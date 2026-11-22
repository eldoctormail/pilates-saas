// Comprar sin cuenta con Mercado Pago: qué se acepta del formulario, y el
// formato de la referencia de una tarjeta regalo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerDatosInvitada } from './invitada.ts';
import { esIdRegalo, leerReferencia, nuevoIdRegalo, referenciaDeRegalo } from './referencia.ts';

const base = { socioEmail: ' Ana@Example.com ', socioNombre: ' Ana Pérez ', socioTelefono: '600 111 222' };

test('invitada: email normalizado y nombre obligatorio', () => {
  const r = leerDatosInvitada(base);
  assert.ok(r.ok);
  assert.equal(r.datos.email, 'ana@example.com');
  assert.equal(r.datos.nombre, 'Ana Pérez');
  assert.equal(leerDatosInvitada({ ...base, socioNombre: '' }).ok, false);
  assert.equal(leerDatosInvitada({ ...base, socioNombre: 'x'.repeat(121) }).ok, false);
});

test('invitada: un email con comodines de ilike o sin forma no pasa', () => {
  for (const e of ['a%b@example.com', 'a_b@example.com', 'sin-arroba', '', 'a@b', `${'a'.repeat(200)}@example.com`]) {
    assert.equal(leerDatosInvitada({ ...base, socioEmail: e }).ok, false, e);
  }
  assert.equal(leerDatosInvitada({ socioNombre: 'Ana' }).ok, false, 'sin email');
});

test('invitada: el teléfono que no encaja no viaja, pero no frena', () => {
  const r = leerDatosInvitada({ ...base, socioTelefono: 'llámame' });
  assert.ok(r.ok);
  assert.equal(r.datos.telefono, null);
  const ok = leerDatosInvitada(base);
  assert.ok(ok.ok && ok.datos.telefono === '600 111 222', 'con el formato del país de los tests (España)');
});

test('invitada: lo opcional solo se guarda si tiene forma', () => {
  const r = leerDatosInvitada({
    ...base, origenLead: 'ig-story', widgetSesion: '123e4567-e89b-12d3-a456-426614174000',
    genero: 'F', codigoPostal: '8300', fechaNacimiento: '1990-05-17',
  });
  assert.ok(r.ok);
  assert.equal(r.datos.origenLead, 'ig-story');
  assert.equal(r.datos.widgetSesion, '123e4567-e89b-12d3-a456-426614174000');
  assert.deepEqual(r.datos.datosAdicionales, { genero: 'F', comoConociste: null, codigoPostal: '8300', fechaNacimiento: '1990-05-17' });
  const malo = leerDatosInvitada({ ...base, origenLead: '<script>', widgetSesion: 'x', fechaNacimiento: '17/05/1990', codigoPostal: 'x'.repeat(13) });
  assert.ok(malo.ok);
  assert.deepEqual([malo.datos.origenLead, malo.datos.widgetSesion, malo.datos.datosAdicionales.fechaNacimiento, malo.datos.datosAdicionales.codigoPostal], [null, null, null, null]);
});

test('referencia de regalo: ida y vuelta, e id con forma', () => {
  const id = nuevoIdRegalo();
  assert.ok(esIdRegalo(id));
  assert.deepEqual(leerReferencia(referenciaDeRegalo('st1', id)), { tipo: 'regalo', studioId: 'st1', regaloId: id });
  for (const x of ['mpc_' + 'a'.repeat(32), 'mpr_', 'mpr_' + 'G'.repeat(32), 'cs_test_1']) assert.equal(esIdRegalo(x), false, x);
  assert.equal(leerReferencia('tentare:regalo:st1'), null);
  assert.throws(() => referenciaDeRegalo('st1', 'a:b'));
});
