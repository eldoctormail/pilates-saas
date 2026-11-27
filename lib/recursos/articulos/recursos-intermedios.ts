// ─────────────────────────────────────────────────────────────────────────────
// La llamada a mitad de un artículo hacia el recurso que le corresponde
// (calculadora, plantilla o descarga que YA existen).
//
// Una sola por artículo, en el tono editorial (un filete a la izquierda, sin
// caja de color), y solo donde hay un recurso relevante: un artículo que no
// aparece en MAPA no lleva ninguna. El mapa vive aquí, en datos, no a mano en
// cada artículo. Lo comprueba articulos.test.ts: la ruta existe, el ancla es una
// sección real y el artículo no repite el recurso que ya lleva dentro.
//
// Los textos solo dicen lo que el propio recurso ya promete (descargas.ts, la
// calculadora, la plantilla): ninguna cifra ni garantía nuevas.
//
// Sin alias `@/`: lo leen `node --test` y los scripts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Articulo } from './tipos.ts';

export interface RecursoIntermedio {
  /** Una frase que dice qué hace el recurso. Sin enlaces (el enlace va aparte). */
  texto: string;
  /** El texto del enlace. */
  enlace: string;
  /** Adónde lleva: una página del registro, con el ancla de su sección si el recurso vive dentro de una guía. */
  href: string;
  /**
   * Cómo está el recurso dentro de su artículo, para comprobar que existe:
   * `articulo` es el slug donde vive (si no es una página aparte) y `bloque` el
   * tipo de bloque que lo lleva.
   */
  vive?: { articulo: string; bloque: 'herramienta' | 'descarga'; id: string };
}

export const RECURSOS_INTERMEDIOS = {
  'modelo-estudio-12-meses': {
    texto: 'Con tus propios números se decide mejor: el modelo de estudio a 12 meses te enseña tu año mes a mes y la ocupación que necesitas para cubrir costes y tu propio sueldo.',
    enlace: 'Ver el modelo en Excel',
    href: '/recursos/rentabilidad-estudio-de-pilates#punto-de-equilibrio',
    vive: { articulo: 'rentabilidad-estudio-de-pilates', bloque: 'descarga', id: 'modelo-estudio-12-meses' },
  },
  'calculadora-rentabilidad': {
    texto: 'Pon los números de tu estudio y mira a qué ocupación cubres costes.',
    enlace: 'Abrir la calculadora de rentabilidad',
    href: '/recursos/rentabilidad-estudio-de-pilates#punto-de-equilibrio',
    vive: { articulo: 'rentabilidad-estudio-de-pilates', bloque: 'herramienta', id: 'calculadora-rentabilidad' },
  },
  'calculadora-bonos': {
    texto: 'Si dudas entre bonos y cuota, la calculadora te dice cuánto sale cada sesión según el descuento y avisa si un escalón queda por debajo de tu coste.',
    enlace: 'Probar la calculadora de bonos',
    href: '/recursos/bonos-de-pilates#como-disenar-bonos-de-pilates',
    vive: { articulo: 'bonos-de-pilates', bloque: 'herramienta', id: 'calculadora-bonos' },
  },
  'plantilla-politica-cancelacion': {
    texto: 'Si todavía no tienes tu política por escrito, hay una plantilla en Word con las cláusulas de la guía, lista para rellenar.',
    enlace: 'Ver la plantilla de política de cancelación',
    href: '/recursos/politica-de-cancelacion-de-clases#plantilla',
    vive: { articulo: 'politica-de-cancelacion-de-clases', bloque: 'descarga', id: 'plantilla-politica-cancelacion' },
  },
  'plantilla-control-asistencia': {
    texto: 'Para empezar sin programa hay una plantilla gratuita en Excel para llevar la asistencia y los bonos de tus alumnas.',
    enlace: 'Ver la plantilla de control de asistencia',
    href: '/recursos/plantilla-control-de-asistencia-pilates',
  },
  'calculadora-plazas-vacias': {
    texto: 'Pon los números de tu estudio y mira cuánto valen las plazas de reformer que se quedan sin vender cada mes.',
    enlace: 'Abrir la calculadora de plazas vacías',
    href: '/soluciones/estudio-de-pilates-reformer',
  },
} as const satisfies Record<string, RecursoIntermedio>;

