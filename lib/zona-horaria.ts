// Zona horaria del estudio (IANA). Fuente única para todo el código que antes
// tenía la zona de Madrid escrita a mano.
//
// Por defecto, Argentina (sin horario de verano, UTC−3). Se puede cambiar con
// NEXT_PUBLIC_ZONA_HORARIA sin tocar código; los tests la fijan en Madrid
// (scripts/register-test-hooks.mjs) porque sus fechas esperadas están
// escritas en esa hora.
import { envPublica } from './env-publica.ts';

export const ZONA_HORARIA: string =
  /* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_ZONA_HORARIA) ||
  'America/Argentina/Buenos_Aires';

/**
 * El lugar de la zona, para decirlo en una frase: «hora de Argentina», «hora de
 * Madrid». Lo usa el asistente (prompt y herramientas), que antes decía «hora de
 * Madrid» escrito a mano mientras el código ya calculaba en la zona del estudio.
 * Constante por despliegue: no parte la caché del prompt.
 */
export function lugarDeLaZona(zona: string = ZONA_HORARIA): string {
  if (zona === 'Europe/Madrid') return 'Madrid';
  if (zona.startsWith('America/Argentina/')) return 'Argentina';
  const ciudad = zona.split('/').pop() ?? zona;
  return ciudad.replace(/_/g, ' ');
}

export const LUGAR_DE_LA_HORA: string = lugarDeLaZona();
