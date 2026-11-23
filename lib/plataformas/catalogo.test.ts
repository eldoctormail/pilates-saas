import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plataformasDelPais } from './catalogo.ts';

test('en Argentina no se ofrece Urban Sports Club', () => {
  assert.deepEqual([...plataformasDelPais(true)], ['CLASSPASS', 'WELLHUB']);
  assert.deepEqual([...plataformasDelPais(false)], ['CLASSPASS', 'URBAN_SPORTS_CLUB', 'WELLHUB']);
});
