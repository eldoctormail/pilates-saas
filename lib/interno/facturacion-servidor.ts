import 'server-only';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cruzarFacturacion, pagaConMercadoPago, type FacturacionReal, type FilaCadena, type FilaEstudio, type LecturaMercadoPago } from './facturacion-real.ts';
import { CON_MERCADOPAGO } from '@/lib/pasarela';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { leerSuscripcion } from '@/lib/billing/mp-plataforma/api';
import { preapprovalDe, type Preapproval } from '@/lib/billing/mp-plataforma/reglas';

/**
 * Las suscripciones de Mercado Pago de los estudios que pagan así (`subscription_id = mp:<id>`), preguntadas una a
 * una a la cuenta de Centra (Mercado Pago no lista preapprovals por cuenta sin filtros). Si falta la configuración o
 * Mercado Pago no contesta a ninguna, `disponible: false` y un aviso: nunca un MRR de 0 que parezca real.
 */
async function leerMercadoPago(estudios: FilaEstudio[]): Promise<{ lectura: LecturaMercadoPago; aviso: string | null }> {
  const porEstudio = new Map<string, Preapproval | null>();
  const cfg = configMpPlataforma();
  if (!cfg.ok) return { lectura: { disponible: false, porEstudio }, aviso: cfg.motivo };
  const conMp = estudios.filter(pagaConMercadoPago);
  let fallos = 0;
  let ultimoError: string | null = null;
  // De a cinco: con decenas de estudios no se le pega a Mercado Pago con todo a la vez.
  for (let i = 0; i < conMp.length; i += 5) {
    await Promise.all(conMp.slice(i, i + 5).map(async (e) => {
      const id = preapprovalDe(e.subscription_id);
      if (!id) { porEstudio.set(e.id, null); return; }
      const r = await leerSuscripcion(cfg.accessToken, id);
      if (r.ok) porEstudio.set(e.id, r.datos);
      else if (r.status === 404) porEstudio.set(e.id, null);
      else { fallos += 1; ultimoError = r.error; }
    }));
  }
  if (conMp.length > 0 && fallos === conMp.length) {
    return { lectura: { disponible: false, porEstudio }, aviso: `Mercado Pago no respondió: ${ultimoError ?? 'sin detalle'}` };
  }
  // Las que fallaron sueltas no están en el mapa: su línea sale como descuadre («no se pudo preguntar»).
  return { lectura: { disponible: true, porEstudio }, aviso: null };
}

/**
 * El estado de cobro real de cada estudio, preguntado a Stripe y cruzado con la
 * base. Lo comparten /interno → Facturación y /interno → Hoy: dos pantallas que
 * calculasen el dinero cada una a su manera serían peor que una mal (nunca
 * sabrías cuál miente). Ver la cabecera de `facturacion-real.ts`.
 *
 * Si Stripe falla NO se devuelve un MRR de 0: `avisoStripe` dice por qué, y
 * quien lo pinte enseña «no he podido preguntar», que es distinto de «no cobras
 * nada». `null` solo si no se pudo leer la base.
 */
export async function leerFacturacion(db: SupabaseClient): Promise<
  { resultado: FacturacionReal; subs: Stripe.Subscription[]; avisoStripe: string | null } | null
> {
  const [estudios, cadenas] = await Promise.all([
    db.from('studios').select('id, nombre, plan, subscription_status, stripe_customer_id, cadena_id, subscription_id, current_period_end, trial_ends_at'),
    db.from('cadenas').select('id, nombre, plan, subscription_status, stripe_customer_id'),
  ]);
  if (estudios.error) return null;

  // Con Mercado Pago (Argentina) la mensualidad de los estudios se cobra con la cuenta de Centra en Mercado Pago
  // (lib/billing/mp-plataforma): ese es el dinero que hay que leer. Stripe solo si además tiene clave.
  if (CON_MERCADOPAGO) {
    const filas = (estudios.data ?? []) as unknown as FilaEstudio[];
    const { lectura, aviso } = await leerMercadoPago(filas);
    const resultado = cruzarFacturacion(filas, (cadenas.data ?? []) as unknown as FilaCadena[], [], false, lectura);
    return { resultado, subs: [], avisoStripe: aviso };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  let subs: Stripe.Subscription[] = [];
  let avisoStripe: string | null = null;

  if (key) {
    try {
      const stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
      // Todas las suscripciones de la cuenta de PLATAFORMA (lo que los estudios
      // nos pagan). Las de Connect son cobros de las socias a su estudio y no
      // son ingreso nuestro: no se listan aquí a propósito.
      //
      // `status: 'all'` porque las canceladas e impagadas son justo las que hay
      // que ver. `expand` trae el precio para calcular el importe de verdad.
      for await (const sub of stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.items.data.price'],
      })) {
        subs.push(sub);
      }
    } catch (e) {
      avisoStripe = e instanceof Error ? e.message : 'Stripe no respondió';
      subs = [];
    }
  } else {
    avisoStripe = 'STRIPE_SECRET_KEY no está configurada en este entorno';
  }

  const resultado = cruzarFacturacion(
    (estudios.data ?? []) as unknown as FilaEstudio[],
    (cadenas.data ?? []) as unknown as FilaCadena[],
    subs,
    avisoStripe === null,
  );
  return { resultado, subs, avisoStripe };
}
