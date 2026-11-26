// Moneda del estudio. Fuente única para los importes que antes llevaban «€»
// escrito a mano.
//
// Por defecto, pesos argentinos con formato es-AR («$ 1.234,50»). Se cambia con
// NEXT_PUBLIC_MONEDA (código ISO 4217) y NEXT_PUBLIC_LOCALE_MONEDA (por defecto, el de lib/locale.ts). Los tests la
// fijan en EUR / es-ES (scripts/register-test-hooks.mjs) porque sus textos
// esperados están escritos en euros.
//
// Lo que queda en euros a propósito: Stripe (cobros online, apagado en esta
// instalación), VeriFactu y los artículos de /recursos. Los precios de los planes
// de Centra van en esta moneda y se editan desde /interno/precios
// (lib/billing/precios-plataforma.ts).

import { LOCALE } from './locale.ts';
import { envPublica } from './env-publica.ts';

const leer = (v: string | undefined): string | undefined => (v && v.trim()) || undefined;

export const MONEDA: string =
  leer(/* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_MONEDA)) ?? 'ARS';

export const LOCALE_MONEDA: string =
  leer(/* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_LOCALE_MONEDA)) ?? LOCALE;

const partes = /* @__PURE__ */ new Intl.NumberFormat(LOCALE_MONEDA, {
  style: 'currency', currency: MONEDA, currencyDisplay: 'narrowSymbol',
}).formatToParts(1);

/** «$» para ARS, «€» para EUR. */
export const MONEDA_SIMBOLO: string = partes.find(p => p.type === 'currency')?.value ?? MONEDA;

/** Si el símbolo va delante del número («$ 12») o detrás («12 €»). */
export const SIMBOLO_DELANTE: boolean =
  partes.findIndex(p => p.type === 'currency') < partes.findIndex(p => p.type === 'integer');

/**
 * Pone el símbolo a un importe YA escrito como texto, en el lado que toca:
 * conMoneda('12,50') → «$ 12,50» (ARS) o «12,50 €» (EUR). `sep` = lo que va
 * entre número y símbolo (un espacio, uno duro o nada).
 */
export function conMoneda(importe: string | number | null | undefined, sep: string = ' '): string {
  return SIMBOLO_DELANTE ? `${MONEDA_SIMBOLO}${sep}${importe}` : `${importe}${sep}${MONEDA_SIMBOLO}`;
}

const FORMATOS = new Map<string, Intl.NumberFormat>();

/**
 * Importe con formato de la moneda: «$ 1.234,50». `decimales`: 2 siempre (por
 * defecto), 'auto' (sin decimales si es entero) o 0.
 */
export function formatoMoneda(n: number, decimales: 2 | 0 | 'auto' = 2): string {
  const min = decimales === 'auto' ? (Number.isInteger(n) ? 0 : 2) : decimales;
  const max = decimales === 0 ? 0 : 2;
  const clave = `${min}-${max}`;
  let f = FORMATOS.get(clave);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE_MONEDA, { minimumFractionDigits: min, maximumFractionDigits: max });
    FORMATOS.set(clave, f);
  }
  return conMoneda(f.format(n));
}

const NOMBRES: Record<string, readonly [string, string]> = {
  ARS: ['peso', 'pesos'], EUR: ['euro', 'euros'], USD: ['dólar', 'dólares'], UYU: ['peso', 'pesos'],
  CLP: ['peso', 'pesos'], MXN: ['peso', 'pesos'], COP: ['peso', 'pesos'],
};

/** «peso» / «euro»: para los textos que nombran la moneda («Por cada peso que gastes»). */
export const MONEDA_NOMBRE: string = NOMBRES[MONEDA]?.[0] ?? MONEDA;
/** «pesos» / «euros» («Escribí las cifras en pesos»). */
export const MONEDA_NOMBRE_PLURAL: string = NOMBRES[MONEDA]?.[1] ?? MONEDA;
