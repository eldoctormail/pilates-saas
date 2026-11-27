// Aplica a la fila del estudio lo que dicen las reglas (reglas.ts) a partir de
// lo que Mercado Pago tiene de verdad. Lo usan el webhook, el cron de
// conciliación y la vuelta de /suscripcion. SOLO servidor.
//
// Toda escritura es compare-and-set sobre `subscription_id`: si entre la
// lectura y la escritura otra petición cambió de suscripción, no se pisa.
//
// Dos tablas: `studios` (un estudio suelto) y `cadenas` (Cadena: una sola
// suscripción para todas las sedes; el trigger `propagar_plan_cadena` lo copia
// a cada una). Mientras la cadena paga, una sede no lleva suscripción propia:
// si le queda una viva de antes, se da de baja (nunca dos cobros por lo mismo).

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { cancelarSuscripcion, leerPagoAutorizado, leerSuscripcion } from './api';
import {
  decidirPorPago, decidirPorSuscripcion, leerReferencia, preapprovalDe, vencida,
  type Cambios, type Decision, type FilaEstudio, type Preapproval, type TablaMp,
} from './reglas';
import { facturarMensualidad } from './factura-centra';
import { emitirFactura } from '@/lib/arca/servidor';

export const COLUMNAS_MP = 'id, plan, subscription_status, subscription_id, current_period_end, cadena_id';
const COLUMNAS_CADENA = 'id, plan, subscription_status, subscription_id, current_period_end';
const PAGA = ['active', 'trialing', 'past_due'];

export type Resultado =
  | { tipo: 'aplicado'; cambios: Cambios }
  | { tipo: 'ignorado'; motivo: string }
  /** Mercado Pago o la base de datos no contestaron: que el aviso se reintente. */
  | { tipo: 'reintentar'; motivo: string };

const etiquetas = { area: 'billing', pasarela: 'mercadopago-plataforma' } as const;

export async function leerFila(admin: SupabaseClient, studioId: string, tabla: TablaMp = 'studios'): Promise<FilaEstudio | null> {
  const { data, error } = await admin.from(tabla).select(tabla === 'studios' ? COLUMNAS_MP : COLUMNAS_CADENA).eq('id', studioId).maybeSingle();
  if (error) throw new Error(`leer ${tabla === 'studios' ? 'estudio' : 'cadena'}: ${error.message}`);
  return (data as unknown as FilaEstudio | null) ?? null;
}

