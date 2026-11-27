import type { Articulo } from '../tipos.ts';
import requisitos from './requisitos-para-abrir-un-estudio-de-pilates.ts';
import iva from './iva-clases-de-pilates.ts';
import precioClase from './precio-clase-de-pilates.ts';
import sueldoInstructora from './cuanto-cobra-una-instructora-de-pilates.ts';
import cuantoCuestaAbrir from './cuanto-cuesta-abrir-un-estudio-de-pilates.ts';
import rentabilidad from './rentabilidad-estudio-de-pilates.ts';
import reformerMat from './precios-reformer-mat.ts';
import bonos from './bonos-de-pilates.ts';
import nombres from './nombres-para-estudio-de-pilates.ts';
import cubrirBaja from './cubrir-baja-instructora.ts';
import politicaCancelacion from './politica-de-cancelacion-de-clases.ts';
import reducirCancelaciones from './reducir-cancelaciones-ultima-hora.ts';
import asistencia from './plantilla-control-de-asistencia-pilates.ts';
import clasesValle from './ocupacion-clases-valle.ts';

// Versiones argentinas (formato es-AR) de artículos que en España hablan de su
// normativa. Mismo slug: la dirección no cambia, cambia el texto. Las elige
// `articulosPara()` en ../index.ts; lo que no está aquí se muestra tal cual.
export const ARTICULOS_ARGENTINA: Articulo[] = [
  requisitos,
  iva,
  precioClase,
  sueldoInstructora,
  cuantoCuestaAbrir,
  rentabilidad,
  reformerMat,
  bonos,
  nombres,
  cubrirBaja,
  politicaCancelacion,
  reducirCancelaciones,
  asistencia,
  clasesValle,
];
