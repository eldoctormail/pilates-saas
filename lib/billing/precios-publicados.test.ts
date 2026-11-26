import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRECIOS_DE_SERIE, marcarPublicados, paginasDesfasadas } from './precios-plataforma.ts';

test('tras un despliegue las páginas tienen los de serie: solo se regeneran si los guardados son otros, y una vez', () => {
  const serie = { ...PRECIOS_DE_SERIE };
  assert.equal(paginasDesfasadas(serie, serie), false, 'guardados = de serie: el build ya los tiene');
  const guardados = { ...serie, BASE: serie.BASE + 1 };
  assert.equal(paginasDesfasadas(guardados, serie), true);
  marcarPublicados(guardados);
  assert.equal(paginasDesfasadas(guardados, serie), false, 'ya regeneradas con esos');
  assert.equal(paginasDesfasadas({ ...guardados, ia: guardados.ia + 1 }, serie), true, 'otro cambio, otra vez');
});
