// Comprobación de la firma de los avisos (webhooks) de Mercado Pago.
//
// Mercado Pago manda la cabecera `x-signature: ts=<ts>,v1=<hmac>` y
// `x-request-id`. El HMAC-SHA256 (hex) se calcula con la clave secreta de la
// sección Webhooks sobre el «manifiesto»:
//
//   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
//
// donde `data.id` sale del query string del aviso. Si falta un valor, su par se
// omite del manifiesto. Un `data.id` alfanumérico va en minúsculas.
//
// Además de la firma se mira la antigüedad: un aviso firmado de hace horas
// reenviado por un tercero no debería poder volver a dispararse (aunque el
// webhook es idempotente y siempre relee el pago en la API).

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface AvisoFirmado {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}

export type VeredictoFirma =
  | { ok: true; ts: number }
  | { ok: false; motivo: 'sin-cabecera' | 'cabecera-rara' | 'firma-no-coincide' | 'caducado' };

/** `ts=…,v1=…` → partes. Tolera espacios y el orden. */
export function leerCabeceraFirma(cabecera: string): { ts: string; v1: string } | null {
  let ts = '';
  let v1 = '';
  for (const parte of cabecera.split(',')) {
    const [clave, ...resto] = parte.split('=');
    const valor = resto.join('=').trim();
    if (clave?.trim() === 'ts') ts = valor;
    else if (clave?.trim() === 'v1') v1 = valor;
  }
  return ts && /^[0-9a-f]+$/i.test(v1) ? { ts, v1 } : null;
}

export function manifiestoDe(p: { dataId: string | null; xRequestId: string | null; ts: string }): string {
  let m = '';
  if (p.dataId) m += `id:${/^[a-z0-9]+$/i.test(p.dataId) ? p.dataId.toLowerCase() : p.dataId};`;
  if (p.xRequestId) m += `request-id:${p.xRequestId};`;
  m += `ts:${p.ts};`;
  return m;
}

/** ms del ts: Mercado Pago lo manda en segundos o en milisegundos según el producto. */
function tsEnMs(ts: string): number {
  const n = Number(ts);
  if (!Number.isFinite(n)) return NaN;
  return n < 1e12 ? n * 1000 : n;
}

export function verificarFirma(
  aviso: AvisoFirmado,
  secreto: string,
  opciones: { ahoraMs?: number; maxAntiguedadMs?: number } = {},
): VeredictoFirma {
  if (!aviso.xSignature) return { ok: false, motivo: 'sin-cabecera' };
  const partes = leerCabeceraFirma(aviso.xSignature);
  if (!partes) return { ok: false, motivo: 'cabecera-rara' };

  const esperado = createHmac('sha256', secreto)
    .update(manifiestoDe({ dataId: aviso.dataId, xRequestId: aviso.xRequestId, ts: partes.ts }))
    .digest('hex');
  const a = Buffer.from(esperado, 'hex');
  const b = Buffer.from(partes.v1.toLowerCase(), 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, motivo: 'firma-no-coincide' };

  const ms = tsEnMs(partes.ts);
  const ahora = opciones.ahoraMs ?? Date.now();
  const max = opciones.maxAntiguedadMs ?? 24 * 60 * 60 * 1000;
  if (!Number.isFinite(ms) || Math.abs(ahora - ms) > max) return { ok: false, motivo: 'caducado' };
  return { ok: true, ts: ms };
}
