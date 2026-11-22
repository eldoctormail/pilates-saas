-- Mercado Pago, Etapa 1: la alumna paga un recibo pendiente con Checkout Pro.
--
-- 1) `recibos.metodo_cobro` admite 'MERCADOPAGO' (lo escribe el webhook al
--    confirmar el cobro con `confirmarCobro`, el mismo dueño que Stripe).
-- 2) `pagos_mercadopago`: un registro por pago de Mercado Pago que llegó al
--    webhook. Es el libro que contesta «¿este pago ya se aplicó?», «¿qué recibo
--    pagó?» y, en una etapa siguiente, desde dónde se devuelve. Solo lo escribe
--    el servidor (service_role); el navegador no lo ve.

alter table public.recibos drop constraint if exists recibos_metodo_cobro_valido;
alter table public.recibos add constraint recibos_metodo_cobro_valido
  check (metodo_cobro is null or metodo_cobro = any (array['TARJETA','SEPA','BIZUM','EFECTIVO','TRANSFERENCIA','MERCADOPAGO']));

create table if not exists public.pagos_mercadopago (
  payment_id     text primary key,
  studio_id      text not null references public.studios(id) on delete cascade,
  recibo_id      text,
  estado         text not null,
  estado_detalle text,
  importe        numeric(12, 2) not null,
  moneda         text not null,
  medio          text,
  -- Qué hizo Tentare con él: aplicado (recibo cobrado), ya_estaba (reentrega),
  -- no_aplicable (recibo anulado o cobrado por otra vía: hay que devolverlo),
  -- rechazado (importe o estudio no cuadran), pendiente (aún no aprobado).
  desenlace      text not null check (desenlace in ('aplicado', 'ya_estaba', 'no_aplicable', 'rechazado', 'pendiente')),
  detalle        text,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists pagos_mercadopago_recibo on public.pagos_mercadopago (studio_id, recibo_id);

alter table public.pagos_mercadopago enable row level security;
revoke all on table public.pagos_mercadopago from public, anon, authenticated;
grant select, insert, update on table public.pagos_mercadopago to service_role;

-- Toda tabla de public con RLS lleva la política restrictiva del segundo paso
-- (migr 20261003102845; lo vigila supabase/tests/rls-doble-factor.test.ts).
drop policy if exists exige_doble_factor on public.pagos_mercadopago;
create policy exige_doble_factor on public.pagos_mercadopago as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

comment on table public.pagos_mercadopago is
  'Pagos de Mercado Pago recibidos por el webhook (autoalojado). Solo service_role.';
