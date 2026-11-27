import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cuerpoPreapproval, decidirAlta, decidirPorPago, decidirPorSuscripcion, estadoVisible, GRACIA_DIAS,
  idSuscripcion, intervaloDe, leerReferencia, preapprovalDe, referenciaDeCadena, referenciaDePlan, vencida, yaEmpezo,
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
  assert.deepEqual(leerReferencia(referenciaDePlan('est-1', 'BASE')), { tabla: 'studios', id: 'est-1', plan: 'BASE', intervalo: 'mensual' });
  assert.deepEqual(leerReferencia(referenciaDePlan('est-1', 'ESTUDIO', 'anual')), { tabla: 'studios', id: 'est-1', plan: 'ESTUDIO', intervalo: 'anual' });
  assert.equal(referenciaDePlan('est-1', 'BASE', 'anual'), 'centra:plan:est-1:BASE:anual');
  assert.deepEqual(leerReferencia(referenciaDeCadena('cadena-1')), { tabla: 'cadenas', id: 'cadena-1', plan: 'CADENA', intervalo: 'mensual' });
  assert.deepEqual(leerReferencia(referenciaDeCadena('cadena-1', 'anual')), { tabla: 'cadenas', id: 'cadena-1', plan: 'CADENA', intervalo: 'anual' });
  // Cadena solo como referencia de cadena: una sede no paga «Cadena» por su cuenta.
  assert.equal(leerReferencia('centra:plan:est-1:CADENA'), null);
  assert.equal(leerReferencia('centra:cadena:c1:mensual'), null);
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

