// Teléfonos de Argentina (autoalojado): lo que se le pasa a WhatsApp (wa.me) y a Twilio.
// Los tests fijan es-ES (scripts/register-test-hooks.mjs); aquí se pasa el locale a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { telefonoE164 } from './decision/mensajes-socia.ts';
import { telefonoValido } from './csv.ts';

const AR = 'es-AR-u-hc-h23';

test('celular argentino, se escriba como se escriba → +549 + área + número', () => {
  for (const t of ['299 412-3456', '0299 15 412-3456', '+54 9 299 412 3456', '+54 299 4123456', '5492994123456', '0054 9 299 4123456']) {
    assert.equal(telefonoE164(t, AR), '+5492994123456', t);
  }
  assert.equal(telefonoE164('(011) 15 4123-4567', AR), '+5491141234567');
  assert.equal(telefonoE164('11 4123-4567', AR), '+5491141234567');
  assert.equal(telefonoE164('0351 15 412-3456', AR), '+5493514123456');
});

test('con otro país, como venía; sin código de área, nada (mejor sin enlace que a otro número)', () => {
  assert.equal(telefonoE164('+34 612 345 678', AR), '+34612345678');
  assert.equal(telefonoE164('412-3456', AR), null);
});

test('España sigue igual', () => {
  assert.equal(telefonoE164('612 345 678', 'es-ES'), '+34612345678');
  assert.equal(telefonoE164('+54 9 299 412 3456', 'es-ES'), '+5492994123456');
});

test('el formulario acepta lo mismo que WhatsApp entiende', () => {
  for (const t of ['299 412-3456', '0299 15 412-3456', '+54 9 299 412 3456']) {
    assert.equal(telefonoValido(t, AR), true, t);
    assert.ok(telefonoE164(t, AR), t);
  }
});
