// Formato regional del estudio para fechas y números. Fuente única para el
// código que antes tenía 'es-ES' escrito a mano.
//
// Por defecto, español de Argentina con reloj de 24 h ('es-AR-u-hc-h23'): sin
// la extensión, es-AR escribe «06:05 p. m.» y hay código que lee la hora
// formateada como número. Se cambia con NEXT_PUBLIC_LOCALE. Los tests lo fijan
// en 'es-ES' (scripts/register-test-hooks.mjs): sus textos esperados son de
// España.
//
// Quedan en es-ES a propósito: VeriFactu, los festivos de España y las páginas
// comerciales de Tentare.
export const LOCALE: string =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_LOCALE?.trim() : undefined) ||
  'es-AR-u-hc-h23';
