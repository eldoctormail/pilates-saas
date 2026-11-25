// Llamadas a la API de suscripciones de Mercado Pago (preapproval), con el
// Access Token de la cuenta de Centra. Mismo `pedir` que el resto de Mercado
// Pago: nunca lanza, devuelve { ok: false } con el motivo.
//
//   POST /preapproval                 crea la suscripción → init_point
//   GET  /preapproval/{id}            la suscripción, tal cual la tiene Mercado Pago
//   PUT  /preapproval/{id}            cancelarla (status: cancelled)
//   GET  /authorized_payments/{id}    un cobro mensual de una suscripción

import { pedir } from '../../mercadopago/api.ts';
import type { PagoAutorizado, Preapproval } from './reglas.ts';

const ID = /^[A-Za-z0-9]{1,64}$/;
const malId = () => Promise.resolve({ ok: false, status: 400, error: 'id no válido' } as const);

export function crearSuscripcion(token: string, cuerpo: unknown, idempotencia: string) {
  return pedir<Preapproval>(token, '/preapproval', { method: 'POST', body: JSON.stringify(cuerpo), idempotencia }, 15_000);
}

export function leerSuscripcion(token: string, id: string) {
  if (!ID.test(id)) return malId();
  return pedir<Preapproval>(token, `/preapproval/${id}`, { method: 'GET' });
}

export function cancelarSuscripcion(token: string, id: string) {
  if (!ID.test(id)) return malId();
  return pedir<Preapproval>(token, `/preapproval/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
}

export function leerPagoAutorizado(token: string, id: string) {
  if (!/^\d{1,20}$/.test(id)) return malId();
  return pedir<PagoAutorizado>(token, `/authorized_payments/${id}`, { method: 'GET' });
}
