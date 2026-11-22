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

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { configMercadoPago } from '@/lib/mercadopago/config';
import { verificarFirma } from '@/lib/mercadopago/firma';
import { leerPago } from '@/lib/mercadopago/api';
import { procesarPago } from '@/lib/mercadopago/procesar-pago';

const etiquetas = { area: 'cobros', pasarela: 'mercadopago' } as const;

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
  const r = await procesarPago(admin, pago);
  return NextResponse.json(r.cuerpo, { status: r.status });
}
