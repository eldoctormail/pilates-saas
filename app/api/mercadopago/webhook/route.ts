// Avisos (webhooks) de Mercado Pago: confirma el cobro de un recibo pagado con
// Checkout Pro (autoalojado, Etapa 1).
//
// Reglas, las mismas que con Stripe:
//   1. Sin firma válida (`x-signature`, clave MERCADOPAGO_WEBHOOK_SECRET) no se
//      hace nada: 401.
//   2. El cuerpo del aviso no se cree: el pago se RELEE en la API de Mercado
//      Pago con el Access Token, y de ahí salen estado, importe, moneda y la
//      referencia de qué se pagó.
//   3. El recibo se vuelve a leer de la base de datos: tiene que ser del
//      estudio de la referencia y el importe tiene que cuadrar al centavo.
//   4. Lo da por cobrado `confirmarCobroRecibo` (el dueño único de «recibo
//      cobrado», el mismo que usa el webhook de Stripe): factura, renovación,
//      créditos y avisos salen de ahí.
//   5. Idempotente: Mercado Pago reintenta (cada 15 min) hasta recibir 200, y el
//      mismo pago puede avisarse varias veces (created, updated). El libro
//      `pagos_mercadopago` dice si ya se aplicó.
//   6. Un error que se puede reintentar (la API de Mercado Pago o la base de
//      datos no contestan) devuelve 500 para que Mercado Pago lo vuelva a mandar.

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { confirmarCobroRecibo } from '@/lib/billing/confirmar-cobro';
import { MONEDA } from '@/lib/moneda';
import { configMercadoPago } from '@/lib/mercadopago/config';
import { verificarFirma } from '@/lib/mercadopago/firma';
import { leerPago, type PagoMercadoPago } from '@/lib/mercadopago/api';
import { importeCoincide, leerReferencia } from '@/lib/mercadopago/referencia';

type Desenlace = 'aplicado' | 'ya_estaba' | 'no_aplicable' | 'rechazado' | 'pendiente';

const etiquetas = { area: 'cobros', pasarela: 'mercadopago' } as const;

