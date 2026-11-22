// Inicia el pago de un RECIBO pendiente con Checkout Pro de Mercado Pago
// (autoalojado, Etapa 1). Devuelve la URL de Mercado Pago a la que ir.
//
// Mismas reglas de dinero que `/api/stripe/checkout` en su rama de recibo:
// el importe y el concepto salen SIEMPRE de la base de datos, nunca del cuerpo;
// el recibo tiene que ser de ese estudio y estar cobrable; no se abre un pago
// online si ya hay otro cobro en marcha (el mostrador, una tarjeta guardada),
// si es la renovación de una cuota en pausa, o si es una penalización que no se
// puede pagar a mano. Igual que con Stripe, pagar un recibo NO exige sesión
// (se paga por enlace); si hay sesión, tiene que ser de la dueña del recibo.
//
// Quien da el recibo por cobrado es el webhook (`/api/mercadopago/webhook`),
// después de releer el pago en la API de Mercado Pago. Volver a la app con
// «pago=ok» no significa nada: la pantalla lo comprueba.

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { bloqueoPorSuscripcion } from '@/lib/billing/billing-guard';
import { esReciboCobrable } from '@/lib/billing/deuda-recibo';
import { CODIGO_CUOTA_EN_PAUSA, MENSAJE_CUOTA_EN_PAUSA, pagoOnlineDeRenovacionPermitido } from '@/lib/billing/renovar-plan-reglas';
import { bloqueoCobroManualDePenalizacion } from '@/lib/billing/penalizacion-recibo-server';
import { MENSAJE_PAGO_ONLINE_COBRANDOSE_CON_METODO_GUARDADO } from '@/lib/billing/cobro-off-session-marca';
import { MENSAJE_PAGO_ONLINE_CON_COBRO_DE_LA_CAJA } from '@/lib/pos/referencia-cobro-recibo';
import { urlsDeRetorno } from '@/lib/billing/origen-pago';
import { verificarUsuarioSupabase } from '@/lib/auth-server';
import { socioAutenticado } from '@/lib/db/supabase-data-admin';
import { appUrl } from '@/lib/app-url';
import { MONEDA } from '@/lib/moneda';
import { configMercadoPago } from '@/lib/mercadopago/config';
import { crearPreferencia } from '@/lib/mercadopago/api';
import { referenciaDeRecibo } from '@/lib/mercadopago/referencia';

