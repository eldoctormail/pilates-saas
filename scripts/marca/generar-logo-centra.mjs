// Genera el logo de Centra: el kit de docs/marca-centra/ y los trazados que hay
// que pegar en components/marca/trazados.ts.
//
// Isotipo: la figura en postura de Pilates, cinco franjas de color
// (docs/marca-centra/figura.json, ver scripts/marca/vectorizar-figura.py). Palabra: «centra» en Quicksand 600,
// pasada a curvas (no depende de que la letra esté instalada).
//
// Uso (opentype.js no es dependencia del proyecto, se baja solo para esto):
//   curl -sSL -o /tmp/Quicksand600.ttf "$(curl -s 'https://fonts.googleapis.com/css2?family=Quicksand:wght@600' -A 'Mozilla/4.0' | grep -o 'https://[^)]*\.ttf')"
//   npm i --no-save opentype.js@1.3.4
//   node scripts/marca/generar-logo-centra.mjs /tmp/Quicksand600.ttf .
// Después: pegar docs/marca-centra/trazados.json en trazados.ts y correr
//   node scripts/regenerar-marca.mjs docs/marca-centra
// (iconos, favicon y logo de los correos). La imagen para compartir
// (public/og-image.png) se saca de docs/marca-centra/og-image.svg a 1200×630.
import opentype from 'opentype.js';
import fs from 'node:fs';
import { figura, COLORES } from './figura-centra.mjs';

const [fuente, repo] = process.argv.slice(2);
const f = opentype.loadSync(fuente);
const FRANJAS = figura();
/** Color de la palabra: el marrón oscuro de la marca. */
const TINTA = '#3B3020';
/** Fondo crema de los iconos y de la imagen para compartir. */
const CREMA = '#FBF6EE';

const palabra = (x0, ancho, base) => {
  const ref = f.getPath('centra', 0, 0, 100).getBoundingBox();
  const size = (ancho / (ref.x2 - ref.x1)) * 100;
  const x = x0 - (ref.x1 * size) / 100;
  const p = f.getPath('centra', x, base, size);
  return { d: p.toPathData(2), bb: p.getBoundingBox(), size };
};
const H = palabra(124, 250, 89);   // en línea con el isotipo (horizontal, que va trasladado 6 abajo)
const V = palabra(33, 169, 173);   // debajo del isotipo (vertical)

const kit = `${repo}/docs/marca-centra`;
for (const d of ['horizontal', 'icono-app', 'favicon']) fs.mkdirSync(`${kit}/${d}`, { recursive: true });
fs.writeFileSync(`${kit}/trazados.json`, JSON.stringify({ FRANJAS, COLORES, H: H.d, V: V.d }));

const CLASES = ['t-hoja-i', 't-hoja-d', 't-disco', 't-tallo', 't-franja-5'];
const iso = (transform, colores = COLORES) => `  <g class="t-marca">
  <g transform="${transform}">
${FRANJAS.map((d, i) => `    <path class="${CLASES[i]}" fill="${colores[i]}" d="${d}"></path>`).join('\n')}
  </g>
  </g>`;

fs.writeFileSync(`${kit}/horizontal/tentare-horizontal-degradado.svg`, `<svg class="t-logo" viewBox="0 0 400 148" width="400" height="148" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Centra">
${iso('translate(0,6)')}
  <path class="t-palabra" fill="${TINTA}" d="${H.d}"></path>
</svg>
`);
const placa = (transform) => `<svg class="t-logo" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Centra">
  <rect width="120" height="120" rx="26" fill="${CREMA}"></rect>
${iso(transform)}
</svg>
`;
fs.writeFileSync(`${kit}/icono-app/tentare-icono-oscuro.svg`, placa('translate(13.2,13.2) scale(0.78)'));
fs.writeFileSync(`${kit}/favicon/tentare-favicon-placa.svg`, placa('translate(6,6) scale(0.9)'));
// Imagen para compartir (og-image): fondo crema y el logo a color.
fs.writeFileSync(`${kit}/og-image.svg`, `<svg viewBox="0 0 1200 630" width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${CREMA}"></rect>
  <g transform="translate(270,197) scale(1.79)">
    <g transform="translate(-7,-17)">
${iso('translate(0,6)')}
      <path fill="${TINTA}" d="${H.d}"></path>
    </g>
  </g>
</svg>
`);
