// Alta (o cambio de plan) de la mensualidad del ESTUDIO a Centra con una
// suscripción de Mercado Pago. Solo la propietaria. Crea la suscripción en la
// cuenta de Centra y devuelve el enlace de Mercado Pago donde la propietaria
// pone la tarjeta. Aquí NO se escribe nada en el estudio: el plan lo activa el
// webhook (o la vuelta a /suscripcion) cuando Mercado Pago la autoriza.
// Reglas en lib/billing/mp-plataforma/reglas.ts.
//
// Mensual o anual (`intervalo`). El plan Cadena lo paga la CADENA (tabla
// `cadenas`, la misma que usa Stripe): si el estudio todavía no tiene, se crea
// aquí, igual que en app/api/billing/checkout. Una sede de una cadena solo
// contrata un plan suelto si es la principal y la cadena no paga
// (`decidirPlanSuelto`, la misma regla que con Stripe).

import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { PLAN_INFO, PLANES, precioAnual, type Plan } from '@/lib/billing/entitlements';
import { cargarPrecios } from '@/lib/billing/precios-servidor';
import { precioMesDe } from '@/lib/billing/precios-plataforma';
import { MONEDA } from '@/lib/moneda';
import { claveCheckoutLock, liberarCheckoutLock, reclamarCheckoutLock } from '@/lib/billing/checkout-lock';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { crearSuscripcion, leerSuscripcion } from '@/lib/billing/mp-plataforma/api';
import { cuerpoPreapproval, decidirAlta, preapprovalDe, type FilaEstudio, type IntervaloMp, type Preapproval } from '@/lib/billing/mp-plataforma/reglas';
import { leerFila } from '@/lib/billing/mp-plataforma/servidor';
import { decidirPlanSuelto } from '@/lib/billing/sede-incluida-en-cadena';
import { leerCadenaParaGratis } from '@/lib/billing/convertir-a-gratis';
import type { SupabaseClient } from '@supabase/supabase-js';
import { errorInterno } from '@/lib/errores-servidor';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

/**
 * La cadena del estudio, creándola si no tiene (primera vez que contrata
 * Cadena). Mismo criterio que el checkout de Stripe: el vínculo se escribe con
 * `is('cadena_id', null)` y, si otra petición ganó, se borra la recién creada.
 * `null` si la cadena es de otra persona: no se paga lo ajeno.
 */
