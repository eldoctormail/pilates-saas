import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { errorInterno } from '@/lib/errores-servidor';
import { leerUsuario } from '@/lib/mercadopago/api';
import {
  MercadoPagoNoDisponible, configDelEstudio, cuentaPublica, guardarCuenta, quitarCuenta, validarCuenta,
} from '@/lib/mercadopago/cuenta';

export const dynamic = 'force-dynamic';

// La cuenta de Mercado Pago del estudio (Apps e integraciones › Mercado Pago).
// SOLO la propietaria: es SU cuenta, donde entra el dinero. El token y la clave
// del webhook entran por aquí, se comprueban con Mercado Pago y se guardan
// cifrados; nunca vuelven a salir del servidor.

async function sesionPropietaria(req: NextRequest) {
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (sesion.rol !== 'PROPIETARIO') {
    return { error: NextResponse.json({ error: 'Solo la propietaria conecta la cuenta de Mercado Pago.' }, { status: 403 }) };
  }
  const admin = getSupabaseAdmin();
  if (!admin) return { error: NextResponse.json({ error: 'Servidor sin service-role configurada' }, { status: 503 }) };
  return { sesion, admin };
}

export async function GET(req: NextRequest) {
  const s = await sesionPropietaria(req);
  if ('error' in s) return s.error;
  try {
    return NextResponse.json(await cuentaPublica(s.admin, s.sesion.studioId));
  } catch (err) {
    return errorInterno('mercadopago/configuracion:GET', err, 'No se pudo leer la cuenta de Mercado Pago.');
  }
}

export async function POST(req: NextRequest) {
  const s = await sesionPropietaria(req);
  if ('error' in s) return s.error;
  const { admin, sesion } = s;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    if (body?.accion === 'guardar') {
      const v = validarCuenta(body);
      if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
      const r = await guardarCuenta(admin, {
        studioId: sesion.studioId, userId: sesion.userId ?? null, accessToken: v.accessToken, webhookSecret: v.webhookSecret,
      });
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    } else if (body?.accion === 'quitar') {
      await quitarCuenta(admin, sesion.studioId);
    } else if (body?.accion === 'probar') {
      const c = await configDelEstudio(admin, sesion.studioId);
      if (!c.ok) return NextResponse.json({ error: c.motivo }, { status: 409 });
      const u = await leerUsuario(c.accessToken);
      if (!u.ok) {
        const error = u.status === 401 || u.status === 403
          ? 'Mercado Pago ya no acepta ese Access Token: volvé a copiarlo de tu aplicación y guardalo.'
          : 'Mercado Pago no contestó. Probá de nuevo en unos minutos.';
        return NextResponse.json({ error }, { status: 502 });
      }
      return NextResponse.json({ ...(await cuentaPublica(admin, sesion.studioId)), prueba: { cuenta: u.datos.nickname ?? String(u.datos.id) } });
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    return NextResponse.json(await cuentaPublica(admin, sesion.studioId));
  } catch (err) {
    if (err instanceof MercadoPagoNoDisponible) return NextResponse.json({ error: err.message }, { status: 409 });
    return errorInterno('mercadopago/configuracion:POST', err, 'No se pudo guardar la cuenta de Mercado Pago.');
  }
}
