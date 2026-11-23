-- Mercado Pago desde el panel (autoalojado): la cuenta de cada estudio.
--
-- Hasta ahora el Access Token y la clave del webhook vivían solo en el .env del
-- servidor (una cuenta para toda la instalación). Ahora la propietaria los
-- carga en Apps e integraciones › Mercado Pago, y cada estudio cobra en SU
-- cuenta. El .env sigue valiendo para un estudio que no cargó nada.
--
-- Solo service_role: el navegador no lee ni escribe esta tabla (ni siquiera la
-- propietaria). El token y la clave van cifrados en la app (enc:v1:, con
-- INTEGRACIONES_CLAVE_CIFRADO), como la clave de ARCA.

create table if not exists public.mercadopago_config (
  studio_id       text primary key references public.studios(id) on delete cascade,
  access_token    text not null check (access_token like 'enc:v1:%'),
  webhook_secret  text not null check (webhook_secret like 'enc:v1:%'),
  -- Lo que se enseña en pantalla, comprobado contra /users/me al guardar.
  cuenta_id       text not null check (cuenta_id ~ '^[0-9]{1,20}$'),
  cuenta_nombre   text check (cuenta_nombre is null or char_length(cuenta_nombre) <= 200),
  sitio           text check (sitio is null or sitio ~ '^[A-Z]{3}$'),
  token_final     text not null check (token_final ~ '^[A-Za-z0-9]{4}$'),
  de_prueba       boolean not null default false,
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid
);

alter table public.mercadopago_config enable row level security;

drop policy if exists exige_doble_factor on public.mercadopago_config;
create policy exige_doble_factor on public.mercadopago_config as restrictive for all to authenticated
  using ((select public.nivel_acceso_suficiente())) with check ((select public.nivel_acceso_suficiente()));

revoke all on table public.mercadopago_config from public, anon, authenticated;
grant all on table public.mercadopago_config to service_role;

do $$
begin
  if has_table_privilege('anon', 'public.mercadopago_config', 'SELECT')
     or has_table_privilege('authenticated', 'public.mercadopago_config', 'SELECT')
     or has_table_privilege('authenticated', 'public.mercadopago_config', 'INSERT')
     or has_table_privilege('authenticated', 'public.mercadopago_config', 'UPDATE') then
    raise exception 'mercadopago_config: grants más abiertos de lo previsto';
  end if;
end $$;

comment on table public.mercadopago_config is
  'Cuenta de Mercado Pago de cada estudio (autoalojado). Solo service_role; el token y la clave del webhook, cifrados en la app.';
