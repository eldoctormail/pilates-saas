-- Mercado Pago, Etapa 2: la alumna compra un bono o plan desde la app.
--
-- Una compra de Checkout Pro no tiene un recibo previo (el recibo lo crea la
-- entrega, `entregarPlanComprado`). Lo que se decidió AL ABRIR el pago —qué
-- plan, para quién, cuánto (con código, prorrateo y matrícula), qué condiciones
-- aceptó— se guarda aquí, y el webhook entrega exactamente eso. Es el
-- equivalente de la metadata de una Checkout Session de Stripe, pero en la base:
-- nada de lo que decide el importe viaja por Mercado Pago.
--
-- `cupo_matricula_reservado`: la compra se llevó una plaza de matrícula gratis
-- (promoción con cupo). Si caduca sin pagarse, la plaza se devuelve
-- (`liberarCupoMatriculaUnaVez` con el id de la compra como clave) desde el
-- propio checkout de Mercado Pago, que barre las caducadas antes de abrir otra.
--
-- Solo service_role.

create table if not exists public.compras_mercadopago (
  id                       text primary key,
  studio_id                text not null references public.studios(id) on delete cascade,
  plan_id                  text not null,
  socio_id                 text not null,
  email                    text,
  importe_plan             numeric(12, 2) not null check (importe_plan > 0),
  matricula                numeric(12, 2) not null default 0 check (matricula >= 0),
  moneda                   text not null,
  codigo_descuento_id      text,
  terminos_hash            text,
  ciclo_fin                text,
  cuota_texto              text,
  cupo_matricula_reservado boolean not null default false,
  preference_id            text,
  url_pago                 text,
  estado                   text not null default 'abierta' check (estado in ('abierta', 'pagada', 'caducada', 'fallida')),
  payment_id               text,
  expira_en                timestamptz not null,
  creado_en                timestamptz not null default now(),
  actualizado_en           timestamptz not null default now()
);

create index if not exists compras_mercadopago_abiertas on public.compras_mercadopago (expira_en) where estado = 'abierta';
create index if not exists compras_mercadopago_socio on public.compras_mercadopago (studio_id, socio_id);

alter table public.compras_mercadopago enable row level security;
revoke all on table public.compras_mercadopago from public, anon, authenticated;
grant select, insert, update on table public.compras_mercadopago to service_role;

drop policy if exists exige_doble_factor on public.compras_mercadopago;
create policy exige_doble_factor on public.compras_mercadopago as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

-- El libro de pagos también apunta a la compra (un pago de plan no tiene recibo hasta que se entrega).
alter table public.pagos_mercadopago add column if not exists compra_id text;

comment on table public.compras_mercadopago is
  'Compras de plan con Mercado Pago (autoalojado): lo decidido al abrir el pago, que el webhook entrega. Solo service_role.';
