// Aplica a la fila del estudio lo que dicen las reglas (reglas.ts) a partir de
// lo que Mercado Pago tiene de verdad. Lo usan el webhook, el cron de
// conciliación y la vuelta de /suscripcion. SOLO servidor.
//
// Toda escritura es compare-and-set sobre `subscription_id`: si entre la
// lectura y la escritura otra petición cambió de suscripción, no se pisa.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { cancelarSuscripcion, leerPagoAutorizado, leerSuscripcion } from './api';
import {
  decidirPorPago, decidirPorSuscripcion, leerReferencia, preapprovalDe, vencida,
  type Cambios, type Decision, type FilaEstudio,
} from './reglas';
import { facturarMensualidad } from './factura-centra';
import { emitirFactura } from '@/lib/arca/servidor';

export const COLUMNAS_MP = 'id, plan, subscription_status, subscription_id, current_period_end, cadena_id';

export type Resultado =
  | { tipo: 'aplicado'; cambios: Cambios }
  | { tipo: 'ignorado'; motivo: string }
  /** Mercado Pago o la base de datos no contestaron: que el aviso se reintente. */
  | { tipo: 'reintentar'; motivo: string };

const etiquetas = { area: 'billing', pasarela: 'mercadopago-plataforma' } as const;

export async function leerFila(admin: SupabaseClient, studioId: string): Promise<FilaEstudio | null> {
  const { data, error } = await admin.from('studios').select(COLUMNAS_MP).eq('id', studioId).maybeSingle();
  if (error) throw new Error(`leer estudio: ${error.message}`);
  return (data as FilaEstudio | null) ?? null;
}

/** Escribe los cambios solo si la fila sigue con la misma suscripción que se leyó. */
export async function escribir(admin: SupabaseClient, fila: FilaEstudio, cambios: Cambios): Promise<boolean> {
  let q = admin.from('studios').update(cambios).eq('id', fila.id);
  q = fila.subscription_id === null ? q.is('subscription_id', null) : q.eq('subscription_id', fila.subscription_id);
  const { data, error } = await q.select('id');
  if (error) throw new Error(`actualizar estudio: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

async function aplicar(admin: SupabaseClient, token: string, fila: FilaEstudio, d: Decision): Promise<Resultado> {
  if (!d.aplicar) return { tipo: 'ignorado', motivo: d.motivo };
  if (!(await escribir(admin, fila, d.cambios))) return { tipo: 'reintentar', motivo: 'cambio-en-medio' };
  console.info('[mp-plataforma] estudio actualizado', { studioId: fila.id, ...d.cambios });
  if (d.cancelarAnterior) {
    // La nueva ya está escrita: la vieja deja de cobrar. Si Mercado Pago no
    // contesta, queda avisado para cancelarla a mano (nunca dos cobros sin saberlo).
    const r = await cancelarSuscripcion(token, d.cancelarAnterior);
    if (!r.ok) {
      Sentry.captureMessage('[mp-plataforma] no se pudo cancelar la suscripción anterior', {
        level: 'error', tags: etiquetas, extra: { studioId: fila.id, anterior: d.cancelarAnterior, error: r.error },
      });
    }
  }
  return { tipo: 'aplicado', cambios: d.cambios };
}

/** Relee una suscripción en Mercado Pago y pone al día el estudio de su referencia. */
export async function sincronizarSuscripcion(
  admin: SupabaseClient, token: string, preapprovalId: string, ahora = new Date(),
): Promise<Resultado> {
  const leida = await leerSuscripcion(token, preapprovalId);
  if (!leida.ok) {
    if (leida.status === 404 || leida.status === 400) return { tipo: 'ignorado', motivo: 'suscripcion-desconocida' };
    return { tipo: 'reintentar', motivo: `mercadopago-${leida.status}` };
  }
  const ref = leerReferencia(leida.datos.external_reference);
  if (!ref) return { tipo: 'ignorado', motivo: 'no-es-de-centra' };
  const fila = await leerFila(admin, ref.studioId);
  if (!fila) return { tipo: 'ignorado', motivo: 'estudio-desconocido' };
  return aplicar(admin, token, fila, decidirPorSuscripcion(fila, leida.datos, ahora));
}

/** Un cobro mensual: primero la suscripción (corre la fecha), después el estado del cobro. */
export async function sincronizarPago(admin: SupabaseClient, token: string, pagoId: string, ahora = new Date()): Promise<Resultado> {
  const leido = await leerPagoAutorizado(token, pagoId);
  if (!leido.ok) {
    if (leido.status === 404 || leido.status === 400) return { tipo: 'ignorado', motivo: 'pago-desconocido' };
    return { tipo: 'reintentar', motivo: `mercadopago-${leido.status}` };
  }
  const pago = leido.datos;
  const previo = await sincronizarSuscripcion(admin, token, String(pago.preapproval_id), ahora);
  if (previo.tipo === 'reintentar') return previo;
  const leida = await leerSuscripcion(token, String(pago.preapproval_id));
  if (!leida.ok) return { tipo: 'reintentar', motivo: `mercadopago-${leida.status}` };
  const ref = leerReferencia(leida.datos.external_reference);
  if (!ref) return { tipo: 'ignorado', motivo: 'no-es-de-centra' };
  const fila = await leerFila(admin, ref.studioId);
  if (!fila) return { tipo: 'ignorado', motivo: 'estudio-desconocido' };
  const resultado = await aplicar(admin, token, fila, decidirPorPago(fila, pago));
  // La factura de Centra de este cobro (apagada sin CENTRA_FACTURACION_ESTUDIO_ID). Un fallo no tumba el aviso:
  // el recibo queda cobrado y la factura se emite a mano desde Cobros del estudio de Centra.
  if (resultado.tipo !== 'reintentar' && fila.subscription_id === `mp:${pago.preapproval_id}`) {
    const f = await facturarMensualidad(admin, { pago, preapproval: leida.datos, studioId: ref.studioId, fetch, emitir: emitirFactura });
    if (f.tipo === 'sin-factura') {
      Sentry.captureMessage('Mensualidad cobrada por Mercado Pago sin factura de ARCA', {
        level: 'warning', tags: etiquetas, extra: { reciboId: f.reciboId, error: f.error },
      });
    }
  }
  return resultado;
}

/** Se acabó lo pagado (más el margen): se cierra. Devuelve si lo cerró. */
export async function cerrarSiVencida(admin: SupabaseClient, fila: FilaEstudio, ahora = new Date()): Promise<boolean> {
  if (!vencida(fila, ahora)) return false;
  const cerrada = await escribir(admin, fila, { subscription_status: 'canceled' });
  if (cerrada) console.info('[mp-plataforma] suscripción vencida, panel cerrado', { studioId: fila.id });
  return cerrada;
}

/** Los estudios que pagan (o pagaban) con Mercado Pago, para el cron. */
export async function estudiosConSuscripcionMp(admin: SupabaseClient): Promise<FilaEstudio[]> {
  const { data, error } = await admin.from('studios').select(COLUMNAS_MP).like('subscription_id', 'mp:%')
    .in('subscription_status', ['active', 'past_due']).limit(1000);
  if (error) throw new Error(`leer estudios: ${error.message}`);
  return ((data ?? []) as FilaEstudio[]).filter((f) => preapprovalDe(f.subscription_id));
}
