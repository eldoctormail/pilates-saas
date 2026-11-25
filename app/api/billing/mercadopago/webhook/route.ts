// Avisos de Mercado Pago de las suscripciones de los ESTUDIOS a Centra (la
// cuenta de la plataforma, no la de un estudio: esa usa /api/mercadopago/webhook).
//
// En la aplicación de Mercado Pago de Centra › Webhooks, con los eventos de
// «Planes y suscripciones»:
//   subscription_preapproval          la suscripción cambió (alta, baja, pausa)
//   subscription_authorized_payment   un cobro mensual
//
// Mismas reglas que el resto de webhooks de dinero: sin firma válida, 401; el
// cuerpo no se cree (se relee todo en la API de Mercado Pago); idempotente; un
// fallo que se puede reintentar devuelve 500 para que Mercado Pago lo reenvíe.

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { verificarFirma } from '@/lib/mercadopago/firma';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { sincronizarPago, sincronizarSuscripcion, type Resultado } from '@/lib/billing/mp-plataforma/servidor';

export const dynamic = 'force-dynamic';

const etiquetas = { area: 'billing', pasarela: 'mercadopago-plataforma' } as const;

export async function POST(req: NextRequest) {
  const config = configMpPlataforma();
  if (!config.ok) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });

  const url = req.nextUrl;
  const cuerpo = await req.json().catch(() => null) as { type?: string; topic?: string; data?: { id?: string | number } } | null;
  const tipo = url.searchParams.get('type') ?? cuerpo?.type ?? url.searchParams.get('topic') ?? cuerpo?.topic ?? null;
  // La firma se calcula con el data.id del QUERY STRING.
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  const firma = verificarFirma({ xSignature: req.headers.get('x-signature'), xRequestId: req.headers.get('x-request-id'), dataId }, config.webhookSecret);
  if (!firma.ok) {
    Sentry.captureMessage('[mp-plataforma/webhook] aviso con firma no válida', { level: 'warning', tags: etiquetas, extra: { motivo: firma.motivo, tipo } });
    return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
  }
  if (!dataId) return NextResponse.json({ recibido: true, ignorado: 'sin-id' });

  let r: Resultado;
  try {
    if (tipo === 'subscription_preapproval' || tipo === 'preapproval') r = await sincronizarSuscripcion(admin, config.accessToken, dataId);
    else if (tipo === 'subscription_authorized_payment' || tipo === 'authorized_payment') r = await sincronizarPago(admin, config.accessToken, dataId);
    else return NextResponse.json({ recibido: true, ignorado: tipo ?? 'sin-tipo' });
  } catch (err) {
    Sentry.captureException(err, { tags: etiquetas, extra: { tipo, dataId } });
    return NextResponse.json({ error: 'No se pudo procesar' }, { status: 500 });
  }
  if (r.tipo === 'reintentar') {
    Sentry.captureMessage('[mp-plataforma/webhook] aviso para reintentar', { level: 'warning', tags: etiquetas, extra: { tipo, dataId, motivo: r.motivo } });
    return NextResponse.json({ error: r.motivo }, { status: 500 });
  }
  return NextResponse.json({ recibido: true, resultado: r.tipo, ...(r.tipo === 'ignorado' ? { motivo: r.motivo } : {}) });
}
