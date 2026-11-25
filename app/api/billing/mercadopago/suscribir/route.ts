// Alta (o cambio de plan) de la mensualidad del ESTUDIO a Centra con una
// suscripción de Mercado Pago. Solo la propietaria. Crea la suscripción en la
// cuenta de Centra y devuelve el enlace de Mercado Pago donde la propietaria
// pone la tarjeta. Aquí NO se escribe nada en el estudio: el plan lo activa el
// webhook (o la vuelta a /suscripcion) cuando Mercado Pago la autoriza.
// Reglas en lib/billing/mp-plataforma/reglas.ts.

import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { PLAN_INFO, PLANES, type Plan } from '@/lib/billing/entitlements';
import { cargarPrecios } from '@/lib/billing/precios-servidor';
import { precioMesDe } from '@/lib/billing/precios-plataforma';
import { MONEDA } from '@/lib/moneda';
import { claveCheckoutLock, liberarCheckoutLock, reclamarCheckoutLock } from '@/lib/billing/checkout-lock';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { crearSuscripcion, leerSuscripcion } from '@/lib/billing/mp-plataforma/api';
import { cuerpoPreapproval, decidirAlta, preapprovalDe, type Preapproval } from '@/lib/billing/mp-plataforma/reglas';
import { leerFila } from '@/lib/billing/mp-plataforma/servidor';
import { errorInterno } from '@/lib/errores-servidor';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const limitado = await enforceRateLimit(req, 'billing-mp-suscribir', { max: 10, windowSeconds: 60 });
  if (limitado) return limitado;

  const config = configMpPlataforma();
  if (!config.ok) return NextResponse.json({ error: 'El cobro con Mercado Pago todavía no está configurado.' }, { status: 503 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 });

  const sesion = await verificarSesionStaff(req);
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (sesion.rol !== 'PROPIETARIO') {
    return NextResponse.json({ error: 'Solo la propietaria puede gestionar la suscripción' }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { plan?: unknown; email?: unknown } | null;
  const plan = body?.plan as Plan | undefined;
  if (!plan || !PLANES.includes(plan)) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
  // El correo de la cuenta de Mercado Pago con la que va a pagar: Mercado Pago
  // exige que coincida con la cuenta con la que entra. Sin él, el de la sesión.
  const pedido = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (pedido && !EMAIL.test(pedido)) return NextResponse.json({ error: 'Ese correo no parece válido.' }, { status: 400 });
  const email = pedido || sesion.email;
  if (!email) return NextResponse.json({ error: 'Escribí el correo de tu cuenta de Mercado Pago.' }, { status: 400 });

  const clave = claveCheckoutLock('studio', sesion.studioId);
  if (!(await reclamarCheckoutLock(admin, clave))) {
    return NextResponse.json({ error: 'Ya hay un pago en marcha para esta suscripción. Esperá unos segundos y volvé a intentarlo.' }, { status: 409 });
  }
  try {
    const fila = await leerFila(admin, sesion.studioId);
    if (!fila) return NextResponse.json({ error: 'Estudio no encontrado' }, { status: 404 });

    // La que ya tiene, releída de Mercado Pago (no de la fila: puede estar desfasada).
    let actual: Preapproval | null = null;
    const idActual = preapprovalDe(fila.subscription_id);
    if (idActual) {
      const r = await leerSuscripcion(config.accessToken, idActual);
      if (r.ok) actual = r.datos;
      else if (r.status !== 404) return NextResponse.json({ error: 'Mercado Pago no contesta. Probá de nuevo en un momento.' }, { status: 502 });
    }
    const decision = decidirAlta(fila, plan, actual, new Date());
    if (!decision.ok) return NextResponse.json({ error: decision.error }, { status: decision.status });

    await cargarPrecios();
    const importe = precioMesDe(plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const cuerpo = cuerpoPreapproval({
      studioId: fila.id, plan, nombrePlan: PLAN_INFO[plan].nombre, importe, moneda: MONEDA, email,
      backUrl: `${appUrl}/suscripcion?suscripcion=ok`, empiezaEl: decision.empiezaEl,
    });
    // Un doble clic dentro del mismo minuto devuelve la misma suscripción.
    const minuto = Math.floor(Date.now() / 60_000);
    const creada = await crearSuscripcion(config.accessToken, cuerpo, `centra-plan-${fila.id}-${plan}-${minuto}`);
    if (!creada.ok || !creada.datos.init_point) {
      console.error('[billing/mercadopago/suscribir] Mercado Pago no creó la suscripción', { studioId: fila.id, status: creada.ok ? 200 : creada.status, error: creada.ok ? 'sin init_point' : creada.error });
      const error = !creada.ok && creada.status === 400
        ? 'Mercado Pago no aceptó la suscripción. Revisá que el correo sea el de tu cuenta de Mercado Pago.'
        : 'Mercado Pago no pudo abrir el pago. Probá de nuevo en un momento.';
      return NextResponse.json({ error }, { status: 502 });
    }
    return NextResponse.json({ url: creada.datos.init_point, empiezaEl: decision.empiezaEl });
  } catch (err) {
    return errorInterno('billing/mercadopago/suscribir:POST', err, 'No se pudo iniciar la suscripción. Probá de nuevo en un momento.');
  } finally {
    await liberarCheckoutLock(admin, clave);
  }
}
