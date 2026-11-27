import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facturarMensualidad, idReciboCentra, importeDelCobro, receptorDelEstudio, type Emisor } from './factura-centra.ts';
import type { PagoAutorizado, Preapproval } from './reglas.ts';

// Un cliente de Supabase falso: lo justo para lo que usa facturarMensualidad.
function clienteFalso(datos: { estudio?: { nombre: string } | null; arca?: { cuit: string; condicion: string } | null; errorUpsert?: string } = {}) {
  const upserts: Array<Record<string, unknown>> = [];
  const desde = (tabla: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: tabla === 'studios' ? (datos.estudio ?? null) : (datos.arca ?? null), error: null }),
      }),
    }),
    upsert: async (fila: Record<string, unknown>) => {
      upserts.push(fila);
      return { error: datos.errorUpsert ? { message: datos.errorUpsert } : null };
    },
  });
  return { cliente: { from: desde } as never, upserts };
}

const pago = (status = 'approved', extra: Record<string, unknown> = {}): PagoAutorizado =>
  ({ id: 7012345678, preapproval_id: 'pre1', status: 'processed', payment: { id: 1, status }, ...extra }) as PagoAutorizado;
const pre: Preapproval = { id: 'pre1', status: 'authorized', reason: 'Centra · Plan Estudio', auto_recurring: { transaction_amount: 79000 } };
const ENV = { CENTRA_FACTURACION_ESTUDIO_ID: 'est-centra' };

test('sin CENTRA_FACTURACION_ESTUDIO_ID no hace nada', async () => {
  const { cliente, upserts } = clienteFalso();
  const emitir: Emisor = async () => { throw new Error('no debería emitir'); };
  const r = await facturarMensualidad(cliente, { pago: pago(), preapproval: pre, studioId: 'e1', fetch: fetch as never, emitir, env: {} });
  assert.deepEqual(r, { tipo: 'apagado' });
  assert.equal(upserts.length, 0);
});

test('un cobro rechazado no se factura', async () => {
  const { cliente, upserts } = clienteFalso();
  const r = await facturarMensualidad(cliente, { pago: pago('rejected'), preapproval: pre, studioId: 'e1', fetch: fetch as never, emitir: async () => ({ ok: false, error: 'x' }), env: ENV });
  assert.equal(r.tipo, 'no-corresponde');
  assert.equal(upserts.length, 0);
});

test('un cobro aprobado crea el recibo en el estudio de Centra y emite a un monotributista con su CUIT', async () => {
  const { cliente, upserts } = clienteFalso({ estudio: { nombre: 'Pilates Sur' }, arca: { cuit: '20111111112', condicion: 'MONOTRIBUTO' } });
  let pedido: Parameters<Emisor>[1] | null = null;
  const emitir: Emisor = async (_a, p) => { pedido = p; return { ok: true, comprobante: { numero: 12 } }; };
  const r = await facturarMensualidad(cliente, { pago: pago(), preapproval: pre, studioId: 'e1', fetch: fetch as never, emitir, env: ENV });
  assert.deepEqual(r, { tipo: 'emitida', reciboId: 'rec-centra-mp-7012345678', numero: 12 });
  assert.equal(upserts[0].studio_id, 'est-centra');
  assert.equal(upserts[0].importe, 79000);
  assert.equal(upserts[0].estado, 'COBRADO');
  assert.equal(upserts[0].metodo_cobro, 'MERCADOPAGO');
  assert.match(String(upserts[0].concepto), /Plan Estudio · Pilates Sur/);
  assert.deepEqual(pedido!.receptor, { documento: '20111111112', condicionIva: 6, nombre: 'Pilates Sur' });
  assert.equal(pedido!.studioId, 'est-centra');
});

test('si ARCA falla, queda el recibo y se dice por qué (no lanza)', async () => {
  const { cliente } = clienteFalso();
  const r = await facturarMensualidad(cliente, { pago: pago(), preapproval: pre, studioId: 'e1', fetch: fetch as never, emitir: async () => { throw new Error('ARCA caída'); }, env: ENV });
  assert.deepEqual(r, { tipo: 'sin-factura', reciboId: 'rec-centra-mp-7012345678', error: 'ARCA caída' });
});

test('el estudio de Centra no se factura a sí mismo', async () => {
  const { cliente } = clienteFalso();
  const r = await facturarMensualidad(cliente, { pago: pago(), preapproval: pre, studioId: 'est-centra', fetch: fetch as never, emitir: async () => ({ ok: false, error: 'x' }), env: ENV });
  assert.equal(r.tipo, 'no-corresponde');
});

test('receptor: sin ARCA configurada es consumidor final; RI con CUIT es 1', () => {
  assert.deepEqual(receptorDelEstudio('X', null), { documento: null, condicionIva: 5, nombre: 'X' });
  assert.equal(receptorDelEstudio('X', { cuit: '30', condicion: 'RESPONSABLE_INSCRIPTO' }).condicionIva, 1);
});

test('importe: el del cobro si viene, si no el de la suscripción; id de recibo estable', () => {
  assert.equal(importeDelCobro(pago('approved', { transaction_amount: 29000 }), pre), 29000);
  assert.equal(importeDelCobro(pago(), pre), 79000);
  assert.equal(importeDelCobro(pago(), null), null);
  assert.equal(idReciboCentra('70-12'), 'rec-centra-mp-7012');
});
