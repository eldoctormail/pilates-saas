// Conciliador de las suscripciones de los estudios a Centra con Mercado Pago.
// Lo llama el cron del despliegue (deploy/crontab) cada 6 horas con
// `Authorization: Bearer <CRON_SECRET>`. Por cada estudio que paga con Mercado
// Pago relee su suscripción (por si un aviso no llegó) y cierra las que pasaron
// el fin de lo pagado más el margen (lib/billing/mp-plataforma/reglas.ts).

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { secretoValido } from '@/lib/salud/secreto';
import { configMpPlataforma } from '@/lib/billing/mp-plataforma/config';
import { preapprovalDe } from '@/lib/billing/mp-plataforma/reglas';
import { cerrarSiVencida, estudiosConSuscripcionMp, leerFila, sincronizarSuscripcion } from '@/lib/billing/mp-plataforma/servidor';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 });
  if (!secretoValido(req.headers.get('authorization'), secret)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const config = configMpPlataforma();
  if (!config.ok) return NextResponse.json({ omitido: true, motivo: config.motivo });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });

  const resumen = { revisados: 0, actualizados: 0, cerrados: 0, errores: 0 };
  for (const f of await estudiosConSuscripcionMp(admin)) {
    resumen.revisados++;
    try {
      const r = await sincronizarSuscripcion(admin, config.accessToken, preapprovalDe(f.subscription_id)!);
      if (r.tipo === 'aplicado') resumen.actualizados++;
      if (r.tipo === 'reintentar') resumen.errores++;
      const fila = await leerFila(admin, f.id);
      if (fila && (await cerrarSiVencida(admin, fila))) resumen.cerrados++;
    } catch (err) {
      resumen.errores++;
      console.error('[cron/mp-suscripciones]', f.id, err instanceof Error ? err.message : err);
    }
  }
  return NextResponse.json(resumen);
}
