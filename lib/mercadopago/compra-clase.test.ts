// Pagar y reservar una clase con Mercado Pago: las piezas puras (caducidad del
// pago, vuelta a la ficha, lectura del inicio del pago en la app).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { caducidadDeCompra, HORAS_VALIDEZ_COMPRA, MINIMO_PARA_PAGAR_CLASE_MS } from './caducidad.ts';
import { esIdCompra, nuevoIdCompra, urlsDeClase } from './referencia.ts';
import { leerInicioPagoMercadoPago } from '../student/pagar-clase-reglas.ts';

const AHORA = Date.parse('2026-11-22T12:00:00Z');

test('caducidad: sin clase, 24 h', () => {
  const r = caducidadDeCompra(null, AHORA);
  assert.ok(r.ok);
  assert.equal(r.expira.getTime(), AHORA + HORAS_VALIDEZ_COMPRA * 3600_000);
});

test('caducidad: con clase, lo que falte para que se cierre su reserva si es antes de 24 h', () => {
  const cierre = new Date(AHORA + 3 * 3600_000);
  const r = caducidadDeCompra(cierre, AHORA);
  assert.ok(r.ok);
  assert.equal(r.expira.getTime(), cierre.getTime());
  const lejos = caducidadDeCompra(new Date(AHORA + 5 * 86400_000), AHORA);
  assert.ok(lejos.ok);
  assert.equal(lejos.expira.getTime(), AHORA + 24 * 3600_000);
});

test('caducidad: si la reserva se cierra en menos del mínimo, no se abre el pago', () => {
  const justo = caducidadDeCompra(new Date(AHORA + MINIMO_PARA_PAGAR_CLASE_MS), AHORA);
  assert.ok(justo.ok, 'en el límite, sí');
  const tarde = caducidadDeCompra(new Date(AHORA + MINIMO_PARA_PAGAR_CLASE_MS - 1), AHORA);
  assert.equal(tarde.ok, false);
  assert.ok(!tarde.ok && /No te hemos cobrado nada/.test(tarde.error));
  assert.equal(caducidadDeCompra(new Date(AHORA - 1), AHORA).ok, false, 'ya cerrada');
});

test('vuelta de Mercado Pago: a la ficha de la clase con la compra, o «cancelado»', () => {
  const u = urlsDeClase('https://pilates.example.com/', 'luz', 'ses 9', 'mpc_' + 'a'.repeat(32));
  assert.equal(u.successUrl, `https://pilates.example.com/portal/luz/reservar/ses%209?mp=mpc_${'a'.repeat(32)}`);
  assert.equal(u.cancelUrl, 'https://pilates.example.com/portal/luz/reservar/ses%209?mp=cancelado');
});

test('esIdCompra: solo lo que crea nuevoIdCompra', () => {
  assert.ok(esIdCompra(nuevoIdCompra()));
  for (const x of ['cancelado', '', 'mpc_', 'mpc_' + 'A'.repeat(32), 'pi_123', 'mpc_' + 'a'.repeat(33)]) assert.equal(esIdCompra(x), false, x);
});

test('leerInicioPagoMercadoPago: una URL https es ir a pagar; lo demás, rechazos y errores', () => {
  assert.deepEqual(leerInicioPagoMercadoPago(200, { url: 'https://www.mercadopago.com.ar/checkout/v1/redirect?x=1' }),
    { tipo: 'redirigir', url: 'https://www.mercadopago.com.ar/checkout/v1/redirect?x=1' });
  assert.equal(leerInicioPagoMercadoPago(200, { url: 'javascript:alert(1)' }).tipo, 'error');
  assert.equal(leerInicioPagoMercadoPago(200, {}).tipo, 'error');
  assert.deepEqual(leerInicioPagoMercadoPago(409, { error: 'Esta clase está cancelada', codigo: null }),
    { tipo: 'rechazo', codigo: null, mensaje: 'Esta clase está cancelada' });
  assert.equal(leerInicioPagoMercadoPago(401, { error: 'x' }).tipo, 'sesion');
  assert.equal(leerInicioPagoMercadoPago(401, { codigo: 'doble_factor_requerido' }).tipo, 'dos-pasos');
  assert.equal(leerInicioPagoMercadoPago(409, { codigo: 'faltan-preguntas', error: 'x' }).tipo, 'faltan-preguntas');
  assert.equal(leerInicioPagoMercadoPago(502, { error: 'detalle interno' }).tipo, 'error', 'el texto de un 5xx no es para la alumna');
});

test('la entrega reserva la clase de la compra con la compra como clave', () => {
  const s = readFileSync(join(import.meta.dirname, 'procesar-pago.ts'), 'utf8');
  const entrega = s.indexOf('await entregarPlanComprado(');
  const reserva = s.indexOf('await reservarClasePagada(', entrega);
  const pagada = s.indexOf("update({ estado: 'pagada'", reserva);
  assert.ok(entrega > 0 && reserva > entrega && pagada > reserva, 'entregar → reservar → marcar pagada');
  assert.match(s, /paymentIntentId: compraId,/);
  assert.match(s, /via: 'mercadopago'/);
});
