-- Autoalojado: la moneda por defecto de las columnas `moneda` pasa a ARS.
--
-- Son informativas (los importes se guardan en número y la app los pinta con
-- la moneda de lib/moneda.ts), pero `cobros_externos` exigía 'EUR' con un CHECK
-- y una fila nueva en pesos no habría entrado. Las filas que ya existan no se
-- tocan. Idempotente.
--
-- `cobros_externos` se retiró en el repo original (20261003002752): en una base
-- instalada desde cero no existe, y entonces no hay nada que tocar. Lo mismo
-- vale para cualquier tabla de esta lista que falte.

do $$
declare
  r record;
begin
  if to_regclass('public.cobros_externos') is not null then
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
    alter table public.cobros_externos alter column moneda set default 'ARS';
    alter table public.cobros_externos drop constraint if exists cobros_externos_moneda_iso;
    alter table public.cobros_externos add constraint cobros_externos_moneda_iso check (moneda ~ '^[A-Z]{3}$');
  end if;

  if to_regclass('public.instructor_tarifas') is not null then
    alter table public.instructor_tarifas alter column moneda set default 'ARS';
  end if;
end $$;
