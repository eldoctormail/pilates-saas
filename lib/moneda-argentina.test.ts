// Importes en pesos donde antes había «€» escrito a mano o un número sin
// separador de miles. Solo tiene sentido con la configuración argentina (el
// job es-AR del CI y `npm run test:argentina`); con la de los tests del
// original (EUR) no comprueba nada.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MONEDA } from './moneda.ts';
import { AJUSTES_POR_DEFECTO, validarImporte } from './regalo/reglas.ts';
import { eur } from './interno/hoy.ts';

const enPesos = MONEDA === 'ARS';

test('regalo: el rango del importe libre va con separador de miles', { skip: !enPesos }, () => {
  const r = validarImporte(AJUSTES_POR_DEFECTO, 1);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.motivo : '', /entre \$\s?10\.000 y \$\s?300\.000/);
});

test('/interno: el MRR va en pesos, no en euros', { skip: !enPesos }, () => {
  assert.match(eur(108000), /^\$\s?108\.000$/);
});
