-- Mercado Pago: pagar y reservar una clase en un paso.
--
-- Una compra de `compras_mercadopago` puede llevar una clase concreta (y el
-- sitio que eligió en la sala). El webhook entrega el plan como siempre y,
-- después, reserva ESA clase con `reservarClasePagada` (el mismo dueño que usa
-- Stripe), con el id de la compra como clave de idempotencia de la reserva.
--
-- Sin clave foránea a `sesiones` a propósito: si el estudio borra la clase
-- entre el pago y el aviso, el dinero entra igual y el plan se entrega; la
-- reserva falla con `sesion-no-encontrada` y se avisa al mostrador.

alter table public.compras_mercadopago add column if not exists sesion_id text;
alter table public.compras_mercadopago add column if not exists spot_id text;

comment on column public.compras_mercadopago.sesion_id is
  'Clase que se paga y reserva con esta compra (null = solo el plan).';