/** Escribe los cambios solo si la fila sigue con la misma suscripción que se leyó. */
export async function escribir(admin: SupabaseClient, fila: FilaEstudio, cambios: Cambios, tabla: TablaMp = 'studios'): Promise<boolean> {
  let q = admin.from(tabla).update(cambios).eq('id', fila.id);
  q = fila.subscription_id === null ? q.is('subscription_id', null) : q.eq('subscription_id', fila.subscription_id);
  const { data, error } = await q.select('id');
  if (error) throw new Error(`actualizar ${tabla === 'studios' ? 'estudio' : 'cadena'}: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** ¿La cadena de esta sede paga? Entonces la sede no lleva suscripción propia. Lanza si no se puede leer. */
export async function cadenaPaga(admin: SupabaseClient, cadenaId: string | null | undefined): Promise<boolean> {
  if (!cadenaId) return false;
  const { data, error } = await admin.from('cadenas').select('subscription_status').eq('id', cadenaId).maybeSingle();
  if (error) throw new Error(`leer cadena: ${error.message}`);
  return PAGA.includes((data as { subscription_status: string | null } | null)?.subscription_status ?? '');
}

/**
 * La cadena ya paga: las suscripciones propias de sus sedes que sigan vivas en
 * Mercado Pago se dan de baja (lo que les quedaba pagado no se devuelve: lo
 * avisa /suscripcion antes de pagar Cadena). Avisa y sigue si una no se puede.
 */
async function cancelarSueltasDeLaCadena(admin: SupabaseClient, token: string, cadenaId: string): Promise<void> {
  const { data, error } = await admin.from('studios').select('id, subscription_id').eq('cadena_id', cadenaId).like('subscription_id', 'mp:%');
  if (error) {
    Sentry.captureMessage('[mp-plataforma] no se pudieron leer las sedes de la cadena', { level: 'error', tags: etiquetas, extra: { cadenaId, error: error.message } });
    return;
  }
  for (const sede of (data ?? []) as { id: string; subscription_id: string | null }[]) {
    const id = preapprovalDe(sede.subscription_id);
    if (!id) continue;
    const leida = await leerSuscripcion(token, id);
    if (leida.ok && leida.datos.status !== 'authorized' && leida.datos.status !== 'paused') continue;
    const r = leida.ok ? await cancelarSuscripcion(token, id) : leida;
    if (!r.ok && r.status !== 404) {
      Sentry.captureMessage('[mp-plataforma] sede de una cadena con su suscripción propia viva: darla de baja a mano', {
        level: 'error', tags: etiquetas, extra: { cadenaId, studioId: sede.id, suscripcion: id, error: r.error },
      });
    } else if (r.ok) console.info('[mp-plataforma] suscripción propia de una sede cancelada al pagar Cadena', { cadenaId, studioId: sede.id });
  }
}

async function aplicar(admin: SupabaseClient, token: string, fila: FilaEstudio, d: Decision, tabla: TablaMp = 'studios'): Promise<Resultado> {
  if (!d.aplicar) {
    if (d.cancelar) {
      // Una vieja que seguía cobrando (su baja falló al cambiar de plan): se da de baja ahora.
      const r = await cancelarSuscripcion(token, d.cancelar);
      if (!r.ok) {
        Sentry.captureMessage('[mp-plataforma] no se pudo cancelar la suscripción anterior', {
          level: 'error', tags: etiquetas, extra: { studioId: fila.id, anterior: d.cancelar, error: r.error },
        });
        return { tipo: 'reintentar', motivo: 'cancelar-anterior' };
      }
      console.info('[mp-plataforma] suscripción anterior cancelada', { studioId: fila.id, anterior: d.cancelar });
    } else if (d.motivo === 'dos-autorizadas-sin-fecha') {
      Sentry.captureMessage('[mp-plataforma] el estudio tiene dos suscripciones autorizadas', {
        level: 'error', tags: etiquetas, extra: { studioId: fila.id, actual: fila.subscription_id },
      });
    }
    return { tipo: 'ignorado', motivo: d.motivo };
  }
  if (!(await escribir(admin, fila, d.cambios, tabla))) return { tipo: 'reintentar', motivo: 'cambio-en-medio' };
  console.info('[mp-plataforma] suscripción al día', { tabla, id: fila.id, ...d.cambios });
  if (d.cancelarAnterior) {
    // La nueva ya está escrita: la vieja deja de cobrar. Si Mercado Pago no
    // contesta, queda avisado para cancelarla a mano (nunca dos cobros sin saberlo).
    const r = await cancelarSuscripcion(token, d.cancelarAnterior);
    if (!r.ok) {
      Sentry.captureMessage('[mp-plataforma] no se pudo cancelar la suscripción anterior', {
        level: 'error', tags: etiquetas, extra: { studioId: fila.id, anterior: d.cancelarAnterior, error: r.error },
      });
    }
  }
  if (tabla === 'cadenas' && d.cambios.subscription_status === 'active') await cancelarSueltasDeLaCadena(admin, token, fila.id);
  return { tipo: 'aplicado', cambios: d.cambios };
}

/**
 * Una suscripción propia de una sede cuya cadena ya paga: se da de baja y la
 * fila no se toca (la gobierna la cadena). `null` si no es el caso.
 */
async function sueltaDeSedeEnCadena(admin: SupabaseClient, token: string, fila: FilaEstudio, pre: Preapproval): Promise<Resultado | null> {
  if (!(await cadenaPaga(admin, fila.cadena_id))) return null;
  if (pre.status === 'authorized' || pre.status === 'paused') {
    const r = await cancelarSuscripcion(token, pre.id);
    if (!r.ok) return { tipo: 'reintentar', motivo: 'cancelar-suelta-de-sede' };
    console.info('[mp-plataforma] suscripción propia de una sede cancelada: la paga su cadena', { studioId: fila.id });
  }
  return { tipo: 'ignorado', motivo: 'la-paga-su-cadena' };
}

/** Relee una suscripción en Mercado Pago y pone al día el estudio de su referencia. */
export async function sincronizarSuscripcion(
  admin: SupabaseClient, token: string, preapprovalId: string, ahora = new Date(),
): Promise<Resultado> {
  const leida = await leerSuscripcion(token, preapprovalId);
  if (!leida.ok) {
    if (leida.status === 404 || leida.status === 400) return { tipo: 'ignorado', motivo: 'suscripcion-desconocida' };
    return { tipo: 'reintentar', motivo: `mercadopago-${leida.status}` };
  }
  const ref = leerReferencia(leida.datos.external_reference);
  if (!ref) return { tipo: 'ignorado', motivo: 'no-es-de-centra' };
  const fila = await leerFila(admin, ref.id, ref.tabla);
  if (!fila) return { tipo: 'ignorado', motivo: ref.tabla === 'studios' ? 'estudio-desconocido' : 'cadena-desconocida' };
  if (ref.tabla === 'studios') {
    const suelta = await sueltaDeSedeEnCadena(admin, token, fila, leida.datos);
    if (suelta) return suelta;
  }
  // Si la fila tiene OTRA suscripción, se relee también: decide cuál es la nueva.
  let actual: Preapproval | null = null;
  const idActual = preapprovalDe(fila.subscription_id);
  if (leida.datos.status === 'authorized' && idActual && idActual !== leida.datos.id) {
    const r = await leerSuscripcion(token, idActual);
    if (r.ok) actual = r.datos;
    else if (r.status !== 404 && r.status !== 400) return { tipo: 'reintentar', motivo: `mercadopago-${r.status}` };
  }
  return aplicar(admin, token, fila, decidirPorSuscripcion(fila, leida.datos, ahora, actual), ref.tabla);
}

/** La sede principal de una cadena (la más antigua): a su nombre va la factura de la mensualidad. */
async function sedePrincipal(admin: SupabaseClient, cadenaId: string): Promise<string | null> {
  const { data, error } = await admin.from('studios').select('id').eq('cadena_id', cadenaId)
    .order('creado_en', { ascending: true }).order('id', { ascending: true }).limit(1).maybeSingle();
  if (error) throw new Error(`leer sedes de la cadena: ${error.message}`);
  return (data as { id: string } | null)?.id ?? null;
}

/** Un cobro mensual: primero la suscripción (corre la fecha), después el estado del cobro. */
export async function sincronizarPago(admin: SupabaseClient, token: string, pagoId: string, ahora = new Date()): Promise<Resultado> {
  const leido = await leerPagoAutorizado(token, pagoId);
  if (!leido.ok) {
    if (leido.status === 404 || leido.status === 400) return { tipo: 'ignorado', motivo: 'pago-desconocido' };
    return { tipo: 'reintentar', motivo: `mercadopago-${leido.status}` };
  }
  const pago = leido.datos;
  const previo = await sincronizarSuscripcion(admin, token, String(pago.preapproval_id), ahora);
  if (previo.tipo === 'reintentar') return previo;
  const leida = await leerSuscripcion(token, String(pago.preapproval_id));
  if (!leida.ok) return { tipo: 'reintentar', motivo: `mercadopago-${leida.status}` };
  const ref = leerReferencia(leida.datos.external_reference);
  if (!ref) return { tipo: 'ignorado', motivo: 'no-es-de-centra' };
  const fila = await leerFila(admin, ref.id, ref.tabla);
  if (!fila) return { tipo: 'ignorado', motivo: ref.tabla === 'studios' ? 'estudio-desconocido' : 'cadena-desconocida' };
  if (ref.tabla === 'studios' && (await cadenaPaga(admin, fila.cadena_id))) return { tipo: 'ignorado', motivo: 'la-paga-su-cadena' };
  const resultado = await aplicar(admin, token, fila, decidirPorPago(fila, pago), ref.tabla);
  // La factura de Centra de este cobro (apagada sin CENTRA_FACTURACION_ESTUDIO_ID). Un fallo no tumba el aviso:
  // el recibo queda cobrado y la factura se emite a mano desde Cobros del estudio de Centra.
  const aFacturar = ref.tabla === 'studios' ? ref.id : await sedePrincipal(admin, ref.id);
  if (resultado.tipo !== 'reintentar' && fila.subscription_id === `mp:${pago.preapproval_id}` && aFacturar) {
    const f = await facturarMensualidad(admin, { pago, preapproval: leida.datos, studioId: aFacturar, fetch, emitir: emitirFactura });
    if (f.tipo === 'sin-factura') {
      Sentry.captureMessage('Mensualidad cobrada por Mercado Pago sin factura de ARCA', {
        level: 'warning', tags: etiquetas, extra: { reciboId: f.reciboId, error: f.error },
      });
    }
  }
  return resultado;
}

/** Se acabó lo pagado (más el margen): se cierra. Devuelve si lo cerró. */
export async function cerrarSiVencida(admin: SupabaseClient, fila: FilaEstudio, ahora = new Date(), tabla: TablaMp = 'studios'): Promise<boolean> {
  if (!vencida(fila, ahora)) return false;
  // Una sede cuya cadena paga no se cierra por su suscripción vieja: la gobierna la cadena.
  if (tabla === 'studios' && (await cadenaPaga(admin, fila.cadena_id))) return false;
  const cerrada = await escribir(admin, fila, { subscription_status: 'canceled' }, tabla);
  if (cerrada) console.info('[mp-plataforma] suscripción vencida, panel cerrado', { tabla, id: fila.id });
  return cerrada;
}

/** Los estudios (o cadenas) que pagan, o pagaban, con Mercado Pago, para el cron. */
export async function estudiosConSuscripcionMp(admin: SupabaseClient, tabla: TablaMp = 'studios'): Promise<FilaEstudio[]> {
  const { data, error } = await admin.from(tabla).select(tabla === 'studios' ? COLUMNAS_MP : COLUMNAS_CADENA).like('subscription_id', 'mp:%')
    .in('subscription_status', ['active', 'past_due']).limit(1000);
  if (error) throw new Error(`leer ${tabla}: ${error.message}`);
  return ((data ?? []) as unknown as FilaEstudio[]).filter((f) => preapprovalDe(f.subscription_id));
}

export interface Destino { tabla: TablaMp; fila: FilaEstudio }

/**
 * La suscripción que gestiona la propietaria desde esta sede: la de su CADENA
 * si la cadena tiene una de Mercado Pago (y es suya), y si no la del estudio.
 * Con la cadena pagando, la de la cadena aunque a la sede le quede una vieja.
 */
export async function destinoDeLaSede(admin: SupabaseClient, studioId: string, userId: string): Promise<Destino | null> {
  const studio = await leerFila(admin, studioId);
  if (!studio) return null;
  if (studio.cadena_id) {
    const { data, error } = await admin.from('cadenas').select(`${COLUMNAS_CADENA}, owner_auth_user_id`).eq('id', studio.cadena_id).maybeSingle();
    if (error) throw new Error(`leer cadena: ${error.message}`);
    const cadena = data as (FilaEstudio & { owner_auth_user_id: string | null }) | null;
    if (cadena && cadena.owner_auth_user_id === userId && preapprovalDe(cadena.subscription_id)
      && (PAGA.includes(cadena.subscription_status ?? '') || !preapprovalDe(studio.subscription_id))) {
      const { owner_auth_user_id: _duena, ...fila } = cadena;
      return { tabla: 'cadenas', fila };
    }
  }
  return { tabla: 'studios', fila: studio };
}
