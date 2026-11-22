import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { errorInterno } from '@/lib/errores-servidor';
import { puedeMoverDinero } from '@/lib/permisos-reglas';
import { emitirFactura } from '@/lib/arca/servidor';
import { CONDICIONES_IVA_RECEPTOR } from '@/lib/arca/reglas';

export const dynamic = 'force-dynamic';

// Emitir la factura de ARCA de un recibo cobrado, A MANO. Quien mueve dinero.
// Nada optimista: la pantalla solo dice «emitida» con el CAE que devuelve esto.
export async function POST(req: NextRequest) {
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!puedeMoverDinero(sesion.rol)) return NextResponse.json({ error: 'Tu rol no puede emitir facturas.' }, { status: 403 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servidor sin service-role configurada' }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { reciboId?: unknown; receptor?: { documento?: unknown; condicionIva?: unknown; nombre?: unknown } } | null;
  const reciboId = typeof body?.reciboId === 'string' ? body.reciboId : '';
  const condicionIva = Number(body?.receptor?.condicionIva);
  if (!reciboId) return NextResponse.json({ error: 'Falta el recibo.' }, { status: 400 });
  if (!CONDICIONES_IVA_RECEPTOR.some(c => c.id === condicionIva)) return NextResponse.json({ error: 'Elegí la condición frente al IVA de quien recibe la factura.' }, { status: 400 });

  try {
    const r = await emitirFactura(admin, {
      studioId: sesion.studioId,
      reciboId,
      receptor: {
        documento: typeof body?.receptor?.documento === 'string' ? body.receptor.documento : null,
        condicionIva,
        nombre: typeof body?.receptor?.nombre === 'string' ? body.receptor.nombre : null,
      },
      fetch,
    });
    if (!r.ok) return NextResponse.json({ error: r.error, mensajes: r.mensajes ?? [] }, { status: r.status });
    return NextResponse.json({ comprobante: r.comprobante });
  } catch (err) {
    return errorInterno('arca/emitir:POST', err, 'No se pudo emitir la factura.');
  }
}
