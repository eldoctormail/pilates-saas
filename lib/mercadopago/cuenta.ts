// La cuenta de Mercado Pago de cada estudio (autoalojado).
//
// De dónde sale el Access Token y la clave del webhook:
//   1. Lo que la propietaria cargó en el panel (`mercadopago_config`, cifrado).
//   2. Si no cargó nada, el .env del servidor (MERCADOPAGO_ACCESS_TOKEN y
//      MERCADOPAGO_WEBHOOK_SECRET), como antes: una cuenta para la instalación.
//
// ⚠️ Una cuenta del panel cobra SOLO lo de su estudio: el webhook y el
// conciliador descartan un pago de esa cuenta cuya referencia sea de otro
// estudio (si no, un estudio podría dar por cobrado el recibo de otro con
// dinero que entró en su propia cuenta). La del .env, como siempre, vale para
// los estudios que no tienen la suya.
//
// Sin `server-only`: lo importan solo rutas de servidor, y así se prueba con
// `node --test` (cuenta.test.ts).

import type { SupabaseClient } from '@supabase/supabase-js';
import { clavesDelEntorno, cifrarCredencial, descifrarCredencial } from '../integraciones/cifrado-credenciales.ts';
import { configMercadoPago, type ConfigMercadoPago } from './config.ts';
import { leerUsuario } from './api.ts';

export type Origen = 'panel' | 'servidor';

/** Una cuenta lista para usar. `studioId` null = la del .env (sin estudio propio). */
export interface CuentaMercadoPago {
  studioId: string | null;
  accessToken: string;
  webhookSecret: string;
  origen: Origen;
}

export class MercadoPagoNoDisponible extends Error {}

const contexto = (studioId: string, campo: string) => `mercadopago:${studioId}:${campo}`;

interface Fila {
  studio_id: string;
  access_token: string;
  webhook_secret: string;
  cuenta_id: string;
  cuenta_nombre: string | null;
  sitio: string | null;
  token_final: string;
  de_prueba: boolean;
  actualizado_en: string;
}

const COLUMNAS = 'studio_id, access_token, webhook_secret, cuenta_id, cuenta_nombre, sitio, token_final, de_prueba, actualizado_en';

function descifrar(studioId: string, campo: string, valor: string): string {
  const r = descifrarCredencial(valor, contexto(studioId, campo), clavesDelEntorno());
  if (!r.ok) throw new MercadoPagoNoDisponible('No se pudo descifrar la cuenta de Mercado Pago (¿cambió INTEGRACIONES_CLAVE_CIFRADO?).');
  return r.valor;
}

function desdeFila(f: Fila): CuentaMercadoPago {
  return {
    studioId: f.studio_id,
    accessToken: descifrar(f.studio_id, 'access_token', f.access_token),
    webhookSecret: descifrar(f.studio_id, 'webhook_secret', f.webhook_secret),
    origen: 'panel',
  };
}

function delEntorno(env: Record<string, string | undefined>): CuentaMercadoPago | null {
  const c = configMercadoPago(env);
  return c.ok ? { studioId: null, accessToken: c.accessToken, webhookSecret: c.webhookSecret, origen: 'servidor' } : null;
}

async function leerFila(admin: SupabaseClient, studioId: string): Promise<Fila | null> {
  const { data, error } = await admin.from('mercadopago_config').select(COLUMNAS).eq('studio_id', studioId).maybeSingle();
  if (error) throw error;
  return (data as Fila | null) ?? null;
}

/**
 * La cuenta con la que cobra un estudio, con la misma forma que `configMercadoPago`
 * (para cambiar lo mínimo en quien la usa).
 */
export async function configDelEstudio(
  admin: SupabaseClient, studioId: string, env: Record<string, string | undefined> = process.env,
): Promise<ConfigMercadoPago & { origen?: Origen }> {
  const fila = await leerFila(admin, studioId);
  if (fila) {
    const c = desdeFila(fila);
    return { ok: true, accessToken: c.accessToken, webhookSecret: c.webhookSecret, origen: 'panel' };
  }
  const env_ = configMercadoPago(env);
  return env_.ok ? { ...env_, origen: 'servidor' } : { ok: false, motivo: 'Mercado Pago no está configurado: cargá tu cuenta en Apps e integraciones › Mercado Pago.' };
}

/** ¿El estudio cobra con Mercado Pago? (no lanza: ante la duda, no) */
export async function estudioCobraConMercadoPago(admin: SupabaseClient, studioId: string): Promise<boolean> {
  try {
    return (await configDelEstudio(admin, studioId)).ok;
  } catch {
    return false;
  }
}

/** Todas las cuentas que pueden mandar avisos o tener pagos: las del panel y, si está, la del .env. */
export async function todasLasCuentas(
  admin: SupabaseClient, env: Record<string, string | undefined> = process.env,
): Promise<CuentaMercadoPago[]> {
  const { data, error } = await admin.from('mercadopago_config').select(COLUMNAS);
  if (error) throw error;
  const cuentas: CuentaMercadoPago[] = [];
  for (const f of (data ?? []) as Fila[]) {
    try { cuentas.push(desdeFila(f)); } catch { /* una que no se descifra no tumba a las demás */ }
  }
  const e = delEntorno(env);
  if (e) cuentas.push(e);
  return cuentas;
}

