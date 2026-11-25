import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cuerpoPreapproval, decidirAlta, decidirPorPago, decidirPorSuscripcion, estadoVisible, GRACIA_DIAS,
  idSuscripcion, leerReferencia, preapprovalDe, referenciaDePlan, vencida,
  type FilaEstudio, type Preapproval,
} from './reglas.ts';
import { configMpPlataforma } from './config.ts';

const AHORA = new Date('2026-11-25T12:00:00Z');
const DIA = 24 * 60 * 60 * 1000;
const enDias = (n: number) => new Date(AHORA.getTime() + n * DIA).toISOString();

const fila = (f: Partial<FilaEstudio> = {}): FilaEstudio => ({
  id: 'est-1', plan: 'BASE', subscription_status: 'trialing', subscription_id: null, current_period_end: null, cadena_id: null, ...f,
});
const pre = (p: Partial<Preapproval> = {}): Preapproval => ({
  id: 'abc123', status: 'authorized', external_reference: referenciaDePlan('est-1', 'ESTUDIO'), next_payment_date: enDias(30), ...p,
});

test('referencia e id: ida y vuelta, y nada raro pasa', () => {
  assert.deepEqual(leerReferencia(referenciaDePlan('est-1', 'BASE')), { studioId: 'est-1', plan: 'BASE' });
  assert.equal(leerReferencia('tentare:rec:est-1:r1'), null, 'una referencia de cobro a alumnas no es una suscripción');
  assert.equal(leerReferencia('centra:plan:est-1:OTRO'), null);
  assert.equal(preapprovalDe(idSuscripcion('abc123')), 'abc123');
  assert.equal(preapprovalDe('sub_123'), null, 'un id de Stripe no es de Mercado Pago');
  assert.equal(preapprovalDe('mp:../x'), null);
  assert.throws(() => idSuscripcion('a/b'));
});

test('config: sin token o sin clave de webhook, apagado', () => {
  assert.equal(configMpPlataforma({}).ok, false);
  assert.equal(configMpPlataforma({ MP_PLATAFORMA_ACCESS_TOKEN: 'APP_USR-1' }).ok, false);
  assert.equal(configMpPlataforma({ MP_PLATAFORMA_ACCESS_TOKEN: 'otra-cosa', MP_PLATAFORMA_WEBHOOK_SECRET: 's' }).ok, false);
  const ok = configMpPlataforma({ MP_PLATAFORMA_ACCESS_TOKEN: 'TEST-1', MP_PLATAFORMA_WEBHOOK_SECRET: 's' });
  assert.ok(ok.ok && ok.dePrueba);
});

test('alta: Cadena no, mismo plan pagado no, cambio de plan empieza al terminar lo pagado', () => {
  assert.equal(decidirAlta(fila(), 'CADENA', null, AHORA).ok, false);
  assert.equal(decidirAlta(fila({ cadena_id: 'c1' }), 'BASE', null, AHORA).ok, false);
  assert.deepEqual(decidirAlta(fila(), 'ESTUDIO', null, AHORA), { ok: true, empiezaEl: null });

  const pagando = fila({ plan: 'BASE', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(10) });
  const vigente = pre({ external_reference: referenciaDePlan('est-1', 'BASE') });
  assert.equal(decidirAlta(pagando, 'BASE', vigente, AHORA).ok, false);
  assert.deepEqual(decidirAlta(pagando, 'ESTUDIO', vigente, AHORA), { ok: true, empiezaEl: enDias(10) });
  // Ya dada de baja en Mercado Pago: la nueva cobra hoy (no hay nada pagado que respetar más allá del acceso).
  assert.deepEqual(decidirAlta(pagando, 'BASE', pre({ status: 'cancelled' }), AHORA), { ok: true, empiezaEl: null });
  // Con un cobro pendiente no se cambia de plan: primero la tarjeta.
  assert.equal(decidirAlta({ ...pagando, subscription_status: 'past_due' }, 'ESTUDIO', vigente, AHORA).ok, false);
});

test('el cuerpo de la suscripción: mensual, en la moneda y con la fecha de inicio solo si toca', () => {
  const c = cuerpoPreapproval({
    studioId: 'est-1', plan: 'ESTUDIO', nombrePlan: 'Estudio', importe: 79000, moneda: 'ARS',
    email: 'duena@example.com', backUrl: 'https://app.example.com/suscripcion?suscripcion=ok', empiezaEl: null,
  });
  assert.equal(c.external_reference, 'centra:plan:est-1:ESTUDIO');
  assert.deepEqual(c.auto_recurring, { frequency: 1, frequency_type: 'months', transaction_amount: 79000, currency_id: 'ARS' });
  assert.equal(c.status, 'pending');
  const conInicio = cuerpoPreapproval({ ...{ studioId: 'est-1', plan: 'BASE', nombrePlan: 'x', importe: 1, moneda: 'ARS', email: 'a@example.com', backUrl: 'u' }, empiezaEl: enDias(3) });
  assert.equal((conInicio.auto_recurring as { start_date?: string }).start_date, enDias(3));
});

