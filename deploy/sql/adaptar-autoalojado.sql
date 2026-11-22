-- Adaptación del servidor propio, que se vuelve a aplicar DESPUÉS DE CADA
-- `supabase db push` (lo corre deploy/scripts/migrar.sh).
--
-- Las migraciones 20261122000000…010200 adaptan la base a Argentina y a tu
-- dominio, pero solo lo que existía cuando se escribieron. Las migraciones que
-- el repo original siga añadiendo vuelven a traer lo de Tentare: un trabajo de
-- pg_cron que llama a https://www.tentare.app, una función con 'Europe/Madrid',
-- un horario pensado para Madrid… (pasó el mismo día: `valoraciones-pedir`).
-- Esto lo arregla cada vez. Es idempotente: correrlo dos veces no cambia nada
-- la segunda.
--
--   1. Zona horaria: 'Europe/Madrid' → 'America/Argentina/Buenos_Aires' en
--      funciones, vistas, políticas RLS, defaults de columnas y pg_cron. No toca
--      datos: un estudio que eligió otra zona la conserva.
--   2. Dirección del servidor: la base de la URL sale del secreto 'app_url' de
--      Vault, en los trabajos de pg_cron y en las funciones que llaman solas.
--   3. Horarios fijos de pg_cron (pg_cron va en UTC): +4 h, para que lo que en
--      Madrid salía a las 10:00 salga a las 10:00 en Argentina. Cada trabajo se
--      ajusta una sola vez por horario (lo recuerda autoalojado.cron_ajustados).
--   4. Sin prueba de 7 días: el estudio nace activo.
--   5. Comprobaciones: si algo sigue apuntando a Tentare, falla a la vista.

\set ON_ERROR_STOP on

-- ── 1) Zona horaria ─────────────────────────────────────────────────────────
do $$
declare
  v_vieja constant text := 'Europe/Madrid';
  v_nueva constant text := 'America/Argentina/Buenos_Aires';
  r record;
begin
  for r in
    select p.oid, p.oid::regprocedure as firma
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname not in ('pg_catalog', 'information_schema') and n.nspname not like 'pg_toast%'
      and p.prokind in ('f', 'p')
      and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
      and (p.prosrc like '%' || v_vieja || '%' or pg_get_function_arguments(p.oid) like '%' || v_vieja || '%')
  loop
    execute replace(pg_get_functiondef(r.oid), v_vieja, v_nueva);
    raise notice 'zona horaria: función %', r.firma;
  end loop;

  for r in
    select c.oid, n.nspname, c.relname, c.reloptions
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'v' and n.nspname not in ('pg_catalog', 'information_schema')
      and pg_get_viewdef(c.oid) like '%' || v_vieja || '%'
  loop
    execute format('create or replace view %I.%I %s as %s', r.nspname, r.relname,
                   case when r.reloptions is null then '' else 'with (' || array_to_string(r.reloptions, ', ') || ')' end,
                   replace(pg_get_viewdef(r.oid), v_vieja, v_nueva));
    raise notice 'zona horaria: vista %.%', r.nspname, r.relname;
  end loop;

  for r in
    select schemaname, tablename, policyname, qual, with_check from pg_policies
    where coalesce(qual, '') like '%' || v_vieja || '%' or coalesce(with_check, '') like '%' || v_vieja || '%'
  loop
    if r.qual is not null then
      execute format('alter policy %I on %I.%I using (%s)', r.policyname, r.schemaname, r.tablename, replace(r.qual, v_vieja, v_nueva));
    end if;
    if r.with_check is not null then
      execute format('alter policy %I on %I.%I with check (%s)', r.policyname, r.schemaname, r.tablename, replace(r.with_check, v_vieja, v_nueva));
    end if;
    raise notice 'zona horaria: política % en %.%', r.policyname, r.schemaname, r.tablename;
  end loop;

  for r in
    select n.nspname, c.relname, a.attname, pg_get_expr(d.adbin, d.adrelid) as expr
    from pg_attrdef d
    join pg_class c on c.oid = d.adrelid join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = d.adrelid and a.attnum = d.adnum
    where n.nspname not in ('pg_catalog', 'information_schema') and pg_get_expr(d.adbin, d.adrelid) like '%' || v_vieja || '%'
  loop
    execute format('alter table %I.%I alter column %I set default %s', r.nspname, r.relname, r.attname, replace(r.expr, v_vieja, v_nueva));
    raise notice 'zona horaria: default de %.%.%', r.nspname, r.relname, r.attname;
  end loop;

  if to_regclass('cron.job') is not null then
    for r in select jobid, jobname, command from cron.job where command like '%' || v_vieja || '%' loop
      perform cron.alter_job(r.jobid, command := replace(r.command, v_vieja, v_nueva));
      raise notice 'zona horaria: trabajo pg_cron %', r.jobname;
    end loop;
  end if;