/**
 * ¿Puede esta cuenta aplicar un pago con referencia de `studioRef`? La del panel,
 * solo los de su estudio; la del .env, los de estudios sin cuenta propia.
 */
export function cuentaPuedeAplicar(cuenta: Pick<CuentaMercadoPago, 'studioId'>, studioRef: string, estudiosConCuenta: ReadonlySet<string>): boolean {
  if (cuenta.studioId !== null) return cuenta.studioId === studioRef;
  return !estudiosConCuenta.has(studioRef);
}

// ── Lo que ve y toca la propietaria ─────────────────────────────────────────

export interface CuentaPublica {
  configurada: boolean;
  origen: Origen | null;
  cuentaId: string | null;
  cuentaNombre: string | null;
  sitio: string | null;
  tokenFinal: string | null;
  dePrueba: boolean;
  actualizadoEn: string | null;
  webhookUrl: string | null;
}

/** Nunca el token ni la clave: solo lo que identifica la cuenta. */
export async function cuentaPublica(
  admin: SupabaseClient, studioId: string, env: Record<string, string | undefined> = process.env,
): Promise<CuentaPublica> {
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || null;
  const webhookUrl = base ? `${base}/api/mercadopago/webhook` : null;
  const f = await leerFila(admin, studioId);
  if (f) {
    return {
      configurada: true, origen: 'panel', cuentaId: f.cuenta_id, cuentaNombre: f.cuenta_nombre, sitio: f.sitio,
      tokenFinal: f.token_final, dePrueba: f.de_prueba, actualizadoEn: f.actualizado_en, webhookUrl,
    };
  }
  const e = configMercadoPago(env);
  return {
    configurada: e.ok, origen: e.ok ? 'servidor' : null, cuentaId: null, cuentaNombre: null, sitio: null,
    tokenFinal: e.ok ? e.accessToken.slice(-4) : null, dePrueba: e.ok && e.accessToken.startsWith('TEST-'),
    actualizadoEn: null, webhookUrl,
  };
}

export type ValidacionCuenta =
  | { ok: true; accessToken: string; webhookSecret: string }
  | { ok: false; error: string };

/** Forma de lo que pega la propietaria (sin llamar a nadie). */
export function validarCuenta(b: Record<string, unknown>): ValidacionCuenta {
  const accessToken = typeof b.accessToken === 'string' ? b.accessToken.trim() : '';
  const webhookSecret = typeof b.webhookSecret === 'string' ? b.webhookSecret.trim() : '';
  if (!/^(APP_USR|TEST)-[A-Za-z0-9-]{20,300}$/.test(accessToken)) {
    return { ok: false, error: 'El Access Token empieza con APP_USR- (o TEST-). Copialo entero de tu aplicación de Mercado Pago › Credenciales.' };
  }
  if (!/^[A-Za-z0-9]{16,200}$/.test(webhookSecret)) {
    return { ok: false, error: 'La clave secreta del webhook está en tu aplicación de Mercado Pago › Webhooks (letras y números, sin espacios).' };
  }
  return { ok: true, accessToken, webhookSecret };
}

type LeerUsuario = typeof leerUsuario;

/**
 * Guarda la cuenta tras comprobar con Mercado Pago que el token es bueno.
 * Devuelve un error que se le puede enseñar a la propietaria.
 */
export async function guardarCuenta(
  admin: SupabaseClient,
  p: { studioId: string; userId: string | null; accessToken: string; webhookSecret: string },
  leer: LeerUsuario = leerUsuario,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const claves = clavesDelEntorno();
  if (!claves.actual) {
    return { ok: false, status: 409, error: 'Falta INTEGRACIONES_CLAVE_CIFRADO en el servidor: sin ella no se guarda la cuenta (deploy/scripts/generar-secretos.sh).' };
  }
  const u = await leer(p.accessToken);
  if (!u.ok) {
    if (u.status === 401 || u.status === 403) return { ok: false, status: 400, error: 'Mercado Pago no reconoce ese Access Token. Revisá que esté entero y que sea de la aplicación correcta.' };
    return { ok: false, status: 502, error: 'Mercado Pago no contestó. Probá de nuevo en unos minutos.' };
  }
  const fila = {
    studio_id: p.studioId,
    access_token: cifrarCredencial(p.accessToken, contexto(p.studioId, 'access_token'), claves.actual),
    webhook_secret: cifrarCredencial(p.webhookSecret, contexto(p.studioId, 'webhook_secret'), claves.actual),
    cuenta_id: String(u.datos.id),
    cuenta_nombre: u.datos.nickname?.slice(0, 200) ?? null,
    sitio: u.datos.site_id && /^[A-Z]{3}$/.test(u.datos.site_id) ? u.datos.site_id : null,
    token_final: p.accessToken.slice(-4).replace(/[^A-Za-z0-9]/g, '0'),
    de_prueba: p.accessToken.startsWith('TEST-'),
    actualizado_en: new Date().toISOString(),
    actualizado_por: p.userId,
  };
  const { error } = await admin.from('mercadopago_config').upsert(fila, { onConflict: 'studio_id' });
  if (error) throw error;
  return { ok: true };
}

export async function quitarCuenta(admin: SupabaseClient, studioId: string): Promise<void> {
  const { error } = await admin.from('mercadopago_config').delete().eq('studio_id', studioId);
  if (error) throw error;
}
