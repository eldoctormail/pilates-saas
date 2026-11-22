// Configuración de Mercado Pago (autoalojado: una sola cuenta, la del estudio).
//
//   MERCADOPAGO_ACCESS_TOKEN   Access Token de la cuenta (APP_USR-… en
//                              producción, TEST-… en pruebas). Solo servidor.
//   MERCADOPAGO_WEBHOOK_SECRET Clave secreta de la sección Webhooks de la
//                              aplicación. Sin ella NO se acepta ningún aviso:
//                              un aviso sin firma comprobada no mueve dinero.
//   NEXT_PUBLIC_PASARELA       'mercadopago' para que la app de la alumna pague
//                              con Mercado Pago en vez de Stripe.
//
// Lo que sí se puede leer en el navegador es solo NEXT_PUBLIC_PASARELA.

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
  return (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PASARELA : undefined) === 'mercadopago';
}

/**
 * ¿El estudio cobra online? Con su cuenta de Stripe conectada (Tentare SaaS) o,
 * autoalojado, con Mercado Pago configurado en el servidor. Solo servidor: lee
 * el Access Token.
 */
export function cobraOnline(stripeAccountId: string | null | undefined, env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(stripeAccountId) || configMercadoPago(env).ok;
}
