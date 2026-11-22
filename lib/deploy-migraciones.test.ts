// El servidor propio recorre las migraciones desde una base vacía con los MISMOS
// arreglos que el job de base de datos de CI (.github/workflows/ci.yml). Si el
// repo original cambia esos arreglos (o renombra un fichero), este test falla
// antes de que un `migrar.sh` falle en el servidor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..');
const ci = readFileSync(join(RAIZ, '.github/workflows/ci.yml'), 'utf8');
const script = readFileSync(join(RAIZ, 'deploy/scripts/preparar-migraciones.sh'), 'utf8');

const deCi = {
  mv: [...ci.matchAll(/run: mv supabase\/migrations\/(\S+) supabase\/migrations\/(\S+)/g)].map(m => [m[1], m[2]]),
  rm: [...ci.matchAll(/run: rm supabase\/migrations\/(\S+\.sql)/g)].map(m => m[1]),
  sed: [...ci.matchAll(/^\s+supabase\/migrations\/(\S+\.sql)\s*$/gm)].map(m => m[1]),
};

test('preparar-migraciones.sh hace los mismos arreglos que CI', () => {
  assert.ok(deCi.mv.length >= 2 && deCi.rm.length >= 2 && deCi.sed.length >= 1, 'el job de CI cambió de forma: revisar este test');
  const mv = [...script.matchAll(/^mv "\$M\/(\S+)" "\$M\/(\S+)"$/gm)].map(m => [m[1], m[2]]);
  const rm = [...script.matchAll(/^rm "\$M\/(\S+)"$/gm)].map(m => m[1]);
  const sed = [...script.matchAll(/^\s+"\$M\/(\S+\.sql)"$/gm)].map(m => m[1]);
  assert.deepEqual(mv, deCi.mv);
  assert.deepEqual(rm, deCi.rm);
  assert.deepEqual(sed, deCi.sed);
});

test('los ficheros que se arreglan existen', () => {
  for (const f of [...deCi.mv.map(([a]) => a), ...deCi.rm, ...deCi.sed]) {
    assert.ok(existsSync(join(RAIZ, 'supabase/migrations', f)), f);
  }
});

test('migrar.sh prepara la copia, empuja desde ella y adapta después', () => {
  const m = readFileSync(join(RAIZ, 'deploy/scripts/migrar.sh'), 'utf8');
  const prep = m.indexOf('preparar-migraciones.sh');
  const push = m.indexOf('db push', prep);
  const adapta = m.indexOf('adaptar-autoalojado.sql', push);
  assert.ok(prep > 0 && push > prep && adapta > push, 'preparar → push → adaptar');
  assert.ok(m.slice(prep, push).includes('cd "$TMP"'), 'el push corre desde la copia');
});
