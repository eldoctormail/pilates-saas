// Reglas del cobro de la mensualidad de Centra a cada estudio con suscripciones
// de Mercado Pago (preapproval). Puras, sin red ni base de datos: las aplican
// las rutas de app/api/billing/mercadopago y el cron de conciliación.
//
// Cómo encaja con lo que ya había (pensado para Stripe):
//   · La fila del estudio guarda lo mismo de siempre: `plan`,
//     `subscription_status` ('active' | 'past_due' | 'canceled'),
//     `subscription_id` y `current_period_end`. El id lleva el prefijo `mp:`
//     para no confundirlo nunca con uno de Stripe (`sub_…`).
//   · El estado no se cree del aviso: la suscripción se RELEE en la API de
//     Mercado Pago y de ahí sale todo.
//   · Una baja (o un cobro que no sale) no corta el acceso en el acto: el
//     estudio sigue hasta el final de lo que pagó (`current_period_end`) más
//     unos días de margen, y después se cierra (`vencida`). Cada cobro bueno
//     corre esa fecha al mes siguiente, así que quien paga nunca llega.
//   · Cambiar de plan es una suscripción NUEVA que empieza a cobrar cuando
//     termina lo ya pagado; cuando Mercado Pago la autoriza, la anterior se
//     cancela (`cancelarAnterior`). Nunca se cobran dos meses a la vez. Pasar
//     de mensual a anual (o al revés) es lo mismo: otra suscripción.
//   · Anual = una suscripción que cobra cada 12 meses el precio de 10
//     (`precioAnual`, la misma regla que se enseña en /precios).
//   · Cadena: la suscripción es de la CADENA (tabla `cadenas`, la misma fila
//     que usa Stripe) y su referencia lo dice (`centra:cadena:<id>`). El
//     trigger `propagar_plan_cadena` copia plan, estado y fin de periodo a
//     todas sus sedes: aquí solo se escribe la cadena.

import type { Plan } from '../entitlements.ts';

export const PREFIJO_ID = 'mp:';
/** Días de margen tras el fin de lo pagado antes de cerrar el panel (Mercado Pago reintenta el cobro). */
export const GRACIA_DIAS = 5;
export const PLANES_MP: readonly Plan[] = ['BASE', 'ESTUDIO', 'CADENA'];

export type IntervaloMp = 'mensual' | 'anual';
/** Dónde vive la suscripción: un estudio suelto o una cadena (todas sus sedes). */
export type TablaMp = 'studios' | 'cadenas';

const ID_PREAPPROVAL = /^[A-Za-z0-9]{1,64}$/;
const ID_ESTUDIO = /^[A-Za-z0-9_-]{1,120}$/;
const DIA_MS = 24 * 60 * 60 * 1000;

// ── Lo que devuelve Mercado Pago (solo lo que se usa) ────────────────────────

export interface Preapproval {
  id: string;
  /** pending | authorized | paused | cancelled */
  status: string;
  external_reference?: string | null;
  payer_email?: string | null;
  reason?: string | null;
  next_payment_date?: string | null;
  /** Cuándo se creó: entre dos suscripciones del mismo estudio, la más nueva es la que vale. */
  date_created?: string | null;
  init_point?: string | null;
  auto_recurring?: {
    transaction_amount?: number;
    currency_id?: string;
    frequency?: number;
    frequency_type?: string;
    start_date?: string | null;
  } | null;
}

export interface PagoAutorizado {
  id: number | string;
  preapproval_id: string;
  /** scheduled | processed | recycling | cancelled */
  status: string;
  payment?: { id?: number | string | null; status?: string | null } | null;
}

/** Lo que se lee y se escribe de la fila de `studios`. */
export interface FilaEstudio {
  id: string;
  plan: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  current_period_end: string | null;
  cadena_id?: string | null;
}

export type Cambios = Partial<Pick<FilaEstudio, 'plan' | 'subscription_status' | 'subscription_id' | 'current_period_end'>>;

// ── Identificadores ──────────────────────────────────────────────────────────

export function idSuscripcion(preapprovalId: string): string {
  if (!ID_PREAPPROVAL.test(preapprovalId)) throw new Error('id de suscripción de Mercado Pago no válido');
  return `${PREFIJO_ID}${preapprovalId}`;
}

