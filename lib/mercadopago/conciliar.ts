// Conciliador de Mercado Pago (autoalojado): la red de seguridad del webhook.
//
// Mercado Pago reintenta un aviso durante un tiempo, pero si el servidor estuvo
// caído, la clave del webhook mal puesta o el dominio sin resolver, un pago
// aprobado puede no llegar nunca: la alumna pagó y no tiene su bono o su
// recibo sigue pendiente. Este barrido repasa los pagos de la cuenta de los
// últimos días y aplica, con la MISMA función que el webhook (`procesarPago`),
// los que Tentare no tiene anotados o tiene en otro estado.
//
// También cierra las compras de plan caducadas de todos los estudios (devuelve
// su plaza de matrícula gratis), por si nadie abrió una compra nueva en ese
// estudio que las barriera.
//
// Idempotente: aplicar dos veces el mismo pago no hace nada la segunda.

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buscarPagos } from './api.ts';
import { leerReferencia } from './referencia.ts';
import { procesarPago } from './procesar-pago.ts';
import { barrerComprasCaducadas } from './compra-plan-servidor.ts';
import { hayQueProcesar } from './conciliar-reglas.ts';

export interface ResumenConciliacion {
  revisados: number;
  deTentare: number;
  procesados: number;
  aplicados: number;
  errores: number;
  comprasCaducadasEstudios: number;
  truncado: boolean;
}

const MAX_PAGINAS = 20; // 2.000 pagos por pasada: de sobra para un estudio

export async function conciliarMercadoPago(
  admin: SupabaseClient,
  accessToken: string,
  opciones: { horas?: number; ahora?: Date } = {},
): Promise<ResumenConciliacion> {
  const ahora = opciones.ahora ?? new Date();
  const desde = new Date(ahora.getTime() - (opciones.horas ?? 72) * 60 * 60 * 1000);
  const r: ResumenConciliacion = { revisados: 0, deTentare: 0, procesados: 0, aplicados: 0, errores: 0, comprasCaducadasEstudios: 0, truncado: false };

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    const res = await buscarPagos(accessToken, { desde, hasta: ahora, offset: pagina * 100 });
    if (!res.ok) {
      r.errores++;
      Sentry.captureMessage('[mercadopago/conciliar] no se pudo buscar pagos', {
        level: 'warning', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { status: res.status, error: res.error, pagina },
      });
      break;
    }
    const pagos = res.datos.results ?? [];
    r.revisados += pagos.length;
    const nuestros = pagos.filter(p => leerReferencia(p.external_reference) !== null);
    r.deTentare += nuestros.length;

    if (nuestros.length) {
      const { data: anotados, error } = await admin.from('pagos_mercadopago')
        .select('payment_id, estado, desenlace').in('payment_id', nuestros.map(p => String(p.id)));
      if (error) { r.errores++; break; }
      const porId = new Map((anotados ?? []).map(a => [a.payment_id as string, a as { estado: string; desenlace: string }]));
      for (const pago of nuestros) {
        if (!hayQueProcesar(pago, porId.get(String(pago.id)))) continue;
        r.procesados++;
        try {
          const out = await procesarPago(admin, pago);
          if (out.status >= 500) r.errores++;
          if (out.cuerpo.aplicado === true || out.cuerpo.entregado === true) r.aplicados++;
        } catch (e) {
          r.errores++;
          Sentry.captureException(e, { tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { paymentId: pago.id } });
        }
      }
    }

    const { total, limit, offset } = res.datos.paging ?? { total: 0, limit: 100, offset: 0 };
    if (offset + limit >= total || pagos.length === 0) break;
    if (pagina === MAX_PAGINAS - 1) r.truncado = true;
  }

  if (r.aplicados > 0) {
    // Un pago que solo aplicó el conciliador es un aviso que no llegó: conviene mirar la configuración del webhook.
    Sentry.captureMessage('[mercadopago/conciliar] se aplicaron pagos cuyo aviso no había llegado: revisar el webhook', {
      level: 'warning', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { aplicados: r.aplicados },
    });
  }

  // Compras caducadas de todos los estudios.
  const { data: conCaducadas } = await admin.from('compras_mercadopago')
    .select('studio_id').eq('estado', 'abierta').lt('expira_en', ahora.toISOString()).limit(500);
  const estudios = [...new Set((conCaducadas ?? []).map(c => c.studio_id as string))];
  for (const studioId of estudios) await barrerComprasCaducadas(admin, studioId);
  r.comprasCaducadasEstudios = estudios.length;

  return r;
}
