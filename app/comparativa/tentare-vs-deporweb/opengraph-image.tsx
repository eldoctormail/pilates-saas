import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, generarOgImage } from '@/lib/og-image';

export const alt = 'Centra vs DeporWeb';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  return generarOgImage('Centra vs DeporWeb.', 'Precio, transparencia, reformer individual y sustitución de instructoras — comparados punto por punto.');
}
