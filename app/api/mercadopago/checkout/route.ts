// Inicia un pago con Checkout Pro de Mercado Pago (autoalojado) y devuelve la
// URL de Mercado Pago a la que ir. Dos casos:
//   · `reciboId`: pagar un RECIBO pendiente (Etapa 1, abajo).
//   · `planId`:   comprar un plan desde la app (Etapa 2, `checkoutPlan`).
//     Con `sesionId` (y `spotId`): pagar y reservar esa clase en un paso.
//
// Rama de recibo:
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
import { conCorsWidget, respuestaPreflightWidget } from '@/lib/cors-widget';
import { MONEDA } from '@/lib/moneda';
import { configMercadoPago } from '@/lib/mercadopago/config';
import { crearPreferencia } from '@/lib/mercadopago/api';
import { nuevoIdCompra, referenciaDeCompra, referenciaDeRecibo, urlsDeClase } from '@/lib/mercadopago/referencia';
import { barrerComprasCaducadas, caducidadDeCompra, decidirCompraDePlan, reservarMatriculaDeCompra } from '@/lib/mercadopago/compra-plan-servidor';
import { liberarCupoMatriculaUnaVez } from '@/lib/billing/matricula-online';
import type { SupabaseClient } from '@supabase/supabase-js';

// El widget de la web del estudio llama desde OTRO origen: mismas cabeceras CORS que
// `/api/stripe/checkout` (solo para los dominios que el estudio autorizó).
export async function OPTIONS(req: NextRequest) {
  return respuestaPreflightWidget(req);
}

export async function POST(req: NextRequest) {
  const limitado = await enforceRateLimit(req, 'mercadopago-checkout', { max: 10, windowSeconds: 60 });
  if (limitado) return limitado;
  return conCorsWidget(req, await iniciarPago(req));
}

