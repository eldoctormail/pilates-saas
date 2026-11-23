import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpArgentino, normalizarCpArgentino, PROVINCIAS_AR } from './provincias.ts';
import { codigoPostalValido, textoProvincia } from '../alta/tu-estudio.ts';

const AR = 'es-AR-u-hc-h23';

test('CP argentino: cuatro cifras sin provincia, o el CPA con la provincia de su letra', () => {
  assert.deepEqual(cpArgentino('8300'), { valido: true, provincia: null });
  assert.deepEqual(cpArgentino('Q8300ABC'), { valido: true, provincia: 'Neuquén' });
  assert.deepEqual(cpArgentino('q 8300-abc'), { valido: true, provincia: 'Neuquén' });
  assert.deepEqual(cpArgentino('C1425BHA'), { valido: true, provincia: 'Ciudad Autónoma de Buenos Aires' });
  assert.deepEqual(cpArgentino('X5000AAA'), { valido: true, provincia: 'Córdoba' });
  for (const malo of ['', '830', '83000', '28003', 'I8300ABC', 'O8300ABC', 'Q830ABC', 'Q8300AB', 'Q8300ABCD']) {
    assert.equal(cpArgentino(malo).valido, false, malo);
  }
  assert.equal(normalizarCpArgentino(' q8300 abc '), 'Q8300ABC');
  assert.equal(Object.keys(PROVINCIAS_AR).length, 24);
});

test('el alta acepta el CP del país del formato regional', () => {
  assert.equal(codigoPostalValido('8300', AR), true);
  assert.equal(codigoPostalValido('Q8300ABC', AR), true);
  assert.equal(codigoPostalValido('28003', AR), false);
  assert.equal(codigoPostalValido('28003', 'es-ES'), true);
  assert.equal(codigoPostalValido('8300', 'es-ES'), false);
  assert.equal(textoProvincia('Q8300ABC', AR), 'Provincia: Neuquén. Sale sola de tu código postal.');
  assert.match(textoProvincia('8300', AR), /CPA/);
  assert.match(textoProvincia('28003', 'es-ES'), /Madrid/);
});
