// Zona horaria del estudio (IANA). Fuente única para todo el código que antes
// tenía la zona de Madrid escrita a mano.
//
// Por defecto, Argentina (sin horario de verano, UTC−3). Se puede cambiar con
// NEXT_PUBLIC_ZONA_HORARIA sin tocar código; los tests la fijan en Madrid
// (scripts/register-test-hooks.mjs) porque sus fechas esperadas están
// escritas en esa hora.
export const ZONA_HORARIA: string =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ZONA_HORARIA : undefined) ||
  'America/Argentina/Buenos_Aires';
