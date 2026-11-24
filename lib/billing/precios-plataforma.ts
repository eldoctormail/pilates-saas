// ─────────────────────────────────────────────────────────────────────────────
// Precios de los planes y complementos de Centra: lo que paga cada ESTUDIO por
// usar la plataforma (no lo que cobra un estudio a sus alumnas).
//
// Se editan desde /interno/precios y se guardan en `ajustes_plataforma`, clave
// `precios_planes` (lib/billing/precios-servidor.ts los lee). Aquí vive el
// almacén que leen todas las pantallas: `PLAN_INFO[p].precioMes` y
// `ADDONS[a].precioMes` (lib/billing/entitlements.ts) son getters que leen de él.
//
// ⚠️ El almacén va en `globalThis`, no en una variable del módulo: en el
// servidor, Next carga este módulo varias veces (capa de servidor, de SSR, la
// de instrumentation…) y todas tienen que ver los mismos precios. En el
// navegador lo rellena <PreciosCliente> (components/raiz/precios-cliente.tsx)
// con lo que mandó el servidor, antes de pintar nada.
//
// ⚠️ Nunca guardes un precio en una constante del módulo (`const X = …precioMes`):
// se calcularía una sola vez, al cargar el módulo, y no vería los cambios.
// Usa una función.
//
// Puro y con extensiones `.ts` explícitas: lo importa `npm test`.
// ─────────────────────────────────────────────────────────────────────────────

import { MONEDA } from '../moneda.ts';

export const CLAVES_PLAN = ['BASE', 'ESTUDIO', 'CADENA'] as const;
export const CLAVES_COMPLEMENTO = ['decisiones', 'sustituciones', 'ia'] as const;
export const CLAVES_PRECIO = [...CLAVES_PLAN, ...CLAVES_COMPLEMENTO] as const;
export type ClavePrecio = (typeof CLAVES_PRECIO)[number];
export type Precios = Record<ClavePrecio, number>;

/** Clave de `ajustes_plataforma` donde se guardan. */
export const CLAVE_AJUSTE_PRECIOS = 'precios_planes';

/** Los de Tentare, en euros. Solo si la instalación está en euros (los tests lo están). */
const PRECIOS_EUROS: Precios = { BASE: 29, ESTUDIO: 79, CADENA: 249, decisiones: 22, sustituciones: 12, ia: 16 };

/**
 * En pesos, hasta que se carguen los de verdad desde /interno/precios. Son de
 * partida, no una decisión de precio.
 */
const PRECIOS_PESOS: Precios = { BASE: 29000, ESTUDIO: 79000, CADENA: 249000, decisiones: 22000, sustituciones: 12000, ia: 16000 };

export const PRECIOS_DE_SERIE: Readonly<Precios> = Object.freeze(MONEDA === 'EUR' ? PRECIOS_EUROS : PRECIOS_PESOS);

/** Tope de cordura: nadie escribe a propósito un precio de cien millones al mes. */
export const PRECIO_MAXIMO = 100_000_000;

const LLAVE = Symbol.for('centra.precios-plataforma');
type ConAlmacen = typeof globalThis & { [LLAVE]?: Precios };

function almacen(): Precios {
  const g = globalThis as ConAlmacen;
  if (!g[LLAVE]) g[LLAVE] = { ...PRECIOS_DE_SERIE };
  return g[LLAVE]!;
}

export function esClavePrecio(x: unknown): x is ClavePrecio {
  return typeof x === 'string' && (CLAVES_PRECIO as readonly string[]).includes(x);
}

function precioValido(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= PRECIO_MAXIMO && Math.round(n * 100) === n * 100;
}

/** Lo que vale cada uno ahora mismo. */
export function preciosActuales(): Precios {
  return { ...almacen() };
}

/** Precio al mes de un plan o complemento. */
export function precioMesDe(clave: ClavePrecio): number {
  return almacen()[clave];
}

/** Cambia los precios en memoria. Ignora lo que no sea un precio válido. */
export function fijarPrecios(nuevos: Partial<Record<string, unknown>>): void {
  const a = almacen();
  for (const k of CLAVES_PRECIO) {
    const v = nuevos[k];
    if (precioValido(v)) a[k] = v;
  }
}

/** Vuelve a los de serie (para los tests). */
export function restablecerPrecios(): void {
  Object.assign(almacen(), PRECIOS_DE_SERIE);
}

/**
 * Lo guardado en `ajustes_plataforma` → precios completos. Lo que falte o no
 * valga cae al de serie: una fila a medias nunca deja un plan sin precio.
 */
export function leerPreciosGuardados(valor: unknown): Precios {
  const p: Precios = { ...PRECIOS_DE_SERIE };
  if (valor && typeof valor === 'object') {
    for (const k of CLAVES_PRECIO) {
      const v = (valor as Record<string, unknown>)[k];
      if (precioValido(v)) p[k] = v;
    }
  }
  return p;
}

/**
 * Lo que manda /interno/precios al guardar. Aquí sí se rechaza lo inválido:
 * guardar algo que luego se ignora engañaría a quien lo guarda.
 */
export function validarPrecios(body: unknown): { ok: true; precios: Precios } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Faltan los precios.' };
  const p = {} as Precios;
  for (const k of CLAVES_PRECIO) {
    const v = (body as Record<string, unknown>)[k];
    if (!precioValido(v)) {
      return { ok: false, error: `El precio de «${k}» tiene que ser un número mayor que cero, con dos decimales como mucho.` };
    }
    p[k] = v;
  }
  return { ok: true, precios: p };
}
