// El estado de la RESERVA nacida de un pago con clase («pagar y reservar»), ya
// con la identidad comprobada. Solo lectura. Lo comparten `/api/public/estado-pago`
// (Stripe: la clave es el PaymentIntent) y `/api/mercadopago/estado-compra`
// (Mercado Pago: la clave es el id de la compra). Las dos entregas derivan la
// reserva con `idsDe(clave)` y avisan al mostrador con esa misma clave, así que
// la lectura es la misma.
import type { SupabaseClient } from '@supabase/supabase-js';
import { idsDe } from './ids-compra.ts';
import { EVENTOS } from '../notifications/catalog.ts';
import {
  avisoDeYaTenia, elegirAvisoDelPago, reservaPreviaDe, estadoConPagoDeClase, resolverEstadoPago,
  type AvisoSinPlaza, type FilaPagoParaEstado, type ReservaPrevia, type RespuestaEstadoPago,
} from './estado-pago-publico.ts';

/**
 * El estado de la RESERVA nacida del pago (si el pago llevaba clase), ya con la
 * identidad comprobada por uno de los dos modos. Solo lectura.
 */
export async function estadoDeLaReserva(
  admin: SupabaseClient,
  { pi, studioId, socioId, fechaCobro, detalle }: {
    pi: string; studioId: string; socioId: string; fechaCobro: string | null;
    /** Con la sesión de la socia: lo que tiene a su favor (bono, saldo, caducidad) y su puesto. Sin ella, solo si va en espera. */
    detalle: boolean;
  },
): Promise<RespuestaEstadoPago> {
  const ids = idsDe(pi);

  // 3. La reserva derivada del MISMO PaymentIntent (res-web-…), acotada a
  //    estudio y socia propios.
  const { data: reserva } = await admin
    .from('reservas')
    .select('estado, sesion_id')
    .eq('id', ids.reservaId)
    .eq('studio_id', studioId)
    .eq('socio_id', socioId)
    .maybeSingle();

  // 3b. El pago de clase con su fila (P06): si el servidor ya decidió, eso manda
  //     (salvo una reserva confirmada, que manda siempre: `estadoConPagoDeClase`).
  const { data: filaPago } = await admin.from('pagos_clase')
    .select('estado, motivo, aviso_estudio_en, suscripcion_id, reserva_id')
    .eq('payment_intent_id', pi).eq('studio_id', studioId).maybeSingle();
  const decidido = estadoConPagoDeClase(reserva?.estado as string | null | undefined, filaPago as FilaPagoParaEstado | null);
  if (decidido === 'compensada' && filaPago) {
    const enEspera = filaPago.motivo === 'EN_ESPERA';
    if (!detalle) return { estado: 'compensada', compensacion: { motivo: filaPago.motivo as string, enEspera } };
    let posicion: number | null = null;
    if (enEspera && filaPago.reserva_id) {
      const { data: r } = await admin.from('reservas').select('posicion_espera, estado')
        .eq('id', filaPago.reserva_id as string).eq('studio_id', studioId).maybeSingle();
      posicion = r?.estado === 'LISTA_ESPERA' ? ((r.posicion_espera as number | null) ?? null) : null;
    }
    let bono: NonNullable<RespuestaEstadoPago['compensacion']>['bono'] = null;
    if (filaPago.suscripcion_id) {
      const { data: sus } = await admin.from('suscripciones').select('sesiones_restantes, fecha_fin, plan_id')
        .eq('id', filaPago.suscripcion_id as string).eq('studio_id', studioId).eq('socio_id', socioId).maybeSingle();
      if (sus) {
        const { data: plan } = await admin.from('planes_tarifa').select('nombre').eq('id', sus.plan_id as string).eq('studio_id', studioId).maybeSingle();
        bono = {
          nombre: (plan?.nombre as string | undefined) ?? 'Tu bono',
          sesionesRestantes: (sus.sesiones_restantes as number | null) ?? null,
          fechaFin: (sus.fecha_fin as string | null) ?? null,
        };
      }
    }
    return {
      estado: 'compensada',
      compensacion: { motivo: filaPago.motivo as string, enEspera, posicion, bono, estudioAvisado: !!filaPago.aviso_estudio_en },
    };
  }
  if (decidido === 'reembolsada') return { estado: 'reembolsada' };

  // 4. Sin reserva: ¿dejó el webhook el aviso de «pagó y no hubo plaza» al
  //    mostrador? Acotado a este estudio, esta socia y a partir del cobro
  //    (menos un margen por relojes) para no confundirlo con un aviso viejo
  //    de otra compra, y elegido por ESTE pago (`elegirAvisoDelPago`): el de
  //    otro pago de la misma clase no vale para este.
  let aviso: AvisoSinPlaza | null = null;
  if (!reserva) {
    const desde = fechaCobro
      ? new Date(new Date(fechaCobro).getTime() - 5 * 60_000).toISOString()
      : new Date(Date.now() - 60 * 60_000).toISOString();
    const { data: avisos } = await admin
      .from('notification')
      .select('data, resource_id')
      .eq('studio_id', studioId)
      .eq('event_type', EVENTOS.RESERVA_PAGADA_SIN_PLAZA)
      .contains('data', { socioId })
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .limit(20);
    aviso = elegirAvisoDelPago(avisos as AvisoSinPlaza[] | null, pi);
  }

  // 5. Ya tenía una reserva viva en esa clase: este pago no la ha reservado otra
  //    vez. Se le dice lo que TIENE ahora (plaza, cola o pendiente), no «sin
  //    plaza», que a quien sí tenía plaza le podía hacer no ir a su clase.
  let sesionDeLaClase = (reserva?.sesion_id as string | null | undefined) ?? null;
  let previa: ReservaPrevia | null = null;
  if (!reserva && aviso && avisoDeYaTenia(aviso) && aviso.resource_id) {
    const { data: suyas } = await admin
      .from('reservas')
      .select('estado')
      .eq('studio_id', studioId)
      .eq('sesion_id', aviso.resource_id)
      .eq('socio_id', socioId)
      .in('estado', ['CONFIRMADA', 'ASISTIDA', 'LISTA_ESPERA', 'PENDIENTE_APROBACION']);
    previa = reservaPreviaDe((suyas ?? []).map(r => (r.estado as string | null) ?? null));
    if (previa) sesionDeLaClase = aviso.resource_id;
  }

  const estado = previa ? 'ya_tenia_plaza' : resolverEstadoPago(reserva?.estado as string | null | undefined, !!aviso);
  if (estado === 'en_proceso' || estado === 'fallida') return { estado };

  // Con reserva (confirmada / lista de espera / pendiente, o la que ya tenía): los
  // datos de la clase PROPIA para que la pantalla los enseñe con la respuesta real.
  let clase: RespuestaEstadoPago['clase'];
  if (sesionDeLaClase) {
    const { data: ses } = await admin
      .from('sesiones')
      .select('inicio, tipo_clase_id')
      .eq('id', sesionDeLaClase)
      .eq('studio_id', studioId)
      .maybeSingle();
    if (ses?.inicio) {
      let nombre = 'Tu clase';
      if (ses.tipo_clase_id) {
        const { data: tipo } = await admin
          .from('tipos_clase')
          .select('nombre')
          .eq('id', ses.tipo_clase_id as string)
          .maybeSingle();
        if (tipo?.nombre) nombre = tipo.nombre as string;
      }
      clase = { nombre, inicio: ses.inicio as string };
    }
  }

  return { estado, clase, ...(previa ? { previa } : {}) };
}
