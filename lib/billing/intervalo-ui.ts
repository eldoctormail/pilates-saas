// Cómo se ENSEÑA un precio según se pague por meses o por años. Pura, sin
// React ni Stripe: la usan /precios, /suscripcion y el selector del alta, y un
// test la cruza con las cifras que dicen los Price de Stripe (10 × el mensual).
//
// ⚠️ Los importes reales los cobra Stripe con sus Price; esto solo los dice. Por
// eso `precioAnual` sale del mensual con la regla de «dos meses gratis» y el
// ahorro se calcula, nunca se escribe a mano.

import { ahorroAnual, precioAnual } from './entitlements.ts';
import { LOCALE_MONEDA, conMoneda } from '../moneda.ts';

export type IntervaloUi = 'mensual' | 'anual';

/**
 * La cifra de un precio, sin símbolo, en el formato de la moneda de la
 * instalación: «2.490» (miles con punto; decimales solo si los tiene). Se llama
 * `euros` por historia: hoy vale para pesos igual.
 */
export function euros(n: number): string {
  return n.toLocaleString(LOCALE_MONEDA, { maximumFractionDigits: 2, useGrouping: n >= 1000 });
}

/** Un precio con su símbolo: «79 €» o «$ 79.000». `sep`, lo que va entre cifra y símbolo. */
export function precio(n: number, sep: string = ' '): string {
  return conMoneda(euros(n), sep);
}

/** Lo que se cobra cada vez: el mes, o el año entero por adelantado. */
export function importeDe(precioMes: number, intervalo: IntervaloUi): number {
  return intervalo === 'anual' ? precioAnual(precioMes) : precioMes;
}

/** «79€/mes» o «790€/año» («$79.000/mes» en pesos). */
export function etiquetaPrecio(precioMes: number, intervalo: IntervaloUi): string {
  return `${precio(importeDe(precioMes, intervalo), '')}/${intervalo === 'anual' ? 'año' : 'mes'}`;
}

/** «Facturado 790 € al año» (anual) o «IVA incluido» (mensual): la línea bajo la cifra. */
export function lineaFacturacion(precioMes: number, intervalo: IntervaloUi): string {
  return intervalo === 'anual'
    ? `Facturado ${precio(precioAnual(precioMes))} al año · IVA incluido`
    : 'IVA incluido';
}

/** El ahorro del año frente a pagar doce meses: «Ahorras 158 €». */
export function textoAhorro(precioMes: number): string {
  return `Ahorras ${precio(ahorroAnual(precioMes))}`;
}