export type ClaveRecurso = keyof typeof RECURSOS_INTERMEDIOS;

/** Artículo → recurso. Un artículo que no está aquí no lleva llamada a mitad de texto. */
export const RECURSO_POR_ARTICULO: Readonly<Record<string, ClaveRecurso>> = {
  'como-abrir-un-estudio-de-pilates': 'modelo-estudio-12-meses',
  'como-abrir-un-estudio-de-yoga': 'modelo-estudio-12-meses',
  'cuanto-cuesta-abrir-un-estudio-de-pilates': 'modelo-estudio-12-meses',
  'precio-clase-de-pilates': 'calculadora-bonos',
  'precios-reformer-mat': 'calculadora-rentabilidad',
  'ocupacion-clases-valle': 'calculadora-plazas-vacias',
  'reducir-cancelaciones-ultima-hora': 'plantilla-politica-cancelacion',
  'software-pilates-gratis': 'plantilla-control-asistencia',
};

/**
 * La llamada de un artículo. Con `articulos` (los del país que se publica), un
 * recurso que vive dentro de otra guía solo se ofrece si esa guía lo sigue
 * llevando: las versiones argentinas no tienen las descargas de España, y la
 * llamada prometería un Excel o un Word que no está.
 */
export function recursoIntermedio(
  slug: string,
  articulos?: readonly Pick<Articulo, 'slug' | 'secciones'>[],
): RecursoIntermedio | undefined {
  const clave = RECURSO_POR_ARTICULO[slug];
  if (!clave) return undefined;
  const r: RecursoIntermedio = RECURSOS_INTERMEDIOS[clave];
  if (!articulos || !r.vive) return r;
  const seccion = seccionDelRecurso(r.vive, articulos);
  if (!seccion) return undefined;
  // El ancla es la sección donde está el bloque en ESTA versión de la guía (la
  // argentina no siempre titula igual que la de España).
  const [base, ancla] = r.href.split('#');
  return ancla === seccion ? r : { ...r, href: `${base}#${seccion}` };
}

/** El id de la sección de su guía que lleva el recurso, o null si ya no lo lleva. */
function seccionDelRecurso(
  vive: NonNullable<RecursoIntermedio['vive']>,
  articulos: readonly Pick<Articulo, 'slug' | 'secciones'>[],
): string | null {
  const destino = articulos.find((a) => a.slug === vive.articulo);
  const campo = vive.bloque === 'descarga' ? 'recurso' : 'id';
  return destino?.secciones.find((s) => s.bloques.some(
    (b) => b.t === vive.bloque && (b as unknown as Record<string, string>)[campo] === vive.id,
  ))?.id ?? null;
}

const LLEVA_SU_PROPIA_LLAMADA = new Set(['llamada', 'producto', 'descarga', 'herramienta']);

/**
 * Después de qué sección va la llamada: la de la mitad del artículo o, si esa
 * ya lleva otra llamada, un recurso o una herramienta, la más cercana que no.
 * Devuelve el índice de la sección, o -1 si no hay hueco limpio (no se pinta).
 */
export function seccionDeLaLlamada(a: Pick<Articulo, 'secciones'>): number {
  const n = a.secciones.length;
  const mitad = Math.ceil(n / 2) - 1;
  const orden = Array.from({ length: n }, (_, i) => i)
    .sort((x, y) => Math.abs(x - mitad) - Math.abs(y - mitad) || x - y);
  return orden.find((i) => a.secciones[i].bloques.every((b) => !LLEVA_SU_PROPIA_LLAMADA.has(b.t))) ?? -1;
}
