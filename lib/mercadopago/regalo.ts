// Tarjeta regalo pagada con Mercado Pago (autoalojado). Lo llama `procesarPago`
// (webhook y conciliador) con un pago `tentare:regalo:…` leído de la API de
// Mercado Pago, nunca del cuerpo de un aviso.
//
//   · Aprobado y cuadra con lo que se decidió al abrir el pago (importe y
//     moneda, de `regalos_mercadopago`) → la tarjeta la crea `regalo_crear`
//     (idempotente: el id de la fila es su `checkout_session_id`) y los correos
//     salen una vez (`enviarCorreosUnaVez`). Los mismos dueños que usa Stripe.
//   · Devuelto entero o contracargo → la tarjeta se anula y se retira el saldo
//     que le quedara (`anularRegaloPorPago`: lo ya gastado no vuelve). Una
//     devolución parcial solo se anota y se avisa: el estudio decide.
//   · Devuelto antes de crearse → no se crea (nunca una tarjeta con saldo de un
//     pago que ya no está).
//
// Idempotente: el webhook y el conciliador pueden llegar los dos.

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MONEDA } from '../moneda.ts';
import type { PagoMercadoPago } from './api.ts';
import { importeCoincide } from './referencia.ts';
import type { ResultadoProceso } from './procesar-pago.ts';

const etiquetas = { area: 'cobros', pasarela: 'mercadopago', tipo: 'regalo' } as const;
const resp = (cuerpo: Record<string, unknown>, status = 200): ResultadoProceso => ({ status, cuerpo });

function devuelto(pago: Pick<PagoMercadoPago, 'status' | 'transaction_amount' | 'transaction_amount_refunded'>): number {
  if (pago.status === 'charged_back') return pago.transaction_amount;
  if (pago.status === 'refunded') return Number(pago.transaction_amount_refunded ?? 0) || pago.transaction_amount;
  return Number(pago.transaction_amount_refunded ?? 0);
}

async function anotar(
  admin: SupabaseClient, pago: PagoMercadoPago, studioId: string, regaloId: string | null,
  desenlace: string, detalle: string | null,
): Promise<boolean> {
  const { error } = await admin.from('pagos_mercadopago').upsert({
    payment_id: String(pago.id), studio_id: studioId, recibo_id: null, compra_id: null, regalo_id: regaloId,
    estado: pago.status, estado_detalle: pago.status_detail ?? null, importe: pago.transaction_amount,
    importe_devuelto: devuelto(pago), moneda: pago.currency_id, medio: pago.payment_method_id ?? pago.payment_type_id ?? null,
    desenlace, detalle, actualizado_en: new Date().toISOString(),
  }, { onConflict: 'payment_id' });
  if (error) {
    Sentry.captureMessage('[mercadopago/regalo] no se pudo anotar el pago', { level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId, error: error.message } });
    return false;
  }
  return true;
}

