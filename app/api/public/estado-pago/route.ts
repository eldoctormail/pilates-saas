import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { enforceRateLimit, rateLimit } from '@/lib/rate-limit';
import { retryAfterSeconds, tooManyRequestsResponse } from '@/lib/rate-limit-core';
import { usuarioSupabaseConPaso } from '@/lib/auth-server';
import { socioAutenticado } from '@/lib/db/supabase-data-admin';
import { CODIGO_SEGUNDO_PASO } from '@/lib/auth/doble-factor-reglas';
import type { SupabaseClient } from '@supabase/supabase-js';
import { respuestaPreflightWidget, conCorsWidget } from '@/lib/cors-widget';
import { idsDe } from '@/lib/billing/entregar-plan-comprado';
import {
  compraDeSuscripcion, emailsCoinciden, modoDeIdentidad, reciboIdValido, type CompraEntregada, type RespuestaEstadoPago,
} from '@/lib/billing/estado-pago-publico';
import { estadoDeLaReserva } from '@/lib/billing/estado-reserva-pagada';
import { situacionRecibo } from '@/lib/billing/situacion-recibo';

// P1-3 — estado REAL de la reserva tras «pagar y reservar sin login» (Modo A).
//
// Tras confirmar el PaymentIntent, la reserva la crea el WEBHOOK
// (app/api/stripe/webhook, rama plan_web_embebido → reservarPlazaTrasPagoPublico,
// best-effort): el paso 'done' de /reservar/[slug] hace polling aquí para
// poder decir «tu plaza está confirmada» solo cuando LO ESTÁ, en vez de
// quedarse en «estamos confirmando» sin respuesta jamás.
//
// SOLO LECTURA sobre el camino del dinero: este endpoint no crea ni toca
// nada — lee las filas que el webhook ya persiste con ids DERIVADOS del
// PaymentIntent (idsDe(): recibo `rec-web-…`, reserva `res-web-…`).
//
// Identificación sin sesión: ?pi=<paymentIntentId>&email=<email> — ambos los
// tiene ya el cliente (el pi sale del clientSecret; el email es el del paso
// 'datos'). El email debe coincidir con el de la ficha del recibo: un pi
// ajeno, un email que no corresponde o un pi inexistente reciben TODOS la
// misma respuesta neutra 'en_proceso' — nunca se filtra si un pago o un
// email existen.
//
// Con la SESIÓN de la socia (app de la alumna, P01 · 6-oct-2026): cabecera
// `Authorization` + ?pi=&studioId=. La identidad sale SOLO del token
// (`usuarioSupabaseConPaso` + `socioAutenticado`): con cabecera nunca se cae al
// modo email, y el recibo del pago tiene que ser de esa socia y de ese estudio.
// Esa respuesta añade `compra` (lo que el pago le ha entregado), que es lo que
// deja a la hoja de compra decir «tu bono está activo» en vez de suponerlo en
// cuanto Stripe contesta. Límites: 60/min por IP (la wifi del estudio es una
// IP para todas) y 30/min por socia.
//
// Detección de 'fallida': cuando reservarPlazaTrasPagoPublico devuelve
// !ok, el webhook NO deja fila en `reservas` — la única traza consultable es
// la notificación RESERVA_PAGADA_SIN_PLAZA que emite al mostrador
// (emitirReservaPagadaSinPlaza → tabla `notification`). Es best-effort
// también en origen (si publish fallara, o el fallo fuera una excepción
// capturada en vez de un !ok, no hay fila): en esos restos el cliente agota
// el techo del polling y muestra el copy honesto de «tardando», que cubre
// exactamente ese hueco.

export async function OPTIONS(req: NextRequest) {
  return respuestaPreflightWidget(req);
}

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function respuesta(req: NextRequest, body: RespuestaEstadoPago) {
  return conCorsWidget(req, NextResponse.json(body, { headers: NO_STORE }));
}

