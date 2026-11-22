// `external_reference` de un pago de Mercado Pago: dice QUÉ se está pagando.
//
// La pone el servidor al crear la preferencia y vuelve dentro del pago, que el
// webhook relee de la API de Mercado Pago (nunca del cuerpo del aviso). Aun así
// no se fía de ella para el estudio ni el importe: el recibo se vuelve a leer de
// la base de datos y se exige que sea de ese estudio y que el importe cuadre.
//
// Formato: `tentare:rec:<studioId>:<reciboId>` (Etapa 1: solo recibos).

const PREFIJO = 'tentare';
const ID = /^[A-Za-z0-9_-]{1,120}$/;

export type Referencia = { tipo: 'recibo'; studioId: string; reciboId: string };

export function referenciaDeRecibo(studioId: string, reciboId: string): string {
  if (!ID.test(studioId) || !ID.test(reciboId)) throw new Error('Id con caracteres no admitidos en la referencia de Mercado Pago');
  return `${PREFIJO}:rec:${studioId}:${reciboId}`;
}

export function leerReferencia(ref: string | null | undefined): Referencia | null {
  if (!ref) return null;
  const partes = ref.split(':');
  if (partes.length !== 4 || partes[0] !== PREFIJO) return null;
  const [, tipo, studioId, reciboId] = partes;
  if (tipo !== 'rec' || !ID.test(studioId) || !ID.test(reciboId)) return null;
  return { tipo: 'recibo', studioId, reciboId };
}

/** Importes en la unidad de la moneda (pesos), comparados al centavo. */
export function importeCoincide(cobrado: number, esperado: number): boolean {
  return Number.isFinite(cobrado) && Number.isFinite(esperado) && Math.round(cobrado * 100) === Math.round(esperado * 100);
}
