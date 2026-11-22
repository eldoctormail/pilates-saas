-- Factura electrónica de ARCA (Argentina, RG 4291, web service WSFEv1).
--
-- El estudio emite, A MANO desde un recibo cobrado, la factura legal con CAE:
-- clase C si es monotributista; A o B si es responsable inscripto.
--
--   · `arca_config`: una fila por estudio con su CUIT, condición, punto de venta
--     (dado de alta en ARCA como «RECE para aplicativo y web services»), entorno
--     (homologación o producción), la clave privada CIFRADA en la app
--     (`enc:v1:`, la base no tiene la clave para descifrarla), el pedido de
--     certificado (CSR) y el certificado que devuelve ARCA, y el ticket de
--     acceso de WSAA (vale unas 12 h; pedir otro con uno vigente lo rechaza
--     ARCA, por eso se guarda).
--   · `comprobantes_arca`: una fila por comprobante pedido. Nace PENDIENTE con
--     su número ANTES de llamar a ARCA, con la solicitud entera; así, si ARCA
--     no contesta, el siguiente intento consulta ese número (FECompConsultar) o
--     reenvía la misma solicitud, y nunca se emite dos veces ni se salta un
--     número. RECHAZADO no ocupa el número.
--
-- Solo el servidor lee y escribe las dos tablas (service_role): el panel pasa
-- por /api/arca/*. Son registros fiscales: no se borran desde la app.

create table if not exists public.arca_config (
  studio_id          text primary key references public.studios(id) on delete cascade,
  cuit               text not null check (cuit ~ '^[0-9]{11}$'),
  condicion          text not null check (condicion in ('MONOTRIBUTO', 'RESPONSABLE_INSCRIPTO')),
  punto_venta        integer not null check (punto_venta between 1 and 99998),
  entorno            text not null default 'homologacion' check (entorno in ('homologacion', 'produccion')),
  razon_social       text check (razon_social is null or char_length(razon_social) <= 200),
  domicilio          text check (domicilio is null or char_length(domicilio) <= 300),
  ingresos_brutos    text check (ingresos_brutos is null or char_length(ingresos_brutos) <= 40),
  inicio_actividades date,
  -- Secretos: solo cifrados en la app.
  clave_privada      text check (clave_privada is null or clave_privada like 'enc:v1:%'),
  csr                text,
  certificado        text,
  certificado_vence  timestamptz,
  ticket_token       text check (ticket_token is null or ticket_token like 'enc:v1:%'),
  ticket_sign        text check (ticket_sign is null or ticket_sign like 'enc:v1:%'),
  ticket_vence       timestamptz,
  actualizado_en     timestamptz not null default now()
);

create table if not exists public.comprobantes_arca (
  id                      text primary key default gen_random_uuid()::text,
  studio_id               text not null references public.studios(id) on delete cascade,
  recibo_id               text not null references public.recibos(id) on delete restrict,
  entorno                 text not null check (entorno in ('homologacion', 'produccion')),
  cuit_emisor             text not null check (cuit_emisor ~ '^[0-9]{11}$'),
  punto_venta             integer not null,
  -- 1 Factura A, 6 Factura B, 11 Factura C (3, 8, 13: sus notas de crédito).
  tipo_cbte               integer not null check (tipo_cbte in (1, 6, 11, 3, 8, 13)),
  numero                  bigint not null check (numero > 0),
  fecha                   date not null,
  doc_tipo                integer not null,
  doc_nro                 text not null check (doc_nro ~ '^[0-9]{1,11}$'),
  condicion_iva_receptor  integer not null,
  receptor_nombre         text check (receptor_nombre is null or char_length(receptor_nombre) <= 200),
  concepto                text check (concepto is null or char_length(concepto) <= 300),
  imp_total               numeric(14,2) not null check (imp_total > 0),
  imp_neto                numeric(14,2) not null,
  imp_iva                 numeric(14,2) not null,
  imp_op_ex               numeric(14,2) not null default 0,
  alicuota                numeric(5,2),
  estado                  text not null check (estado in ('PENDIENTE', 'EMITIDO', 'RECHAZADO')),
  cae                     text check (cae is null or cae ~ '^[0-9]{14}$'),
  cae_vto                 date,
  -- Lo que se mandó (para reenviar la MISMA solicitud) y lo que dijo ARCA.
  solicitud               jsonb not null,
  mensajes                jsonb not null default '[]'::jsonb,
  creado_en               timestamptz not null default now(),
  emitido_en              timestamptz,
  check (estado <> 'EMITIDO' or (cae is not null and cae_vto is not null))
);

-- Un número no se usa dos veces (lo rechazado no lo ocupa).
create unique index if not exists comprobantes_arca_numero_unico
  on public.comprobantes_arca (studio_id, entorno, punto_venta, tipo_cbte, numero)
  where estado <> 'RECHAZADO';
-- Una factura viva por recibo y entorno (las de homologación no cuentan en producción).
create unique index if not exists comprobantes_arca_una_factura_por_recibo
  on public.comprobantes_arca (recibo_id, entorno)
  where estado <> 'RECHAZADO' and tipo_cbte in (1, 6, 11);
create index if not exists comprobantes_arca_por_estudio
  on public.comprobantes_arca (studio_id, creado_en desc);
create index if not exists comprobantes_arca_pendientes
  on public.comprobantes_arca (studio_id, entorno, punto_venta, tipo_cbte, numero)
  where estado = 'PENDIENTE';

-- Un comprobante emitido no cambia: solo PENDIENTE → EMITIDO | RECHAZADO.
create or replace function public.comprobantes_arca_inmutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.estado <> 'PENDIENTE' then
    raise exception 'comprobantes_arca: un comprobante % no cambia', old.estado using errcode = '42501';
  end if;
  if new.numero <> old.numero or new.tipo_cbte <> old.tipo_cbte or new.punto_venta <> old.punto_venta
     or new.recibo_id <> old.recibo_id or new.imp_total <> old.imp_total or new.entorno <> old.entorno then
    raise exception 'comprobantes_arca: los datos de la solicitud no cambian' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists trg_comprobantes_arca_inmutable on public.comprobantes_arca;
create trigger trg_comprobantes_arca_inmutable
  before update on public.comprobantes_arca
  for each row execute function public.comprobantes_arca_inmutable();

create or replace function public.comprobantes_arca_sin_borrar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.estado = 'EMITIDO' then
    raise exception 'comprobantes_arca: un comprobante emitido no se borra' using errcode = '42501';
  end if;
  return old;
end $$;

drop trigger if exists trg_comprobantes_arca_sin_borrar on public.comprobantes_arca;
create trigger trg_comprobantes_arca_sin_borrar
  before delete on public.comprobantes_arca
  for each row execute function public.comprobantes_arca_sin_borrar();

alter table public.arca_config enable row level security;
alter table public.comprobantes_arca enable row level security;

drop policy if exists exige_doble_factor on public.arca_config;
create policy exige_doble_factor on public.arca_config as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));
drop policy if exists exige_doble_factor on public.comprobantes_arca;
create policy exige_doble_factor on public.comprobantes_arca as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

revoke all on table public.arca_config from public, anon, authenticated;
revoke all on table public.comprobantes_arca from public, anon, authenticated;
grant all on table public.arca_config to service_role;
grant all on table public.comprobantes_arca to service_role;
revoke all on function public.comprobantes_arca_inmutable() from public, anon, authenticated;
revoke all on function public.comprobantes_arca_sin_borrar() from public, anon, authenticated;

do $$
begin
  if has_table_privilege('anon', 'public.arca_config', 'SELECT')
     or has_table_privilege('authenticated', 'public.arca_config', 'SELECT')
     or has_table_privilege('authenticated', 'public.arca_config', 'UPDATE')
     or has_table_privilege('anon', 'public.comprobantes_arca', 'SELECT')
     or has_table_privilege('authenticated', 'public.comprobantes_arca', 'SELECT')
     or has_table_privilege('authenticated', 'public.comprobantes_arca', 'INSERT') then
    raise exception 'arca: grants más abiertos de lo previsto';
  end if;
end $$;

comment on table public.arca_config is
  'Factura electrónica de ARCA (WSFEv1) del estudio. Solo service_role; la clave privada y el ticket, cifrados en la app.';
comment on table public.comprobantes_arca is
  'Comprobantes pedidos a ARCA. Nacen PENDIENTE con su número antes de llamar; emitidos, no cambian ni se borran.';
