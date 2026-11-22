-- Mercado Pago: comprar sin cuenta (invitada) y tarjetas regalo.
--
-- 1. Compra sin cuenta. Una compra de `compras_mercadopago` puede no tener
--    socia: la ficha la crea la entrega (`entregarPlanComprado` con
--    `esInvitada`) con lo que escribió en el formulario, que se guarda aquí
--    (el equivalente de la metadata del cobro de Stripe). Toda compra tiene
--    socia o es de invitada con email.
--
-- 2. Tarjeta regalo. `regalos_mercadopago` guarda lo decidido al abrir el pago
--    (importe, quién regala, a quién, el mensaje). La tarjeta NO existe hasta que
--    el webhook (o el conciliador) confirma el pago: entonces `regalo_crear`
--    la crea con el id de esta fila como `checkout_session_id` (idempotente por
--    su índice único).
--
-- 3. Importes de regalo en pesos: los topes de `regalo_ajustes` (2000) eran
--    euros. Se amplían y los valores de serie pasan a pesos.
--
-- Idempotente. Las tablas nuevas, solo service_role.

-- 1 ───────────────────────────────────────────────────────────────────────────
alter table public.compras_mercadopago alter column socio_id drop not null;
alter table public.compras_mercadopago add column if not exists es_invitada boolean not null default false;
alter table public.compras_mercadopago add column if not exists nombre text;
alter table public.compras_mercadopago add column if not exists telefono text;
alter table public.compras_mercadopago add column if not exists origen_lead text;
alter table public.compras_mercadopago add column if not exists widget_sesion text;
alter table public.compras_mercadopago add column if not exists datos_adicionales jsonb;

alter table public.compras_mercadopago drop constraint if exists compras_mercadopago_de_quien;
alter table public.compras_mercadopago add constraint compras_mercadopago_de_quien check (
  socio_id is not null or (es_invitada and email is not null and nombre is not null)
);

create index if not exists compras_mercadopago_invitada on public.compras_mercadopago (studio_id, email) where socio_id is null;

-- 2 ───────────────────────────────────────────────────────────────────────────
create table if not exists public.regalos_mercadopago (
  id                  text primary key,
  studio_id           text not null references public.studios(id) on delete cascade,
  importe             numeric(12, 2) not null check (importe > 0),
  moneda              text not null,
  caducidad_meses     integer not null check (caducidad_meses between 1 and 60),
  comprador_nombre    text not null check (char_length(comprador_nombre) <= 120),
  comprador_email     text not null check (char_length(comprador_email) <= 200),
  destinatario_nombre text not null check (char_length(destinatario_nombre) <= 120),
  destinatario_email  text not null check (char_length(destinatario_email) <= 200),
  mensaje             text check (mensaje is null or char_length(mensaje) <= 400),
  preference_id       text,
  url_pago            text,
  estado              text not null default 'abierta' check (estado in ('abierta', 'pagada', 'caducada', 'fallida')),
  payment_id          text,
  tarjeta_id          uuid,
  expira_en           timestamptz not null,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

create index if not exists regalos_mercadopago_estudio on public.regalos_mercadopago (studio_id, creado_en desc);

alter table public.regalos_mercadopago enable row level security;
revoke all on table public.regalos_mercadopago from public, anon, authenticated;
grant select, insert, update on table public.regalos_mercadopago to service_role;

drop policy if exists exige_doble_factor on public.regalos_mercadopago;
create policy exige_doble_factor on public.regalos_mercadopago as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

alter table public.pagos_mercadopago add column if not exists regalo_id text;

comment on table public.regalos_mercadopago is
  'Tarjetas regalo pagadas con Mercado Pago (autoalojado): lo decidido al abrir el pago; la tarjeta la crea el webhook. Solo service_role.';

-- 3 ───────────────────────────────────────────────────────────────────────────
alter table public.regalo_ajustes drop constraint if exists regalo_ajustes_importe_min_eur_check;
alter table public.regalo_ajustes drop constraint if exists regalo_ajustes_importe_max_eur_check;
alter table public.regalo_ajustes drop constraint if exists regalo_ajustes_importes;
alter table public.regalo_ajustes drop constraint if exists regalo_ajustes_importe_min_tope;
alter table public.regalo_ajustes drop constraint if exists regalo_ajustes_importe_max_tope;
alter table public.regalo_ajustes add constraint regalo_ajustes_importe_min_tope check (importe_min_eur between 1 and 10000000);
alter table public.regalo_ajustes add constraint regalo_ajustes_importe_max_tope check (importe_max_eur between 1 and 10000000);
alter table public.regalo_ajustes add constraint regalo_ajustes_importes check (
  cardinality(importes_eur) <= 6 and 0 < all (importes_eur) and 10000000 >= all (importes_eur)
);

alter table public.regalo_ajustes alter column importes_eur set default '{25000,50000,100000}';
alter table public.regalo_ajustes alter column importe_min_eur set default 10000;
alter table public.regalo_ajustes alter column importe_max_eur set default 300000;