test('alta: mismo plan pagado no, cambio de plan empieza al terminar lo pagado', () => {
  // Cadena se cobra a la fila de la cadena (la ruta la resuelve); aquí, como cualquier plan.
  assert.deepEqual(decidirAlta(fila({ id: 'cadena-1', cadena_id: undefined }), 'CADENA', null, AHORA), { ok: true, empiezaEl: null });
  assert.deepEqual(decidirAlta(fila(), 'ESTUDIO', null, AHORA), { ok: true, empiezaEl: null });

  const pagando = fila({ plan: 'BASE', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(10) });
  const vigente = pre({ external_reference: referenciaDePlan('est-1', 'BASE') });
  assert.equal(decidirAlta(pagando, 'BASE', vigente, AHORA).ok, false);
  // El mismo plan, pero pasando a anual: otra suscripción, que empieza al terminar lo pagado.
  assert.deepEqual(decidirAlta(pagando, 'BASE', vigente, AHORA, 'anual'), { ok: true, empiezaEl: enDias(10) });
  const anual = pre({ external_reference: referenciaDePlan('est-1', 'BASE', 'anual'), auto_recurring: { frequency: 12, frequency_type: 'months' } });
  assert.equal(decidirAlta(pagando, 'BASE', anual, AHORA, 'anual').ok, false);
  assert.equal(decidirAlta(pagando, 'BASE', anual, AHORA, 'mensual').ok, true);
  assert.deepEqual(decidirAlta(pagando, 'ESTUDIO', vigente, AHORA), { ok: true, empiezaEl: enDias(10) });
  // Ya dada de baja en Mercado Pago pero con días pagados: la nueva empieza cuando se acaban, no cobra hoy otra vez.
  assert.deepEqual(decidirAlta(pagando, 'BASE', pre({ status: 'cancelled' }), AHORA), { ok: true, empiezaEl: enDias(10) });
  assert.deepEqual(decidirAlta(pagando, 'ESTUDIO', null, AHORA), { ok: true, empiezaEl: enDias(10) });
  // Lo pagado ya se acabó: cobra hoy.
  assert.deepEqual(decidirAlta({ ...pagando, current_period_end: enDias(-1) }, 'BASE', pre({ status: 'cancelled' }), AHORA), { ok: true, empiezaEl: null });
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
  // Anual: cada 12 meses, y lo dice la referencia y el motivo.
  const a = cuerpoPreapproval({
    studioId: 'est-1', plan: 'ESTUDIO', intervalo: 'anual', nombrePlan: 'Estudio', importe: 790000, moneda: 'ARS',
    email: 'duena@example.com', backUrl: 'u', empiezaEl: null,
  });
  assert.equal(a.external_reference, 'centra:plan:est-1:ESTUDIO:anual');
  assert.equal(a.reason, 'Centra · Estudio (anual)');
  assert.deepEqual(a.auto_recurring, { frequency: 12, frequency_type: 'months', transaction_amount: 790000, currency_id: 'ARS' });
  assert.equal(intervaloDe(a), 'anual');
  assert.equal(intervaloDe(c), 'mensual');
  assert.equal(intervaloDe(null), 'mensual');
  // Cadena: la referencia es de la cadena.
  const cad = cuerpoPreapproval({ studioId: 'cadena-1', plan: 'CADENA', nombrePlan: 'Cadena', importe: 1, moneda: 'ARS', email: 'a@example.com', backUrl: 'u', empiezaEl: null });
  assert.equal(cad.external_reference, 'centra:cadena:cadena-1');
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

test('la vieja que no se pudo cancelar no le quita el relevo a la nueva', () => {
  // Cambio de plan: la nueva (abc123) ya está en la fila y la baja de la vieja falló.
  const f = fila({ plan: 'ESTUDIO', subscription_status: 'active', subscription_id: 'mp:abc123' });
  const nueva = pre({ date_created: '2026-11-20T10:00:00.000Z' });
  const vieja = pre({ id: 'vieja1', date_created: '2026-10-01T10:00:00.000Z' });
  const d = decidirPorSuscripcion(f, vieja, AHORA, nueva);
  assert.equal(d.aplicar, false);
  assert.ok(!d.aplicar && d.cancelar === 'vieja1' && d.motivo === 'anterior-sin-cancelar');
  // Al revés (la de la fila es la vieja): la nueva toma el relevo y cancela la vieja, como siempre.
  const g = fila({ subscription_status: 'active', subscription_id: 'mp:vieja1' });
  const r = decidirPorSuscripcion(g, nueva, AHORA, vieja);
  assert.ok(r.aplicar && r.cancelarAnterior === 'vieja1' && r.cambios.subscription_id === 'mp:abc123');
  // Sin fechas no se adivina: no se toca la fila.
  const sinFecha = decidirPorSuscripcion(f, pre({ id: 'vieja1' }), AHORA, pre());
  assert.ok(!sinFecha.aplicar && sinFecha.motivo === 'dos-autorizadas-sin-fecha' && !sinFecha.cancelar);
  // Si la de la fila ya está cancelada, la autorizada toma el relevo (vuelve tras una baja).
  const tras = decidirPorSuscripcion(f, vieja, AHORA, pre({ status: 'cancelled', date_created: '2026-11-20T10:00:00.000Z' }));
  assert.ok(tras.aplicar && tras.cambios.subscription_id === 'mp:vieja1');
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

test('cambio de plan: el plan nuevo entra cuando empieza a cobrarse, no al autorizarse', () => {
  const pagando = fila({ plan: 'BASE', subscription_status: 'active', subscription_id: 'mp:vieja1', current_period_end: enDias(10) });
  const nueva = pre({ next_payment_date: enDias(10), auto_recurring: { start_date: enDias(10) } });
  assert.equal(yaEmpezo(nueva, AHORA), false);
  // Al autorizarse: toma el relevo (y cancela la vieja), pero sigue con el plan que pagó.
  const d = decidirPorSuscripcion(pagando, nueva, AHORA);
  assert.ok(d.aplicar);
  assert.deepEqual(d.cambios, { plan: 'BASE', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(10) });
  assert.equal(d.cancelarAnterior, 'vieja1');
  // Releída antes de empezar: sigue igual.
  const relevada = fila({ plan: 'BASE', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(10) });
  const antes = decidirPorSuscripcion(relevada, nueva, AHORA);
  assert.ok(antes.aplicar && antes.cambios.plan === 'BASE');
  // Ya empezó (el primer cobro corrió la fecha): pasa al plan nuevo.
  const despues = new Date(AHORA.getTime() + 11 * DIA);
  const d2 = decidirPorSuscripcion(relevada, { ...nueva, next_payment_date: enDias(40) }, despues);
  assert.ok(d2.aplicar);
  assert.deepEqual(d2.cambios, { plan: 'ESTUDIO', current_period_end: enDias(40) });
});

test('sin fecha de inicio, o con la del alta, la suscripción ya empezó', () => {
  assert.equal(yaEmpezo(pre(), AHORA), true);
  assert.equal(yaEmpezo(pre({ auto_recurring: { start_date: AHORA.toISOString() } }), AHORA), true);
  assert.equal(yaEmpezo(pre({ auto_recurring: { start_date: new Date(AHORA.getTime() + 60_000).toISOString() } }), AHORA), true);
});

test('cadena: su suscripción se aplica a la fila de la cadena, no a una sede', () => {
  const cadena = fila({ id: 'cadena-1', plan: null, subscription_status: null, cadena_id: undefined });
  const p = pre({ external_reference: referenciaDeCadena('cadena-1') });
  const d = decidirPorSuscripcion(cadena, p, AHORA);
  assert.ok(d.aplicar);
  assert.deepEqual(d.cambios, { plan: 'CADENA', subscription_status: 'active', subscription_id: 'mp:abc123', current_period_end: enDias(30) });
  // La misma suscripción leída contra una sede (o contra otra cadena) no toca nada.
  assert.equal(decidirPorSuscripcion(fila({ id: 'est-1' }), p, AHORA).aplicar, false);
  assert.equal(decidirPorSuscripcion(fila({ id: 'cadena-2' }), p, AHORA).aplicar, false);
});
