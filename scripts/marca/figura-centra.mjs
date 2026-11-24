// Isotipo de Centra: la figura en postura de Pilates que eligió Javier
// (docs/marca-centra/figura-original.jpg), hecha de cinco franjas de color con
// huecos blancos entre ellas. La vectoriza scripts/marca/vectorizar-figura.py,
// que deja en docs/marca-centra/figura.json un trazado por color, ya encajado
// en la caja del isotipo ('7 11 106 98').
import fs from 'node:fs';

const figuraJson = JSON.parse(fs.readFileSync(new URL('../../docs/marca-centra/figura.json', import.meta.url), 'utf8'));

/** naranja, oliva, verde agua, bordó y oliva claro: el orden de --marca-c1…c5. */
export const COLORES = figuraJson.COLORES;

export function figura() {
  return figuraJson.FRANJAS;
}
