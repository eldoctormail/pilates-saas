// Pone las direcciones de la app y de Supabase en la app ya compilada, al
// arrancar el contenedor (lo llama el CMD de deploy/Dockerfile).
//
// Next graba las NEXT_PUBLIC_* dentro del código al compilar. La imagen se
// compila con dos direcciones de relleno (RELLENO, abajo) y este script las
// cambia por las de deploy/.env cada vez que arranca. Así, cambiar la IP o
// pasar a dominio es editar deploy/.env y `docker compose up -d`, sin volver a
// compilar.
//
// Lo que ya se aplicó queda anotado en .next/urls-aplicadas.json: si las
// direcciones no cambiaron, no se toca nada y arranca al instante; si cambiaron
// (el mismo contenedor con otro .env), se reemplazan las viejas por las nuevas.
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const ANOTADAS = path.join(RAIZ, '.next', 'urls-aplicadas.json');

// Las mismas que pone deploy/Dockerfile al compilar.
export const RELLENO = {
  NEXT_PUBLIC_APP_URL: 'http://centra-app-url.invalid',
  NEXT_PUBLIC_SUPABASE_URL: 'http://centra-supabase-url.invalid',
};

const CARPETAS = [path.join(RAIZ, '.next'), path.join(RAIZ, 'public')];
const SALTAR = new Set([path.join(RAIZ, '.next', 'cache')]);
const EXTENSIONES = new Set(['.js', '.mjs', '.cjs', '.json', '.html', '.rsc', '.body', '.meta', '.txt', '.css', '.xml', '.webmanifest', '.map']);

function sinBarra(u) {
  return u.replace(/\/+$/, '');
}

function leerAnotadas() {
  try {
    return JSON.parse(fs.readFileSync(ANOTADAS, 'utf8'));
  } catch {
    return { ...RELLENO };
  }
}

// Cada dirección se cambia entera (http://host:puerto) y, aparte, el host
// suelto y la forma codificada para URL, que también aparecen en el código
// compilado (encabezados, enlaces armados con encodeURIComponent).
// Primero todas las direcciones enteras y después los hosts sueltos (salen, por
// ejemplo, en el texto legal). Un host no se cambia si está dentro del otro
// («centra.com.ar» dentro de «api.centra.com.ar»): se rompería el segundo.
function pares(viejas, nuevas) {
  const claves = Object.keys(RELLENO);
  const viejo = (c) => sinBarra(viejas[c] ?? RELLENO[c]);
  const enteras = [];
  const hosts = [];
  for (const clave of claves) {
    const vieja = viejo(clave);
    const nueva = sinBarra(nuevas[clave]);
    if (vieja === nueva) continue;
    enteras.push([vieja, nueva], [encodeURIComponent(vieja), encodeURIComponent(nueva)]);
    const host = new URL(vieja).host;
    const dentroDeOtro = claves.some((o) => o !== clave && new URL(viejo(o)).host.includes(host));
    if (!dentroDeOtro) hosts.push([host, new URL(nueva).host]);
  }
  return [...enteras, ...hosts].map(([a, b]) => [Buffer.from(a), Buffer.from(b)]);
}

function* archivos(dir) {
  let entradas;
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entradas) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SALTAR.has(ruta)) yield* archivos(ruta);
    } else if (e.isFile() && ruta !== ANOTADAS && EXTENSIONES.has(path.extname(e.name))) {
      yield ruta;
    }
  }
}

function reemplazar(buf, a, b) {
  let i = buf.indexOf(a);
  if (i === -1) return null;
  const partes = [];
  let desde = 0;
  while (i !== -1) {
    partes.push(buf.subarray(desde, i), b);
    desde = i + a.length;
    i = buf.indexOf(a, desde);
  }
  partes.push(buf.subarray(desde));
  return Buffer.concat(partes);
}

function main() {
  const nuevas = {};
  for (const clave of Object.keys(RELLENO)) {
    const v = (process.env[clave] ?? '').trim();
    if (!v) {
      console.error(`✘ Falta ${clave} en deploy/.env. Poné la dirección (por ejemplo http://192.168.1.50:3000) y volvé a arrancar.`);
      process.exit(1);
    }
    try {
      new URL(v);
    } catch {
      console.error(`✘ ${clave}=${v} no es una dirección válida (tiene que empezar con http:// o https://).`);
      process.exit(1);
    }
    nuevas[clave] = sinBarra(v);
  }

  const viejas = leerAnotadas();
  const lista = pares(viejas, nuevas);
  if (lista.length === 0) {
    console.log(`✔ Direcciones al día: ${nuevas.NEXT_PUBLIC_APP_URL} y ${nuevas.NEXT_PUBLIC_SUPABASE_URL}`);
    return;
  }

  let tocados = 0;
  for (const carpeta of CARPETAS) {
    for (const ruta of archivos(carpeta)) {
      let buf = fs.readFileSync(ruta);
      let cambio = false;
      for (const [a, b] of lista) {
        const r = reemplazar(buf, a, b);
        if (r) {
          buf = r;
          cambio = true;
        }
      }
      if (cambio) {
        fs.writeFileSync(ruta, buf);
        tocados++;
      }
    }
  }
  fs.writeFileSync(ANOTADAS, JSON.stringify(nuevas, null, 2));
  console.log(`✔ Direcciones aplicadas en ${tocados} archivos: ${nuevas.NEXT_PUBLIC_APP_URL} y ${nuevas.NEXT_PUBLIC_SUPABASE_URL}`);
}

main();
