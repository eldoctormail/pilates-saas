import type { Articulo } from '../tipos.ts';
import requisitos from './requisitos-para-abrir-un-estudio-de-pilates.ts';
import iva from './iva-clases-de-pilates.ts';
import precioClase from './precio-clase-de-pilates.ts';
import sueldoInstructora from './cuanto-cobra-una-instructora-de-pilates.ts';

// Versiones argentinas (formato es-AR) de artículos que en España hablan de su
// normativa. Mismo slug: la dirección no cambia, cambia el texto. Las elige
// `articulosPara()` en ../index.ts; lo que no está aquí se muestra tal cual.
export const ARTICULOS_ARGENTINA: Articulo[] = [
  requisitos,
  iva,
  precioClase,
  sueldoInstructora,
];
