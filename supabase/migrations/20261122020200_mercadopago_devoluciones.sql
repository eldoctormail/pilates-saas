-- Mercado Pago: devoluciones desde el panel.
--
-- Lo devuelto de cada pago (acumulado, tal cual lo da la API de Mercado Pago):
-- el conciliador lo compara con lo que dice la API para saber si hay una
-- devolución nueva (total, parcial o un contracargo) que anotar en Tentare.
alter table public.pagos_mercadopago add column if not exists importe_devuelto numeric(12, 2) not null default 0;
