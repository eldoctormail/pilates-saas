// Botón de arrepentimiento y de baja (Argentina, Disp. 954/2025): lo puro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { botonesConsumidorActivos, esCodigoPedido, leerPedido, NOMBRE_BOTON, nuevoCodigo, rutaPedido } from './pedidos.ts';

const RAIZ = join(import.meta.dirname, '..', '..');
const base = { slug: 'pilates-valle', tipo: 'BAJA', nombre: ' Ana Pérez ', email: ' Ana@Example.com ' };

test('solo en Argentina', () => {
  assert.equal(botonesConsumidorActivos('es-AR-u-hc-h23'), true);
  assert.equal(botonesConsumidorActivos('es-ES'), false);
});

test('los nombres son los de la norma, tal cual', () => {
  assert.equal(NOMBRE_BOTON.ARREPENTIMIENTO, 'Botón de arrepentimiento');
  assert.equal(NOMBRE_BOTON.BAJA, 'Botón de baja de servicio');
  assert.equal(rutaPedido('pilates-valle', 'BAJA'), '/reservar/pilates-valle/baja');
});

test('código: prefijo por tipo, 6 caracteres sin 0/O/1/I, y con forma', () => {
  for (let i = 0; i < 200; i++) {
    const a = nuevoCodigo('ARREPENTIMIENTO'); const b = nuevoCodigo('BAJA');
    assert.ok(esCodigoPedido(a) && a.startsWith('ARR-'), a);
    assert.ok(esCodigoPedido(b) && b.startsWith('BAJ-'), b);
    assert.doesNotMatch(a.slice(4) + b.slice(4), /[01OI]/);
  }
  assert.equal(nuevoCodigo('BAJA', () => new Uint8Array([0, 1, 2, 3, 4, 31])), 'BAJ-23456Z');
});

test('el código cumple el CHECK de la tabla', () => {
  const sql = readFileSync(join(RAIZ, 'supabase/migrations/20261122020500_pedidos_consumidor.sql'), 'utf8');
  const patron = /codigo ~ '([^']+)'/.exec(sql)![1];
  const re = new RegExp(patron);
  for (let i = 0; i < 50; i++) assert.match(nuevoCodigo(i % 2 ? 'BAJA' : 'ARREPENTIMIENTO'), re);
});

test('leerPedido: sin registrarse, solo nombre y email obligatorios', () => {
  const r = leerPedido(base);
  assert.ok(r.ok);
  assert.deepEqual([r.pedido.nombre, r.pedido.email, r.pedido.tipo, r.pedido.telefono, r.pedido.documento], ['Ana Pérez', 'ana@example.com', 'BAJA', null, null]);
  assert.equal(leerPedido({ ...base, nombre: '' }).ok, false);
  assert.equal(leerPedido({ ...base, email: 'a%b@example.com' }).ok, false);
  assert.equal(leerPedido({ ...base, tipo: 'OTRO' }).ok, false);
  assert.equal(leerPedido({ ...base, slug: '../x' }).ok, false);
});

test('leerPedido: el DNI se guarda sin puntos; lo que no tiene forma, no', () => {
  const r = leerPedido({ ...base, documento: '28.033.514' });
  assert.ok(r.ok && r.pedido.documento === '28033514');
  const m = leerPedido({ ...base, documento: 'abc', detalle: 'x'.repeat(1500) });
  assert.ok(m.ok && m.pedido.documento === null && m.pedido.detalle!.length === 1000);
});

test('la página pública se enlaza siempre desde /reservar (no depende de la sección de contacto) y desde la app', () => {
  const reservar = readFileSync(join(RAIZ, 'app/reservar/[slug]/page.tsx'), 'utf8');
  const i = reservar.indexOf('<BotonesConsumidor');
  assert.ok(i > 0);
  const antes = reservar.slice(reservar.lastIndexOf('{', i), i);
  assert.doesNotMatch(antes, /seccionVisible/);
  assert.match(readFileSync(join(RAIZ, 'app/portal/[slug]/perfil/page.tsx'), 'utf8'), /NOMBRE_BOTON\.ARREPENTIMIENTO[\s\S]*NOMBRE_BOTON\.BAJA/);
});

test('la API no pide cuenta ni captcha (la norma no deja poner trámites)', () => {
  const api = readFileSync(join(RAIZ, 'app/api/public/pedidos-consumidor/route.ts'), 'utf8');
  assert.doesNotMatch(api, /verificarUsuarioSupabase|verificarCaptcha|authorization/i);
});
