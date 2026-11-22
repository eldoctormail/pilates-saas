-- Autoalojado: el estudio nace ACTIVO, sin prueba de 7 días.
--
-- En Tentare (SaaS) un estudio nuevo nace en una prueba local de 7 días
-- ('trialing' sin subscription_id). Al vencer, el pg_cron
-- `cerrar-pruebas-vencidas` lo pasa a 'trial_expirado' y desde ahí:
--   · `tieneFeature()` dice que no a todo (en el navegador y en el servidor):
--     se esconden Centro de Control, sustituciones, varias sedes, etc.;
--   · el ciclo de estudios vencidos (`notif-trial`) le manda a la propietaria
--     los avisos de «tu prueba terminó» a los 30 y 83 días (la purga real está
--     apagada sin PURGA_ESTUDIOS_VENCIDOS=activa).
--
-- En una instalación propia no hay suscripción que pagar a Tentare: el estudio
-- nace en 'active', sin fecha de fin de prueba. Con el plan que elija en el
-- alta: Founding (BASE) sin régimen de complementos ya es el plan completo
-- (`BASE_COMPLETO`) salvo varias sedes, que pide Cadena.
--
-- Los avisos y bloqueos de cobro de la suscripción siguen apagados mientras no
-- se configure Stripe ni BILLING_ENFORCED (fallan abiertos).

create or replace function public.arrancar_prueba_gratuita()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Mismo criterio que la versión original: una sede de cadena hereda de su
  -- cadena (trg_heredar_plan_de_cadena) y no se toca aquí.
  if new.cadena_id is null then
    new.trial_ends_at := null;
    new.subscription_status := 'active';
    new.subscription_id := null;
    new.current_period_end := null;
  end if;
  return new;
end;
$$;

revoke execute on function public.arrancar_prueba_gratuita() from public;
revoke execute on function public.arrancar_prueba_gratuita() from anon;
revoke execute on function public.arrancar_prueba_gratuita() from authenticated;

comment on function public.arrancar_prueba_gratuita() is
  'Autoalojado: el estudio nace activo, sin prueba (migr 20261122010200). El nombre se conserva para no tocar el trigger.';

-- Los estudios que ya existan sin suscripción de Stripe (en prueba, con la
-- prueba vencida o en el plan gratis) pasan a activos.
update public.studios
set subscription_status = 'active',
    trial_ends_at = null,
    current_period_end = null
where subscription_id is null
  and cadena_id is null
  and (subscription_status is null
       or subscription_status in ('trialing', 'trial_expirado', 'gratis', 'gratis_cerrado'));
