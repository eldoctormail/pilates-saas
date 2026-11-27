import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conReloj24, esArgentina } from './locale.ts';

test('es-AR a secas lleva el reloj de 24 h; lo demás se respeta', () => {
  assert.equal(conReloj24('es-AR'), 'es-AR-u-hc-h23');
  assert.equal(conReloj24('es-ar'), 'es-ar-u-hc-h23');
  assert.equal(conReloj24('es-AR-u-hc-h12'), 'es-AR-u-hc-h12', 'una extensión puesta a propósito no se toca');
  assert.equal(conReloj24('es-ES'), 'es-ES');
  assert.ok(esArgentina(conReloj24('es-AR')));
  // Lo que se arregla: con es-AR a secas la hora salía «06:00 p. m.».
  const hora = (l: string) => new Date(Date.UTC(2026, 0, 1, 18, 0)).toLocaleTimeString(l, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  assert.equal(hora(conReloj24('es-AR')), '18:00');
});