async function anotar(
  admin: SupabaseClient,
  pago: PagoMercadoPago,
  studioId: string,
  reciboId: string | null,
  desenlace: Desenlace,
  detalle: string | null,
): Promise<boolean> {
  const { error } = await admin.from('pagos_mercadopago').upsert({
    payment_id: String(pago.id),
    studio_id: studioId,
    recibo_id: reciboId,
    estado: pago.status,
    estado_detalle: pago.status_detail ?? null,
    importe: pago.transaction_amount,
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

export async function POST(req: NextRequest) {
  const config = configMercadoPago();
  if (!config.ok) {
    console.error('[mercadopago/webhook]', config.motivo);
    return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  }

  const url = req.nextUrl;
  const cuerpo = await req.json().catch(() => null) as { type?: string; topic?: string; data?: { id?: string | number } } | null;
  const tipo = url.searchParams.get('type') ?? cuerpo?.type ?? url.searchParams.get('topic') ?? cuerpo?.topic ?? null;
  // La firma se calcula con el data.id del QUERY STRING (documentación de Mercado Pago).
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  const firma = verificarFirma(
    { xSignature: req.headers.get('x-signature'), xRequestId: req.headers.get('x-request-id'), dataId },
    config.webhookSecret,
  );
  if (!firma.ok) {
    Sentry.captureMessage('[mercadopago/webhook] aviso con firma no válida', {
      level: 'warning', tags: etiquetas, extra: { motivo: firma.motivo, tipo, dataId },
    });
    return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
  }

  // Solo pagos. El resto de avisos (merchant_order, etc.) se contesta 200 para que no se reintenten.
  if (tipo !== 'payment' || !dataId) return NextResponse.json({ recibido: true, ignorado: tipo ?? 'sin-tipo' });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });

  const leido = await leerPago(config.accessToken, dataId);
  if (!leido.ok) {
    // 404 = ese pago no es de esta cuenta (o no existe): reintentar no lo arregla.
    if (leido.status === 404) return NextResponse.json({ recibido: true, ignorado: 'pago-desconocido' });
    Sentry.captureMessage('[mercadopago/webhook] no se pudo leer el pago', {
      level: 'warning', tags: etiquetas, extra: { dataId, status: leido.status, error: leido.error },
    });
    return NextResponse.json({ error: 'No se pudo leer el pago' }, { status: 502 });
  }
  const pago = leido.datos;

  const ref = leerReferencia(pago.external_reference);
  if (!ref) {
    // Un pago de la cuenta que no salió de Tentare (un cobro con QR, un link manual): no es nuestro.
    return NextResponse.json({ recibido: true, ignorado: 'sin-referencia-de-tentare' });
  }
  const { studioId, reciboId } = ref;

  // ¿Ya aplicado? (reentrega del mismo pago)
  const { data: previo, error: errPrevio } = await admin.from('pagos_mercadopago')
    .select('desenlace').eq('payment_id', String(pago.id)).maybeSingle();
  if (errPrevio) return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 503 });
  if (previo?.desenlace === 'aplicado' || previo?.desenlace === 'ya_estaba') {
    if (pago.status === 'refunded' || pago.status === 'charged_back') {
      Sentry.captureMessage('[mercadopago/webhook] un pago ya aplicado se devolvió en Mercado Pago: revisar el recibo a mano', {
        level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, estado: pago.status },
      });
      await anotar(admin, pago, studioId, reciboId, previo.desenlace as Desenlace, `devuelto en Mercado Pago (${pago.status}): revisar a mano`);
    }
    return NextResponse.json({ recibido: true, yaAplicado: true });
  }

  const { data: recibo, error: errRecibo } = await admin.from('recibos')
    .select('importe, studio_id, estado').eq('id', reciboId).maybeSingle();
  if (errRecibo) return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 503 });
  if (!recibo || recibo.studio_id !== studioId) {
    Sentry.captureMessage('[mercadopago/webhook] pago con una referencia que no casa con ningún recibo del estudio', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, estado: pago.status },
    });
    const { data: estudio } = await admin.from('studios').select('id').eq('id', studioId).maybeSingle();
    if (estudio) await anotar(admin, pago, studioId, null, 'rechazado', 'el recibo no existe o es de otro estudio');
    return NextResponse.json({ recibido: true, ignorado: 'recibo-desconocido' });
  }

  if (pago.status !== 'approved') {
    // Pendiente, en proceso, rechazado o cancelado: se anota y no se toca el recibo.
    const ok = await anotar(admin, pago, studioId, reciboId, 'pendiente', null);
    return ok ? NextResponse.json({ recibido: true, estado: pago.status }) : NextResponse.json({ error: 'No anotado' }, { status: 503 });
  }

  if (pago.currency_id !== MONEDA || !importeCoincide(pago.transaction_amount, Number(recibo.importe))) {
    Sentry.captureMessage('[mercadopago/webhook] pago aprobado que no cuadra con el recibo: NO se da por cobrado, revisar y devolver', {
      level: 'error', tags: etiquetas,
      extra: { paymentId: pago.id, studioId, reciboId, cobrado: pago.transaction_amount, moneda: pago.currency_id, esperado: recibo.importe, monedaEsperada: MONEDA },
    });
    await anotar(admin, pago, studioId, reciboId, 'rechazado', `cobrado ${pago.transaction_amount} ${pago.currency_id}, esperado ${recibo.importe} ${MONEDA}`);
    return NextResponse.json({ recibido: true, ignorado: 'importe-no-coincide' });
  }

  const r = await confirmarCobroRecibo(admin, {
    studioId, reciboId, metodoCobro: 'MERCADOPAGO', paymentIntentId: null, fuente: 'webhook',
  });
  if (!r.ok) {
    // Fallo de escritura o de lectura: que Mercado Pago lo reintente.
    Sentry.captureMessage('[mercadopago/webhook] no se pudo confirmar el cobro; Mercado Pago lo reintentará', {
      level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, error: r.error, codigo: r.codigo },
    });
    return NextResponse.json({ error: 'No se pudo confirmar' }, { status: 500 });
  }

  if (r.actualizado) {
    const ok = await anotar(admin, pago, studioId, reciboId, 'aplicado', null);
    // El recibo ya está cobrado: aunque el libro no se escriba, no se reintenta el cobro.
    return NextResponse.json({ recibido: true, aplicado: true, anotado: ok });
  }

  // El recibo no se cerró con este pago: ya estaba cobrado por otra vía o anulado.
  // El dinero entró dos veces (o a un recibo perdonado): hay que devolverlo a mano.
  Sentry.captureMessage('[mercadopago/webhook] pago aprobado de un recibo que ya no estaba pendiente: posible doble cobro, devolver en Mercado Pago', {
    level: 'error', tags: etiquetas, extra: { paymentId: pago.id, studioId, reciboId, estadoRecibo: recibo.estado },
  });
  await anotar(admin, pago, studioId, reciboId, 'no_aplicable', `recibo en estado ${String(recibo.estado)}: devolver en Mercado Pago`);
  return NextResponse.json({ recibido: true, aplicado: false });
}