/** El id de Mercado Pago de una fila, o `null` si no es una suscripción de Mercado Pago. */
export function preapprovalDe(subscriptionId: string | null | undefined): string | null {
  if (!subscriptionId?.startsWith(PREFIJO_ID)) return null;
  const id = subscriptionId.slice(PREFIJO_ID.length);
  return ID_PREAPPROVAL.test(id) ? id : null;
}

/**
 * `external_reference` de la suscripción: de qué estudio y qué plan, y `:anual`
 * si cobra una vez al año. Sin sufijo, mensual (las de antes de que hubiera anual).
 */
export function referenciaDePlan(studioId: string, plan: Exclude<Plan, 'CADENA'>, intervalo: IntervaloMp = 'mensual'): string {
  if (!ID_ESTUDIO.test(studioId)) throw new Error('id de estudio no admitido en la referencia');
  return `centra:plan:${studioId}:${plan}${intervalo === 'anual' ? ':anual' : ''}`;
}

/** La de una cadena: la paga la cadena entera, no una sede. */
export function referenciaDeCadena(cadenaId: string, intervalo: IntervaloMp = 'mensual'): string {
  if (!ID_ESTUDIO.test(cadenaId)) throw new Error('id de cadena no admitido en la referencia');
  return `centra:cadena:${cadenaId}${intervalo === 'anual' ? ':anual' : ''}`;
}

export interface Referencia {
  tabla: TablaMp;
  /** El id de la fila: el estudio o la cadena. */
  id: string;
  plan: Plan;
  intervalo: IntervaloMp;
}

export function leerReferencia(ref: string | null | undefined): Referencia | null {
  const deEstudio = /^centra:plan:([A-Za-z0-9_-]{1,120}):(BASE|ESTUDIO)(:anual)?$/.exec(ref ?? '');
  if (deEstudio) return { tabla: 'studios', id: deEstudio[1], plan: deEstudio[2] as Plan, intervalo: deEstudio[3] ? 'anual' : 'mensual' };
  const deCadena = /^centra:cadena:([A-Za-z0-9_-]{1,120})(:anual)?$/.exec(ref ?? '');
  if (deCadena) return { tabla: 'cadenas', id: deCadena[1], plan: 'CADENA', intervalo: deCadena[2] ? 'anual' : 'mensual' };
  return null;
}

/** Cada cuánto cobra una suscripción, según Mercado Pago (12 meses = anual). */
export function intervaloDe(pre: Pick<Preapproval, 'auto_recurring'> | null | undefined): IntervaloMp {
  const r = pre?.auto_recurring;
  return r?.frequency === 12 && r.frequency_type === 'months' ? 'anual' : 'mensual';
}

// ── Fechas ───────────────────────────────────────────────────────────────────

function ms(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const n = Date.parse(iso);
  return Number.isFinite(n) ? n : null;
}

/**
 * ¿Se acabó lo pagado (más el margen)? Solo para suscripciones de Mercado Pago
 * que todavía dan acceso. Sin fecha no se cierra nada: mejor abierto que
 * dejar fuera a quien paga por un dato que falta.
 */
export function vencida(fila: Pick<FilaEstudio, 'subscription_id' | 'subscription_status' | 'current_period_end'>, ahora: Date): boolean {
  if (!preapprovalDe(fila.subscription_id)) return false;
  if (fila.subscription_status !== 'active' && fila.subscription_status !== 'past_due') return false;
  const fin = ms(fila.current_period_end);
  return fin !== null && fin + GRACIA_DIAS * DIA_MS < ahora.getTime();
}

// ── Alta ─────────────────────────────────────────────────────────────────────

export type DecisionAlta =
  | { ok: true; empiezaEl: string | null }
  | { ok: false; status: number; error: string };

/**
 * ¿Se puede abrir una suscripción nueva para este plan? `actual` es la
 * suscripción de Mercado Pago que el estudio ya tiene, releída de la API (o
 * `null` si no tiene). Si ya hay una pagada, la nueva empieza a cobrar cuando
 * termina lo pagado (`empiezaEl`): es un cambio de plan, no un segundo cobro.
 */
