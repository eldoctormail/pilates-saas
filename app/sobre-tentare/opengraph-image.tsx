import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, generarOgImage } from '@/lib/og-image';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

export const alt = 'Sobre Centra — software para estudios de Pilates y yoga';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  return generarOgImage('Sobre Centra.', `Software de gestión para estudios de Pilates y yoga, ${ES ? 'hecho en España' : 'para Argentina'}.`);
}
