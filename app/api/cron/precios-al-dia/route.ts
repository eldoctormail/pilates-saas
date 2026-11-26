// Deja las páginas ya generadas con los precios de /interno/precios.
//
// Las páginas estáticas se generan al compilar la imagen, sin base de datos, y
// salen con los precios de serie (lib/billing/precios-plataforma.ts). Sin esto,
// tras cada `docker compose up` con imagen nueva la web y /suscripcion
// enseñaban esos precios mientras Mercado Pago cobraba los guardados, hasta que
// alguien volviera a guardar en /interno/precios.
//
// Lo llama el cron del despliegue (deploy/crontab y el arranque del contenedor
// de cron) con `Authorization: Bearer <CRON_SECRET>`. Solo regenera si los
// precios guardados no son los que tienen las páginas de este proceso.

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { secretoValido } from '@/lib/salud/secreto';
import { PRECIOS_DE_SERIE } from '@/lib/billing/precios-plataforma';
import { cargarPrecios, marcarPublicados, paginasDesfasadas } from '@/lib/billing/precios-servidor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 });
  if (!secretoValido(req.headers.get('authorization'), secret)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  // Sin base de datos no hay precios guardados que poner: que el cron lo reintente.
  if (!getSupabaseAdmin()) return NextResponse.json({ error: 'Persistencia no disponible' }, { status: 503 });

  const precios = await cargarPrecios({ forzar: true });
  if (!paginasDesfasadas(precios, PRECIOS_DE_SERIE)) return NextResponse.json({ regeneradas: false });
  revalidatePath('/', 'layout');
  marcarPublicados(precios);
  console.info('[precios] páginas regeneradas con los precios guardados');
  return NextResponse.json({ regeneradas: true });
}
