// Regla pura del conciliador de Mercado Pago (ver conciliar.ts).

import type { PagoMercadoPago } from './api.ts';

/** ¿Hay que (re)procesar este pago? Nuevo para Tentare, o con otro estado que el anotado. */
export function hayQueProcesar(pago: Pick<PagoMercadoPago, 'status'>, anotado: { estado: string; desenlace: string } | undefined): boolean {
  if (!anotado) return true;
  if (anotado.desenlace === 'aplicado' || anotado.desenlace === 'ya_estaba') {
    // Ya aplicado: solo interesa si después se devolvió (para avisar).
    return pago.status !== anotado.estado && (pago.status === 'refunded' || pago.status === 'charged_back');
  }
  return pago.status !== anotado.estado;
}
