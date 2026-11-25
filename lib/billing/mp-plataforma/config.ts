// La cuenta de Mercado Pago de CENTRA (la plataforma), con la que se cobra la
// mensualidad a cada estudio. No es la cuenta de un estudio: con esa cobran
// ellos a sus alumnas (lib/mercadopago/config.ts y cuenta.ts).
//
//   MP_PLATAFORMA_ACCESS_TOKEN   Access Token de la aplicación de Centra
//                                (APP_USR-… en producción, TEST-… en pruebas).
//   MP_PLATAFORMA_WEBHOOK_SECRET Clave secreta de los Webhooks de esa
//                                aplicación. Sin ella no se acepta ningún aviso.
//
// Sin las dos, el cobro a estudios con Mercado Pago queda apagado: /suscripcion
// no ofrece pagar y /api/billing/status no cierra ningún panel.

export type ConfigMpPlataforma =
  | { ok: true; accessToken: string; webhookSecret: string; dePrueba: boolean }
  | { ok: false; motivo: string };

export function configMpPlataforma(env: Record<string, string | undefined> = process.env): ConfigMpPlataforma {
  const accessToken = env.MP_PLATAFORMA_ACCESS_TOKEN?.trim() ?? '';
  const webhookSecret = env.MP_PLATAFORMA_WEBHOOK_SECRET?.trim() ?? '';
  if (!accessToken) return { ok: false, motivo: 'Falta MP_PLATAFORMA_ACCESS_TOKEN.' };
  if (!/^(APP_USR|TEST)-/.test(accessToken)) {
    return { ok: false, motivo: 'MP_PLATAFORMA_ACCESS_TOKEN no tiene forma de Access Token (APP_USR-… o TEST-…).' };
  }
  if (!webhookSecret) return { ok: false, motivo: 'Falta MP_PLATAFORMA_WEBHOOK_SECRET: sin ella no se pueden confirmar las suscripciones.' };
  return { ok: true, accessToken, webhookSecret, dePrueba: accessToken.startsWith('TEST-') };
}

export function mpPlataformaLista(env: Record<string, string | undefined> = process.env): boolean {
  return configMpPlataforma(env).ok;
}
