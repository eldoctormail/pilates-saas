// Genera el logo provisional de Centra: el kit de docs/marca-centra/ y los
// trazados que hay que pegar en components/marca/trazados.ts.
//
// Isotipo: un anillo abierto a la derecha (la «C») con un punto en el centro.
// Palabra: «centra» en Quicksand 600, pasada a curvas (no depende de que la
// letra esté instalada).
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
const [fuente, repo] = process.argv.slice(2);
const f = opentype.loadSync(fuente);
const r2 = (n) => Math.round(n * 100) / 100;
const P = (r, g, cx = 60, cy = 60) => { const a = (g * Math.PI) / 180; return [r2(cx + r * Math.cos(a)), r2(cy - r * Math.sin(a))]; };
// Anillo abierto a la derecha (la «C»), con puntas redondas.
const RE = 47, RI = 29, RC = (RE - RI) / 2, G = 42;
const A = P(RE, G), B = P(RE, -G), C = P(RI, -G), D = P(RI, G);
const ANILLO = `M${A}A${RE} ${RE} 0 1 0 ${B}A${RC} ${RC} 0 0 0 ${C}A${RI} ${RI} 0 1 1 ${D}A${RC} ${RC} 0 0 0 ${A}Z`.replace(/,/g, ' ');
const CENTRO = 'M60 47.5A12.5 12.5 0 1 1 60 72.5A12.5 12.5 0 1 1 60 47.5Z';
const palabra = (x0, ancho, base) => {
  const ref = f.getPath('centra', 0, 0, 100).getBoundingBox();
  const size = (ancho / (ref.x2 - ref.x1)) * 100;
  const x = x0 - (ref.x1 * size) / 100;
  const p = f.getPath('centra', x, base, size);
  return { d: p.toPathData(2), bb: p.getBoundingBox(), size };
};
const H = palabra(124, 250, 89);   // en línea con el isotipo (horizontal, que va trasladado 6 abajo)
const V = palabra(33, 169, 173);   // debajo del isotipo (vertical)
console.error('H', H.bb, 'V', V.bb);
fs.mkdirSync(`${repo}/docs/marca-centra`, { recursive: true });
fs.writeFileSync(`${repo}/docs/marca-centra/trazados.json`, JSON.stringify({ ANILLO, CENTRO, H: H.d, V: V.d }));

const kit = `${repo}/docs/marca-centra`;
for (const d of ['horizontal', 'icono-app', 'favicon']) fs.mkdirSync(`${kit}/${d}`, { recursive: true });
const iso = (relleno, centro, transform) => `  <g class="t-marca">
  <g transform="${transform}">
    <path class="t-tallo" fill="${relleno}" d="${ANILLO}"></path>
    <path class="t-disco" fill="${centro}" d="${CENTRO}"></path>
  </g>
  </g>`;
fs.writeFileSync(`${kit}/horizontal/tentare-horizontal-degradado.svg`, `<svg class="t-logo" viewBox="0 0 400 148" width="400" height="148" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Centra">
  <defs>
    <linearGradient id="centra-horizontal-tg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4C9CB0"></stop><stop offset="1" stop-color="#B4537E"></stop>
    </linearGradient>
  </defs>
${iso('url(#centra-horizontal-tg)', '#B4537E', 'translate(0,6)')}
  <path class="t-palabra" fill="#222A33" d="${H.d}"></path>
</svg>
`);
fs.writeFileSync(`${kit}/icono-app/tentare-icono-oscuro.svg`, `<svg class="t-logo" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Centra">
  <defs>
    <linearGradient id="centra-icono-oscuro-tg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8FD0DF"></stop><stop offset="1" stop-color="#E9A7C2"></stop>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="#111827"></rect>
${iso('url(#centra-icono-oscuro-tg)', '#FFFFFF', 'translate(13.2,13.2) scale(0.78)')}
</svg>
`);
fs.writeFileSync(`${kit}/favicon/tentare-favicon-placa.svg`, `<svg class="t-logo" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Centra">
  <rect width="120" height="120" rx="26" fill="#111827"></rect>
${iso('#FFFFFF', '#FFFFFF', 'translate(9.6,9.6) scale(0.84)')}
</svg>
`);
// Imagen para compartir (og-image): degradado de la marca y el logo en blanco.
fs.writeFileSync(`${kit}/og-image.svg`, `<svg viewBox="0 0 1200 630" width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og-fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4C9CB0"></stop><stop offset="1" stop-color="#B4537E"></stop>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#og-fondo)"></rect>
  <g transform="translate(270,197) scale(1.79)">
    <g transform="translate(-7,-17)">
${iso('#FFFFFF', '#FFFFFF', 'translate(0,6)').replace(/fill="#FFFFFF" d="M60 47/, 'fill="#FFFFFF" fill-opacity="0.75" d="M60 47')}
      <path fill="#FFFFFF" d="${H.d}"></path>
    </g>
  </g>
</svg>
`);