end $$;

-- ── 2) Dirección del servidor ───────────────────────────────────────────────
do $$
declare
  v_nueva constant text := '(select decrypted_secret from vault.decrypted_secrets where name = ''app_url'') || ''';
  v_vieja text;
  r record;
begin
  -- Con y sin «www».
  foreach v_vieja in array array['''https://www.tentare.app', '''https://tentare.app'] loop
    if to_regclass('cron.job') is not null then
      for r in select jobid, jobname, command from cron.job where command like '%' || v_vieja || '%' loop
        perform cron.alter_job(r.jobid, command := replace(r.command, v_vieja, v_nueva));
        raise notice 'url: trabajo pg_cron %', r.jobname;
      end loop;
    end if;
    for r in
      select p.oid, p.oid::regprocedure as firma
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname not in ('pg_catalog', 'information_schema') and p.prokind in ('f', 'p')
        and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
        and p.prosrc like '%' || v_vieja || '%'
    loop
      execute replace(pg_get_functiondef(r.oid), v_vieja, v_nueva);
      raise notice 'url: función %', r.firma;
    end loop;
  end loop;
end $$;

-- ── 3) Horarios fijos de pg_cron ────────────────────────────────────────────
create schema if not exists autoalojado;
revoke all on schema autoalojado from public;
create table if not exists autoalojado.cron_ajustados (
  jobname text primary key,
  schedule_original text not null,
  schedule_ajustado text not null,
  ajustado_en timestamptz not null default now()
);
revoke all on table autoalojado.cron_ajustados from public;

-- Los que ya ajustó la migración 20261122010100 (se apuntan con su horario de ahora).
insert into autoalojado.cron_ajustados (jobname, schedule_original, schedule_ajustado)
select v.jobname, v.original, v.ajustado
from (values
  ('notif-inactivas', '0 10 * * 1', '0 14 * * 1'), ('backups-diarios', '0 3 * * *', '0 7 * * *'),
  ('revisiones-salud', '0 7 * * *', '0 11 * * *'), ('series-renovacion', '0 7 * * *', '0 11 * * *'),
  ('notif-bonos', '0 9 * * *', '0 13 * * *'), ('clase-fija-termina-pronto', '0 9 * * *', '0 13 * * *'),
  ('recuperaciones-semanales', '15 4 * * 1', '15 8 * * 1'), ('resumen-semanal', '15 9 * * 1', '15 13 * * 1'),
  ('cobros-externos-retencion', '23 3 * * *', '23 7 * * *'), ('purgar-denuncias-resueltas', '23 4 * * *', '23 8 * * *'),
  ('api-eventos-purgar', '25 4 * * *', '25 8 * * *'), ('purgar-datos-caducados', '30 4 * * *', '30 8 * * *'),
  ('purgar-ayuda-busquedas', '35 4 * * *', '35 8 * * *'), ('purgar-consultas-contacto', '45 4 * * *', '45 8 * * *'),
  ('purgar-accesos-qr', '50 4 * * *', '50 8 * * *')
) as v(jobname, original, ajustado)
where to_regclass('cron.job') is not null
  and exists (select 1 from cron.job j where j.jobname = v.jobname and j.schedule = v.ajustado)
on conflict (jobname) do nothing;

