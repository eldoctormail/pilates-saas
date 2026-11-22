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
