import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Con el formato de Argentina (lib/locale.ts) nada de lo que ve el estudio en la
// guía, la visita, la puesta en marcha, el checklist y el Centro de ayuda habla
// de Stripe ni de lo que solo existe en España. Los tests corren en es-ES
// (scripts/register-test-hooks.mjs) y estos textos se deciden al cargar el
// módulo, así que se miran en un proceso aparte con es-AR.

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCRIPT = `
const r = {};
const curriculo = await import('./lib/guia/curriculo.ts');
const visita = await import('./lib/tour/capitulos.ts');
const ruta = await import('./lib/guia/ruta-puesta-en-marcha.ts');
const pasos = await import('./lib/guia/primeros-pasos.ts');
const onboarding = await import('./lib/onboarding.ts');
const ayuda = await import('./lib/ayuda/registro.ts');
const secciones = await import('./lib/configuracion/secciones.ts');
const listo = await import('./lib/opening/listo.ts');
r.textos = JSON.stringify([curriculo.CAPITULOS, visita.CAPITULOS, ruta.PASOS_RUTA, pasos.OPCIONAL, listo.HREF_LISTO, listo.ACCION_LISTO]);
r.articulos = ayuda.ARTICULOS.map(a => a.categoria + '/' + a.slug);
r.ayuda = JSON.stringify(ayuda.ARTICULOS.map(a => [a.titulo, a.descripcion]));
r.visita = visita.TODOS_LOS_PASOS.map(p => p.id);
const vacio = { nif: null, stripeAccountId: null, slug: 'mi-estudio', colorPrimario: null, temaPortal: null, logoUrl: null,
  numInstructores: 0, numInstructoresConCuenta: 0, numTiposClase: 0, numSesiones: 0, numSocios: 0, numSalas: 0,
  numPlanesTarifa: 0, numSuscripcionesActivas: 0, numReservas: 0, hayTarjetaEnLaApp: false, automatizacionesActivas: new Set(),
  reservaExigirPlan: true, numPlanesActivos: 1 };
const o = onboarding.calcularOnboarding(vacio);
r.pasos = o.categorias.flatMap(c => c.pasos.map(p => p.id));
r.recomendaciones = o.recomendaciones.map(x => x.id);
r.onboarding = JSON.stringify(o);
r.avisoVenta = onboarding.avisoVentaOnline(vacio);
r.penalizacionOculta = secciones.tarjetaDeOtroPais('si-cancela-tarde-o-no-viene');
console.log(JSON.stringify(r));
`;

function enArgentina(): {
  textos: string; articulos: string[]; ayuda: string; visita: string[]; pasos: string[];
  recomendaciones: string[]; onboarding: string; avisoVenta: string | null; penalizacionOculta: boolean;
} {
  const salida = execFileSync(process.execPath, [
    '--import', './scripts/register-test-hooks.mjs', '--experimental-strip-types', '--no-warnings',
    '--input-type=module', '-e', SCRIPT,
  ], { cwd: raiz, env: { ...process.env, NEXT_PUBLIC_LOCALE: 'es-AR-u-hc-h23', NEXT_PUBLIC_MONEDA: 'ARS' }, encoding: 'utf8' });
  return JSON.parse(salida.trim().split('\n').pop()!);
}

const r = enArgentina();
const DE_ESPANA = /Stripe|Bizum|Veri\*?Factu|AEAT|[Dd]omiciliaci|remesa|\bSEPA\b/;

test('Argentina: la guía, la visita, la puesta en marcha y «listo para reservar» no hablan de Stripe ni de España', () => {
  assert.doesNotMatch(r.textos, DE_ESPANA);
  assert.match(r.textos, /Mercado Pago/);
  assert.match(r.textos, /pestana=mercadopago/);
});

test('Argentina: la visita no enseña la fila de Stripe', () => {
  assert.ok(!r.visita.includes('c6.4'));
});

test('Argentina: el checklist no pide conectar Stripe ni lo recomienda', () => {
  assert.ok(!r.pasos.includes('stripe'));
  assert.ok(!r.recomendaciones.includes('stripe'));
  assert.equal(r.avisoVenta, null, 'el aviso de venta online lo da el servidor, que sí mira la cuenta de Mercado Pago');
  assert.doesNotMatch(r.onboarding, DE_ESPANA);
});

test('Argentina: el Centro de ayuda publica Mercado Pago y no los artículos de Stripe', () => {
  assert.ok(r.articulos.includes('pagos/conectar-mercadopago'));
  for (const fuera of ['pagos/conectar-stripe', 'pagos/tarjeta-guardada-y-cobro-automatico', 'pagos/cobros-fallidos', 'pagos/conectar-el-datafono']) {
    assert.ok(!r.articulos.includes(fuera), fuera);
  }
  assert.doesNotMatch(r.ayuda, /Stripe|Bizum|Veri\*?Factu/);
});

test('Argentina: sin tarjeta guardada no se ofrece el cargo por cancelar tarde', () => {
  assert.equal(r.penalizacionOculta, true);
});
