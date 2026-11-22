-- Autoalojado: zona horaria de Argentina y dirección del servidor configurable.
--
-- Va al final de todas las migraciones y trabaja sobre el estado que dejaron,
-- sin editar ninguna anterior (así las actualizaciones del repo original no
-- chocan con este cambio).
--
-- 1) Zona horaria: todo lo que en la base decía 'Europe/Madrid' (funciones,
--    vistas, políticas RLS, comandos de pg_cron, el default de
--    studios.zona_horaria y los estudios ya creados) pasa a
--    'America/Argentina/Buenos_Aires'.
--
-- 2) Dirección del servidor: los trabajos de pg_cron llamaban a
--    https://www.tentare.app/api/cron/... Ahora leen la base de la URL del
--    secreto 'app_url' de Vault. Después de aplicar las migraciones, cargarlo
--    una vez con tu dominio (sin barra final):
--
--      select vault.create_secret('https://pilates.ejemplo.com.ar', 'app_url');
--
--    Para cambiarlo más adelante:
--
--      select vault.update_secret(id, 'https://otro.dominio')
--      from vault.secrets where name = 'app_url';
--
--    Mientras no exista, los trabajos fallan sin llamar a nadie (url nula).
--
-- ⚠️ Si una migración futura del repo original vuelve a programar un trabajo
-- con la URL de Tentare escrita a mano, hay que volver a correr el bloque 2
-- (o esta migración entera: es idempotente).

-- ── 1) Zona horaria ─────────────────────────────────────────────────────────

do $$
declare
  v_vieja constant text := 'Europe/Madrid';
  v_nueva constant text := 'America/Argentina/Buenos_Aires';
  r record;
  v_def text;
begin
  -- Funciones y procedimientos (cuerpo y defaults de parámetros).
  for r in
    select p.oid, p.oid::regprocedure as firma
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname not in ('pg_catalog', 'information_schema')
      and n.nspname not like 'pg_toast%'
      and p.prokind in ('f', 'p')
      -- Las de extensiones no se tocan.
      and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
      and (p.prosrc like '%' || v_vieja || '%'
           or pg_get_function_arguments(p.oid) like '%' || v_vieja || '%')
  loop
    v_def := replace(pg_get_functiondef(r.oid), v_vieja, v_nueva);
    execute v_def;
    raise notice 'zona horaria: función %', r.firma;
  end loop;

  -- Vistas.
  for r in
    select c.oid, n.nspname, c.relname, c.reloptions
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'v'
      and n.nspname not in ('pg_catalog', 'information_schema')
      and pg_get_viewdef(c.oid) like '%' || v_vieja || '%'
  loop
    -- Se repiten sus opciones (security_invoker, etc.) para no perderlas.
    execute format('create or replace view %I.%I %s as %s',
                   r.nspname, r.relname,
                   case when r.reloptions is null then ''
                        else 'with (' || array_to_string(r.reloptions, ', ') || ')' end,
                   replace(pg_get_viewdef(r.oid), v_vieja, v_nueva));
    raise notice 'zona horaria: vista %.%', r.nspname, r.relname;
  end loop;

  -- Políticas RLS.
  for r in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where coalesce(qual, '') like '%' || v_vieja || '%'
       or coalesce(with_check, '') like '%' || v_vieja || '%'
  loop
    if r.qual is not null then
      execute format('alter policy %I on %I.%I using (%s)',
                     r.policyname, r.schemaname, r.tablename,
                     replace(r.qual, v_vieja, v_nueva));
    end if;
    if r.with_check is not null then
      execute format('alter policy %I on %I.%I with check (%s)',
                     r.policyname, r.schemaname, r.tablename,
                     replace(r.with_check, v_vieja, v_nueva));
    end if;
    raise notice 'zona horaria: política % en %.%', r.policyname, r.schemaname, r.tablename;
  end loop;

  -- Defaults de columnas que tengan la zona escrita (studios.zona_horaria y
  -- cualquier otra).
  for r in
    select n.nspname, c.relname, a.attname, pg_get_expr(d.adbin, d.adrelid) as expr
    from pg_attrdef d
    join pg_class c on c.oid = d.adrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = d.adrelid and a.attnum = d.adnum
    where n.nspname not in ('pg_catalog', 'information_schema')
      and pg_get_expr(d.adbin, d.adrelid) like '%' || v_vieja || '%'
  loop
    execute format('alter table %I.%I alter column %I set default %s',
                   r.nspname, r.relname, r.attname,
                   replace(r.expr, v_vieja, v_nueva));
    raise notice 'zona horaria: default de %.%.%', r.nspname, r.relname, r.attname;
  end loop;

  -- Comandos de pg_cron.
  if to_regclass('cron.job') is not null then
    for r in select jobid, jobname, command from cron.job where command like '%' || v_vieja || '%'
    loop
      perform cron.alter_job(r.jobid, command := replace(r.command, v_vieja, v_nueva));
      raise notice 'zona horaria: trabajo pg_cron %', r.jobname;
    end loop;
  end if;
end $$;

-- Los estudios que ya existan.
update public.studios
set zona_horaria = 'America/Argentina/Buenos_Aires'
where zona_horaria = 'Europe/Madrid';

comment on column public.studios.zona_horaria is
  'Zona horaria IANA del estudio (CAL-5). Autoalojado: por defecto America/Argentina/Buenos_Aires.';

-- ── 2) Dirección del servidor en los trabajos de pg_cron ────────────────────

do $$
declare
  v_vieja constant text := '''https://www.tentare.app';
  v_nueva constant text :=
    '(select decrypted_secret from vault.decrypted_secrets where name = ''app_url'') || ''';
  r record;
  v_cmd text;
begin
  if to_regclass('cron.job') is null then
    raise notice 'pg_cron no está instalado: no hay trabajos que cambiar';
    return;
  end if;

  for r in select jobid, jobname, command from cron.job where command like '%' || v_vieja || '%'
  loop
    v_cmd := replace(r.command, v_vieja, v_nueva);
    perform cron.alter_job(r.jobid, command := v_cmd);
    raise notice 'url: trabajo pg_cron %', r.jobname;
  end loop;

  if exists (select 1 from cron.job where command like '%tentare.app%') then
    raise exception 'quedan trabajos de pg_cron que apuntan a tentare.app';
  end if;
end $$;

-- Ninguna función de la base puede seguir llamando al servidor de Tentare.
do $$
declare v_lista text;
begin
  select string_agg(p.oid::regprocedure::text, ', ')
  into v_lista
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prosrc like '%www.tentare.app%';
  if v_lista is not null then
    raise exception 'estas funciones todavía llaman a www.tentare.app: %', v_lista;
  end if;
end $$;
