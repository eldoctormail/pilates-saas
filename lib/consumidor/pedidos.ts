// Botón de arrepentimiento y Botón de baja de servicio (Argentina, Disposición 954/2025).
// Puro: lo usan la página pública, el servidor, el panel y los tests.
//
//   · Se ven solo en un servidor propio en Argentina (`NEXT_PUBLIC_LOCALE` es-AR): en España la
//     norma es otra y el producto no cambia.
//   · Sin registrarse: nombre, email y lo que quiere. Teléfono, documento y detalle, si quiere.
//   · La constancia es un código (ARR-XXXXXX / BAJ-XXXXXX) que se enseña en el acto: la norma pide
//     confirmar «por el mismo medio» un código del pedido.
import { LOCALE } from '../locale.ts';
import { telefonoValido } from '../csv.ts';

export type TipoPedido = 'ARREPENTIMIENTO' | 'BAJA';

/** ¿Se enseñan los botones? Solo en Argentina. */
export function botonesConsumidorActivos(locale: string = LOCALE): boolean {
  return /^es-AR\b/i.test(locale);
}

/** Los nombres que exige la norma, tal cual: son los que tiene que ver la persona. */
export const NOMBRE_BOTON: Record<TipoPedido, string> = {
  ARREPENTIMIENTO: 'Botón de arrepentimiento',
  BAJA: 'Botón de baja de servicio',
};

/** El tramo de la URL de cada página: /reservar/<slug>/arrepentimiento y /reservar/<slug>/baja. */
export const RUTA_PEDIDO: Record<TipoPedido, string> = { ARREPENTIMIENTO: 'arrepentimiento', BAJA: 'baja' };

export function rutaPedido(slug: string, tipo: TipoPedido): string {
  return `/reservar/${encodeURIComponent(slug)}/${RUTA_PEDIDO[tipo]}`;
}

export const EXPLICACION: Record<TipoPedido, string> = {
  ARREPENTIMIENTO:
    'Si compraste a distancia (por la app, la web o por teléfono), podés revocar la compra dentro de los 10 días corridos desde que la hiciste, sin costo ni responsabilidad (art. 34 de la Ley 24.240 y art. 1110 del Código Civil y Comercial).',
  BAJA:
    'Podés dar de baja el plan o la suscripción que contrataste, sin más trámites. La baja rige para los períodos siguientes.',
};

// Sin 0/O ni 1/I: el código se dicta y se copia a mano.
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const PREFIJO: Record<TipoPedido, string> = { ARREPENTIMIENTO: 'ARR', BAJA: 'BAJ' };

/** `aleatorio` devuelve bytes; en producción, `crypto.getRandomValues`. */
export function nuevoCodigo(tipo: TipoPedido, aleatorio: (n: number) => Uint8Array = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n))): string {
  const b = aleatorio(6);
  let s = '';
  for (let i = 0; i < 6; i++) s += ALFABETO[b[i] % ALFABETO.length];
  return `${PREFIJO[tipo]}-${s}`;
}

export function esCodigoPedido(s: string): boolean {
  return /^(ARR|BAJ)-[2-9A-HJ-NP-Z]{6}$/.test(s);
}

const EMAIL = /^[^\s@%_]+@[^\s@%_]+\.[^\s@%_]+$/;
const texto = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  return t ? t.slice(0, max) : null;
};

export interface PedidoLeido {
  slug: string;
  tipo: TipoPedido;
  nombre: string;
  email: string;
  telefono: string | null;
  documento: string | null;
  detalle: string | null;
}

export function leerPedido(b: Record<string, unknown>): { ok: true; pedido: PedidoLeido } | { ok: false; error: string } {
  const slug = typeof b.slug === 'string' ? b.slug.trim().toLowerCase() : '';
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { ok: false, error: 'Estudio no válido' };
  const tipo = b.tipo === 'ARREPENTIMIENTO' || b.tipo === 'BAJA' ? b.tipo : null;
  if (!tipo) return { ok: false, error: 'Tipo de pedido no válido' };
  const nombre = texto(b.nombre, 120);
  if (!nombre) return { ok: false, error: 'Escribí tu nombre y apellido.' };
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!email || email.length > 200 || !EMAIL.test(email)) return { ok: false, error: 'Revisá el email.' };
  const tel = texto(b.telefono, 32);
  const doc = texto(b.documento, 20);
  return {
    ok: true,
    pedido: {
      slug, tipo, nombre, email,
      // El teléfono que no tenga forma no frena el pedido: no es obligatorio.
      telefono: tel && telefonoValido(tel) ? tel : null,
      documento: doc && /^[0-9.\- ]{6,20}$/.test(doc) ? doc.replace(/[.\- ]/g, '') : null,
      detalle: texto(b.detalle, 1000),
    },
  };
}

/** Lo que se le dice a la persona en la pantalla de constancia. */
export function textoConstancia(tipo: TipoPedido, codigo: string, nombreEstudio: string): string {
  const que = tipo === 'ARREPENTIMIENTO' ? 'revocar tu compra' : 'dar de baja tu servicio';
  return `Recibimos tu pedido para ${que} en ${nombreEstudio}. Tu código de constancia es ${codigo}: guardalo, sirve como prueba de que lo pediste y de cuándo.`;
}