test('aviso de suscripción autorizada: activa el plan de la referencia', () => {
  const d = decidirPorSuscripcion(fila(), pre(), AHORA);
  assert.ok(d.aplicar);
  assert.deepEqual(d.cambios, { plan: 'ESTUDIO', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(30) });
  assert.equal(d.cancelarAnterior, null);
});

test('una suscripción nueva toma el relevo y cancela la anterior de Mercado Pago (cambio de plan)', () => {
  const d = decidirPorSuscripcion(fila({ subscription_status: 'active', subscription_id: 'mp:vieja1' }), pre(), AHORA);
  assert.ok(d.aplicar && d.cancelarAnterior === 'vieja1');
  // Una de Stripe no se toca desde aquí.
  const s = decidirPorSuscripcion(fila({ subscription_status: 'active', subscription_id: 'sub_1' }), pre(), AHORA);
  assert.ok(s.aplicar && s.cancelarAnterior === null);
});

test('la misma suscripción autorizada otra vez: corre la fecha y no pisa un cobro pendiente', () => {
  const f = fila({ plan: 'ESTUDIO', subscription_status: 'past_due', subscription_id: 'mp:abc123', current_period_end: enDias(-1) });
  const d = decidirPorSuscripcion(f, pre(), AHORA);
  assert.ok(d.aplicar);
  assert.deepEqual(d.cambios, { plan: 'ESTUDIO', current_period_end: enDias(30) });
});

test('referencia de otro estudio: no se toca nada', () => {
  const d = decidirPorSuscripcion(fila({ id: 'est-2' }), pre(), AHORA);
  assert.equal(d.aplicar, false);
});

test('baja: sigue hasta el fin de lo pagado más el margen, y después se cierra', () => {
  const f = fila({ plan: 'ESTUDIO', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(10) });
  assert.equal(decidirPorSuscripcion(f, pre({ status: 'cancelled' }), AHORA).aplicar, false);
  assert.equal(vencida(f, AHORA), false);
  const pasada = { ...f, current_period_end: enDias(-(GRACIA_DIAS + 1)) };
  assert.equal(vencida(pasada, AHORA), true);
  const d = decidirPorSuscripcion(pasada, pre({ status: 'cancelled' }), AHORA);
  assert.ok(d.aplicar && d.cambios.subscription_status === 'canceled');
  // Dentro del margen, todavía no.
  assert.equal(vencida({ ...f, current_period_end: enDias(-(GRACIA_DIAS - 1)) }, AHORA), false);
});

test('vencida solo mira suscripciones de Mercado Pago que dan acceso, y sin fecha no cierra', () => {
  assert.equal(vencida(fila({ subscription_id: 'sub_1', subscription_status: 'active', current_period_end: enDias(-30) }), AHORA), false);
  assert.equal(vencida(fila({ subscription_id: 'mp:abc123', subscription_status: 'active', current_period_end: null }), AHORA), false);
  assert.equal(vencida(fila({ subscription_id: 'mp:abc123', subscription_status: 'canceled', current_period_end: enDias(-30) }), AHORA), false);
});

test('cobro mensual: rechazado → past_due; aprobado → active; de otra suscripción, nada', () => {
  const f = fila({ subscription_status: 'active', subscription_id: 'mp:abc123' });
  const rechazado = decidirPorPago(f, { id: 1, preapproval_id: 'abc123', status: 'recycling', payment: { status: 'rejected' } });
  assert.ok(rechazado.aplicar && rechazado.cambios.subscription_status === 'past_due');
  const aprobado = decidirPorPago({ ...f, subscription_status: 'past_due' }, { id: 2, preapproval_id: 'abc123', status: 'processed', payment: { status: 'approved' } });
  assert.ok(aprobado.aplicar && aprobado.cambios.subscription_status === 'active');
  // Tras cerrarse por vencida, un cobro que al final sale la reabre.
  const reabre = decidirPorPago({ ...f, subscription_status: 'canceled' }, { id: 3, preapproval_id: 'abc123', status: 'processed', payment: { status: 'approved' } });
  assert.ok(reabre.aplicar && reabre.cambios.subscription_status === 'active');
  assert.equal(decidirPorPago(f, { id: 4, preapproval_id: 'otra', status: 'processed', payment: { status: 'approved' } }).aplicar, false);
});

test('estado que ve la propietaria', () => {
  assert.equal(estadoVisible({ subscription_status: 'active' }, pre()), 'al_dia');
  assert.equal(estadoVisible({ subscription_status: 'past_due' }, pre()), 'impago');
  assert.equal(estadoVisible({ subscription_status: 'active' }, pre({ status: 'cancelled' })), 'baja_programada');
  assert.equal(estadoVisible({ subscription_status: 'canceled' }, pre({ status: 'cancelled' })), 'cancelada');
  assert.equal(estadoVisible({ subscription_status: 'active' }, pre({ status: 'pending' })), 'pendiente');
  assert.equal(estadoVisible({ subscription_status: 'active' }, null), 'cancelada');
});
