// Carga los precios de los planes guardados en `ajustes_plataforma` y los deja
// en el almacén compartido (lib/billing/precios-plataforma.ts). SOLO servidor.
//
// La lee el layout raíz en cada render (con caché de un minuto), así que una
// página nueva siempre sale con los precios al día. Tras guardar desde
// /interno/precios, la ruta fija los nuevos al momento y regenera las páginas.
import 'server-only';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { senalConLimite } from '@/lib/senal-con-limite';
import { CLAVE_AJUSTE_PRECIOS, fijarPrecios, leerPreciosGuardados, preciosActuales, type Precios } from './precios-plataforma';

const VIGENCIA_MS = 60_000;
/**
 * Lo más que espera el layout raíz a la base de datos. Lo lee CADA página, así
 * que una base lenta o caída no puede retenerlas: sin esto, supabase-js
 * reintentaba con espera y cada página tardaba unos 7 s en salir (lo destapó
 * el CI, donde la base no existe).
 */
const ESPERA_MAXIMA_MS = 2_500;
const LLAVE = Symbol.for('centra.precios-plataforma.cargados-en');
const EN_CURSO = Symbol.for('centra.precios-plataforma.en-curso');
type ConMarca = typeof globalThis & { [LLAVE]?: number; [EN_CURSO]?: Promise<Precios> };

/**
 * Los precios vigentes. Va a la base de datos como mucho una vez por minuto
 * (también si falla: entretanto valen los que había) y las peticiones que
 * llegan a la vez comparten la misma lectura. Sin base de datos (un build sin
 * claves) se quedan los que había.
 */
export async function cargarPrecios(opciones: { forzar?: boolean } = {}): Promise<Precios> {
  const g = globalThis as ConMarca;
  if (!opciones.forzar && g[LLAVE] && Date.now() - g[LLAVE]! < VIGENCIA_MS) return preciosActuales();
  if (!opciones.forzar && g[EN_CURSO]) return g[EN_CURSO]!;
  const db = getSupabaseAdmin();
  if (!db) return preciosActuales();
  const lectura = (async () => {
    try {
      const { data, error } = await db.from('ajustes_plataforma').select('valor').eq('clave', CLAVE_AJUSTE_PRECIOS)
        .retry(false).abortSignal(senalConLimite(ESPERA_MAXIMA_MS)).maybeSingle();
      if (error) throw error;
      fijarPrecios(leerPreciosGuardados(data?.valor));
    } catch (e) {
      console.error('[precios] no se pudieron leer:', e instanceof Error ? e.message : e);
    } finally {
      g[LLAVE] = Date.now();
      g[EN_CURSO] = undefined;
    }
    return preciosActuales();
  })();
  g[EN_CURSO] = lectura;
  return lectura;
}

/** Tras guardar: los nuevos valen ya, sin esperar al minuto de caché. */
export function preciosRecienGuardados(p: Precios): void {
  fijarPrecios(p);
  (globalThis as ConMarca)[LLAVE] = Date.now();
}


// Con qué precios están las páginas ya generadas: lib/billing/precios-plataforma.ts.
export { marcarPublicados, paginasDesfasadas } from './precios-plataforma';
