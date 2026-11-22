// Devolver desde el panel un recibo cobrado con Mercado Pago (autoalojado).
//
// Mismo reparto que con Stripe (`/api/reembolsos`): aquí solo se PIDE la
// devolución a Mercado Pago y se anota que Tentare la pidió. Lo que viene
// después —recibo DEVUELTO, fila en `devoluciones`, factura rectificativa,
// aviso a la socia, ofrecer quitarle el bono— lo hace `procesarChargeRefunded`
// cuando Mercado Pago avisa del pago devuelto (webhook) o cuando el conciliador
// lo ve. Así un reembolso hecho desde el panel de Mercado Pago sigue el mismo
// camino que uno pedido desde Tentare.
//
// Quién puede, la política del estudio (plazo, sin usar) y el recibo del
// estudio ya los comprobó la ruta antes de llegar aquí.

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { registrarAuditoriaServidor } from '../auditoria/registrar-servidor.ts';
import type { SesionStaff } from '../auth-server.ts';
import { configMercadoPago } from './config.ts';
import { devolverPago } from './api.ts';

export interface ReciboADevolver {
  id: string;
  importe: number | string | null;
  concepto: string | null;
  socio_id: string | null;
  reembolso_solicitado_en: string | null;
  reembolso_stripe_id: string | null;
  reembolso_fallido_en: string | null;
}

export type ResultadoPedido =
  | { ok: true; refundId: string; estado: string }
  | { ok: false; status: number; error: string; motivo?: string };

export async function pedirReembolsoMercadoPago(
  admin: SupabaseClient, sesion: SesionStaff, recibo: ReciboADevolver,
): Promise<ResultadoPedido> {
  const config = configMercadoPago();
  if (!config.ok) return { ok: false, status: 503, error: 'Mercado Pago no está configurado en este servidor.' };

  // El pago que cobró este recibo. Un recibo de matrícula de una compra no tiene
  // fila propia: el pago es el del plan (se devuelven los dos juntos).
  const { data: pagos, error } = await admin.from('pagos_mercadopago')
    .select('payment_id, importe, desenlace')
    .eq('studio_id', sesion.studioId).eq('recibo_id', recibo.id).in('desenlace', ['aplicado', 'ya_estaba']);
  if (error) return { ok: false, status: 503, error: 'No hemos podido leer el pago. Inténtalo en un momento.' };
  if (!pagos?.length) {
    const esMatricula = recibo.id.startsWith('rec-web-mat-');
    return {
      ok: false, status: 409, motivo: esMatricula ? 'MATRICULA_JUNTO_AL_PLAN' : 'SIN_RASTRO_MERCADOPAGO',
      error: esMatricula
        ? 'La matrícula se pagó junto con el plan en un solo pago de Mercado Pago. Devolvé el recibo del plan: se devuelven los dos.'
        : 'No encontramos el pago de este recibo en Mercado Pago, así que no se puede devolver desde aquí. Devolvelo desde tu cuenta de Mercado Pago: Tentare lo detectará igual.',
    };
  }
  if (pagos.length > 1) {
    return {
      ok: false, status: 409, motivo: 'VARIOS_COBROS',
      error: 'Este recibo tiene MÁS DE UN PAGO en Mercado Pago, así que aquí no podemos elegir cuál devolver. '
        + 'Devolvé el que sobra desde tu cuenta de Mercado Pago: ' + pagos.map(p => p.payment_id).join(', ') + '.',
    };
  }
  const paymentId = String(pagos[0].payment_id);

  // Idempotencia por recibo (doble clic, dos pestañas). Un reintento tras un
  // fallo comunicado lleva el id anterior, para no recibir la respuesta vieja.
  const reintento = !!recibo.reembolso_fallido_en && !!recibo.reembolso_stripe_id;
  const clave = reintento ? `reembolso-mp-${recibo.id}-tras-${recibo.reembolso_stripe_id}` : `reembolso-mp-${recibo.id}`;

  const res = await devolverPago(config.accessToken, paymentId, clave);
  if (!res.ok) {
    // 400 con el pago ya devuelto: alguien lo devolvió desde Mercado Pago entre medias.
    if (res.status === 400 && /refund|devoluci|already/i.test(res.error)) {
      return { ok: false, status: 409, error: `Mercado Pago no aceptó la devolución: ${res.error}. Si ya estaba devuelto, Tentare lo anotará solo.` };
    }
    Sentry.captureMessage('[mercadopago/reembolso] no se pudo devolver', {
      level: 'error', tags: { area: 'cobros', tipo: 'reembolso', pasarela: 'mercadopago' },
      extra: { reciboId: recibo.id, studioId: sesion.studioId, paymentId, status: res.status, error: res.error },
    });
    return { ok: false, status: 502, error: 'No se pudo completar la devolución. Volvé a intentarlo; si sigue fallando, hacela desde tu cuenta de Mercado Pago.' };
  }

  const refundId = `mp_ref_${res.datos.id}`;
  const pedidoEn = new Date().toISOString();

  // El dinero YA salió: primero el libro de auditoría (quién, qué, cuánto), después la marca.
  if (recibo.reembolso_stripe_id !== refundId) await registrarAuditoriaServidor(admin, {
    sesion,
    tabla: 'recibos', filaId: recibo.id, operacion: 'UPDATE', socioId: recibo.socio_id,
    antes: {
      reembolso_solicitado_en: recibo.reembolso_solicitado_en,
      reembolso_stripe_id: recibo.reembolso_stripe_id,
      reembolso_fallido_en: recibo.reembolso_fallido_en,
    },
    despues: { reembolso_solicitado_en: pedidoEn, reembolso_stripe_id: refundId, reembolso_fallido_en: null },
    contexto: {
      accion: 'REEMBOLSO_PEDIDO', pasarela: 'mercadopago', concepto: recibo.concepto,
      importe: Number(recibo.importe) || null, estado_mercadopago: res.datos.status,
    },
  });

  // `reembolso_stripe_id` es la columna de «devolución pedida» que ya leen el
  // panel y el aviso de «devolviendo…»; aquí lleva el id de Mercado Pago (mp_ref_…).
  const { error: errMarca } = await admin.from('recibos').update({
    reembolso_solicitado_en: pedidoEn,
    reembolso_stripe_id: refundId,
    reembolso_fallido_en: null,
    reembolso_fallo_motivo: null,
  }).eq('id', recibo.id).eq('studio_id', sesion.studioId);
  if (errMarca) {
    Sentry.captureMessage('[mercadopago/reembolso] devolución hecha pero sin marcar como solicitada', {
      level: 'warning', tags: { area: 'cobros', tipo: 'reembolso', pasarela: 'mercadopago' },
      extra: { reciboId: recibo.id, refundId, error: errMarca.message },
    });
  }
  return { ok: true, refundId, estado: res.datos.status };
}
