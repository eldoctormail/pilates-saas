// Regla pura del conciliador de Mercado Pago (ver conciliar.ts).

import type { PagoMercadoPago } from './api.ts';

type Anotado = { estado: string; desenlace: string; importe_devuelto?: number | string | null };

/** Lo devuelto del pago, en la unidad de la moneda (un contracargo, entero). Espejo de `devueltoDe`. */
function devuelto(pago: Pick<PagoMercadoPago, 'status' | 'transaction_amount' | 'transaction_amount_refunded'>): number {
  if (pago.status === 'charged_back') return pago.transaction_amount;
  if (pago.status === 'refunded') return Number(pago.transaction_amount_refunded ?? 0) || pago.transaction_amount;
  return Number(pago.transaction_amount_refunded ?? 0);
}

/**
 * ¿Hay que (re)procesar este pago? Nuevo para Centra; con otro estado que el
 * anotado (un pendiente que se aprobó); o, si ya se aplicó, con más devuelto
 * que lo anotado (una devolución total o parcial, o un contracargo). Un
 * rechazado o no aplicable con el mismo estado no se repite: no re-alerta.
 */
export function hayQueProcesar(
  pago: Pick<PagoMercadoPago, 'status' | 'transaction_amount' | 'transaction_amount_refunded'>,
  anotado: Anotado | undefined,
): boolean {
  if (!anotado) return true;
  if (anotado.desenlace === 'aplicado' || anotado.desenlace === 'ya_estaba') {
    return Math.round(devuelto(pago) * 100) > Math.round(Number(anotado.importe_devuelto ?? 0) * 100);
  }
  return pago.status !== anotado.estado;
}
