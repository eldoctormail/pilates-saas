// Carga los precios de los planes guardados en `ajustes_plataforma` y los deja
// en el almacén compartido (lib/billing/precios-plataforma.ts). SOLO servidor.
//
// La lee el layout raíz en cada render (con caché de un minuto), así que una
// página nueva siempre sale con los precios al día. Tras guardar desde
// /interno/precios, la ruta fija los nuevos al momento y regenera las páginas.
import 'server-only';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { CLAVE_AJUSTE_PRECIOS, fijarPrecios, leerPreciosGuardados, preciosActuales, type Precios } from './precios-plataforma';

const VIGENCIA_MS = 60_000;
const LLAVE = Symbol.for('centra.precios-plataforma.cargados-en');
type ConMarca = typeof globalThis & { [LLAVE]?: number };

/**
 * Los precios vigentes. Va a la base de datos como mucho una vez por minuto;
 * sin base de datos (un build sin claves) o si falla, se quedan los que había.
 */
export async function cargarPrecios(opciones: { forzar?: boolean } = {}): Promise<Precios> {
  const g = globalThis as ConMarca;
  if (!opciones.forzar && g[LLAVE] && Date.now() - g[LLAVE]! < VIGENCIA_MS) return preciosActuales();
  const db = getSupabaseAdmin();
  if (!db) return preciosActuales();
  try {
    const { data, error } = await db.from('ajustes_plataforma').select('valor').eq('clave', CLAVE_AJUSTE_PRECIOS).maybeSingle();
    if (error) throw error;
    fijarPrecios(leerPreciosGuardados(data?.valor));
    g[LLAVE] = Date.now();
  } catch (e) {
    console.error('[precios] no se pudieron leer:', e instanceof Error ? e.message : e);
  }
  return preciosActuales();
}

/** Tras guardar: los nuevos valen ya, sin esperar al minuto de caché. */
export function preciosRecienGuardados(p: Precios): void {
  fijarPrecios(p);
  (globalThis as ConMarca)[LLAVE] = Date.now();
}


// Con qué precios están las páginas ya generadas: lib/billing/precios-plataforma.ts.
export { marcarPublicados, paginasDesfasadas } from './precios-plataforma';
