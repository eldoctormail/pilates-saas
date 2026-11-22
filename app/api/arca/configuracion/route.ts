import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { errorInterno } from '@/lib/errores-servidor';
import {
  ArcaNoDisponible, configPublica, generarPedido, guardarCertificado, guardarDatos, leerConfig, probarConexion, validarDatos,
} from '@/lib/arca/servidor';
import { ArcaSinRespuesta } from '@/lib/arca/soap';
import { ErrorArca } from '@/lib/arca/wsfe';

export const dynamic = 'force-dynamic';

// Configuración de la factura electrónica de ARCA. SOLO la propietaria: es la
// obligada ante ARCA, y acá se genera la clave con la que se firma en su nombre.
// La clave y el ticket nunca salen del servidor.

async function sesionPropietaria(req: NextRequest) {
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (sesion.rol !== 'PROPIETARIO') return { error: NextResponse.json({ error: 'Solo la propietaria configura la factura electrónica.' }, { status: 403 }) };
  const admin = getSupabaseAdmin();
  if (!admin) return { error: NextResponse.json({ error: 'Servidor sin service-role configurada' }, { status: 503 }) };
  return { sesion, admin };
}

export async function GET(req: NextRequest) {
  const s = await sesionPropietaria(req);
  if ('error' in s) return s.error;
  try {
    return NextResponse.json(configPublica(await leerConfig(s.admin, s.sesion.studioId)));
  } catch (err) {
    if (err instanceof ArcaNoDisponible) return NextResponse.json({ error: err.message }, { status: 409 });
    return errorInterno('arca/configuracion:GET', err, 'No se pudo leer la configuración de ARCA.');
  }
}

export async function POST(req: NextRequest) {
  const s = await sesionPropietaria(req);
  if ('error' in s) return s.error;
  const { admin, sesion } = s;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const accion = body?.accion;
  try {
    if (accion === 'datos') {
      const v = validarDatos(body ?? {});
      if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
      await guardarDatos(admin, sesion.studioId, v.datos);
    } else if (accion === 'pedido') {
      const { data } = await admin.from('studios').select('slug').eq('id', sesion.studioId).maybeSingle();
      await generarPedido(admin, sesion.studioId, data?.slug ?? sesion.studioId);
    } else if (accion === 'certificado') {
      const r = await guardarCertificado(admin, sesion.studioId, typeof body?.certificado === 'string' ? body.certificado : '');
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    } else if (accion === 'probar') {
      const r = await probarConexion(admin, sesion.studioId, fetch);
      return NextResponse.json({ ...configPublica(await leerConfig(admin, sesion.studioId)), prueba: r });
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    return NextResponse.json(configPublica(await leerConfig(admin, sesion.studioId)));
  } catch (err) {
    if (err instanceof ArcaNoDisponible) return NextResponse.json({ error: err.message }, { status: 409 });
    if (err instanceof ArcaSinRespuesta) return NextResponse.json({ error: 'ARCA no contestó. Probá de nuevo en unos minutos.' }, { status: 504 });
    if (err instanceof ErrorArca) return NextResponse.json({ error: `ARCA devolvió un error: ${err.message}` }, { status: 502 });
    return errorInterno('arca/configuracion:POST', err, 'No se pudo guardar la configuración de ARCA.');
  }
}
