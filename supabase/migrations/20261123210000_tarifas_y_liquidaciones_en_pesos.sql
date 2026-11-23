-- Tarifas y liquidaciones con importes en pesos (autoalojado, Argentina).
--
-- La tarifa por hora tenía un tope de 999,99 (numeric(5,2)), la base mensual de
-- 99.999,99 y cada importe de la liquidación de 9.999.999,99: pensados en
-- euros. En pesos, una hora ya pasa de mil y un sueldo de cien mil. Se amplían
-- a numeric(12,2) y numeric(14,2), con el tope de la tarifa en 9.999.999,99,
-- el mismo que valida la app (lib/equipo/tarifa-limites.ts).

alter table public.instructor_tarifas drop constraint if exists instructor_tarifas_rango;
alter table public.instructor_tarifas
  alter column tarifa_hora type numeric(12,2),
  alter column base_mensual_eur type numeric(12,2);
alter table public.instructor_tarifas add constraint instructor_tarifas_rango
  check (tarifa_hora is null or (tarifa_hora >= 0 and tarifa_hora <= 9999999.99));

-- El total es una columna calculada: hay que quitarla para cambiar el tipo de
-- las que suma, y volver a crearla igual (se recalcula sola en cada fila).
alter table public.liquidaciones_instructoras drop column if exists total_eur;
alter table public.liquidaciones_instructoras
  alter column base_eur type numeric(14,2),
  alter column variable_propias_eur type numeric(14,2),
  alter column variable_sustitucion_eur type numeric(14,2),
  alter column reparto_penalizaciones_eur type numeric(14,2);
alter table public.liquidaciones_instructoras add column total_eur numeric(14,2) generated always as (
  base_eur + variable_propias_eur + variable_sustitucion_eur + reparto_penalizaciones_eur
) stored;
