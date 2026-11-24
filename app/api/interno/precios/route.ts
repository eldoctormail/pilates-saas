import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { exigirPermiso } from '@/lib/interno/auth';
import { registrar } from '@/lib/interno/auditoria';
import { enforceRateLimit } from '@/lib/rate-limit';
import { CLAVE_AJUSTE_PRECIOS, PRECIOS_DE_SERIE, leerPreciosGuardados, validarPrecios } from '@/lib/billing/precios-plataforma';
import { preciosRecienGuardados } from '@/lib/billing/precios-servidor';

export const runtime = 'nodejs';

// Los precios de los planes y complementos que paga cada estudio por usar Centra
// (lib/billing/precios-plataforma.ts). Los edita quien tiene `plans.update`.

export async function GET(req: NextRequest) {
  const g = await exigirPermiso(req, 'billing.read');
  if ('error' in g) return g.error;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 });
  const { data, error } = await db.from('ajustes_plataforma')
    .select('valor, actualizado_en').eq('clave', CLAVE_AJUSTE_PRECIOS).maybeSingle();
  if (error) return NextResponse.json({ error: 'No se han podido leer los precios.' }, { status: 500 });
  return NextResponse.json({
    precios: leerPreciosGuardados(data?.valor),
    deSerie: PRECIOS_DE_SERIE,
    guardadosEn: data?.actualizado_en ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const g = await exigirPermiso(req, 'plans.update');
  if ('error' in g) return g.error;
  const limitado = await enforceRateLimit(req, 'interno-precios', { max: 20, windowSeconds: 60 }, g.admin.userId);
  if (limitado) return limitado;
  const valido = validarPrecios(await req.json().catch(() => null));
  if (!valido.ok) return NextResponse.json({ error: valido.error }, { status: 400 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 });

  const { data: antes } = await db.from('ajustes_plataforma').select('valor').eq('clave', CLAVE_AJUSTE_PRECIOS).maybeSingle();
  const { error } = await db.from('ajustes_plataforma').upsert({
    clave: CLAVE_AJUSTE_PRECIOS, valor: valido.precios, actualizado_en: new Date().toISOString(), actualizado_por: g.admin.userId,
  }, { onConflict: 'clave' });
  if (error) return NextResponse.json({ error: 'No se han podido guardar los precios.' }, { status: 500 });

  preciosRecienGuardados(valido.precios);
  // Todas las páginas que enseñan un precio (la web, /precios, el alta, la
  // suscripción…) se vuelven a generar con los nuevos en la próxima visita.
  revalidatePath('/', 'layout');
  const p = valido.precios;
  await registrar(db, req, {
    actor: g.admin, accion: 'billing.precios.cambiados', objetivoTipo: 'ajuste', objetivoId: CLAVE_AJUSTE_PRECIOS,
    resumen: `Precios: Founding ${p.BASE}, Estudio ${p.ESTUDIO}, Cadena ${p.CADENA}; complementos ${p.decisiones} / ${p.sustituciones} / ${p.ia}`,
    antes: antes?.valor ?? null, despues: p,
  });
  return NextResponse.json({ ok: true, precios: p });
}
