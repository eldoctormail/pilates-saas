#!/usr/bin/env node
// Regenera lib/recursos/articulos/meta.ts a partir de los artículos.
//   node --experimental-strip-types scripts/generar-meta-articulos.mjs
// Córrelo tras añadir o cambiar un artículo: lib/recursos/articulos/articulos.test.ts
// falla si meta.ts no coincide con ellos.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { articulosPara } from '../lib/recursos/articulos/index.ts';
import { metaDe } from '../lib/recursos/articulos/proyeccion.ts';

const destino = join(import.meta.dirname, '..', 'lib', 'recursos', 'articulos', 'meta.ts');
const espana = articulosPara(true).map(metaDe);
const argentina = articulosPara(false).map(metaDe);
writeFileSync(destino, `// GENERADO por scripts/generar-meta-articulos.mjs a partir de los artículos: no editar a mano.
//
// Los metadatos de cada artículo SIN su cuerpo: lo que necesitan el registro
// SEO (lib/seo/paginas.ts), el listado /recursos, la portada y el JSON-LD del
// blog. Existe para que el código de cliente no arrastre el texto completo de
// los artículos (~300 KB): ver index.ts.
// Con el formato de Argentina (lib/locale.ts) van los de las versiones argentinas.
import type { ArticuloMeta } from './util.ts';
import { FUNCIONES_DE_ESPANA } from '../../locale.ts';

export const ARTICULOS_META_ESPANA: ArticuloMeta[] = ${JSON.stringify(espana, null, 2)};

export const ARTICULOS_META_ARGENTINA: ArticuloMeta[] = ${JSON.stringify(argentina, null, 2)};

export const ARTICULOS_META: ArticuloMeta[] = FUNCIONES_DE_ESPANA ? ARTICULOS_META_ESPANA : ARTICULOS_META_ARGENTINA;
`);
console.log(`meta.ts: ${espana.length} artículos`);