export async function procesarRegalo(admin: SupabaseClient, pago: PagoMercadoPago, studioId: string, regaloId: string): Promise<ResultadoProceso> {
  const { data: fila, error } = await admin.from('regalos_mercadopago')
    .select('id, studio_id, importe, moneda, caducidad_meses, comprador_nombre, comprador_email, destinatario_nombre, destinatario_email, mensaje, estado, payment_id, tarjeta_id')
    .eq('id', regaloId).maybeSingle();
  if (error) return resp({ error: 'Base de datos no disponible' }, 503);
  if (!fila || fila.studio_id !== studioId) {
    Sentry.captureMessage('[mercadopago/regalo] pago de un regalo que no existe en este estudio', { level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId } });
    const { data: estudio } = await admin.from('studios').select('id').eq('id', studioId).maybeSingle();
    if (estudio) await anotar(admin, pago, studioId, null, 'rechazado', 'el regalo no existe o es de otro estudio');
    return resp({ recibido: true, ignorado: 'regalo-desconocido' });
  }

  const esteEsElPago = !fila.payment_id || fila.payment_id === String(pago.id);
  const loDevuelto = devuelto(pago);

  // Devuelto (todo o parte) o contracargo.
  if (loDevuelto > 0 && esteEsElPago) {
    const entero = pago.status === 'refunded' || pago.status === 'charged_back' || loDevuelto >= pago.transaction_amount;
    if (!fila.tarjeta_id) {
      // Se devolvió antes de entregarse: la tarjeta no llega a existir.
      await admin.from('regalos_mercadopago').update({ estado: 'fallida', payment_id: String(pago.id), actualizado_en: new Date().toISOString() })
        .eq('id', regaloId).neq('estado', 'pagada');
      const ok = await anotar(admin, pago, studioId, regaloId, 'no_aplicable', 'devuelto antes de crear la tarjeta');
      return ok ? resp({ recibido: true, entregado: false, motivo: 'devuelto' }) : resp({ error: 'No anotado' }, 503);
    }
    if (entero) {
      const { anularRegaloPorPago } = await import('../regalo/stripe.ts');
      const r = await anularRegaloPorPago(admin, studioId, String(pago.id),
        pago.status === 'charged_back' ? 'Contracargo del pago en Mercado Pago' : 'Pago devuelto en Mercado Pago');
      if (!r.ok) return resp({ error: 'No se pudo anular la tarjeta' }, 500);
    } else {
      Sentry.captureMessage('[mercadopago/regalo] devolución parcial de una tarjeta regalo: la tarjeta sigue activa, revisar', {
        level: 'warning', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId, devuelto: loDevuelto },
      });
    }
    const ok = await anotar(admin, pago, studioId, regaloId, 'aplicado', entero ? 'tarjeta anulada por devolución' : `devolución parcial de ${loDevuelto}`);
    return ok ? resp({ recibido: true, anulada: entero }) : resp({ error: 'No anotado' }, 503);
  }

  if (pago.status !== 'approved') {
    const ok = await anotar(admin, pago, studioId, regaloId, 'pendiente', null);
    return ok ? resp({ recibido: true, estado: pago.status }) : resp({ error: 'No anotado' }, 503);
  }

  if (!esteEsElPago) {
    Sentry.captureMessage('[mercadopago/regalo] segundo pago de un regalo ya pagado: devolver en Mercado Pago', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId, primerPago: fila.payment_id },
    });
    await anotar(admin, pago, studioId, regaloId, 'no_aplicable', `el regalo ya se pagó con el pago ${String(fila.payment_id)}: devolver en Mercado Pago`);
    return resp({ recibido: true, aplicado: false });
  }

  const importe = Number(fila.importe);
  if (pago.currency_id !== fila.moneda || pago.currency_id !== MONEDA || !importeCoincide(pago.transaction_amount, importe)) {
    Sentry.captureMessage('[mercadopago/regalo] pago aprobado de un regalo que no cuadra: NO se crea la tarjeta, revisar y devolver', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId, cobrado: pago.transaction_amount, esperado: importe, moneda: pago.currency_id },
    });
    await anotar(admin, pago, studioId, regaloId, 'rechazado', `cobrado ${pago.transaction_amount} ${pago.currency_id}, esperado ${importe} ${String(fila.moneda)}`);
    return resp({ recibido: true, ignorado: 'importe-no-coincide' });
  }

  const { crearTarjeta } = await import('../regalo/servidor.ts');
  const r = await crearTarjeta(admin, {
    studioId, origen: 'ONLINE', sessionId: regaloId, paymentIntentId: String(pago.id),
    importeEur: importe, compradorNombre: fila.comprador_nombre as string, compradorEmail: fila.comprador_email as string,
    destinatarioNombre: fila.destinatario_nombre as string, destinatarioEmail: fila.destinatario_email as string,
    mensaje: (fila.mensaje as string | null) || null, caducidadMeses: Number(fila.caducidad_meses),
    metodoManual: null, actorTipo: 'webhook', actorId: String(pago.id),
  });
  if (!r.ok) {
    Sentry.captureMessage('[mercadopago/regalo] cobrado pero sin tarjeta: se reintenta', { level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, regaloId, error: r.error } });
    return resp({ error: 'No se pudo crear la tarjeta' }, 500);
  }

  await admin.from('regalos_mercadopago')
    .update({ estado: 'pagada', payment_id: String(pago.id), tarjeta_id: r.tarjetaId, actualizado_en: new Date().toISOString() })
    .eq('id', regaloId);
  const { enviarCorreosUnaVez } = await import('../regalo/enviar.ts');
  await enviarCorreosUnaVez(admin, studioId, r.tarjetaId);
  const anotado = await anotar(admin, pago, studioId, regaloId, 'aplicado', null);
  return resp({ recibido: true, entregado: true, anotado });
}