async function iniciarPago(req: NextRequest): Promise<NextResponse> {
  const config = configMercadoPago();
  if (!config.ok) {
    console.error('[mercadopago/checkout]', config.motivo);
    return NextResponse.json({ error: 'El pago online no está disponible ahora. No se te ha cobrado nada.' }, { status: 503 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });

  const body = await req.json().catch(() => null) as {
    studioId?: unknown; reciboId?: unknown; planId?: unknown; origen?: unknown; codigoDescuento?: unknown; aceptaCondiciones?: unknown;
    sesionId?: unknown; spotId?: unknown;
  } & Record<string, unknown> | null;
  const studioId = typeof body?.studioId === 'string' ? body.studioId : '';
  const reciboId = typeof body?.reciboId === 'string' ? body.reciboId : '';
  const planId = typeof body?.planId === 'string' ? body.planId : '';
  if (!studioId || (!reciboId && !planId)) return NextResponse.json({ error: 'Falta el estudio, el recibo o el plan' }, { status: 400 });
  const origen = body?.origen === 'portal' ? 'portal' : undefined;

  const bloqueo = await bloqueoPorSuscripcion(studioId);
  if (bloqueo) return bloqueo;

  if (!reciboId) {
    return checkoutPlan(req, admin, config.accessToken, {
      studioId, planId,
      codigoDescuento: typeof body?.codigoDescuento === 'string' ? body.codigoDescuento.trim().slice(0, 64) || null : null,
      aceptaCondiciones: body?.aceptaCondiciones === true,
      sesionId: typeof body?.sesionId === 'string' && body.sesionId ? body.sesionId.slice(0, 128) : null,
      spotId: typeof body?.spotId === 'string' && body.spotId ? body.spotId.slice(0, 128) : null,
      origen,
      // Sin sesión y con email: compra sin cuenta (invitada). Lo valida `decidirCompraDePlan`.
      invitada: !req.headers.get('authorization') && typeof body?.socioEmail === 'string' ? body : null,
    });
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// Etapa 2: comprar un plan desde la app de la alumna.
//
// El importe lo decide `decidirCompraDePlan` con las mismas piezas que Stripe;
// la decisión se guarda en `compras_mercadopago` y el webhook entrega eso.
// Un segundo toque con la misma compra abierta (mismo plan, código e importe)
// reutiliza el pago ya creado: dos pestañas no pagan dos bonos.
// ─────────────────────────────────────────────────────────────────────────────
async function checkoutPlan(
  req: NextRequest,
  admin: SupabaseClient,
  accessToken: string,
  p: {
    studioId: string; planId: string; codigoDescuento: string | null; aceptaCondiciones: boolean; sesionId: string | null; spotId: string | null;
    origen: 'portal' | undefined; invitada: Record<string, unknown> | null;
  },
) {
  await barrerComprasCaducadas(admin, p.studioId);

  const decision = await decidirCompraDePlan(admin, req, p);
  if (!decision.ok) {
    const { status, ...resto } = decision.rechazo;
    return NextResponse.json(resto, { status });
  }
  const c = decision.compra;

  // ¿Ya hay una compra abierta igual, con margen de tiempo? Se reutiliza.
  const margen = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  // De quién: la socia, o (invitada) el email con el que compra, sin ficha.
  const deQuien = admin.from('compras_mercadopago')
    .select('id, importe_plan, matricula, url_pago, codigo_descuento_id, sesion_id, spot_id, expira_en')
    .eq('studio_id', p.studioId).eq('plan_id', p.planId).eq('estado', 'abierta');
  const { data: abierta } = await (c.socioId ? deQuien.eq('socio_id', c.socioId) : deQuien.is('socio_id', null).eq('email', c.email ?? ''))
    .gt('expira_en', margen).order('creado_en', { ascending: false }).limit(1).maybeSingle();
  // Misma clase y mismo sitio también: un pago abierto para OTRA clase no reserva esta.
  if (abierta?.url_pago && Number(abierta.importe_plan) === c.importePlan
      && ((abierta.codigo_descuento_id as string | null) ?? null) === c.codigoDescuentoId
      && ((abierta.sesion_id as string | null) ?? null) === c.sesionId
      && ((abierta.spot_id as string | null) ?? null) === c.spotId) {
    const matricula = Number(abierta.matricula) || 0;
    return NextResponse.json(respuestaCompra(abierta.url_pago as string, c, matricula));
  }

  // Último momento antes de crear el pago: la matrícula (y su plaza gratis, si la hay).
  const { matricula, cupoReservado } = await reservarMatriculaDeCompra(admin, {
    studioId: p.studioId, planId: p.planId, socioId: c.socioId, email: c.email, matriculaCatalogo: decision.matriculaCatalogo,
  });

  // 24 h, o hasta que se cierre la reserva de la clase (ya comprobado que da tiempo).
  const compraId = nuevoIdCompra();
  const caducidad = caducidadDeCompra(c.cierreClase, Date.now());
  if (!caducidad.ok) {
    if (cupoReservado) await devolverPlaza(admin, compraId, p.planId, p.studioId);
    return NextResponse.json({ error: caducidad.error, codigo: caducidad.codigo }, { status: 409 });
  }
  const expira = caducidad.expira;
  const { error: errAlta } = await admin.from('compras_mercadopago').insert({
    id: compraId, studio_id: p.studioId, plan_id: p.planId, socio_id: c.socioId, email: c.email,
    importe_plan: c.importePlan, matricula, moneda: MONEDA, codigo_descuento_id: c.codigoDescuentoId,
    terminos_hash: c.terminosHash, ciclo_fin: c.cicloFin, cuota_texto: c.cuotaTexto,
    cupo_matricula_reservado: cupoReservado, expira_en: expira.toISOString(),
    sesion_id: c.sesionId, spot_id: c.spotId,
    ...(c.invitada ? {
      es_invitada: true, nombre: c.invitada.nombre, telefono: c.invitada.telefono, origen_lead: c.invitada.origenLead,
      widget_sesion: c.invitada.widgetSesion, datos_adicionales: c.invitada.datosAdicionales,
    } : {}),
  });
  if (errAlta) {
    if (cupoReservado) await devolverPlaza(admin, compraId, p.planId, p.studioId);
    return NextResponse.json({ error: 'No hemos podido iniciar el pago. No se te ha cobrado nada: inténtalo en un momento.' }, { status: 503 });
  }

  const { data: studio } = await admin.from('studios').select('slug, nombre').eq('id', p.studioId).maybeSingle();
  const base = appUrl().replace(/\/+$/, '');
  const slug = (studio?.slug as string | null) ?? null;
  // Desde la app con una clase: a la ficha de la clase. Desde la app sin clase: a sus bonos.
  // Desde /reservar o el widget (con o sin cuenta): a /reservar, que avisa «en unos segundos».
  const urls = p.origen === 'portal' && c.sesionId && slug
    ? urlsDeClase(base, slug, c.sesionId, compraId)
    : urlsDeRetorno({ origen: p.origen, appUrl: base, slug, esCompraDePlan: true, planId: p.planId });
  const items = [{ id: p.planId, title: c.planNombre.slice(0, 250), quantity: 1, unit_price: c.importePlan, currency_id: MONEDA }];
  if (matricula > 0) items.push({ id: `${p.planId}-matricula`, title: 'Matrícula', quantity: 1, unit_price: matricula, currency_id: MONEDA });

  const pref = await crearPreferencia(accessToken, {
    items,
    external_reference: referenciaDeCompra(p.studioId, compraId),
    back_urls: { success: urls.successUrl, failure: urls.cancelUrl, pending: urls.successUrl },
    auto_return: 'approved',
    notification_url: `${base}/api/mercadopago/webhook`,
    statement_descriptor: String(studio?.nombre ?? '').replace(/[^A-Za-z0-9 ]/g, '').slice(0, 22) || undefined,
    payer: c.email ? { email: c.email } : undefined,
    metadata: { studio_id: p.studioId, compra_id: compraId },
    payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
    expires: true,
    expiration_date_to: expira.toISOString(),
  }, compraId);

  if (!pref.ok) {
    Sentry.captureMessage('[mercadopago/checkout] no se pudo crear la preferencia de una compra', {
      level: 'error', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { studioId: p.studioId, compraId, status: pref.status, error: pref.error },
    });
    await admin.from('compras_mercadopago').update({ estado: 'fallida', actualizado_en: new Date().toISOString() }).eq('id', compraId).eq('estado', 'abierta');
    if (cupoReservado) await devolverPlaza(admin, compraId, p.planId, p.studioId);
    return NextResponse.json({ error: 'No hemos podido iniciar el pago. No se te ha cobrado nada: inténtalo en un momento.' }, { status: 502 });
  }

  const url = accessToken.startsWith('TEST-') && pref.datos.sandbox_init_point ? pref.datos.sandbox_init_point : pref.datos.init_point;
  await admin.from('compras_mercadopago').update({ preference_id: pref.datos.id, url_pago: url, actualizado_en: new Date().toISOString() }).eq('id', compraId);
  return NextResponse.json(respuestaCompra(url, c, matricula));
}

function respuestaCompra(url: string, c: { importePlan: number; descuento: number; codigoAplicado: boolean; cuotaFrase: string | null }, matricula: number) {
  return {
    url,
    importe: c.importePlan,
    descuento: c.descuento,
    codigoAplicado: c.codigoAplicado,
    matricula,
    total: Math.round((c.importePlan + matricula) * 100) / 100,
    cuotaFrase: c.cuotaFrase,
  };
}

async function devolverPlaza(admin: SupabaseClient, compraId: string, planId: string, studioId: string) {
  try {
    await liberarCupoMatriculaUnaVez(admin, compraId, planId, studioId);
  } catch (e) {
    Sentry.captureMessage('[mercadopago/checkout] no se pudo devolver el lugar de matrícula', {
      level: 'warning', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { compraId, studioId, error: String(e) },
    });
  }
}
