// La factura de ARCA de la mensualidad que cada estudio le paga a Centra por Mercado Pago.
//
// Centra factura como un estudio más: el titular crea en la app un estudio para Centra, configura ahí su factura
// electrónica de ARCA (Configuración → Cobros → Factura electrónica: CUIT, condición, punto de venta y certificado)
// y pone su id en CENTRA_FACTURACION_ESTUDIO_ID. Por cada cobro mensual aprobado:
//   1. Se crea en ese estudio un recibo COBRADO con id fijo por cobro (`rec-centra-mp-<id del cobro>`): un aviso
//      repetido de Mercado Pago encuentra el mismo recibo y no crea otro.
//   2. Se emite su factura con el motor de siempre (lib/arca/servidor.ts: numeración, pendientes, CAE), que ya es
//      idempotente por recibo. La letra la decide la condición de Centra (monotributo → C).
// Si algo falla, el recibo queda cobrado y sin factura: se emite a mano desde Cobros de ese estudio, como cualquier
// otro. Nunca se tumba el aviso de Mercado Pago por la factura.
//
// Sin la variable, apagado: no se crea nada.
//
// Sin `server-only`: lo prueba `node --test` con un cliente falso.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Fetch } from '../../arca/soap.ts';
import { CONSUMIDOR_FINAL } from '../../arca/reglas.ts';
import type { PagoAutorizado, Preapproval } from './reglas.ts';

export type ResultadoFacturaCentra =
  | { tipo: 'apagado' }
  | { tipo: 'no-corresponde'; motivo: string }
  | { tipo: 'emitida'; reciboId: string; numero: number }
  | { tipo: 'sin-factura'; reciboId: string; error: string };

/** El id del recibo de un cobro: uno por cobro, para siempre. */
export function idReciboCentra(pagoId: string | number): string {
  return `rec-centra-mp-${String(pagoId).replace(/[^A-Za-z0-9]/g, '')}`;
}

/** La condición frente al IVA del estudio que paga, según su propia configuración de ARCA (si la tiene). */
export function receptorDelEstudio(
  nombre: string | null,
  arca: { cuit: string | null; condicion: string | null } | null,
): { documento: string | null; condicionIva: number; nombre: string | null } {
  if (arca?.cuit && arca.condicion === 'RESPONSABLE_INSCRIPTO') return { documento: arca.cuit, condicionIva: 1, nombre };
  if (arca?.cuit && arca.condicion === 'MONOTRIBUTO') return { documento: arca.cuit, condicionIva: 6, nombre };
  return { documento: null, condicionIva: CONSUMIDOR_FINAL, nombre };
}

/** El importe cobrado: el del cobro si Mercado Pago lo trae; si no, el de la suscripción. */
export function importeDelCobro(pago: PagoAutorizado, pre: Preapproval | null): number | null {
  const delPago = Number((pago as { transaction_amount?: number }).transaction_amount);
  if (Number.isFinite(delPago) && delPago > 0) return delPago;
  const deLaSub = Number(pre?.auto_recurring?.transaction_amount);
  return Number.isFinite(deLaSub) && deLaSub > 0 ? deLaSub : null;
}

export type Emisor = (admin: SupabaseClient, p: {
  studioId: string; reciboId: string; receptor: ReturnType<typeof receptorDelEstudio>; fetch: Fetch;
}) => Promise<{ ok: true; comprobante: { numero: number } } | { ok: false; error: string }>;

export async function facturarMensualidad(admin: SupabaseClient, p: {
  pago: PagoAutorizado;
  preapproval: Preapproval | null;
  /** El estudio que paga. */
  studioId: string;
  fetch: Fetch;
  emitir: Emisor;
  env?: Record<string, string | undefined>;
  ahora?: Date;
}): Promise<ResultadoFacturaCentra> {
  const centra = (p.env ?? process.env).CENTRA_FACTURACION_ESTUDIO_ID?.trim();
  if (!centra) return { tipo: 'apagado' };
  if (p.pago.payment?.status !== 'approved') return { tipo: 'no-corresponde', motivo: `cobro-${p.pago.payment?.status ?? p.pago.status}` };
  if (p.studioId === centra) return { tipo: 'no-corresponde', motivo: 'es-el-estudio-de-centra' };
  const importe = importeDelCobro(p.pago, p.preapproval);
  if (importe === null) return { tipo: 'no-corresponde', motivo: 'sin-importe' };

  const [{ data: estudio }, { data: arca }] = await Promise.all([
    admin.from('studios').select('nombre').eq('id', p.studioId).maybeSingle(),
    admin.from('arca_config').select('cuit, condicion').eq('studio_id', p.studioId).maybeSingle(),
  ]);
  const nombre = (estudio as { nombre?: string | null } | null)?.nombre ?? null;
  const reciboId = idReciboCentra(p.pago.id);
  const ahora = (p.ahora ?? new Date()).toISOString();
  const concepto = `Centra · ${p.preapproval?.reason ?? 'Suscripción mensual'}${nombre ? ` · ${nombre}` : ''}`.slice(0, 300);

  // Idempotente: si el recibo ya existe (otro aviso del mismo cobro), se sigue con él.
  const { error: e1 } = await admin.from('recibos').upsert({
    id: reciboId, studio_id: centra, socio_id: null, concepto, importe, estado: 'COBRADO',
    fecha_vencimiento: ahora.slice(0, 10), fecha_cobro: ahora, cobrado_en: ahora, metodo_cobro: 'MERCADOPAGO',
  }, { onConflict: 'id', ignoreDuplicates: true });
  if (e1) return { tipo: 'sin-factura', reciboId, error: `No se pudo crear el recibo: ${e1.message}` };

  try {
    const r = await p.emitir(admin, {
      studioId: centra, reciboId, receptor: receptorDelEstudio(nombre, arca as { cuit: string | null; condicion: string | null } | null), fetch: p.fetch,
    });
    return r.ok ? { tipo: 'emitida', reciboId, numero: r.comprobante.numero } : { tipo: 'sin-factura', reciboId, error: r.error };
  } catch (err) {
    return { tipo: 'sin-factura', reciboId, error: err instanceof Error ? err.message : 'error al emitir' };
  }
}
