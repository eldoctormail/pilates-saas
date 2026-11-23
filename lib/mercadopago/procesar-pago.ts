// Qué hace Tentare con un pago de Mercado Pago, tal cual lo devuelve su API.
// Lo comparten el webhook (`/api/mercadopago/webhook`, cuando avisa Mercado
// Pago) y el conciliador (`/api/cron/mercadopago-conciliar`, que repasa los
// pagos aprobados por si un aviso no llegó): los dos aplican un pago EXACTAMENTE
// igual, y como es idempotente da igual cuál llegue primero o si llegan los dos.
//
//   · Recibo (`tentare:rec:…`): lo da por cobrado `confirmarCobroRecibo`.
//   · Tarjeta regalo (`tentare:regalo:…`): la crea (o la anula) `procesarRegalo`.
//   · Compra de plan (`tentare:compra:…`): la entrega `entregarPlanComprado`
//     y, si la compra lleva una clase, la reserva `reservarClasePagada`.
//   Los mismos dueños que usa Stripe.
//
// El pago que recibe esta función tiene que venir de la API de Mercado Pago
// (`leerPago` o la búsqueda), nunca del cuerpo de un aviso.
//
// Devuelve el código HTTP y el cuerpo que el webhook contestaría: 200 = hecho
// (aplicado, ya estaba o descartado a propósito), 5xx = reintentable.

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { confirmarCobroRecibo, consumirCodigoDescuentoSiAplica } from '../billing/confirmar-cobro.ts';
import { MONEDA } from '../moneda.ts';
import type { PagoMercadoPago } from './api.ts';
import { importeCoincide, leerReferencia } from './referencia.ts';
import { procesarChargeRefunded, type Fuente } from '../billing/procesar-reembolso.ts';
import { idsDe } from '../billing/ids-compra.ts';

type DatosAdicionalesCompra = { genero?: string | null; comoConociste?: string | null; codigoPostal?: string | null; fechaNacimiento?: string | null };

export type Desenlace = 'aplicado' | 'ya_estaba' | 'no_aplicable' | 'rechazado' | 'pendiente';
export interface ResultadoProceso { status: number; cuerpo: Record<string, unknown> }

const etiquetas = { area: 'cobros', pasarela: 'mercadopago' } as const;
const resp = (cuerpo: Record<string, unknown>, init?: { status: number }): ResultadoProceso => ({ status: init?.status ?? 200, cuerpo });

async function anotar(
  admin: SupabaseClient,
  pago: PagoMercadoPago,
  studioId: string,
  reciboId: string | null,
  desenlace: Desenlace,
  detalle: string | null,
  compraId: string | null = null,
): Promise<boolean> {
  const { error } = await admin.from('pagos_mercadopago').upsert({
    payment_id: String(pago.id),
    studio_id: studioId,
    recibo_id: reciboId,
    compra_id: compraId,
    estado: pago.status,
    estado_detalle: pago.status_detail ?? null,
    importe: pago.transaction_amount,
    importe_devuelto: devueltoDe(pago),
    moneda: pago.currency_id,
    medio: pago.payment_method_id ?? pago.payment_type_id ?? null,
    desenlace,
    detalle,
    actualizado_en: new Date().toISOString(),
  }, { onConflict: 'payment_id' });
  if (error) {
    Sentry.captureMessage('[mercadopago/webhook] no se pudo anotar el pago', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, desenlace, error: error.message },
    });
    return false;
  }
  return true;
}

/** Lo devuelto del pago, en la unidad de la moneda. Un contracargo cuenta como devuelto entero. */
export function devueltoDe(pago: Pick<PagoMercadoPago, 'status' | 'transaction_amount' | 'transaction_amount_refunded'>): number {
  if (pago.status === 'charged_back') return pago.transaction_amount;
  if (pago.status === 'refunded') return Number(pago.transaction_amount_refunded ?? 0) || pago.transaction_amount;
  return Number(pago.transaction_amount_refunded ?? 0);
}

/**
 * `puedeAplicar` (cuenta del panel): ¿la cuenta que cobró este pago es la del
 * estudio de la referencia? Si no, no se toca nada: el dinero entró en otra
 * cuenta y no puede dar por cobrado lo de otro estudio (lib/mercadopago/cuenta.ts).
 */
