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

test('migrar.sh prepara la copia, aplica desde ella (cada una en su transacción) y adapta después', () => {
  const m = readFileSync(join(RAIZ, 'deploy/scripts/migrar.sh'), 'utf8');
  const prep = m.indexOf('"$DEPLOY/scripts/preparar-migraciones.sh" "$TMP"');
  const aplica = m.indexOf('$PSQL < "$LOTE"', prep);
  const adapta = m.indexOf('adaptar-autoalojado.sql', aplica);
  assert.ok(prep > 0 && aplica > prep && adapta > aplica, 'preparar → aplicar → adaptar');
  const tramo = m.slice(prep, aplica);
  assert.ok(tramo.includes('M="$TMP/supabase/migrations"'), 'se aplica la copia arreglada, no supabase/migrations');
  assert.ok(tramo.includes("printf 'begin;") && tramo.includes('commit;'), 'cada migración en su transacción (LOCK TABLE lo exige)');
  assert.ok(tramo.includes('supabase_migrations.schema_migrations'), 'se anota en la tabla de la CLI');
  assert.ok(!m.includes('db push'), 'sin la CLI: corre las sentencias fuera de una transacción');
});

test('las plantillas de correo del servidor propio son las de config.toml, con sus asuntos', () => {
  const toml = readFileSync(join(RAIZ, 'supabase/config.toml'), 'utf8');
  const compose = readFileSync(join(RAIZ, 'deploy/supabase/docker-compose.tentare.yml'), 'utf8');
  const plantillas = [...toml.matchAll(/^\[auth\.email\.template\.(\w+)\]\nsubject = "(.*)"\ncontent_path = "\.\/supabase\/templates\/(\w+)\.html"/gm)];
  assert.ok(plantillas.length >= 4, 'config.toml tiene las plantillas de acceso');
  for (const [, tipo, asunto, archivo] of plantillas) {
    const T = tipo.toUpperCase();
    assert.ok(existsSync(join(RAIZ, 'supabase/templates', `${archivo}.html`)), `${archivo}.html existe`);
    assert.ok(compose.includes(`GOTRUE_MAILER_TEMPLATES_${T}: http://plantillas/${archivo}.html`), `${T}: la plantilla`);
    assert.ok(compose.includes(`GOTRUE_MAILER_SUBJECTS_${T}: '${asunto.replace(/'/g, "''")}'`), `${T}: el mismo asunto que config.toml`);
  }
  // migrar.sh las copia adonde las sirve el contenedor «plantillas».
  const migrar = readFileSync(join(RAIZ, 'deploy/scripts/migrar.sh'), 'utf8');
  assert.ok(migrar.includes('supabase/templates/*.html') && migrar.includes('"$SB/plantillas'), 'migrar.sh copia las plantillas');
  assert.ok(compose.includes('./plantillas:/usr/share/nginx/html:ro'));
});
