// Conciliador de Mercado Pago (autoalojado). Lo llama el cron del despliegue
// (deploy/crontab) cada 30 minutos con `Authorization: Bearer <CRON_SECRET>`.
// Repasa los pagos de las últimas 72 h y aplica los que el webhook no aplicó.
// Ver lib/mercadopago/conciliar.ts.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { secretoValido } from '@/lib/salud/secreto';
import { conciliarMercadoPago, type ResumenConciliacion } from '@/lib/mercadopago/conciliar';
import { cuentaPuedeAplicar, todasLasCuentas } from '@/lib/mercadopago/cuenta';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 });
  if (!secretoValido(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });
  // Cada cuenta (las del panel y la del servidor), con sus pagos y solo los de su estudio.
  const cuentas = await todasLasCuentas(admin);
  // Sin Mercado Pago configurado no hay nada que conciliar: no es un error.
  if (cuentas.length === 0) return NextResponse.json({ omitido: true, motivo: 'Ningún estudio tiene Mercado Pago configurado.' });

  const horasPedidas = Number(req.nextUrl.searchParams.get('horas'));
  const horas = Number.isFinite(horasPedidas) && horasPedidas > 0 && horasPedidas <= 24 * 30 ? horasPedidas : undefined;
  const conCuentaPropia = new Set(cuentas.flatMap(c => (c.studioId ? [c.studioId] : [])));
  const total: ResumenConciliacion = { revisados: 0, deTentare: 0, procesados: 0, aplicados: 0, errores: 0, comprasCaducadasEstudios: 0, truncado: false };
  for (const [i, cuenta] of cuentas.entries()) {
    const r = await conciliarMercadoPago(admin, cuenta.accessToken, {
      horas,
      puedeAplicar: s => cuentaPuedeAplicar(cuenta, s, conCuentaPropia),
      barrerCaducadas: i === cuentas.length - 1,
    });
    total.revisados += r.revisados; total.deTentare += r.deTentare; total.procesados += r.procesados;
    total.aplicados += r.aplicados; total.errores += r.errores; total.comprasCaducadasEstudios += r.comprasCaducadasEstudios;
    total.truncado ||= r.truncado;
  }
  return NextResponse.json({ ...total, cuentas: cuentas.length }, { status: total.errores > 0 ? 207 : 200 });
}
