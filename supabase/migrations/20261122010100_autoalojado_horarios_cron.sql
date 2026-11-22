-- Autoalojado: los trabajos de pg_cron a hora fija, a la misma hora local en
-- Argentina que tenían en Madrid.
--
-- pg_cron interpreta los horarios en UTC. Estaban puestos para Madrid en
-- invierno (UTC+1): «0 9 * * *» = 10:00 en Madrid, pero 06:00 en Argentina
-- (UTC−3), y a esa hora salían avisos a las alumnas («te quedan pocas
-- clases del bono», «tu clase fija termina pronto»). Se suman 4 horas para
-- conservar la hora local: 10:00 en Madrid → 10:00 en Argentina.
--
-- Solo se cambia un trabajo si tiene todavía el horario original (idempotente:
-- correrla dos veces no vuelve a sumar). Los trabajos cada N minutos u horas no
-- dependen de la zona y no se tocan.

do $$
declare
  r record;
  v_id bigint;
begin
  if to_regclass('cron.job') is null then
    raise notice 'pg_cron no está instalado: no hay horarios que cambiar';
    return;
  end if;

  for r in select * from (values
    ('notif-inactivas', '0 10 * * 1', '0 14 * * 1'),
    ('backups-diarios', '0 3 * * *', '0 7 * * *'),
    ('revisiones-salud', '0 7 * * *', '0 11 * * *'),
    ('series-renovacion', '0 7 * * *', '0 11 * * *'),
    ('notif-bonos', '0 9 * * *', '0 13 * * *'),
    ('clase-fija-termina-pronto', '0 9 * * *', '0 13 * * *'),
    ('recuperaciones-semanales', '15 4 * * 1', '15 8 * * 1'),
    ('resumen-semanal', '15 9 * * 1', '15 13 * * 1'),
    ('cobros-externos-retencion', '23 3 * * *', '23 7 * * *'),
    ('purgar-denuncias-resueltas', '23 4 * * *', '23 8 * * *'),
    ('api-eventos-purgar', '25 4 * * *', '25 8 * * *'),
    ('purgar-datos-caducados', '30 4 * * *', '30 8 * * *'),
    ('purgar-ayuda-busquedas', '35 4 * * *', '35 8 * * *'),
    ('purgar-consultas-contacto', '45 4 * * *', '45 8 * * *'),
    ('purgar-accesos-qr', '50 4 * * *', '50 8 * * *')
  ) as t(jobname, original, nuevo)
  loop
    select jobid into v_id from cron.job where jobname = r.jobname and schedule = r.original;
    if v_id is not null then
      perform cron.alter_job(v_id, schedule := r.nuevo);
      raise notice 'horario: % % → % (UTC)', r.jobname, r.original, r.nuevo;
    end if;
  end loop;
end $$;
