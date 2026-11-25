// Dar de baja la mensualidad de Mercado Pago. Mercado Pago deja de cobrar en el
// acto, pero el estudio sigue con su plan hasta el final de lo que ya pagó: lo
// cierra después `vencida` (lib/billing/mp-plataforma/reglas.ts). No se
// devuelve nada. Para volver, se contrata de nuevo desde /suscripcion.

import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { cancelarSuscripcion, leerSuscripcion } from '@/lib/billing/mp-plataforma/api';
import { preapprovalDe } from '@/lib/billing/mp-plataforma/reglas';
import { leerFila } from '@/lib/billing/mp-plataforma/servidor';
import { errorInterno } from '@/lib/errores-servidor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limitado = await enforceRateLimit(req, 'billing-mp-baja', { max: 5, windowSeconds: 60 });
  if (limitado) return limitado;
  const config = configMpPlataforma();
  if (!config.ok) return NextResponse.json({ error: 'El cobro con Mercado Pago no está configurado.' }, { status: 503 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 });
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (sesion.rol !== 'PROPIETARIO') return NextResponse.json({ error: 'Solo la propietaria puede dar de baja la suscripción' }, { status: 403 });

  const body = await req.json().catch(() => null) as { motivo?: unknown } | null;
  const motivo = typeof body?.motivo === 'string' ? body.motivo.trim().slice(0, 300) : '';
  try {
    const fila = await leerFila(admin, sesion.studioId);
    const id = preapprovalDe(fila?.subscription_id);
    if (!fila || !id) return NextResponse.json({ error: 'Este estudio aún no tiene suscripción.' }, { status: 409 });
    const r = await cancelarSuscripcion(config.accessToken, id);
    if (!r.ok) return NextResponse.json({ error: 'Mercado Pago no pudo cancelarla. Probá de nuevo en un momento.' }, { status: 502 });
    // Se relee: solo se anuncia lo que Mercado Pago dice.
    const leida = await leerSuscripcion(config.accessToken, id);
    const cancelada = leida.ok && leida.datos.status === 'cancelled';
    if (cancelada) console.info('[mp-plataforma] baja pedida por la propietaria', { studioId: sesion.studioId, motivo });
    return NextResponse.json({ ok: cancelada, accesoHasta: fila.current_period_end }, { status: cancelada ? 200 : 502 });
  } catch (err) {
    return errorInterno('billing/mercadopago/baja:POST', err, 'No se pudo confirmar la baja. Recargá la página en unos segundos para ver cómo quedó.');
  }
}
