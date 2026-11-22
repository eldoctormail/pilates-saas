// Llamadas a la API REST de Mercado Pago (sin SDK: dos endpoints).
//
//   POST /checkout/preferences   crea el pago de Checkout Pro → init_point
//   GET  /v1/payments/{id}       el pago, tal cual lo tiene Mercado Pago
//
// Nunca lanza: devuelve { ok: false } con el motivo, y quien llama decide.

import { API_MERCADOPAGO } from './config.ts';

export interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface Preferencia {
  items: ItemPreferencia[];
  external_reference: string;
  back_urls: { success: string; failure: string; pending: string };
  auto_return?: 'approved' | 'all';
  notification_url?: string;
  statement_descriptor?: string;
  payer?: { email?: string };
  metadata?: Record<string, string>;
  /** Sin pagos en efectivo de cupón (Rapipago/Pago Fácil): tardan días y el recibo quedaría en el aire. */
  payment_methods?: { excluded_payment_types?: { id: string }[]; installments?: number };
  expires?: boolean;
  expiration_date_to?: string;
}

export interface PagoMercadoPago {
  id: number;
  status: string; // approved | pending | in_process | rejected | cancelled | refunded | charged_back | authorized
  status_detail?: string;
  transaction_amount: number;
  /** Lo devuelto hasta ahora (acumulado), en la unidad de la moneda. */
  transaction_amount_refunded?: number;
  currency_id: string;
  external_reference: string | null;
  date_approved?: string | null;
  payment_type_id?: string;
  payment_method_id?: string;
  payer?: { email?: string | null };
  live_mode?: boolean;
}

type Resultado<T> = { ok: true; datos: T } | { ok: false; status: number; error: string };

async function pedir<T>(
  token: string, ruta: string, init: RequestInit & { idempotencia?: string } = {}, timeoutMs = 10_000,
): Promise<Resultado<T>> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_MERCADOPAGO}${ruta}`, {
      ...init,
      signal: ctl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.idempotencia ? { 'X-Idempotency-Key': init.idempotencia } : {}),
        ...(init.headers ?? {}),
      },
    });
    const cuerpo = await res.json().catch(() => null) as (T & { message?: string }) | null;
    if (!res.ok || !cuerpo) return { ok: false, status: res.status, error: cuerpo?.message ?? `HTTP ${res.status}` };
    return { ok: true, datos: cuerpo };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

export function crearPreferencia(token: string, p: Preferencia, idempotencia: string) {
  return pedir<{ id: string; init_point: string; sandbox_init_point?: string }>(
    token, '/checkout/preferences', { method: 'POST', body: JSON.stringify(p), idempotencia },
  );
}

export function leerPago(token: string, paymentId: string) {
  if (!/^\d{1,20}$/.test(paymentId)) {
    return Promise.resolve({ ok: false, status: 400, error: 'id de pago no válido' } as const);
  }
  return pedir<PagoMercadoPago>(token, `/v1/payments/${paymentId}`, { method: 'GET' });
}

export interface PaginaPagos {
  results: PagoMercadoPago[];
  paging: { total: number; limit: number; offset: number };
}

/**
 * Pagos de la cuenta creados entre dos instantes, del más nuevo al más viejo.
 * `GET /v1/payments/search` con rango por `date_created`; la API pagina con
 * `limit` (máx. 100) y `offset`.
 */
export function buscarPagos(token: string, p: { desde: Date; hasta: Date; offset: number; limit?: number }) {
  const q = new URLSearchParams({
    sort: 'date_created',
    criteria: 'desc',
    range: 'date_created',
    begin_date: p.desde.toISOString(),
    end_date: p.hasta.toISOString(),
    limit: String(Math.min(100, Math.max(1, p.limit ?? 100))),
    offset: String(Math.max(0, p.offset)),
  });
  return pedir<PaginaPagos>(token, `/v1/payments/search?${q.toString()}`, { method: 'GET' }, 15_000);
}

export interface ReembolsoMercadoPago {
  id: number;
  payment_id: number;
  amount: number;
  status: string; // approved | in_process | rejected | cancelled
}

/**
 * Devuelve un pago: total sin `importe`, parcial con él. `idempotencia` hace que
 * un doble clic no devuelva dos veces (Mercado Pago contesta lo mismo).
 */
export function devolverPago(token: string, paymentId: string, idempotencia: string, importe?: number) {
  if (!/^\d{1,20}$/.test(paymentId)) {
    return Promise.resolve({ ok: false, status: 400, error: 'id de pago no válido' } as const);
  }
  return pedir<ReembolsoMercadoPago>(token, `/v1/payments/${paymentId}/refunds`, {
    method: 'POST', body: JSON.stringify(importe ? { amount: importe } : {}), idempotencia,
  }, 20_000);
}
