// En qué quedó una compra de Mercado Pago con clase («pagar y reservar»), para
// la ficha de la clase cuando la alumna vuelve de Mercado Pago (`?mp=<compra>`).
// Volver de Mercado Pago no significa nada: manda lo que el webhook (o el
// conciliador) hizo de verdad con el pago.
//
// Contesta con el MISMO cuerpo que `/api/public/estado-pago` (Stripe), para que
// la hoja de pagar y reservar lo pinte igual:
//   · sin pagar todavía (abierta, o caducada/fallida) → `en_proceso`. Nunca
//     `fallida`: en esta hoja significa «pagaste y no hubo plaza». Una que
//     caducó y aun así se pagó la entrega el webhook y pasa a pagada;
//   · pagada                                          → el estado de la reserva
//     (`estadoDeLaReserva`, con el id de la compra como clave).
//
// Solo con la sesión de la socia: la compra tiene que ser SUYA y de ese estudio.
// Una compra ajena o inexistente recibe `en_proceso`, como una abierta: no se
// distingue lo que no es suyo.

import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { verificarUsuarioSupabase } from '@/lib/auth-server';
import { socioAutenticado } from '@/lib/db/supabase-data-admin';
import { estadoDeLaReserva } from '@/lib/billing/estado-reserva-pagada';
import { esIdCompra } from '@/lib/mercadopago/referencia';
import type { RespuestaEstadoPago } from '@/lib/billing/estado-pago-publico';

const sinCache = { 'Cache-Control': 'no-store' };
const responder = (body: RespuestaEstadoPago | { error: string }, status = 200) => NextResponse.json(body, { status, headers: sinCache });

export async function GET(req: NextRequest) {
  const limitado = await enforceRateLimit(req, 'mercadopago-estado-compra', { max: 60, windowSeconds: 60 });
  if (limitado) return limitado;

  const studioId = req.nextUrl.searchParams.get('studioId') ?? '';
  const compraId = req.nextUrl.searchParams.get('compra') ?? '';
  if (!studioId || !esIdCompra(compraId)) return responder({ estado: 'en_proceso' });

  const usuario = await verificarUsuarioSupabase(req);
  if (!usuario) return responder({ error: 'Tu sesión ha caducado. Vuelve a entrar: tu pago no se pierde.' }, 401);
  const socioId = await socioAutenticado(usuario.userId, studioId);
  if (!socioId) return responder({ estado: 'en_proceso' });

  const admin = getSupabaseAdmin();
  if (!admin) return responder({ estado: 'en_proceso' });

  const { data: compra } = await admin.from('compras_mercadopago')
    .select('estado, sesion_id, actualizado_en')
    .eq('id', compraId).eq('studio_id', studioId).eq('socio_id', socioId)
    .maybeSingle();
  if (!compra) return responder({ estado: 'en_proceso' });

  if (compra.estado !== 'pagada' || !compra.sesion_id) return responder({ estado: 'en_proceso' });

  return responder(await estadoDeLaReserva(admin, {
    pi: compraId, studioId, socioId,
    // Cuándo se entregó: acota el aviso de «pagó y no hubo plaza» a esta compra.
    fechaCobro: (compra.actualizado_en as string | null) ?? null,
    detalle: true,
  }));
}
