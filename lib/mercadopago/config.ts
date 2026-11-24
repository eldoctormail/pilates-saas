// Configuración de Mercado Pago (autoalojado: una sola cuenta, la del estudio).
//
//   MERCADOPAGO_ACCESS_TOKEN   Access Token de la cuenta (APP_USR-… en
//                              producción, TEST-… en pruebas). Solo servidor.
//   MERCADOPAGO_WEBHOOK_SECRET Clave secreta de la sección Webhooks de la
//                              aplicación. Sin ella NO se acepta ningún aviso:
//                              un aviso sin firma comprobada no mueve dinero.
//
// Desde el 23-nov-2026 el token y la clave también se cargan desde el panel,
// por estudio (lib/mercadopago/cuenta.ts); estas dos variables quedan para un
// estudio que no cargó la suya.
//
// La pasarela no se elige: con el formato de Argentina (lib/locale.ts) es
// siempre Mercado Pago, porque Stripe no opera allí. Los caminos de Stripe solo
// quedan para el formato de España (los tests).

import { esArgentina } from '../locale.ts';

export const API_MERCADOPAGO = 'https://api.mercadopago.com';

export type ConfigMercadoPago =
  | { ok: true; accessToken: string; webhookSecret: string }
  | { ok: false; motivo: string };

export function configMercadoPago(env: Record<string, string | undefined> = process.env): ConfigMercadoPago {
  const accessToken = env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? '';
  const webhookSecret = env.MERCADOPAGO_WEBHOOK_SECRET?.trim() ?? '';
  if (!accessToken) return { ok: false, motivo: 'Falta MERCADOPAGO_ACCESS_TOKEN.' };
  if (!/^(APP_USR|TEST)-/.test(accessToken)) {
    return { ok: false, motivo: 'MERCADOPAGO_ACCESS_TOKEN no tiene forma de Access Token (APP_USR-… o TEST-…).' };
  }
  if (!webhookSecret) return { ok: false, motivo: 'Falta MERCADOPAGO_WEBHOOK_SECRET: sin ella no se pueden confirmar los pagos.' };
  return { ok: true, accessToken, webhookSecret };
}

/** ¿La app de la alumna paga con Mercado Pago? (se lee también en el navegador) */
export function pasarelaEsMercadoPago(): boolean {
  return esArgentina();
}
