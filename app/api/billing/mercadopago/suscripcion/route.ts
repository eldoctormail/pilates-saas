// «Mi suscripción» cuando el estudio paga a Centra con Mercado Pago: lo que
// paga, cuándo se cobra y en qué estado está, RELEÍDO de Mercado Pago.
//
//   GET   lo que ve la propietaria.
//   POST  { preapprovalId } a la vuelta de Mercado Pago: la sincroniza en el
//         acto (sin esperar al webhook). Solo la del propio estudio.

import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { leerSuscripcion } from '@/lib/billing/mp-plataforma/api';
import { estadoVisible, leerReferencia, preapprovalDe } from '@/lib/billing/mp-plataforma/reglas';
import { leerFila, sincronizarSuscripcion } from '@/lib/billing/mp-plataforma/servidor';
import { errorInterno } from '@/lib/errores-servidor';

export const dynamic = 'force-dynamic';

async function contexto(req: NextRequest, nombre: string) {
  const limitado = await enforceRateLimit(req, nombre, { max: 30, windowSeconds: 60 });
  if (limitado) return { respuesta: limitado } as const;
  const config = configMpPlataforma();
  if (!config.ok) return { respuesta: NextResponse.json({ error: 'El cobro con Mercado Pago no está configurado.' }, { status: 503 }) } as const;
  const admin = getSupabaseAdmin();
  if (!admin) return { respuesta: NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 }) } as const;
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return { respuesta: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) } as const;
  if (sesion.rol !== 'PROPIETARIO') return { respuesta: NextResponse.json({ error: 'Solo la propietaria ve la suscripción' }, { status: 403 }) } as const;
  return { admin, token: config.accessToken, studioId: sesion.studioId } as const;
}

export async function GET(req: NextRequest) {
  const c = await contexto(req, 'billing-mp-suscripcion');
  if ('respuesta' in c) return c.respuesta;
  try {
    const fila = await leerFila(c.admin, c.studioId);
    const id = preapprovalDe(fila?.subscription_id);
    if (!fila || !id) return NextResponse.json({ error: 'Este estudio aún no tiene suscripción.' }, { status: 409 });
    const r = await leerSuscripcion(c.token, id);
    if (!r.ok && r.status !== 404) return NextResponse.json({ error: 'Mercado Pago no contesta. Probá de nuevo en un momento.' }, { status: 502 });
    const pre = r.ok ? r.datos : null;
    const estado = estadoVisible(fila, pre);
    return NextResponse.json({
      plan: leerReferencia(pre?.external_reference)?.plan ?? fila.plan,
      importe: pre?.auto_recurring?.transaction_amount ?? null,
      moneda: pre?.auto_recurring?.currency_id ?? null,
      proximoCobro: estado === 'al_dia' || estado === 'impago' ? (pre?.next_payment_date ?? fila.current_period_end) : null,
      accesoHasta: estado === 'baja_programada' ? fila.current_period_end : null,
      estado,
      puedeCancelar: pre?.status === 'authorized' || pre?.status === 'paused',
    });
  } catch (err) {
    return errorInterno('billing/mercadopago/suscripcion:GET', err, 'No se pudo leer tu suscripción.');
  }
}

export async function POST(req: NextRequest) {
  const c = await contexto(req, 'billing-mp-confirmar');
  if ('respuesta' in c) return c.respuesta;
  const body = await req.json().catch(() => null) as { preapprovalId?: unknown } | null;
  const id = typeof body?.preapprovalId === 'string' ? body.preapprovalId : '';
  if (!/^[A-Za-z0-9]{1,64}$/.test(id)) return NextResponse.json({ error: 'Suscripción no válida' }, { status: 400 });
  try {
    const leida = await leerSuscripcion(c.token, id);
    if (!leida.ok) return NextResponse.json({ error: 'Mercado Pago no contesta.' }, { status: leida.status === 404 ? 404 : 502 });
    // Solo la del propio estudio: la referencia la puso el servidor al crearla.
    if (leerReferencia(leida.datos.external_reference)?.studioId !== c.studioId) {
      return NextResponse.json({ error: 'Esa suscripción no es de tu estudio.' }, { status: 404 });
    }
    const r = await sincronizarSuscripcion(c.admin, c.token, id);
    return NextResponse.json({ estado: leida.datos.status, resultado: r.tipo });
  } catch (err) {
    return errorInterno('billing/mercadopago/suscripcion:POST', err, 'No se pudo confirmar tu suscripción.');
  }
}
