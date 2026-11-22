import { NextRequest, NextResponse } from 'next/server';
import { verificarSesionStaff } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { errorInterno } from '@/lib/errores-servidor';
import { puedeMoverDinero } from '@/lib/permisos-reglas';
import { ArcaNoDisponible, leerConfig, listarComprobantes } from '@/lib/arca/servidor';

export const dynamic = 'force-dynamic';

// Las facturas de ARCA del estudio (las del entorno en uso), para el menú de
// cada recibo y para imprimirlas. Quien mueve dinero (propietaria y recepción).
export async function GET(req: NextRequest) {
  const sesion = await verificarSesionStaff(req);
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!puedeMoverDinero(sesion.rol)) return NextResponse.json({ activa: false, comprobantes: [] });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Servidor sin service-role configurada' }, { status: 503 });
  try {
    const c = await leerConfig(admin, sesion.studioId);
    if (!c?.clavePem || !c.certificadoPem) return NextResponse.json({ activa: false, comprobantes: [] });
    const comprobantes = await listarComprobantes(admin, sesion.studioId, c.entorno);
    return NextResponse.json({
      activa: true,
      entorno: c.entorno,
      condicion: c.condicion,
      emisor: {
        cuit: c.cuit, razonSocial: c.razonSocial, domicilio: c.domicilio,
        ingresosBrutos: c.ingresosBrutos, inicioActividades: c.inicioActividades, condicion: c.condicion,
      },
      comprobantes,
    });
  } catch (err) {
    if (err instanceof ArcaNoDisponible) return NextResponse.json({ activa: false, comprobantes: [], error: err.message });
    return errorInterno('arca/comprobantes:GET', err, 'No se pudieron leer las facturas de ARCA.');
  }
}
