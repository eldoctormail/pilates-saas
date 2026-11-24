import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, generarOgImage } from '@/lib/og-image';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

export const alt = 'Seguridad y privacidad — Centra';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  return generarOgImage('Seguridad y privacidad.', ES
    ? 'Datos aislados por estudio, base de datos en la UE y diseñado con el RGPD en mente. Sin permanencia.'
    : 'Datos aislados por estudio y diseñado con la Ley 25.326 en mente. Sin permanencia.');
}
