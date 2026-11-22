// El «hoy» de un estudio es el de Madrid, no el de UTC (migr 20261008165518 y 20261008165935).
//
// La base de datos corre en UTC: entre las 00:00 y las 02:00 de Madrid, `current_date` sigue siendo ayer. Una función de
// vigencia (bono, cuota, recuperación, plaza fija, créditos) que lo use decide distinto de lo que ve el panel. Este test deja
// corriendo en cada PR, contra Postgres real, lo que un test estático de migraciones no ve: el cuerpo VIGENTE de cada función.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sqlLocal } from '../../lib/db/rls-test-helpers.ts';

const sql = sqlLocal();

// La zona del estudio es la que tenga la base: 'Europe/Madrid' en Tentare, la del país en un servidor propio
// (migr 20261122000000_autoalojado_zona_y_url y deploy/sql/adaptar-autoalojado.sql). Sale del default de
// studios.zona_horaria, que esas migraciones cambian a la vez que el resto.
async function zonaDeLaBase(): Promise<string> {
  const [fila] = await sql<{ def: string | null }[]>`
    select column_default as def from information_schema.columns
     where table_schema = 'public' and table_name = 'studios' and column_name = 'zona_horaria'`;
  return /'([^']+)'/.exec(fila?.def ?? '')?.[1] ?? 'Europe/Madrid';
}
const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// Las únicas que pueden seguir con `current_date`, y por qué. Añadir una aquí es una decisión: lleva su motivo.
const CON_CURRENT_DATE_A_PROPOSITO: Record<string, string> = {
  // El tope diario del piloto automático (un límite de IA, no de dinero ni de derechos): su «día» es el de UTC y así lo
  // cuenta el resto de esa función (`date_trunc('day', now() at time zone 'utc')`).
  aprobar_recomendacion_autonoma: 'tope diario de la IA, en UTC a propósito',
};

test('hoy_estudio() es el día de Madrid', async () => {
  const zona = await zonaDeLaBase();
  const [fila] = await sql<{ igual: boolean }[]>`
    select public.hoy_estudio() = (now() at time zone ${zona})::date as igual
  `;
  assert.equal(fila?.igual, true);
});

test('ninguna función del esquema public mide la vigencia con current_date (UTC)', async () => {
  const filas = await sql<{ nombre: string }[]>`
    select p.proname as nombre
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace
       and p.prosrc ~* 'current_date'
     order by 1
  `;
  const sobran = filas.map(f => f.nombre).filter(n => !(n in CON_CURRENT_DATE_A_PROPOSITO));
  assert.deepEqual(
    sobran, [],
    `usan current_date (el día UTC): ${sobran.join(', ')}. Usa public.hoy_estudio(): entre las 00:00 y las 02:00 de Madrid `
    + 'current_date sigue en el día anterior. Si es a propósito, añádela a CON_CURRENT_DATE_A_PROPOSITO con su motivo.',
  );
});

test('los valores por defecto de «hoy» tampoco son CURRENT_DATE', async () => {
  const filas = await sql<{ nombre: string }[]>`
    select p.oid::regprocedure::text as nombre
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace
       and pg_get_function_arguments(p.oid) ~* 'current_date'
  `;
  assert.deepEqual(filas.map(f => f.nombre), [], 'un DEFAULT CURRENT_DATE en una firma: usa public.hoy_estudio()');
});

test('las fronteras de semana y de mes de los créditos de fidelidad son las 00:00 de Madrid', async () => {
  const [{ def }] = await sql<{ def: string }[]>`
    select pg_get_functiondef('public.otorgar_credito_disparador(text,text,text,text,text)'::regprocedure) as def
  `;
  const zona = escaparRegex(await zonaDeLaBase());
  assert.match(def, new RegExp(`v_lunes::timestamp at time zone '${zona}'`));
  assert.match(def, new RegExp(`date_trunc\\('month', public\\.hoy_estudio\\(\\)::timestamp\\) at time zone '${zona}'`));
  assert.doesNotMatch(def, /::timestamptz/, 'una conversión de día a instante sin zona cae en UTC');
});

test.after(async () => { await sql.end(); });
