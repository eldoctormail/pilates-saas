// Topes contra un cero de más en los importes que se escriben a mano (Caja,
// cambiar el importe de un recibo). No son reglas de negocio: son una red para
// un dedo que se resbala. En euros, los de siempre; en pesos (o cualquier otra
// moneda), mil veces más, porque una cuota ya pasa de 10.000.
// La base (registrar_venta_pos) aplica el tope de pesos a todos: es el techo.

import { MONEDA } from './moneda.ts';

const EN_EUROS = MONEDA === 'EUR';

/** Un importe libre de la Caja (por unidad). */
export const IMPORTE_LIBRE_MAX = EN_EUROS ? 10_000 : 10_000_000;
/** El total de un ticket de la Caja. */
export const TICKET_MAX = EN_EUROS ? 100_000 : 100_000_000;
/** El importe de un recibo que se cambia a mano. */
export const IMPORTE_RECIBO_MAX = EN_EUROS ? 10_000 : 10_000_000;
