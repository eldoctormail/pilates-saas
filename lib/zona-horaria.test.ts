import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lugarDeLaZona } from './zona-horaria.ts';

test('lugarDeLaZona dice la zona para una persona', () => {
  assert.equal(lugarDeLaZona('America/Argentina/Buenos_Aires'), 'Argentina');
  assert.equal(lugarDeLaZona('America/Argentina/Cordoba'), 'Argentina');
  assert.equal(lugarDeLaZona('Europe/Madrid'), 'Madrid');
  assert.equal(lugarDeLaZona('America/Mexico_City'), 'Mexico City');
});
