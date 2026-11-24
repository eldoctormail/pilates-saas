import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVES_PRECIO, PRECIOS_DE_SERIE, PRECIO_MAXIMO, fijarPrecios, leerPreciosGuardados,
  precioMesDe, preciosActuales, restablecerPrecios, validarPrecios,
} from './precios-plataforma.ts';
import { ADDONS, PLAN_INFO } from './entitlements.ts';
import { etiquetaPrecio } from './intervalo-ui.ts';

beforeEach(() => restablecerPrecios());

test('de serie, los precios de siempre (los tests van en euros)', () => {
  assert.deepEqual(preciosActuales(), { BASE: 29, ESTUDIO: 79, CADENA: 249, decisiones: 22, sustituciones: 12, ia: 16 });
  assert.equal(PLAN_INFO.ESTUDIO.precioMes, 79);
});

test('cambiar un precio cambia PLAN_INFO y ADDONS en el acto, sin recargar el módulo', () => {
  fijarPrecios({ ESTUDIO: 85000, ia: 9500.5 });
  assert.equal(precioMesDe('ESTUDIO'), 85000);
  assert.equal(PLAN_INFO.ESTUDIO.precioMes, 85000);
  assert.equal(ADDONS.ia.precioMes, 9500.5);
  assert.equal(PLAN_INFO.BASE.precioMes, 29, 'lo que no se toca sigue igual');
  assert.equal(etiquetaPrecio(PLAN_INFO.ESTUDIO.precioMes, 'mensual'), '85.000€/mes');
});

test('el almacén es uno para todo el proceso (globalThis), aunque el módulo se cargue dos veces', async () => {
  fijarPrecios({ CADENA: 300 });
  const otra = await import(`./precios-plataforma.ts?copia=${Date.now()}`);
  assert.equal(otra.precioMesDe('CADENA'), 300);
});

test('fijarPrecios ignora lo que no es un precio', () => {
  fijarPrecios({ BASE: -1, ESTUDIO: 0, CADENA: Number.NaN, decisiones: '30', sustituciones: 12.345, ia: PRECIO_MAXIMO + 1 });
  assert.deepEqual(preciosActuales(), { ...PRECIOS_DE_SERIE });
});

test('lo guardado a medias cae al de serie en lo que falta', () => {
  const p = leerPreciosGuardados({ BASE: 35000, ESTUDIO: 'mal' });
  assert.equal(p.BASE, 35000);
  assert.equal(p.ESTUDIO, PRECIOS_DE_SERIE.ESTUDIO);
  assert.deepEqual(leerPreciosGuardados(null), { ...PRECIOS_DE_SERIE });
});

test('validarPrecios rechaza el conjunto entero si falta o falla uno', () => {
  const bien = Object.fromEntries(CLAVES_PRECIO.map((k) => [k, 1000]));
  assert.deepEqual(validarPrecios(bien), { ok: true, precios: bien });
  const r = validarPrecios({ ...bien, ia: 0 });
  assert.equal(r.ok, false);
  assert.equal(validarPrecios({ ...bien, ESTUDIO: undefined }).ok, false);
  assert.equal(validarPrecios(null).ok, false);
});