async function cadenaDelEstudio(admin: SupabaseClient, estudio: FilaEstudio, nombre: string, userId: string): Promise<FilaEstudio | null> {
  let cadenaId = estudio.cadena_id ?? null;
  if (!cadenaId) {
    const nueva = `cadena-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await admin.from('cadenas').insert({ id: nueva, nombre, owner_auth_user_id: userId });
    if (error) throw new Error(`crear cadena: ${error.message}`);
    const { data: vinculada, error: e2 } = await admin.from('studios').update({ cadena_id: nueva }).eq('id', estudio.id).is('cadena_id', null).select('id');
    if (e2) throw new Error(`vincular cadena_id: ${e2.message}`);
    if ((vinculada?.length ?? 0) === 0) {
      await admin.from('cadenas').delete().eq('id', nueva);
      cadenaId = (await leerFila(admin, estudio.id))?.cadena_id ?? null;
      if (!cadenaId) throw new Error('No se pudo resolver la cadena tras una carrera');
    } else cadenaId = nueva;
  }
  const { data, error } = await admin.from('cadenas')
    .select('id, plan, subscription_status, subscription_id, current_period_end, owner_auth_user_id').eq('id', cadenaId).maybeSingle();
  if (error) throw new Error(`leer cadena: ${error.message}`);
  const c = data as (FilaEstudio & { owner_auth_user_id: string | null }) | null;
  if (!c || c.owner_auth_user_id !== userId) return null;
  return { id: c.id, plan: c.plan, subscription_status: c.subscription_status, subscription_id: c.subscription_id, current_period_end: c.current_period_end };
}

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

  const body = await req.json().catch(() => null) as { plan?: unknown; email?: unknown; intervalo?: unknown } | null;
  const plan = body?.plan as Plan | undefined;
  if (!plan || !PLANES.includes(plan)) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
  if (body?.intervalo !== undefined && body.intervalo !== 'mensual' && body.intervalo !== 'anual') {
    return NextResponse.json({ error: 'Periodo no válido' }, { status: 400 });
  }
  const intervalo: IntervaloMp = body?.intervalo === 'anual' ? 'anual' : 'mensual';
  // El correo de la cuenta de Mercado Pago con la que va a pagar: Mercado Pago
  // exige que coincida con la cuenta con la que entra. Sin él, el de la sesión.
  const pedido = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (pedido && !EMAIL.test(pedido)) return NextResponse.json({ error: 'Ese correo no parece válido.' }, { status: 400 });
  const email = pedido || sesion.email;
  if (!email) return NextResponse.json({ error: 'Escribí el correo de tu cuenta de Mercado Pago.' }, { status: 400 });

  const enMarcha = () => NextResponse.json({ error: 'Ya hay un pago en marcha para esta suscripción. Esperá unos segundos y volvé a intentarlo.' }, { status: 409 });
  const clave = claveCheckoutLock('studio', sesion.studioId);
  if (!(await reclamarCheckoutLock(admin, clave))) return enMarcha();
  let claveCadena: string | null = null;
  try {
    const estudio = await leerFila(admin, sesion.studioId);
    if (!estudio) return NextResponse.json({ error: 'Estudio no encontrado' }, { status: 404 });

    // A quién se le cobra: al estudio, o a su cadena (Cadena).
    let fila: FilaEstudio;
    if (plan === 'CADENA') {
      const { data: s } = await admin.from('studios').select('nombre').eq('id', estudio.id).maybeSingle();
      const cadena = await cadenaDelEstudio(admin, estudio, (s as { nombre?: string } | null)?.nombre ?? 'Mi cadena', sesion.userId);
      if (!cadena) return NextResponse.json({ error: 'Esta cadena es de otra cuenta: la contrata quien la creó.' }, { status: 403 });
      claveCadena = claveCheckoutLock('cadena', cadena.id);
      if (!(await reclamarCheckoutLock(admin, claveCadena))) { claveCadena = null; return enMarcha(); }
      fila = cadena;
    } else {
      if (estudio.cadena_id) {
        // Una sede secundaria solo con Cadena; con la cadena pagando, ninguna paga aparte.
        const c = await leerCadenaParaGratis(admin, { id: estudio.id, cadena_id: estudio.cadena_id });
        const d = decidirPlanSuelto(c && { estado: c.subscriptionStatus, esPrincipal: c.esPrincipal });
        if (d.accion === 'bloquear') return NextResponse.json({ error: d.mensaje }, { status: 409 });
      }
      fila = estudio;
    }

    // La que ya tiene, releída de Mercado Pago (no de la fila: puede estar desfasada).
    let actual: Preapproval | null = null;
    const idActual = preapprovalDe(fila.subscription_id);
    if (idActual) {
      const r = await leerSuscripcion(config.accessToken, idActual);
      if (r.ok) actual = r.datos;
      else if (r.status !== 404) return NextResponse.json({ error: 'Mercado Pago no contesta. Probá de nuevo en un momento.' }, { status: 502 });
    }
    const decision = decidirAlta(fila, plan, actual, new Date(), intervalo);
    if (!decision.ok) return NextResponse.json({ error: decision.error }, { status: decision.status });

    await cargarPrecios();
    const importe = intervalo === 'anual' ? precioAnual(precioMesDe(plan)) : precioMesDe(plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const cuerpo = cuerpoPreapproval({
      studioId: fila.id, plan, intervalo, nombrePlan: PLAN_INFO[plan].nombre, importe, moneda: MONEDA, email,
      backUrl: `${appUrl}/suscripcion?suscripcion=ok`, empiezaEl: decision.empiezaEl,
    });
    // Un doble clic dentro del mismo minuto devuelve la misma suscripción.
    const minuto = Math.floor(Date.now() / 60_000);
    const creada = await crearSuscripcion(config.accessToken, cuerpo, `centra-plan-${fila.id}-${plan}-${intervalo}-${minuto}`);
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
    if (claveCadena) await liberarCheckoutLock(admin, claveCadena);
  }
}
