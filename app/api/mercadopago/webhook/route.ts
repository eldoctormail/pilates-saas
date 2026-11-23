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
//   4. Un recibo lo da por cobrado `confirmarCobroRecibo`, y una compra de plan
//      la entrega `entregarPlanComprado`: los mismos dueños que usa el webhook
//      de Stripe (factura, renovación, créditos y avisos salen de ahí).
//   5. Idempotente: Mercado Pago reintenta (cada 15 min) hasta recibir 200, y el
//      mismo pago puede avisarse varias veces (created, updated). El libro
//      `pagos_mercadopago` dice si ya se aplicó.
//   6. Un error que se puede reintentar (la API de Mercado Pago o la base de
//      datos no contestan) devuelve 500 para que Mercado Pago lo vuelva a mandar.
//   7. Cada estudio puede tener SU cuenta (cargada en el panel). El aviso no dice
//      de qué cuenta viene: lo dice la firma, que solo cuadra con la clave de su
//      cuenta. Con esa cuenta se relee el pago, y una cuenta del panel solo
//      aplica pagos de su estudio (lib/mercadopago/cuenta.ts).

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { cuentaPuedeAplicar, todasLasCuentas } from '@/lib/mercadopago/cuenta';
import { verificarFirma } from '@/lib/mercadopago/firma';
import { leerPago } from '@/lib/mercadopago/api';
import { procesarPago } from '@/lib/mercadopago/procesar-pago';

const etiquetas = { area: 'cobros', pasarela: 'mercadopago' } as const;

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });
  let cuentas;
  try {
    cuentas = await todasLasCuentas(admin);
  } catch (err) {
    Sentry.captureException(err, { tags: etiquetas });
    return NextResponse.json({ error: 'No se pudieron leer las cuentas' }, { status: 503 });
  }
  if (cuentas.length === 0) {
    console.error('[mercadopago/webhook] ningún estudio tiene Mercado Pago configurado');
    return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  }

  const url = req.nextUrl;
  const cuerpo = await req.json().catch(() => null) as { type?: string; topic?: string; data?: { id?: string | number } } | null;
  const tipo = url.searchParams.get('type') ?? cuerpo?.type ?? url.searchParams.get('topic') ?? cuerpo?.topic ?? null;
  // La firma se calcula con el data.id del QUERY STRING (documentación de Mercado Pago).
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  const datosFirma = { xSignature: req.headers.get('x-signature'), xRequestId: req.headers.get('x-request-id'), dataId };
  // La firma dice de qué cuenta viene: solo cuadra con la clave de esa cuenta.
  const cuenta = cuentas.find(c => verificarFirma(datosFirma, c.webhookSecret).ok);
  if (!cuenta) {
    const firma = verificarFirma(datosFirma, cuentas[0].webhookSecret);
    Sentry.captureMessage('[mercadopago/webhook] aviso con firma no válida', {
      level: 'warning', tags: etiquetas, extra: { motivo: firma.ok ? 'otra-cuenta' : firma.motivo, tipo, dataId, cuentas: cuentas.length },
    });
    return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
  }

  // Solo pagos. El resto de avisos (merchant_order, etc.) se contesta 200 para que no se reintenten.
  if (tipo !== 'payment' || !dataId) return NextResponse.json({ recibido: true, ignorado: tipo ?? 'sin-tipo' });

  const leido = await leerPago(cuenta.accessToken, dataId);
  if (!leido.ok) {
    // 404 = ese pago no es de esta cuenta (o no existe): reintentar no lo arregla.
    if (leido.status === 404) return NextResponse.json({ recibido: true, ignorado: 'pago-desconocido' });
    Sentry.captureMessage('[mercadopago/webhook] no se pudo leer el pago', {
      level: 'warning', tags: etiquetas, extra: { dataId, status: leido.status, error: leido.error },
    });
    return NextResponse.json({ error: 'No se pudo leer el pago' }, { status: 502 });
  }
  const pago = leido.datos;
  const conCuentaPropia = new Set(cuentas.flatMap(c => (c.studioId ? [c.studioId] : [])));
  const r = await procesarPago(admin, pago, 'webhook', s => cuentaPuedeAplicar(cuenta, s, conCuentaPropia));
  return NextResponse.json(r.cuerpo, { status: r.status });
}
