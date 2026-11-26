import { test } from 'node:test';
import assert from 'node:assert/strict';
import { envPublica } from './env-publica.ts';

test('devuelve lo que lee', () => {
  assert.equal(envPublica(() => 'Europe/Madrid'), 'Europe/Madrid');
  assert.equal(envPublica(() => undefined), undefined);
});

test('donde no existe `process` (la web de un estudio) no revienta: da undefined', () => {
  assert.equal(envPublica(() => { throw new ReferenceError('process is not defined'); }), undefined);
});

test('el widget no vuelve a guardar la lectura con `typeof process`: tiraría el valor inlineado', async () => {
  const { readFileSync } = await import('node:fs');
  for (const f of ['locale.ts', 'zona-horaria.ts', 'moneda.ts', 'legal-info.ts']) {
    const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
    assert.ok(!/typeof process !== 'undefined' \? (leer\()?process\.env\.NEXT_PUBLIC/.test(src), f);
  }
});
