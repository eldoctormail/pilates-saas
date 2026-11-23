import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

process.env.INTEGRACIONES_CLAVE_CIFRADO = randomBytes(32).toString('base64');

const {
  configDelEstudio, cuentaPublica, cuentaPuedeAplicar, guardarCuenta, quitarCuenta, todasLasCuentas, validarCuenta,
} = await import('./cuenta.ts');

const TOKEN = 'APP_USR-1234567890123456-112233-abcdefabcdefabcdefabcdefabcdef12-987654321';
const SECRETO = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

/** Una tabla `mercadopago_config` en memoria, con lo justo de supabase-js. */
function baseFalsa() {
  const filas = new Map<string, Record<string, unknown>>();
  const admin = {
    from(tabla: string) {
      assert.equal(tabla, 'mercadopago_config');
      let filtro: string | null = null;
      const q = {
        select() { return q; },
        eq(_c: string, v: string) { filtro = v; return q; },
        async maybeSingle() { return { data: filtro ? filas.get(filtro) ?? null : null, error: null }; },
        then(res: (v: unknown) => unknown) { return Promise.resolve({ data: [...filas.values()], error: null }).then(res); },
        async upsert(f: Record<string, unknown>) { filas.set(f.studio_id as string, f); return { error: null }; },
        delete() { return { eq: async (_c: string, v: string) => { filas.delete(v); return { error: null }; } }; },
      };
      return q;
    },
  } as unknown as SupabaseClient;
  return { admin, filas };
}

const usuarioOk = async () => ({ ok: true as const, datos: { id: 123456789, nickname: 'ESTUDIO.TEST', site_id: 'MLA' } });

test('validarCuenta: pide un Access Token y una clave con su forma', () => {
  assert.ok(validarCuenta({ accessToken: ` ${TOKEN} `, webhookSecret: SECRETO }).ok);
  assert.ok(!validarCuenta({ accessToken: 'abc', webhookSecret: SECRETO }).ok);
  assert.ok(!validarCuenta({ accessToken: TOKEN, webhookSecret: 'con espacios y cosas' }).ok);
  assert.ok(!validarCuenta({}).ok);
});

test('guardar: comprueba con Mercado Pago, cifra y nunca deja el token en claro', async () => {
  const { admin, filas } = baseFalsa();
  const r = await guardarCuenta(admin, { studioId: 'est-1', userId: null, accessToken: TOKEN, webhookSecret: SECRETO }, usuarioOk);
  assert.deepEqual(r, { ok: true });
  const f = filas.get('est-1')!;
  assert.match(String(f.access_token), /^enc:v1:/);
  assert.match(String(f.webhook_secret), /^enc:v1:/);
  assert.ok(!JSON.stringify(f).includes(TOKEN) && !JSON.stringify(f).includes(SECRETO));
  assert.equal(f.cuenta_id, '123456789');
  assert.equal(f.token_final, '4321');

  const c = await configDelEstudio(admin, 'est-1', {});
  assert.ok(c.ok && c.accessToken === TOKEN && c.webhookSecret === SECRETO && c.origen === 'panel');
});

test('guardar: un token que Mercado Pago no reconoce no se guarda', async () => {
  const { admin, filas } = baseFalsa();
  const r = await guardarCuenta(admin, { studioId: 'est-1', userId: null, accessToken: TOKEN, webhookSecret: SECRETO },
    async () => ({ ok: false as const, status: 401, error: 'unauthorized' }));
  assert.ok(!r.ok && r.status === 400);
  assert.equal(filas.size, 0);
});

test('sin cuenta en el panel vale la del .env; sin ninguna, no hay', async () => {
  const { admin } = baseFalsa();
  const env = { MERCADOPAGO_ACCESS_TOKEN: TOKEN, MERCADOPAGO_WEBHOOK_SECRET: SECRETO };
  const c = await configDelEstudio(admin, 'est-1', env);
  assert.ok(c.ok && c.origen === 'servidor');
  assert.ok(!(await configDelEstudio(admin, 'est-1', {})).ok);
  const pub = await cuentaPublica(admin, 'est-1', { ...env, NEXT_PUBLIC_APP_URL: 'https://app.example.com/' });
  assert.equal(pub.origen, 'servidor');
  assert.equal(pub.webhookUrl, 'https://app.example.com/api/mercadopago/webhook');
  assert.ok(!JSON.stringify(pub).includes(TOKEN));
});

test('todasLasCuentas: las del panel y la del servidor; quitar la deja fuera', async () => {
  const { admin } = baseFalsa();
  await guardarCuenta(admin, { studioId: 'est-1', userId: null, accessToken: TOKEN, webhookSecret: SECRETO }, usuarioOk);
  const env = { MERCADOPAGO_ACCESS_TOKEN: TOKEN.replace('APP_USR', 'TEST'), MERCADOPAGO_WEBHOOK_SECRET: 'otro0123456789abcdef' };
  const cuentas = await todasLasCuentas(admin, env);
  assert.deepEqual(cuentas.map(c => c.studioId), ['est-1', null]);
  await quitarCuenta(admin, 'est-1');
  assert.deepEqual((await todasLasCuentas(admin, env)).map(c => c.studioId), [null]);
});

test('una cuenta del panel solo aplica pagos de su estudio; la del servidor, de los que no tienen cuenta', () => {
  const conCuenta = new Set(['est-1']);
  assert.ok(cuentaPuedeAplicar({ studioId: 'est-1' }, 'est-1', conCuenta));
  assert.ok(!cuentaPuedeAplicar({ studioId: 'est-1' }, 'est-2', conCuenta));
  assert.ok(cuentaPuedeAplicar({ studioId: null }, 'est-2', conCuenta));
  assert.ok(!cuentaPuedeAplicar({ studioId: null }, 'est-1', conCuenta));
});
