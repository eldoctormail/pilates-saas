-- Autoalojado: la moneda por defecto de las columnas `moneda` pasa a ARS.
--
-- Son informativas (los importes se guardan en número y la app los pinta con
-- la moneda de lib/moneda.ts), pero `cobros_externos` exigía 'EUR' con un CHECK
-- y una fila nueva en pesos no habría entrado. Las filas que ya existan no se
-- tocan. Idempotente.

do $$
declare
  r record;
begin
  -- El CHECK (moneda = 'EUR') de cobros_externos, sea cual sea su nombre.
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.cobros_externos'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%moneda%EUR%'
  loop
    execute format('alter table public.cobros_externos drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.cobros_externos
  alter column moneda set default 'ARS';

alter table public.cobros_externos
  drop constraint if exists cobros_externos_moneda_iso;
alter table public.cobros_externos
  add constraint cobros_externos_moneda_iso check (moneda ~ '^[A-Z]{3}$');

alter table public.instructor_tarifas
  alter column moneda set default 'ARS';