export async function procesarPago(
  admin: SupabaseClient, pago: PagoMercadoPago, fuente: Fuente = 'webhook',
  puedeAplicar: (studioId: string) => boolean = () => true,
): Promise<ResultadoProceso> {

  const ref = leerReferencia(pago.external_reference);
  if (!ref) {
    // Un pago de la cuenta que no salió de Tentare (un cobro con QR, un link manual): no es nuestro.
    return resp({ recibido: true, ignorado: 'sin-referencia-de-tentare' });
  }
  const { studioId } = ref;
  if (!puedeAplicar(studioId)) {
    Sentry.captureMessage('[mercadopago] pago de una cuenta que no es la del estudio de la referencia', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, fuente },
    });
    return resp({ recibido: true, ignorado: 'cuenta-de-otro-estudio' });
  }
  // Tarjeta regalo: su propio libro (`regalos_mercadopago`), sus altas y sus anulaciones.
  if (ref.tipo === 'regalo') {
    const { procesarRegalo } = await import('./regalo.ts');
    return procesarRegalo(admin, pago, studioId, ref.regaloId);
  }
  const reciboId = ref.tipo === 'recibo' ? ref.reciboId : null;
  const compraId = ref.tipo === 'compra' ? ref.compraId : null;

  // ¿Ya aplicado? (reentrega del mismo pago)
  const { data: previo, error: errPrevio } = await admin.from('pagos_mercadopago')
    .select('desenlace, recibo_id, compra_id, importe_devuelto').eq('payment_id', String(pago.id)).maybeSingle();
  if (errPrevio) return resp({ error: 'Base de datos no disponible' }, { status: 503 });
  if (previo?.desenlace === 'aplicado' || previo?.desenlace === 'ya_estaba') {
    // Ya aplicado. Si desde entonces se devolvió (todo o parte, desde el panel o
    // desde Mercado Pago) o hubo contracargo, se anota en Tentare.
    if (devueltoDe(pago) > 0) {
      return aplicarDevolucion(admin, pago, studioId, {
        reciboId: (previo.recibo_id as string | null) ?? reciboId,
        compraId: (previo.compra_id as string | null) ?? compraId,
        desenlace: previo.desenlace as Desenlace,
        fuente,
      });
    }
    return resp({ recibido: true, yaAplicado: true });
  }

  if (ref.tipo === 'compra') return entregarCompra(admin, pago, ref.studioId, ref.compraId);
  if (!reciboId) return resp({ recibido: true, ignorado: 'referencia-rara' });

  const { data: recibo, error: errRecibo } = await admin.from('recibos')
    .select('importe, studio_id, estado').eq('id', reciboId).maybeSingle();
  if (errRecibo) return resp({ error: 'Base de datos no disponible' }, { status: 503 });
  if (!recibo || recibo.studio_id !== studioId) {
    Sentry.captureMessage('[mercadopago/webhook] pago con una referencia que no casa con ningún recibo del estudio', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, estado: pago.status },
    });
    const { data: estudio } = await admin.from('studios').select('id').eq('id', studioId).maybeSingle();
    if (estudio) await anotar(admin, pago, studioId, null, 'rechazado', 'el recibo no existe o es de otro estudio');
    return resp({ recibido: true, ignorado: 'recibo-desconocido' });
  }

  if (pago.status !== 'approved') {
    // Pendiente, en proceso, rechazado o cancelado: se anota y no se toca el recibo.
    const ok = await anotar(admin, pago, studioId, reciboId, 'pendiente', null);
    return ok ? resp({ recibido: true, estado: pago.status }) : resp({ error: 'No anotado' }, { status: 503 });
  }

  if (pago.currency_id !== MONEDA || !importeCoincide(pago.transaction_amount, Number(recibo.importe))) {
    Sentry.captureMessage('[mercadopago/webhook] pago aprobado que no cuadra con el recibo: NO se da por cobrado, revisar y devolver', {
      level: 'error', tags: etiquetas,
      extra: { paymentId: pago.id, studioId, reciboId, cobrado: pago.transaction_amount, moneda: pago.currency_id, esperado: recibo.importe, monedaEsperada: MONEDA },
    });
    await anotar(admin, pago, studioId, reciboId, 'rechazado', `cobrado ${pago.transaction_amount} ${pago.currency_id}, esperado ${recibo.importe} ${MONEDA}`);
    return resp({ recibido: true, ignorado: 'importe-no-coincide' });
  }

  const r = await confirmarCobroRecibo(admin, {
    studioId, reciboId, metodoCobro: 'MERCADOPAGO', paymentIntentId: null, fuente: 'webhook',
  });
  if (!r.ok) {
    // Fallo de escritura o de lectura: que Mercado Pago lo reintente.
    Sentry.captureMessage('[mercadopago/webhook] no se pudo confirmar el cobro; Mercado Pago lo reintentará', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, error: r.error, codigo: r.codigo },
    });
    return resp({ error: 'No se pudo confirmar' }, { status: 500 });
  }

  if (r.actualizado) {
    const ok = await anotar(admin, pago, studioId, reciboId, 'aplicado', null);
    // El recibo ya está cobrado: aunque el libro no se escriba, no se reintenta el cobro.
    return resp({ recibido: true, aplicado: true, anotado: ok });
  }

  // El recibo no se cerró con este pago: ya estaba cobrado por otra vía o anulado.
  // El dinero entró dos veces (o a un recibo perdonado): hay que devolverlo a mano.
  Sentry.captureMessage('[mercadopago/webhook] pago aprobado de un recibo que ya no estaba pendiente: posible doble cobro, devolver en Mercado Pago', {
    level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, estadoRecibo: recibo.estado },
  });
  await anotar(admin, pago, studioId, reciboId, 'no_aplicable', `recibo en estado ${String(recibo.estado)}: devolver en Mercado Pago`);
  return resp({ recibido: true, aplicado: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// Etapa 2: compra de un plan. Se entrega EXACTAMENTE lo que se decidió al abrir
// el pago (fila de `compras_mercadopago`), con `entregarPlanComprado`, el mismo
// dueño que usa Stripe: crea (o reutiliza) la suscripción y el recibo COBRADO,
// la matrícula si la hubo, la factura y los avisos. Idempotente: los ids salen
// de la compra (`idsDe(compraId)`), y una reentrega choca por clave primaria.
// ─────────────────────────────────────────────────────────────────────────────
async function entregarCompra(admin: SupabaseClient, pago: PagoMercadoPago, studioId: string, compraId: string): Promise<ResultadoProceso> {
  const { data: compra, error } = await admin.from('compras_mercadopago')
    .select('id, studio_id, plan_id, socio_id, email, importe_plan, matricula, moneda, codigo_descuento_id, terminos_hash, ciclo_fin, cuota_texto, estado, payment_id, creado_en, sesion_id, spot_id, es_invitada, nombre, telefono, origen_lead, widget_sesion, datos_adicionales')
    .eq('id', compraId).maybeSingle();
  if (error) return resp({ error: 'Base de datos no disponible' }, { status: 503 });
  if (!compra || compra.studio_id !== studioId) {
    Sentry.captureMessage('[mercadopago/webhook] pago de una compra que no existe en este estudio', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, compraId, estado: pago.status },
    });
    const { data: estudio } = await admin.from('studios').select('id').eq('id', studioId).maybeSingle();
    if (estudio) await anotar(admin, pago, studioId, null, 'rechazado', 'la compra no existe o es de otro estudio', null);
    return resp({ recibido: true, ignorado: 'compra-desconocida' });
  }

  if (pago.status !== 'approved') {
    const ok = await anotar(admin, pago, studioId, null, 'pendiente', null, compraId);
    return ok ? resp({ recibido: true, estado: pago.status }) : resp({ error: 'No anotado' }, { status: 503 });
  }

  // La compra ya la pagó OTRO pago: este es un segundo cobro.
  if (compra.estado === 'pagada' && compra.payment_id && compra.payment_id !== String(pago.id)) {
    Sentry.captureMessage('[mercadopago/webhook] segundo pago de una compra ya pagada: devolver en Mercado Pago', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, compraId, primerPago: compra.payment_id },
    });
    await anotar(admin, pago, studioId, null, 'no_aplicable', `la compra ya se pagó con el pago ${String(compra.payment_id)}: devolver en Mercado Pago`, compraId);
    return resp({ recibido: true, aplicado: false });
  }

  const importePlan = Number(compra.importe_plan);
  const matricula = Number(compra.matricula) || 0;
  const total = Math.round((importePlan + matricula) * 100) / 100;
  if (pago.currency_id !== compra.moneda || pago.currency_id !== MONEDA || !importeCoincide(pago.transaction_amount, total)) {
    Sentry.captureMessage('[mercadopago/webhook] pago aprobado de una compra que no cuadra: NO se entrega, revisar y devolver', {
      level: 'error', tags: etiquetas,
      extra: { paymentId: pago.id, studioId, compraId, cobrado: pago.transaction_amount, moneda: pago.currency_id, esperado: total, monedaEsperada: compra.moneda },
    });
    await anotar(admin, pago, studioId, null, 'rechazado', `cobrado ${pago.transaction_amount} ${pago.currency_id}, esperado ${total} ${String(compra.moneda)}`, compraId);
    return resp({ recibido: true, ignorado: 'importe-no-coincide' });
  }

  // Una compra que caducó (y quizá devolvió su plaza de matrícula) pero se pagó
  // igual: el dinero entró, se entrega. Solo se avisa para que conste.
  if (compra.estado === 'caducada' || compra.estado === 'fallida') {
    Sentry.captureMessage('[mercadopago/webhook] se pagó una compra que figuraba caducada: se entrega igual', {
      level: 'warning', tags: etiquetas, extra: { paymentId: pago.id, studioId, compraId, estado: compra.estado },
    });
  }

  const sesionId = (compra.sesion_id as string | null) ?? null;
  const { entregarPlanComprado } = await import('../billing/entregar-plan-comprado.ts');
  const entrega = await entregarPlanComprado(admin, {
    sessionId: compraId,
    studioId,
    planId: compra.plan_id as string,
    // Invitada (compra sin cuenta): sin socia, y la entrega crea su ficha con lo del formulario.
    socioId: (compra.socio_id as string | null) ?? null,
    terminosHash: (compra.terminos_hash as string | null) ?? null,
    terminosAceptadosEn: (compra.creado_en as string | null) ?? null,
    email: (compra.email as string | null) ?? null,
    nombre: (compra.nombre as string | null) ?? null,
    telefono: (compra.telefono as string | null) ?? null,
    datosAdicionales: (compra.datos_adicionales as DatosAdicionalesCompra | null) ?? null,
    widgetSesion: (compra.widget_sesion as string | null) ?? null,
    importeCobradoCentimos: Math.round(total * 100),
    matriculaCobradaCentimos: Math.round(matricula * 100),
    paymentIntentId: null,
    origenLead: (compra.origen_lead as string | null) ?? null,
    metodoCobro: 'MERCADOPAGO',
    esInvitada: compra.es_invitada === true,
    fuente: 'webhook',
    cicloFinISO: (compra.ciclo_fin as string | null) ?? null,
    cuotaTexto: (compra.cuota_texto as string | null) ?? null,
    sesionClaseId: sesionId,
  });
  if (!entrega.ok) {
    Sentry.captureMessage('[mercadopago/webhook] cobrado pero NO entregado', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, compraId, motivo: entrega.motivo, detalle: entrega.detalle },
    });
    // Sin socia o sin plan no se arregla reintentando: se anota y se resuelve a mano.
    if (entrega.motivo === 'sin-socia' || entrega.motivo === 'plan-no-encontrado') {
      await anotar(admin, pago, studioId, null, 'no_aplicable', `no se pudo entregar: ${entrega.motivo}. Entregar a mano o devolver.`, compraId);
      return resp({ recibido: true, entregado: false, motivo: entrega.motivo });
    }
    return resp({ error: 'Fallo al entregar el plan comprado' }, { status: 500 });
  }

  await consumirCodigoDescuentoSiAplica(admin, {
    codigoDescuentoId: (compra.codigo_descuento_id as string | null) ?? null,
    reciboId: entrega.reciboId, studioId, socioId: entrega.socioId, fuente: 'mercadopago webhook',
  });

  // «Pagar y reservar»: con el plan ya entregado, la clase. Best-effort (el
  // dinero y el plan ya están): si no hay plaza, `reservarClasePagada` avisa al
  // mostrador. Idempotente por el id de la compra (`res-web-…`), así que el
  // webhook y el conciliador pueden llegar los dos.
  if (sesionId) {
    const { reservarClasePagada } = await import('../billing/reservar-clase-pagada.ts');
    await reservarClasePagada(admin, {
      studioId, sesionId, socioId: entrega.socioId,
      paymentIntentId: compraId,
      spotId: (compra.spot_id as string | null) ?? null,
      via: 'mercadopago', referencia: { compraId, paymentId: String(pago.id) },
      suscripcionEntregadaId: entrega.suscripcionId,
      pagadoEn: pago.date_approved ?? null,
    });
  }

  await admin.from('compras_mercadopago')
    .update({ estado: 'pagada', payment_id: String(pago.id), actualizado_en: new Date().toISOString() })
    .eq('id', compraId).neq('estado', 'pagada');
  const anotado = await anotar(admin, pago, studioId, entrega.reciboId, 'aplicado', null, compraId);
  return resp({ recibido: true, entregado: true, anotado });
}

