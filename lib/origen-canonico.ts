// El origen canónico de la app, SUELTO de lib/legal-info.ts a propósito.
//
// `canonicalizarOrigen` la usan los scripts que se sirven en las webs de los
// estudios (public/widget.js y compañía). Antes vivía en legal-info.ts y el
// compilador descartaba LEGAL porque eran solo literales; desde que LEGAL tiene
// los datos de dos titulares (`ES ? … : …`) ya no puede probar que no tiene
// efectos y se colaba entero, con el NIF, en el widget. Aquí no hay nada más:
// lo vigila scripts/build-widget-bundle.mjs.
// Autoalojado: el origen sale de NEXT_PUBLIC_APP_URL (sin barra final). Sin ella,
// el de Centra de siempre.
import { envPublica } from './env-publica.ts';

export const URL_CANONICA = (
  /* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_APP_URL) || 'https://www.tentare.app'
).replace(/\/+$/, '');
const hostDe = (url: string): string => new URL(url).host;
export const DOMINIO_CANONICO = /* @__PURE__ */ hostDe(URL_CANONICA);

// ⚠️ El apex (`tentare.app` a secas) redirige 308 al host canónico con www —
// ver el comentario de `dominio` en LEGAL (lib/legal-info.ts). Un <script> sigue redirects, pero un
// preflight CORS NO: el bundle embebible cargado desde el apex se pintaba y
// todas sus llamadas a la API morían en silencio (prueba de campo 2026-08-20).
// Vive aquí y no en el bundle porque este fichero es la fuente ÚNICA del
// origen (hay un test que prohíbe escribir el dominio a mano en otro sitio);
// el apex se DERIVA del canónico quitando el prefijo www, nunca se escribe.
export function canonicalizarOrigen(origen: string): string {
  const canonico = new URL(URL_CANONICA);
  const apex = canonico.hostname.replace(/^www\./, '');
  try {
    const u = new URL(origen);
    if (u.protocol === 'https:' && u.hostname === apex) return canonico.origin;
  } catch { /* origen raro: se devuelve tal cual */ }
  return origen;
}
