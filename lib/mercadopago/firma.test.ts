import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { leerCabeceraFirma, manifiestoDe, verificarFirma } from './firma.ts';
import { importeCoincide, leerReferencia, referenciaDeRecibo } from './referencia.ts';
import { configMercadoPago } from './config.ts';

const SECRETO = 'secreto-de-prueba';
const firmar = (manifiesto: string) => createHmac('sha256', SECRETO).update(manifiesto).digest('hex');

test('manifiesto con los tres valores, en el orden de la documentación', () => {
  assert.equal(manifiestoDe({ dataId: '123456', xRequestId: 'req-1', ts: '1704908010' }), 'id:123456;request-id:req-1;ts:1704908010;');
});

test('manifiesto: un valor ausente omite su par; un id alfanumérico va en minúsculas', () => {
  assert.equal(manifiestoDe({ dataId: null, xRequestId: 'req-1', ts: '1' }), 'request-id:req-1;ts:1;');
  assert.equal(manifiestoDe({ dataId: 'ORD01ABC', xRequestId: null, ts: '1' }), 'id:ord01abc;ts:1;');
});

test('cabecera ts/v1 en cualquier orden y con espacios', () => {
  assert.deepEqual(leerCabeceraFirma('v1=abc123, ts=99'), { ts: '99', v1: 'abc123' });
  assert.equal(leerCabeceraFirma('ts=99'), null);
  assert.equal(leerCabeceraFirma('ts=99,v1=no-hex!'), null);
});

test('firma válida y reciente → ok (ts en segundos y en milisegundos)', () => {
  const ahoraMs = 1_800_000_000_000;
  for (const ts of [String(ahoraMs / 1000), String(ahoraMs)]) {
    const v1 = firmar(manifiestoDe({ dataId: '42', xRequestId: 'r', ts }));
    const r = verificarFirma({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'r', dataId: '42' }, SECRETO, { ahoraMs });
    assert.equal(r.ok, true, ts);
  }
});

test('firma de OTRO pago (data.id cambiado) → no coincide', () => {
  const ts = '1800000000';
  const v1 = firmar(manifiestoDe({ dataId: '42', xRequestId: 'r', ts }));
  const r = verificarFirma({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'r', dataId: '43' }, SECRETO, { ahoraMs: 1_800_000_000_000 });
  assert.deepEqual(r, { ok: false, motivo: 'firma-no-coincide' });
});

test('firma con otro secreto → no coincide; sin cabecera → rechazada', () => {
  const ts = '1800000000';
  const v1 = createHmac('sha256', 'otro').update(manifiestoDe({ dataId: '42', xRequestId: 'r', ts })).digest('hex');
  assert.equal(verificarFirma({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'r', dataId: '42' }, SECRETO).ok, false);
  assert.deepEqual(verificarFirma({ xSignature: null, xRequestId: 'r', dataId: '42' }, SECRETO), { ok: false, motivo: 'sin-cabecera' });
});

test('firma válida pero de hace más de un día → caducado', () => {
  const ts = '1800000000';
  const v1 = firmar(manifiestoDe({ dataId: '42', xRequestId: 'r', ts }));
  const r = verificarFirma({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'r', dataId: '42' }, SECRETO, { ahoraMs: 1_800_000_000_000 + 2 * 86_400_000 });
  assert.deepEqual(r, { ok: false, motivo: 'caducado' });
});

test('referencia de recibo: ida y vuelta, y rechaza lo que no es nuestro', () => {
  const ref = referenciaDeRecibo('studio-1', 'rec-web-abc');
  assert.equal(ref, 'tentare:rec:studio-1:rec-web-abc');
  assert.deepEqual(leerReferencia(ref), { tipo: 'recibo', studioId: 'studio-1', reciboId: 'rec-web-abc' });
  for (const mala of [null, '', 'otra:rec:a:b', 'tentare:plan:a:b', 'tentare:rec:a', 'tentare:rec:a:b:c', 'tentare:rec:a b:c']) {
    assert.equal(leerReferencia(mala), null, String(mala));
  }
  assert.throws(() => referenciaDeRecibo('studio:1', 'x'));
});

test('importe al centavo', () => {
  assert.equal(importeCoincide(1500, 1500), true);
  assert.equal(importeCoincide(1499.995, 1500), true);
  assert.equal(importeCoincide(1499.99, 1500), false);
  assert.equal(importeCoincide(Number.NaN, 1500), false);
});

test('config: exige token con forma y la clave del webhook', () => {
  assert.equal(configMercadoPago({}).ok, false);
  assert.equal(configMercadoPago({ MERCADOPAGO_ACCESS_TOKEN: 'sk_live_x', MERCADOPAGO_WEBHOOK_SECRET: 's' }).ok, false);
  assert.equal(configMercadoPago({ MERCADOPAGO_ACCESS_TOKEN: 'APP_USR-123' }).ok, false);
  assert.equal(configMercadoPago({ MERCADOPAGO_ACCESS_TOKEN: 'TEST-123', MERCADOPAGO_WEBHOOK_SECRET: 's' }).ok, true);
});
