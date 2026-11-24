// Isotipo de Centra: una figura en postura de Pilates (pierna arriba, espalda
// enrollada, la otra pierna extendida) hecha con cuatro franjas paralelas.
// Cada franja es un relleno (no un trazo) para que el componente del logo la
// pinte con su color por custom property. Puro: devuelve los `d` de las cuatro.

const COLORES = ['#E8843C', '#5B4A22', '#7DB5A8', '#8C3B2E']; // naranja, oliva, verde agua, bordó (de izquierda a derecha)
export { COLORES };

const bez = (p0, p1, p2, p3) => (t) => {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]);
};

// La línea central de la figura, como cadena de cúbicas (de la punta del pie de
// arriba, bajando por la pierna y la espalda, hasta la nuca).
const CUERPO = [
  [[60, 9], [58, 32], [80, 50], [80, 76]],
  [[80, 76], [82, 96], [70, 104], [60, 102]],
  [[60, 102], [51, 100], [48, 93], [52, 88]],
];
// La pierna extendida, desde la cadera hacia abajo a la izquierda.
const PIERNA = [
  [[74, 88], [60, 82], [38, 87], [10, 97]],
];

function muestras(cadena, n = 60) {
  const pts = [];
  cadena.forEach((c, k) => {
    const f = bez(...c);
    for (let i = k ? 1 : 0; i <= n; i++) pts.push(f(i / n));
  });
  return pts;
}

function normales(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
}

const r = (n) => Math.round(n * 100) / 100;

/** Franjas de una cinta: `ancho` total, partido en `k` bandas, con las puntas afiladas. */
function franjas(cadena, ancho, k, afinar = [0.18, 0.12]) {
  const pts = muestras(cadena);
  const nor = normales(pts);
  const N = pts.length - 1;
  const perfil = (i) => {
    const t = i / N;
    const a = t < afinar[0] ? Math.sin((t / afinar[0]) * Math.PI / 2) : 1;
    const b = t > 1 - afinar[1] ? Math.sin(((1 - t) / afinar[1]) * Math.PI / 2) : 1;
    return Math.max(0.02, Math.min(a, b));
  };
  const borde = (j) => pts.map((p, i) => {
    const o = (j / k - 0.5) * ancho * perfil(i);
    return [p[0] + nor[i][0] * o, p[1] + nor[i][1] * o];
  });
  // Cada banda pisa un poco a la siguiente: sin eso, el suavizado del navegador
  // deja una línea blanca entre dos colores.
  const S = 0.06;
  return Array.from({ length: k }, (_, j) => {
    const ida = borde(Math.max(0, j - S)), vuelta = borde(Math.min(k, j + 1 + S)).reverse();
    return 'M' + [...ida, ...vuelta].map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'Z';
  });
}

export function figura() {
  const cuerpo = franjas(CUERPO, 21, 4, [0.32, 0.06]).reverse();
  const pierna = franjas(PIERNA, 13, 4, [0.02, 0.35]).reverse();
  // Una franja = mismo color en cuerpo y pierna (la pierna va debajo del cuerpo).
  return encaja(COLORES.map((_, i) => pierna[i] + cuerpo[i]));
}

// La caja del isotipo en components/marca/logo-tentare.tsx es '7 11 106 98' (y
// los encuadres horizontal y vertical salen de ella): la figura se escala y se
// centra ahí dentro, con un poco de aire, para no tener que tocar los encuadres.
const CAJA = { x: 7, y: 11, w: 106, h: 98, aire: 1.5 };

function encaja(trazos) {
  const nums = trazos.flatMap((t) => (t.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number));
  const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const e = Math.min((CAJA.w - 2 * CAJA.aire) / (x1 - x0), (CAJA.h - 2 * CAJA.aire) / (y1 - y0));
  const dx = CAJA.x + CAJA.w / 2 - e * (x0 + x1) / 2, dy = CAJA.y + CAJA.h / 2 - e * (y0 + y1) / 2;
  return trazos.map((t) => t.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,
    (_, x, y) => `${r(e * Number(x) + dx)} ${r(e * Number(y) + dy)}`));
}
