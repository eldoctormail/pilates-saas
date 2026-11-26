#!/usr/bin/env node
// Cambia el nombre visible «Tentare» por el de la marca propia (Centra).
//
// Por qué un script y no un cambio a mano: este fork sigue trayendo cambios de
// EcomRodrii/pilates-saas, y cada cambio de allá trae textos nuevos con
// «Tentare». Después de traerlos se vuelve a correr esto y listo:
//
//     node scripts/marca/aplicar-marca.mjs          (cambia los archivos)
//     node scripts/marca/aplicar-marca.mjs --check  (solo dice si falta algo)
//
// Después de correrlo, si cambió algo de lib/demo/panel/, recompilar el panel
// de la demo: node scripts/build-demo-panel.mjs
//
// Qué SÍ cambia: la palabra suelta «Tentare» (textos, títulos, correos, tests
// que los comprueban) y las dos frases en mayúsculas de la lista de abajo.
// Qué NO cambia, a propósito:
//   · nombres de código (`LogoTentare`, `TENTARE_URL`, `correoTentare`): no se
//     ven y renombrarlos daría conflictos en cada sincronización;
//   · «tentare» en minúscula (rutas, claves de localStorage, nombres de
//     archivo, dominios `tentare.app`): cambiarlos rompe enlaces y datos
//     guardados. El dominio sale de NEXT_PUBLIC_APP_URL;
//   · `TENTARE` en mayúsculas (valores guardados en la base, como el origen
//     'TENTARE' de una reserva);
//   · migraciones de supabase/migrations (ya aplicadas; cambiarlas no cambia
//     la base) y la documentación interna (docs/, auditorías).

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MARCA = 'Centra';

const RAIZ = fileURLToPath(new URL('../..', import.meta.url));

const CARPETAS = ['app', 'components', 'lib', 'emails', 'public', 'e2e', 'supabase/templates', 'deploy', 'movil/www'];
const ARCHIVOS_SUELTOS = ['supabase/config.toml', 'next.config.ts', 'capacitor.config.ts'];
const EXTENSIONES = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.mdx', '.txt', '.html', '.toml', '.css', '.sh', '.yml', '.yaml', '.webmanifest', '.xml', '.svg', '.sql']);
const IGNORAR = new Set(['node_modules', '.next', '.git', 'widget-bundle']);

/** Archivos donde «Tentare» es un nombre técnico, no texto que se lee. */
const ARCHIVOS_EXCLUIDOS = new Set([
  // Las familias de letra del widget se llaman 'Tentare <fuente>' en la hoja
  // que ya está publicada en la web de cada estudio (app/widget-bundle/).
  'lib/widget/fuentes-nativa.ts',
  'lib/widget/fuentes-nativa.test.ts',
  'e2e/reservar-pago-confirmacion.spec.ts',
  // Lista de frases prohibidas en las FAQ: busca «tentare core» a propósito.
  'lib/seo/faq-hubs.test.ts',
  // Compilado: sale de lib/demo/panel/entrada.ts con scripts/build-demo-panel.mjs.
  'public/demo-panel.js',
]);

/** La palabra suelta, sin tocar identificadores (`LogoTentare`, `Tentare_x`). */
// Tampoco con guion pegado: `Tentare-Firma`, `Tentare-Estudio` son cabeceras
// HTTP de la API pública y de los webhooks, y las integraciones ya las usan.
const PALABRA = /(?<![A-Za-z0-9_$-])Tentare(?![A-Za-z0-9_$]|-[A-Za-z])/g;

/** Frases con «Tentare» que son DATOS guardados, no texto: no se tocan. */
const INTOCABLES = [
  // Nombre del segundo factor del panel interno: lo guarda Supabase y lo compara
  // la migración 20261005220308_factor_interno_solo_en_interno.sql.
  'Tentare Internal',
  // Familias de letra que sirve la instalación (lib/widget/fuentes-nativa.ts):
  // son nombres técnicos de la hoja publicada en la web de cada estudio, y los
  // E2E las comprueban tal cual.
  'Tentare Cormorant Garamond', 'Tentare Figtree', 'Tentare Instrument Sans', 'Tentare Instrument Serif',
  'Tentare Libre Caslon Text', 'Tentare Outfit', 'Tentare Plus Jakarta Sans', 'Tentare Poppins',
  "'(Tentare [A-Za-z ]+)'",
];

/** Frases exactas que también cambian: [de, a, solo en archivos que empiezan por]. */
const FRASES = [
  // Las dos en mayúsculas que se leen en pantalla (las demás son datos).
  ['TODO LO DEMÁS, TENTARE.', `TODO LO DEMÁS, ${MARCA.toUpperCase()}.`],
  ['QUÉ ES TENTARE', `QUÉ ES ${MARCA.toUpperCase()}`],
  // El pie de los correos al estudio y de los correos de acceso.
  ['Software para estudios de Pilates · Hecho en España', 'Software para estudios de Pilates · Hecho en Argentina'],
  // Los correos de acceso pedían el logo a la web del original: ahora, a la
  // propia instalación (SITE_URL de Supabase = la dirección de la app).
  ['https://www.tentare.app/logo-horizontal.png', '{{ .SiteURL }}/logo-horizontal.png', 'supabase/templates/'],
];

function* archivos(dir) {
  let entradas;
  try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entradas) {
    if (IGNORAR.has(e.name)) continue;
    const ruta = join(dir, e.name);
    if (e.isDirectory()) yield* archivos(ruta);
    else if (EXTENSIONES.has(extname(e.name)) && !ARCHIVOS_EXCLUIDOS.has(relative(RAIZ, ruta))) yield ruta;
  }
}

export function aplicarMarca(texto, ruta = '') {
  const guardadas = INTOCABLES.map((_, i) => `\u0000INTOCABLE${i}\u0000`);
  let salida = texto;
  INTOCABLES.forEach((f, i) => { salida = salida.split(f).join(guardadas[i]); });
  salida = salida.replace(PALABRA, MARCA);
  INTOCABLES.forEach((f, i) => { salida = salida.split(guardadas[i]).join(f); });
  for (const [de, a, solo] of FRASES) if (!solo || ruta.startsWith(solo)) salida = salida.split(de).join(a);
  return salida;
}

function main() {
  const soloComprobar = process.argv.includes('--check');
  const rutas = [
    ...CARPETAS.flatMap((c) => [...archivos(join(RAIZ, c))]),
    ...ARCHIVOS_SUELTOS.map((a) => join(RAIZ, a)).filter((a) => { try { return statSync(a).isFile(); } catch { return false; } }),
  ];
  const cambiados = [];
  for (const ruta of rutas) {
    const antes = readFileSync(ruta, 'utf8');
    const despues = aplicarMarca(antes, relative(RAIZ, ruta));
    if (antes === despues) continue;
    cambiados.push(relative(RAIZ, ruta));
    if (!soloComprobar) writeFileSync(ruta, despues);
  }
  if (soloComprobar) {
    if (cambiados.length) {
      console.error(`Quedan ${cambiados.length} archivos con «Tentare». Corré: node scripts/marca/aplicar-marca.mjs`);
      for (const c of cambiados) console.error(`  ${c}`);
      process.exit(1);
    }
    console.log('La marca está aplicada en todos los archivos.');
  } else {
    console.log(`Marca «${MARCA}» aplicada en ${cambiados.length} archivos.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