// ─────────────────────────────────────────────────────────────────────────────
// Devoluciones. Las anota `procesarChargeRefunded`, el mismo dueño que usa
// Stripe con `charge.refunded`: recibo DEVUELTO (total) o con lo devuelto
// (parcial), fila en `devoluciones`, créditos, aviso a la socia y, si la compra
// era de una clase, revertirla. El «cargo» de Mercado Pago es `mp_<pago>`;
// el acumulado devuelto sale de la API (`transaction_amount_refunded`), nunca de
// un delta, así que repetir no duplica nada.
//
// Un pago de compra con matrícula tiene DOS recibos (plan y matrícula): se
// pasa el de la matrícula para que el acumulado se reparta entre los dos, igual
// que con un cargo combinado de Stripe.
// ─────────────────────────────────────────────────────────────────────────────
async function aplicarDevolucion(
  admin: SupabaseClient,
  pago: PagoMercadoPago,
  studioId: string,
  p: { reciboId: string | null; compraId: string | null; desenlace: Desenlace; fuente: Fuente },
): Promise<ResultadoProceso> {
  if (!p.reciboId) {
    Sentry.captureMessage('[mercadopago] devolución de un pago aplicado sin recibo anotado: revisar a mano', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, compraId: p.compraId },
    });
    return resp({ recibido: true, ignorado: 'devolucion-sin-recibo' });
  }

  let reciboMatriculaId: string | null = null;
  if (p.compraId) {
    const { data: compra } = await admin.from('compras_mercadopago').select('matricula').eq('id', p.compraId).maybeSingle();
    if (Number(compra?.matricula) > 0) reciboMatriculaId = idsDe(p.compraId).reciboMatriculaId;
  }

  const total = Math.round(pago.transaction_amount * 100);
  const devuelto = Math.min(total, Math.round(devueltoDe(pago) * 100));
  const r = await procesarChargeRefunded(admin, {
    studioId,
    reciboId: p.reciboId,
    reciboMatriculaId,
    origenPi: undefined,
    charge: { id: `mp_${pago.id}`, refunded: devuelto >= total, amount: total, amountRefunded: devuelto },
    fuente: p.fuente,
    paymentIntentId: null,
    // La API ya da el acumulado de lo devuelto aprobado: no hay reembolsos «pending» que esperar.
    reembolsosConfirmados: true,
  });
  if (!r.ok) {
    Sentry.captureMessage('[mercadopago] no se pudo anotar la devolución; se reintentará', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId: p.reciboId, error: r.error },
    });
    return resp({ error: 'No se pudo anotar la devolución' }, { status: 500 });
  }
  if (pago.status === 'charged_back') {
    Sentry.captureMessage('[mercadopago] contracargo de un pago aplicado: el recibo queda devuelto', {
      level: 'warning', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId: p.reciboId },
    });
  }
  const motivo = pago.status === 'charged_back' ? 'contracargo' : devuelto >= total ? 'devuelto entero' : 'devuelto en parte';
  await anotar(admin, pago, studioId, p.reciboId, p.desenlace, `${motivo} en Mercado Pago`, p.compraId);
  return resp({ recibido: true, devolucion: true, huboEfecto: r.huboEfecto });
}
