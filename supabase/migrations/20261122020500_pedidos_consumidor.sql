-- Botón de arrepentimiento y Botón de baja de servicio (Argentina, Disposición
-- 954/2025 de la Subsecretaría de Defensa del Consumidor y Lealtad Comercial).
--
-- Quien compró a distancia puede revocar la compra (10 días corridos, art. 34
-- Ley 24.240) y quien contrató un servicio a distancia puede darlo de baja (art.
-- 10 ter), desde un enlace visible del sitio, sin registrarse antes. El estudio
-- tiene que confirmarle un código del pedido. Cada pedido es una fila de aquí:
--
--   · La crea SOLO el servidor (/api/public/pedidos-consumidor), sin sesión: el
--     navegador no tiene INSERT.
--   · El código (ARR-XXXXXX / BAJ-XXXXXX) es la constancia: se le enseña en el
--     acto a quien lo pide y no cambia.
--   · El panel la lee y la marca atendida (quien gestiona clientas), como las
--     consultas de contacto. No se reabre ni se borra desde el panel: es la
--     prueba de que se pidió y de cuándo.
--   · `socio_id` se rellena si el email coincide con una ficha del estudio; si
--     no, queda null (puede que no tenga ficha o que escribiera otro email).

create table if not exists public.pedidos_consumidor (
  id text primary key default gen_random_uuid()::text,
  codigo text not null unique check (codigo ~ '^(ARR|BAJ)-[0-9A-HJ-NP-Z]{6}$'),
  studio_id text not null references public.studios(id) on delete cascade,
  tipo text not null check (tipo in ('ARREPENTIMIENTO', 'BAJA')),
  nombre text not null check (length(btrim(nombre)) between 1 and 120),
  email text not null check (length(email) between 3 and 200),
  telefono text check (telefono is null or length(telefono) <= 32),
  documento text check (documento is null or length(documento) <= 20),
  detalle text check (detalle is null or length(detalle) <= 1000),
  socio_id text references public.socios(id) on delete set null,
  estado text not null default 'PENDIENTE' check (estado in ('PENDIENTE', 'ATENDIDO')),
  creado_en timestamptz not null default now(),
  atendido_en timestamptz,
  -- Sin FK a auth.users (mismo motivo que consultas_contacto.atendida_por).
  atendido_por uuid
);

alter table public.pedidos_consumidor drop constraint if exists pedidos_consumidor_cierre_coherente;
alter table public.pedidos_consumidor
  add constraint pedidos_consumidor_cierre_coherente check (
    (estado = 'PENDIENTE' and atendido_en is null and atendido_por is null)
    or (estado = 'ATENDIDO' and atendido_en is not null)
  );

create index if not exists pedidos_consumidor_studio_estado
  on public.pedidos_consumidor (studio_id, estado, creado_en desc);

alter table public.pedidos_consumidor enable row level security;

drop policy if exists pedidos_consumidor_lectura on public.pedidos_consumidor;
create policy pedidos_consumidor_lectura on public.pedidos_consumidor
  for select to authenticated
  using (studio_id = (select public.current_studio_id()) and (select public.puede_gestionar_clientas()));

-- Solo PENDIENTE → ATENDIDO, firmado por quien lo cierra.
drop policy if exists pedidos_consumidor_atender on public.pedidos_consumidor;
create policy pedidos_consumidor_atender on public.pedidos_consumidor
  for update to authenticated
  using (estado = 'PENDIENTE'
         and studio_id = (select public.current_studio_id()) and (select public.puede_gestionar_clientas()))
  with check (estado = 'ATENDIDO' and atendido_por = (select auth.uid())
              and studio_id = (select public.current_studio_id()) and (select public.puede_gestionar_clientas()));

drop policy if exists exige_doble_factor on public.pedidos_consumidor;
create policy exige_doble_factor on public.pedidos_consumidor as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

revoke all on table public.pedidos_consumidor from public, anon, authenticated;
grant select on table public.pedidos_consumidor to authenticated;
grant update (estado, atendido_en, atendido_por) on table public.pedidos_consumidor to authenticated;
grant all on table public.pedidos_consumidor to service_role;

do $$
begin
  if has_table_privilege('anon', 'public.pedidos_consumidor', 'SELECT')
     or has_table_privilege('anon', 'public.pedidos_consumidor', 'INSERT')
     or has_table_privilege('authenticated', 'public.pedidos_consumidor', 'INSERT')
     or has_table_privilege('authenticated', 'public.pedidos_consumidor', 'DELETE')
     or has_column_privilege('authenticated', 'public.pedidos_consumidor', 'codigo', 'UPDATE')
     or has_column_privilege('authenticated', 'public.pedidos_consumidor', 'creado_en', 'UPDATE') then
    raise exception 'pedidos_consumidor: grants más abiertos de lo previsto';
  end if;
end $$;

comment on table public.pedidos_consumidor is
  'Botón de arrepentimiento / baja de servicio (Disp. 954/2025, Argentina). Lo crea solo el servidor; el panel lo lee y lo marca atendido.';