do $$
declare
  r record;
  v_partes text[];
  v_cruza boolean;
  v_nuevo text;
begin
  if to_regclass('cron.job') is null then return; end if;
  for r in
    select j.jobid, j.jobname, j.schedule
    from cron.job j
    left join autoalojado.cron_ajustados a on a.jobname = j.jobname
    where j.jobname is not null
      -- Nuevo, o el repo original le cambió el horario desde que se ajustó.
      and (a.jobname is null or a.schedule_ajustado <> j.schedule)
  loop
    v_partes := regexp_split_to_array(trim(r.schedule), '\s+');
    -- Solo horarios de 5 campos con la hora en números (0, 9, 7-21, 6,18): los «cada N» no dependen de la zona.
    continue when array_length(v_partes, 1) <> 5 or v_partes[2] !~ '^[0-9]+([,-][0-9]+)*$';
    -- Suma 4 h a cada número del campo de la hora, conservando comas y guiones.
    v_nuevo := (
      select string_agg(case when tok ~ '^[0-9]+$' then ((tok::int + 4) % 24)::text else tok end, '' order by ord)
      from regexp_split_to_table(v_partes[2], '(?<=[,-])|(?=[,-])') with ordinality as t(tok, ord)
    );
    select bool_or(tok::int + 4 >= 24) into v_cruza
    from regexp_split_to_table(v_partes[2], '[,-]') as tok;
    if v_cruza and (v_partes[3] <> '*' or v_partes[5] <> '*' or v_partes[2] ~ '-') then
      -- Pasaría al día siguiente con un día fijado (o un rango que se parte): no se adivina.
      raise warning 'horario: % (%) no se ajusta solo: revísalo a mano (pg_cron va en UTC, Argentina es UTC−3)', r.jobname, r.schedule;
      continue;
    end if;
    v_partes[2] := v_nuevo;
    perform cron.alter_job(r.jobid, schedule := array_to_string(v_partes, ' '));
    insert into autoalojado.cron_ajustados (jobname, schedule_original, schedule_ajustado)
    values (r.jobname, r.schedule, array_to_string(v_partes, ' '))
    on conflict (jobname) do update set schedule_original = excluded.schedule_original,
      schedule_ajustado = excluded.schedule_ajustado, ajustado_en = now();
    raise notice 'horario: % % → % (UTC)', r.jobname, r.schedule, array_to_string(v_partes, ' ');
  end loop;
end $$;

-- ── 4) Sin prueba de 7 días ─────────────────────────────────────────────────
do $$
begin
  if to_regproc('public.arrancar_prueba_gratuita') is null then return; end if;
  -- Si una migración del repo original volvió a poner la prueba, se quita otra vez.
  if (select prosrc from pg_proc where oid = 'public.arrancar_prueba_gratuita'::regproc) !~ 'subscription_status := ''active''' then
    execute $f$
      create or replace function public.arrancar_prueba_gratuita()
      returns trigger language plpgsql security definer set search_path = public as $b$
      begin
        if new.cadena_id is null then
          new.trial_ends_at := null;
          new.subscription_status := 'active';
          new.subscription_id := null;
          new.current_period_end := null;
        end if;
        return new;
      end;
      $b$
    $f$;
    revoke execute on function public.arrancar_prueba_gratuita() from public, anon, authenticated;
    raise notice 'prueba: el estudio vuelve a nacer activo';
  end if;
end $$;

-- ── 5) Comprobaciones ───────────────────────────────────────────────────────
do $$
declare v_lista text;
begin
  if to_regclass('cron.job') is not null then
    select string_agg(jobname, ', ') into v_lista from cron.job where command ilike '%tentare.app%';
    if v_lista is not null then raise exception 'trabajos de pg_cron que siguen llamando a tentare.app: %', v_lista; end if;
  end if;
  select string_agg(p.oid::regprocedure::text, ', ') into v_lista
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema') and p.prosrc ilike '%://%tentare.app%';
  if v_lista is not null then raise exception 'funciones que siguen llamando a tentare.app: %', v_lista; end if;
end $$;