export async function POST(req: NextRequest) {
  const limitado = await enforceRateLimit(req, 'mercadopago-checkout', { max: 10, windowSeconds: 60 });
  if (limitado) return limitado;

  const config = configMercadoPago();
  if (!config.ok) {
    console.error('[mercadopago/checkout]', config.motivo);
    return NextResponse.json({ error: 'El pago online no está disponible ahora. No se te ha cobrado nada.' }, { status: 503 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });

  const body = await req.json().catch(() => null) as { studioId?: unknown; reciboId?: unknown; origen?: unknown } | null;
  const studioId = typeof body?.studioId === 'string' ? body.studioId : '';
  const reciboId = typeof body?.reciboId === 'string' ? body.reciboId : '';
  if (!studioId || !reciboId) return NextResponse.json({ error: 'Falta el estudio o el recibo' }, { status: 400 });
  const origen = body?.origen === 'portal' ? 'portal' : undefined;

  const bloqueo = await bloqueoPorSuscripcion(studioId);
  if (bloqueo) return bloqueo;

  const { data: recibo, error } = await admin
    .from('recibos')
    .select('importe, concepto, estado, studio_id, socio_id, cobro_off_session_clave, cobro_mostrador_pi, cobro_mostrador_checkout_session_id, importe_devuelto, reembolso_stripe_id, reembolso_solicitado_en, suscripcion_id, es_renovacion')
    .eq('id', reciboId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'No hemos podido leer el recibo. Inténtalo en un momento.' }, { status: 503 });
  if (!recibo) return NextResponse.json({ error: 'Recibo no encontrado' }, { status: 404 });
  if (recibo.studio_id !== studioId) return NextResponse.json({ error: 'Ese recibo no pertenece a este estudio' }, { status: 403 });
  if (!esReciboCobrable(recibo as Parameters<typeof esReciboCobrable>[0])) {
    return NextResponse.json({ error: 'Este recibo ya no está pendiente de cobro' }, { status: 409 });
  }
  if (recibo.cobro_off_session_clave) {
    return NextResponse.json({ error: MENSAJE_PAGO_ONLINE_COBRANDOSE_CON_METODO_GUARDADO }, { status: 409 });
  }
  if (recibo.cobro_mostrador_pi || recibo.cobro_mostrador_checkout_session_id) {
    return NextResponse.json({ error: MENSAJE_PAGO_ONLINE_CON_COBRO_DE_LA_CAJA }, { status: 409 });
  }
  if (recibo.es_renovacion === true && recibo.suscripcion_id) {
    const { data: cuota, error: errCuota } = await admin.from('suscripciones')
      .select('estado').eq('id', recibo.suscripcion_id).eq('studio_id', studioId).maybeSingle();
    if (errCuota) return NextResponse.json({ error: 'No hemos podido comprobar tu plan. Inténtalo en un momento.' }, { status: 503 });
    if (!pagoOnlineDeRenovacionPermitido({ es_renovacion: true }, (cuota?.estado as string | null) ?? null)) {
      return NextResponse.json({ error: MENSAJE_CUOTA_EN_PAUSA, codigo: CODIGO_CUOTA_EN_PAUSA }, { status: 409 });
    }
  }
  const penalizacion = await bloqueoCobroManualDePenalizacion(admin, { studioId, reciboId, contexto: 'checkout_alumna' });
  if (penalizacion) return NextResponse.json({ error: penalizacion.mensaje }, { status: penalizacion.http });

  // Con sesión, tiene que ser la dueña del recibo (sin sesión se paga por enlace).
  const socioId = (recibo.socio_id as string | null) ?? null;
  let emailPagador: string | undefined;
  const usuario = await verificarUsuarioSupabase(req);
  if (usuario && socioId) {
    const deSesion = await socioAutenticado(usuario.userId, studioId);
    if (deSesion && deSesion !== socioId) return NextResponse.json({ error: 'Este recibo no es tuyo.' }, { status: 403 });
    if (deSesion === socioId) {
      const { data: socio } = await admin.from('socios').select('email').eq('id', socioId).eq('studio_id', studioId).maybeSingle();
      emailPagador = (socio?.email as string | null) ?? undefined;
    }
  }

  const importe = Number(recibo.importe);
  if (!Number.isFinite(importe) || importe <= 0) {
    return NextResponse.json({ error: 'Este recibo no tiene un importe que se pueda cobrar online.' }, { status: 409 });
  }

  const { data: studio } = await admin.from('studios').select('slug, nombre').eq('id', studioId).maybeSingle();
  const base = appUrl().replace(/\/+$/, '');
  const urls = urlsDeRetorno({
    origen, appUrl: base, slug: (studio?.slug as string | null) ?? null, esCompraDePlan: false, reciboId,
  });

  const pref = await crearPreferencia(config.accessToken, {
    items: [{ id: reciboId, title: String(recibo.concepto ?? 'Pago').slice(0, 250), quantity: 1, unit_price: importe, currency_id: MONEDA }],
    external_reference: referenciaDeRecibo(studioId, reciboId),
    back_urls: { success: urls.successUrl, failure: urls.cancelUrl, pending: urls.successUrl },
    auto_return: 'approved',
    notification_url: `${base}/api/mercadopago/webhook`,
    statement_descriptor: String(studio?.nombre ?? '').replace(/[^A-Za-z0-9 ]/g, '').slice(0, 22) || undefined,
    payer: emailPagador ? { email: emailPagador } : undefined,
    metadata: { studio_id: studioId, recibo_id: reciboId },
    // Sin cupones de efectivo (Rapipago, Pago Fácil): tardan días en acreditarse.
    payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
    // El enlace vale un día: el importe del recibo puede cambiar después.
    expires: true,
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }, globalThis.crypto.randomUUID());

  if (!pref.ok) {
    Sentry.captureMessage('[mercadopago/checkout] no se pudo crear la preferencia', {
      level: 'error', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { studioId, reciboId, status: pref.status, error: pref.error },
    });
    return NextResponse.json({ error: 'No hemos podido iniciar el pago. No se te ha cobrado nada: inténtalo en un momento.' }, { status: 502 });
  }

  const url = config.accessToken.startsWith('TEST-') && pref.datos.sandbox_init_point ? pref.datos.sandbox_init_point : pref.datos.init_point;
  return NextResponse.json({ url });
}
