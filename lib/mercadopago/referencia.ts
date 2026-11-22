// `external_reference` de un pago de Mercado Pago: dice QUÉ se está pagando.
//
// La pone el servidor al crear la preferencia y vuelve dentro del pago, que el
// webhook relee de la API de Mercado Pago (nunca del cuerpo del aviso). Aun así
// no se fía de ella para el estudio ni el importe: el recibo se vuelve a leer de
// la base de datos y se exige que sea de ese estudio y que el importe cuadre.
//
// Formatos:
//   `tentare:rec:<studioId>:<reciboId>`      pagar un recibo (Etapa 1)
//   `tentare:compra:<studioId>:<compraId>`   comprar un plan (Etapa 2,
//                                            fila de `compras_mercadopago`)
//   `tentare:regalo:<studioId>:<regaloId>`   comprar una tarjeta regalo (fila
//                                            de `regalos_mercadopago`)

const PREFIJO = 'tentare';
const ID = /^[A-Za-z0-9_-]{1,120}$/;

export type Referencia =
  | { tipo: 'recibo'; studioId: string; reciboId: string }
  | { tipo: 'compra'; studioId: string; compraId: string }
  | { tipo: 'regalo'; studioId: string; regaloId: string };

function comprobarIds(...ids: string[]): void {
  if (!ids.every(id => ID.test(id))) throw new Error('Id con caracteres no admitidos en la referencia de Mercado Pago');
}

export function referenciaDeRecibo(studioId: string, reciboId: string): string {
  comprobarIds(studioId, reciboId);
  return `${PREFIJO}:rec:${studioId}:${reciboId}`;
}

export function referenciaDeCompra(studioId: string, compraId: string): string {
  comprobarIds(studioId, compraId);
  return `${PREFIJO}:compra:${studioId}:${compraId}`;
}

export function referenciaDeRegalo(studioId: string, regaloId: string): string {
  comprobarIds(studioId, regaloId);
  return `${PREFIJO}:regalo:${studioId}:${regaloId}`;
}

export function leerReferencia(ref: string | null | undefined): Referencia | null {
  if (!ref) return null;
  const partes = ref.split(':');
  if (partes.length !== 4 || partes[0] !== PREFIJO) return null;
  const [, tipo, studioId, id] = partes;
  if (!ID.test(studioId) || !ID.test(id)) return null;
  if (tipo === 'rec') return { tipo: 'recibo', studioId, reciboId: id };
  if (tipo === 'compra') return { tipo: 'compra', studioId, compraId: id };
  if (tipo === 'regalo') return { tipo: 'regalo', studioId, regaloId: id };
  return null;
}

/** Id de una compra nueva: `mpc_` + 32 hex. Base de los ids de la entrega (`idsDe`). */
export function nuevoIdCompra(): string {
  return `mpc_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
}

/** Id de una tarjeta regalo pagada con Mercado Pago: `mpr_` + 32 hex. */
export function nuevoIdRegalo(): string {
  return `mpr_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
}

/** ¿Es un id de regalo de Tentare? (lo que se acepta en `?mp=` de la página del regalo). */
export function esIdRegalo(s: string): boolean {
  return /^mpr_[0-9a-f]{32}$/.test(s);
}

/** Importes en la unidad de la moneda (pesos), comparados al centavo. */
export function importeCoincide(cobrado: number, esperado: number): boolean {
  return Number.isFinite(cobrado) && Number.isFinite(esperado) && Math.round(cobrado * 100) === Math.round(esperado * 100);
}

/** El `?mp=` con que vuelve «pagar y reservar»: el id de una compra, o `cancelado`. */
export const RETORNO_CANCELADO = 'cancelado';

/**
 * Vuelta de «pagar y reservar»: a la ficha de la clase, con la compra para que
 * la pantalla pregunte al servidor en qué quedó (volver de Mercado Pago no
 * significa nada por sí solo).
 */
export function urlsDeClase(base: string, slug: string, sesionId: string, compraId: string) {
  const ficha = `${base.replace(/\/+$/, '')}/portal/${encodeURIComponent(slug)}/reservar/${encodeURIComponent(sesionId)}`;
  return { successUrl: `${ficha}?mp=${encodeURIComponent(compraId)}`, cancelUrl: `${ficha}?mp=${RETORNO_CANCELADO}` };
}

/** ¿Es un id de compra de Tentare? (lo que se acepta en `?mp=` y en el estado de una compra). */
export function esIdCompra(s: string): boolean {
  return /^mpc_[0-9a-f]{32}$/.test(s);
}
