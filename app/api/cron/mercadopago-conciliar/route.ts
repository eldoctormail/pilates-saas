// Conciliador de Mercado Pago (autoalojado). Lo llama el cron del despliegue
// (deploy/crontab) cada 30 minutos con `Authorization: Bearer <CRON_SECRET>`.
// Repasa los pagos de las últimas 72 h y aplica los que el webhook no aplicó.
// Ver lib/mercadopago/conciliar.ts.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { secretoValido } from '@/lib/salud/secreto';
import { configMercadoPago } from '@/lib/mercadopago/config';
import { conciliarMercadoPago } from '@/lib/mercadopago/conciliar';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 });
  if (!secretoValido(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const config = configMercadoPago();
  // Sin Mercado Pago configurado no hay nada que conciliar: no es un error.
  if (!config.ok) return NextResponse.json({ omitido: true, motivo: config.motivo });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });

  const horas = Number(req.nextUrl.searchParams.get('horas'));
  const resumen = await conciliarMercadoPago(admin, config.accessToken, {
    horas: Number.isFinite(horas) && horas > 0 && horas <= 24 * 30 ? horas : undefined,
  });
  return NextResponse.json(resumen, { status: resumen.errores > 0 ? 207 : 200 });
}
