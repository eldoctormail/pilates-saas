// Formato regional del estudio para fechas y números. Fuente única para el
// código que antes tenía 'es-ES' escrito a mano.
//
// Por defecto, español de Argentina con reloj de 24 h ('es-AR-u-hc-h23'): sin
// la extensión, es-AR escribe «06:05 p. m.» y hay código que lee la hora
// formateada como número. Se cambia con NEXT_PUBLIC_LOCALE. Los tests lo fijan
// en 'es-ES' (scripts/register-test-hooks.mjs): sus textos esperados son de
// España.
//
// Quedan en es-ES a propósito: VeriFactu y los festivos de España. Las páginas
// comerciales (precios, funcionalidades, soluciones, seguridad, legales) cambian
// de texto con FUNCIONES_DE_ESPANA: Mercado Pago y ARCA en Argentina.
import { envPublica } from './env-publica.ts';

export const LOCALE: string =
  /* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_LOCALE)?.trim() ||
  'es-AR-u-hc-h23';

/** Un teléfono de ejemplo para los `placeholder`, con el formato del país. */
export const TELEFONO_EJEMPLO: string = /^es-AR\b/i.test(LOCALE) ? '+54 9 299 412 3456' : '+34 600 000 000';

/** ¿El formato regional es el de Argentina? */
export function esArgentina(locale: string = LOCALE): boolean {
  return /^es-AR\b/i.test(locale);
}

// Lo que solo tiene sentido en España —Veri*Factu y la AEAT, las remesas y los
// mandatos SEPA, Bizum, los tipos de IVA españoles— se oculta en el panel con
// el formato de Argentina. Solo se oculta: el código, las tablas y las rutas
// siguen ahí, y con NEXT_PUBLIC_LOCALE=es-ES vuelve todo.
export const FUNCIONES_DE_ESPANA: boolean = !esArgentina();
