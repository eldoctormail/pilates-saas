// La facturación de /interno con Mercado Pago (Argentina): la mensualidad de los estudios se cobra con
// suscripciones `mp:<id>` (lib/billing/mp-plataforma) y el panel tiene que leerlas a ellas, no a Stripe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cruzarFacturacion, importeMensualMp, type FilaEstudio, type LecturaMercadoPago } from './facturacion-real.ts';
import type { Preapproval } from '../billing/mp-plataforma/reglas.ts';

const estudio = (id: string, extra: Partial<FilaEstudio> = {}): FilaEstudio => ({
  id, nombre: `Estudio ${id}`, plan: 'BASE', subscription_status: 'active', stripe_customer_id: null, cadena_id: null,
  subscription_id: `mp:pre${id}`, current_period_end: '2026-12-20T00:00:00.000Z', ...extra,
});
const pre = (status: string, importe = 29000, extra: Partial<Preapproval> = {}): Preapproval => ({
  id: 'x', status, next_payment_date: '2026-12-20T10:00:00.000Z',
  auto_recurring: { transaction_amount: importe, currency_id: 'ARS', frequency: 1, frequency_type: 'months' }, ...extra,
});
const lectura = (pares: Array<[string, Preapproval | null]>, disponible = true): LecturaMercadoPago =>
  ({ disponible, porEstudio: new Map(pares) });

test('una suscripción autorizada suma al MRR con su importe en pesos', () => {
  const r = cruzarFacturacion([estudio('a'), estudio('b', { plan: 'ESTUDIO' })], [], [], false,
    lectura([['a', pre('authorized', 29000)], ['b', pre('authorized', 79000)]]));
  assert.equal(r.fuente, 'Mercado Pago');
  assert.equal(r.stripeDisponible, true);
  assert.equal(r.pagando, 2);
  assert.equal(r.mrrEuros, 108000);
  assert.equal(r.lineas[0].fuente, 'mercadopago');
  assert.equal(r.lineas[0].renuevaEl, '2026-12-20T10:00:00.000Z');
});

test('autorizada pero con el estudio en impago: impago, sin sumar', () => {
  const r = cruzarFacturacion([estudio('a', { subscription_status: 'past_due' })], [], [], false, lectura([['a', pre('authorized')]]));
  assert.equal(r.impagos, 1);
  assert.equal(r.mrrEuros, 0);
});

test('dada de baja: cancelada (aunque siga con acceso hasta fin de mes), no suma', () => {
  const r = cruzarFacturacion([estudio('a')], [], [], false, lectura([['a', pre('cancelled')]]));
  assert.equal(r.lineas[0].estado, 'cancelado');
  assert.equal(r.mrrEuros, 0);
});

test('pendiente de autorizar con acceso, o que Mercado Pago no encuentra: no cuadra', () => {
  const r = cruzarFacturacion([estudio('a'), estudio('b')], [], [], false, lectura([['a', pre('pending')], ['b', null]]));
  assert.equal(r.descuadres, 2);
});

test('si Mercado Pago no contestó, nada se da por pagado y la fuente sale como no disponible', () => {
  const r = cruzarFacturacion([estudio('a')], [], [], false, lectura([], false));
  assert.equal(r.stripeDisponible, false);
  assert.equal(r.pagando, 0);
  assert.equal(r.lineas[0].estado, 'descuadre');
});

test('una suscripción que no se pudo leer (sin entrada) no se inventa: no cuadra', () => {
  const r = cruzarFacturacion([estudio('a'), estudio('b')], [], [], false, lectura([['a', pre('authorized')]]));
  assert.equal(r.lineas.find((l) => l.id === 'b')?.estado, 'descuadre');
  assert.equal(r.pagando, 1);
});

test('la prueba local de 7 días es una prueba, no un descuadre', () => {
  const fin = new Date(Date.now() + 3 * 86_400_000).toISOString();
  const r = cruzarFacturacion([estudio('a', { subscription_status: 'trialing', subscription_id: null, trial_ends_at: fin })], [], [], false, lectura([]));
  assert.equal(r.enPrueba, 1);
  assert.equal(r.descuadres, 0);
  assert.equal(r.pruebasQueAcaban.length, 1);
});

test('importe mensual: cada 3 meses cuenta un tercio', () => {
  assert.equal(importeMensualMp(pre('authorized', 90000, { auto_recurring: { transaction_amount: 90000, frequency: 3, frequency_type: 'months' } })), 30000);
});

test('sin Mercado Pago (Stripe), el resultado es el de siempre', () => {
  const r = cruzarFacturacion([estudio('a', { subscription_id: null })], [], [], true);
  assert.equal(r.fuente, 'Stripe');
  assert.equal(r.lineas[0].estado, 'descuadre');
});

test('una cadena que paga con Mercado Pago es UNA línea con sus sedes, y el anual cuenta su doceava parte al mes', () => {
  const sedes = [estudio('s1', { cadena_id: 'c1', subscription_id: null }), estudio('s2', { cadena_id: 'c1', subscription_id: null })];
  const cadena = { id: 'c1', nombre: 'Mi cadena', plan: 'CADENA', subscription_status: 'active', stripe_customer_id: null, subscription_id: 'mp:prec1' };
  const anual = pre('authorized', 2_400_000, { auto_recurring: { transaction_amount: 2_400_000, currency_id: 'ARS', frequency: 12, frequency_type: 'months' } });
  const r = cruzarFacturacion(sedes, [cadena], [], false, lectura([['c1', anual]]));
  assert.equal(r.lineas.length, 1);
  assert.equal(r.lineas[0].tipo, 'cadena');
  assert.equal(r.lineas[0].sedes, 2);
  assert.equal(r.mrrEuros, 200_000);
});

test('con Mercado Pago, la sede principal que paga su plan suelto (sin la cadena pagando) tiene su línea', () => {
  const principal = estudio('s1', { cadena_id: 'c1' });
  const cadena = { id: 'c1', nombre: 'Mi cadena', plan: null, subscription_status: null, stripe_customer_id: null, subscription_id: null };
  const r = cruzarFacturacion([principal], [cadena], [], false, lectura([['s1', pre('authorized', 29000)]]));
  assert.equal(r.pagando, 1);
  assert.equal(r.mrrEuros, 29000);
});
