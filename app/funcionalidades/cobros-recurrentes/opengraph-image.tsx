import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, generarOgImage } from '@/lib/og-image';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

export const alt = ES ? 'Cobros automáticos y SEPA para estudios de Pilates — Tentare' : 'Cobros con Mercado Pago para estudios de Pilates — Tentare';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  return generarOgImage('Cobra sin perseguir a nadie.', ES ? 'Tarjeta guardada, tres intentos escalonados y remesa SEPA 19.14.' : 'Mercado Pago desde la app, y efectivo, posnet y transferencia en el mostrador.');
}