export function decidirAlta(
  fila: FilaEstudio, plan: Plan, actual: Preapproval | null, ahora: Date, intervalo: IntervaloMp = 'mensual',
): DecisionAlta {
  if (!PLANES_MP.includes(plan)) return { ok: false, status: 400, error: 'Plan no válido' };
  const pagaAhora = fila.subscription_status === 'active' || fila.subscription_status === 'past_due';
  const vigente = actual && (actual.status === 'authorized' || actual.status === 'paused') ? actual : null;
  if (vigente && pagaAhora && fila.plan === plan && intervaloDe(vigente) === intervalo) {
    return { ok: false, status: 409, error: 'Ya tenés este plan. Si querés cambiar la tarjeta, hacelo desde tu cuenta de Mercado Pago.' };
  }
  if (fila.subscription_status === 'past_due' && vigente) {
    return { ok: false, status: 409, error: 'Tu último cobro no salió. Revisá la tarjeta en Mercado Pago antes de cambiar de plan.' };
  }
  // Lo ya pagado se respeta siempre: también si la suscripción anterior ya está
  // dada de baja (baja programada) y vuelve antes de que se acabe. Si no, se le
  // cobraría hoy un mes que se solapa con días que ya pagó.
  const fin = ms(fila.current_period_end);
  const empiezaEl = pagaAhora && fin !== null && fin > ahora.getTime() ? new Date(fin).toISOString() : null;
  return { ok: true, empiezaEl };
}

export interface DatosAlta {
  /** El estudio, o la cadena si `plan` es CADENA. */
  studioId: string;
  plan: Plan;
  /** Sin él, mensual. */
  intervalo?: IntervaloMp;
  nombrePlan: string;
  importe: number;
  moneda: string;
  email: string;
  backUrl: string;
  empiezaEl: string | null;
}

/** El cuerpo de `POST /preapproval`: suscripción sin plan asociado, mensual o anual, a pagar en Mercado Pago. */
export function cuerpoPreapproval(d: DatosAlta) {
  const anual = d.intervalo === 'anual';
  return {
    reason: `Centra · ${d.nombrePlan}${anual ? ' (anual)' : ''}`,
    external_reference: d.plan === 'CADENA'
      ? referenciaDeCadena(d.studioId, d.intervalo)
      : referenciaDePlan(d.studioId, d.plan, d.intervalo),
    payer_email: d.email,
    back_url: d.backUrl,
    status: 'pending',
    auto_recurring: {
      frequency: anual ? 12 : 1,
      frequency_type: 'months',
      transaction_amount: d.importe,
      currency_id: d.moneda,
      ...(d.empiezaEl ? { start_date: d.empiezaEl } : {}),
    },
  };
}

// ── Avisos de Mercado Pago ───────────────────────────────────────────────────

export type Decision =
  | { aplicar: true; cambios: Cambios; cancelarAnterior: string | null }
  /** `cancelar`: una suscripción vieja que sigue cobrando y hay que dar de baja (sin tocar la fila). */
  | { aplicar: false; motivo: string; cancelar?: string | null };

/**
 * Margen para dar por empezada una suscripción: sin `start_date` pedida,
 * Mercado Pago pone la del alta, que puede llegar unos minutos «en el futuro».
 */
const MARGEN_INICIO_MS = DIA_MS;

/**
 * ¿Ya empezó a cobrarse? Un cambio de plan abre una suscripción que empieza
 * cuando termina lo pagado (`start_date`): hasta entonces el estudio sigue con
 * el plan que pagó, ni antes con el nuevo (lo tendría sin pagarlo) ni sin el
 * viejo (lo pagó).
 */
export function yaEmpezo(pre: Preapproval, ahora: Date): boolean {
  const inicio = ms(pre.auto_recurring?.start_date);
  return inicio === null || inicio <= ahora.getTime() + MARGEN_INICIO_MS;
}

/**
 * Qué hacer con la fila del estudio a partir de su suscripción releída en Mercado Pago.
 * `actual` es la suscripción que la fila tiene ahora, releída también, cuando
 * `pre` es OTRA: sin ella no se sabe si `pre` es la nueva o una vieja que no se
 * pudo cancelar al cambiar de plan.
 */
