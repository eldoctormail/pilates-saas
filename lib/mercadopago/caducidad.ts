// Hasta cuándo vale un pago de Mercado Pago abierto desde Centra. Puro: lo
// usan el checkout y los tests.

/** Validez máxima de un pago de Mercado Pago abierto desde Centra. */
export const HORAS_VALIDEZ_COMPRA = 24;
/** Menos que esto hasta que se cierre la reserva de la clase: no se abre el pago (no daría tiempo a pagar). */
export const MINIMO_PARA_PAGAR_CLASE_MS = 15 * 60 * 1000;

/**
 * Hasta cuándo vale el pago de una compra: 24 h, o lo que falte para que se
 * cierre la reserva de la clase si es antes. Pagada después, no habría plaza.
 */
export function caducidadDeCompra(cierreClase: Date | null, ahoraMs: number):
  { ok: true; expira: Date } | { ok: false; error: string; codigo: string } {
  const maximo = ahoraMs + HORAS_VALIDEZ_COMPRA * 60 * 60 * 1000;
  if (!cierreClase) return { ok: true, expira: new Date(maximo) };
  const cierre = cierreClase.getTime();
  if (!(cierre - ahoraMs >= MINIMO_PARA_PAGAR_CLASE_MS)) {
    return {
      ok: false, codigo: 'cierra-pronto',
      error: 'Queda muy poco para que se cierre la reserva de esta clase: resérvala en el estudio. No te hemos cobrado nada.',
    };
  }
  return { ok: true, expira: new Date(Math.min(maximo, cierre)) };
}