export async function GET(req: NextRequest) {
  // El polling legítimo hace ~8 peticiones en ~35s por pago; 30/min deja
  // margen a un reintento sin abrir la puerta a enumerar PaymentIntents. Con
  // sesión el cubo por IP es más holgado (toda la wifi del estudio comparte
  // IP) porque detrás va el de cada socia.
  const modo = modoDeIdentidad(req.headers.get('authorization'));
  const limited = modo === 'sesion'
    ? await enforceRateLimit(req, 'estado-pago-app', { max: 60, windowSeconds: 60 })
    : await enforceRateLimit(req, 'estado-pago', { max: 30, windowSeconds: 60 });
  if (limited) return limited;

  const pi = req.nextUrl.searchParams.get('pi') ?? '';
  const studioIdParam = req.nextUrl.searchParams.get('studioId');
  // RECIBOS: por recibo (pagar un recibo desde la app). Solo con sesión.
  const reciboIdParam = req.nextUrl.searchParams.get('reciboId');
  const porRecibo = modo === 'sesion' && reciboIdValido(reciboIdParam);
  // Forma de id de PaymentIntent (pi_ + alfanumérico, con test_/live_
  // opcional que idsDe() ya sabe recortar). Cualquier otra cosa ni toca BD.
  if (!porRecibo && !/^pi_(test_|live_)?[A-Za-z0-9]{8,64}$/.test(pi)) return respuesta(req, { estado: 'en_proceso' });

  const admin = getSupabaseAdmin();
  if (!admin) return respuesta(req, { estado: 'en_proceso' });
  const ids = idsDe(pi);

  if (modo === 'sesion') {
    // ── Con la sesión de la socia ─────────────────────────────────────────
    if (!studioIdParam) return respuesta(req, { estado: 'en_proceso' });
    const r = await usuarioSupabaseConPaso(req);
    if (!r) {
      return conCorsWidget(req, NextResponse.json(
        { error: 'Tu sesión ha caducado. Vuelve a entrar: tu pago no se pierde.' }, { status: 401, headers: NO_STORE },
      ));
    }
    if (r.paso === 'doble_factor') {
      return conCorsWidget(req, NextResponse.json(
        { error: 'Falta el segundo paso de la verificación', codigo: CODIGO_SEGUNDO_PASO }, { status: 401, headers: NO_STORE },
      ));
    }
    const socioId = await socioAutenticado(r.usuario.userId, studioIdParam);
    if (!socioId) return respuesta(req, { estado: 'en_proceso' });
    // Por socia, no por IP: el cubo de arriba lo comparte toda una wifi.
    const porSocia = { max: 30, windowSeconds: 60 };
    const lim = await rateLimit(`estado-pago-socia:${socioId}`, porSocia);
    if (!lim.allowed) return tooManyRequestsResponse(retryAfterSeconds(lim.resetAt, porSocia.windowSeconds));

    if (porRecibo) {
      // SU recibo, de ESTE estudio. Lo de otra socia o inexistente: la respuesta neutra.
      const { data: r } = await admin
        .from('recibos')
        .select('estado, importe, importe_devuelto, reembolso_stripe_id, reembolso_solicitado_en, es_renovacion, suscripcion_id')
        .eq('id', reciboIdParam)
        .eq('studio_id', studioIdParam)
        .eq('socio_id', socioId)
        .maybeSingle();
      if (!r) return respuesta(req, { estado: 'en_proceso' });
      const situacion = situacionRecibo({
        estado: r.estado as string, importe: r.importe as number, importeDevuelto: (r.importe_devuelto as number | null) ?? 0,
        reembolsoStripeId: (r.reembolso_stripe_id as string | null) ?? null,
        reembolsoSolicitadoEn: (r.reembolso_solicitado_en as string | null) ?? null,
      });
      let renovadoHasta: string | null = null;
      if (situacion === 'COBRADO' && r.es_renovacion === true && r.suscripcion_id) {
        const { data: sus } = await admin.from('suscripciones').select('fecha_fin')
          .eq('id', r.suscripcion_id as string).eq('studio_id', studioIdParam).eq('socio_id', socioId).maybeSingle();
        renovadoHasta = (sus?.fecha_fin as string | null | undefined) ?? null;
      }
      return respuesta(req, { estado: 'en_proceso', recibo: { situacion, ...(renovadoHasta ? { renovadoHasta } : {}) } });
    }

    // El recibo del pago, y tiene que ser SUYO y de ESTE estudio. Si no (pi
    // ajeno, webhook aún sin llegar): la respuesta neutra de siempre.
    const { data: recibo } = await admin
      .from('recibos')
      .select('fecha_cobro')
      .eq('id', ids.reciboId)
      .eq('stripe_payment_intent_id', pi)
      .eq('studio_id', studioIdParam)
      .eq('socio_id', socioId)
      .maybeSingle();
    if (!recibo) return respuesta(req, { estado: 'en_proceso' });

    const [cuerpo, compra] = await Promise.all([
      estadoDeLaReserva(admin, { pi, studioId: studioIdParam, socioId, fechaCobro: (recibo.fecha_cobro as string | null) ?? null, detalle: true }),
      compraDelPago(admin, ids.suscripcionId, studioIdParam, socioId),
    ]);
    return respuesta(req, compra ? { ...cuerpo, compra } : cuerpo);
  }

  // ── Sin sesión: pi + email (/reservar sin cuenta) ─────────────────────────
  const email = req.nextUrl.searchParams.get('email') ?? '';
  if (!email.trim()) return respuesta(req, { estado: 'en_proceso' });

  // 1. El recibo que entregarPlanComprado crea al procesar el webhook — con
  //    el PaymentIntent verificado también por columna, no solo por el id
  //    derivado. Sin recibo, el webhook no ha llegado (o el pi es ajeno):
  //    respuesta neutra.
  const { data: recibo } = await admin
    .from('recibos')
    .select('studio_id, socio_id, fecha_cobro')
    .eq('id', ids.reciboId)
    .eq('stripe_payment_intent_id', pi)
    .maybeSingle();
  if (!recibo?.studio_id || !recibo.socio_id) return respuesta(req, { estado: 'en_proceso' });
  const studioId = recibo.studio_id as string;
  const socioId = recibo.socio_id as string;

  // Si la URL trae studioId (obligatorio para CORS desde el bundle), tiene
  // que ser EL del recibo — defensa extra, misma respuesta neutra.
  if (studioIdParam && studioIdParam !== studioId) return respuesta(req, { estado: 'en_proceso' });

  // 2. La guardia de identidad: el email tiene que ser el de la ficha del
  //    recibo. Mismo 'en_proceso' neutro si no coincide — no se filtra nada.
  const { data: socio } = await admin
    .from('socios')
    .select('email')
    .eq('id', socioId)
    .eq('studio_id', studioId)
    .maybeSingle();
  if (!emailsCoinciden(email, socio?.email as string | null | undefined)) {
    return respuesta(req, { estado: 'en_proceso' });
  }

  return respuesta(req, await estadoDeLaReserva(admin, {
    pi, studioId, socioId, fechaCobro: (recibo.fecha_cobro as string | null) ?? null, detalle: false,
  }));
}

/**
 * Lo que este pago ha entregado (la suscripción `sus-web-…`), solo para la
 * socia con sesión. `null` mientras no exista: la app sigue en «Activando…».
 */
async function compraDelPago(
  admin: SupabaseClient, suscripcionId: string, studioId: string, socioId: string,
): Promise<CompraEntregada | null> {
  const { data: sus } = await admin
    .from('suscripciones')
    .select('estado, sesiones_restantes, fecha_fin, plan_id')
    .eq('id', suscripcionId)
    .eq('studio_id', studioId)
    .eq('socio_id', socioId)
    .maybeSingle();
  if (!sus) return null;
  let nombre: string | null = null;
  if (sus.plan_id) {
    const { data: plan } = await admin
      .from('planes_tarifa').select('nombre').eq('id', sus.plan_id as string).eq('studio_id', studioId).maybeSingle();
    nombre = (plan?.nombre as string | null | undefined) ?? null;
  }
  return compraDeSuscripcion(
    sus as { estado: string | null; sesiones_restantes: number | null; fecha_fin: string | null },
    nombre,
  );
}