export function decidirPorSuscripcion(fila: FilaEstudio, pre: Preapproval, ahora: Date, actual?: Preapproval | null): Decision {
  const ref = leerReferencia(pre.external_reference);
  if (!ref || ref.id !== fila.id) return { aplicar: false, motivo: 'referencia-de-otro' };
  if (!ID_PREAPPROVAL.test(pre.id)) return { aplicar: false, motivo: 'id-raro' };
  const id = idSuscripcion(pre.id);
  const propia = fila.subscription_id === id;
  // El plan de la suscripción manda cuando empieza a cobrarse; antes, el que tenía.
  const plan = yaEmpezo(pre, ahora) || !fila.plan ? ref.plan : fila.plan;

  if (pre.status === 'authorized') {
    const periodo = pre.next_payment_date ?? fila.current_period_end;
    if (propia) {
      const cambios: Cambios = { plan, current_period_end: periodo };
      // Un cobro que no salió lo deja en past_due el aviso del pago, no este.
      if (fila.subscription_status !== 'active' && fila.subscription_status !== 'past_due') cambios.subscription_status = 'active';
      return { aplicar: true, cambios, cancelarAnterior: null };
    }
    // Si la que tiene la fila sigue autorizada, `pre` solo toma el relevo si es
    // MÁS NUEVA. Si es más vieja, es la anterior de un cambio de plan cuya baja
    // falló: tomarla cancelaría la buena. Se da de baja ella, sin tocar la fila.
    const idActual = preapprovalDe(fila.subscription_id);
    if (idActual && actual && actual.id === idActual && actual.status === 'authorized') {
      const creadaPre = ms(pre.date_created);
      const creadaActual = ms(actual.date_created);
      if (creadaPre === null || creadaActual === null) return { aplicar: false, motivo: 'dos-autorizadas-sin-fecha' };
      if (creadaPre < creadaActual) return { aplicar: false, motivo: 'anterior-sin-cancelar', cancelar: pre.id };
    }
    // Una suscripción nueva (alta o cambio de plan) toma el relevo.
    return {
      aplicar: true,
      cambios: { plan, subscription_status: 'active', subscription_id: id, current_period_end: periodo },
      cancelarAnterior: preapprovalDe(fila.subscription_id),
    };
  }

  if ((pre.status === 'cancelled' || pre.status === 'paused') && propia) {
    // Sigue hasta el fin de lo pagado: lo cierra `vencida` cuando toque.
    if (vencida(fila, ahora)) return { aplicar: true, cambios: { subscription_status: 'canceled' }, cancelarAnterior: null };
    return { aplicar: false, motivo: 'baja-con-periodo-pagado' };
  }
  return { aplicar: false, motivo: propia ? `estado-${pre.status}` : 'no-es-la-del-estudio' };
}

/** Qué hacer con la fila a partir de un cobro mensual de la suscripción. */
export function decidirPorPago(fila: FilaEstudio, pago: PagoAutorizado): Decision {
  if (fila.subscription_id !== `${PREFIJO_ID}${pago.preapproval_id}`) return { aplicar: false, motivo: 'no-es-la-del-estudio' };
  const estadoPago = pago.payment?.status ?? null;
  if (estadoPago === 'approved') {
    return fila.subscription_status === 'active'
      ? { aplicar: false, motivo: 'ya-al-dia' }
      : { aplicar: true, cambios: { subscription_status: 'active' }, cancelarAnterior: null };
  }
  if ((estadoPago === 'rejected' || pago.status === 'recycling') && fila.subscription_status === 'active') {
    return { aplicar: true, cambios: { subscription_status: 'past_due' }, cancelarAnterior: null };
  }
  return { aplicar: false, motivo: `pago-${estadoPago ?? pago.status}` };
}

// ── Lo que ve la propietaria ─────────────────────────────────────────────────

export type EstadoVisible = 'al_dia' | 'impago' | 'baja_programada' | 'pendiente' | 'cancelada';

export function estadoVisible(fila: Pick<FilaEstudio, 'subscription_status'>, pre: Preapproval | null): EstadoVisible {
  if (!pre) return 'cancelada';
  if (pre.status === 'pending') return 'pendiente';
  if (pre.status === 'cancelled' || pre.status === 'paused') {
    return fila.subscription_status === 'active' || fila.subscription_status === 'past_due' ? 'baja_programada' : 'cancelada';
  }
  return fila.subscription_status === 'past_due' ? 'impago' : 'al_dia';
}
