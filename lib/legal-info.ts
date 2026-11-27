// ─────────────────────────────────────────────────────────────────────────────
// Datos legales del titular del sitio y servicios usados. FUENTE ÚNICA para las
// páginas públicas /legal, /privacidad, /terminos y /cookies.
//
// Titular = persona física (autónomo). Un autónomo NO tiene datos registrales
// (el Registro Mercantil es solo para sociedades), por eso ese campo no existe.
// El TEXTO legal de las páginas sigue siendo de plantilla y conviene que lo
// revise asesoría jurídica. Si en el futuro se constituye una S.L., actualizar
// titular/nif/domicilio y volver a añadir los datos registrales.
// ─────────────────────────────────────────────────────────────────────────────

// El origen canónico, suelto (ver `dominio` en LEGAL para el porqué del www).
// `canonicalizarOrigen` lo lee de aquí y no de LEGAL: la usan los scripts que
// se sirven en las webs de los estudios, y así no arrastran el resto del objeto.
// Autoalojado: el origen sale de NEXT_PUBLIC_APP_URL (sin barra final). Sin ella,
// el de Centra de siempre.
import { FUNCIONES_DE_ESPANA as ES } from './locale.ts';
import { envPublica } from './env-publica.ts';

const URL_CANONICA = (
  /* @__PURE__ */ envPublica(() => process.env.NEXT_PUBLIC_APP_URL) || 'https://www.tentare.app'
).replace(/\/+$/, '');
// `@__PURE__`: si un paquete (el widget) no usa LEGAL, el compilador puede
// descartarlo entero; con una llamada «con efectos» dentro, lo arrastraría.
const hostDe = (url: string): string => new URL(url).host;
const DOMINIO_CANONICO = /* @__PURE__ */ hostDe(URL_CANONICA);

// ── Titular y contacto de Centra en Argentina (es-AR) ─────────────────────────
// En este fork, con el formato de Argentina, la web y el panel NO pueden
// presentarse con los datos del titular del software original (su nombre, su
// NIF español, su domicilio, sus correos y su WhatsApp): sería decir que Centra
// es suya y mandarle a él los pedidos de demo y de soporte de los estudios.
// Los datos de abajo son los del titular de Centra. Un campo vacío no se
// inventa: el titular sale como «Centra» y el correo, como el de la dirección de
// la app (`hola@<dominio>`), hasta que se rellene.
export const TITULAR_ARGENTINA = {
  /** Nombre y apellido, o razón social. */
  titular: 'Javier Amigo',
  cuit: '23-32951555-9',
  /** Ciudad y provincia alcanzan. */
  domicilio: 'Plottier, Neuquén',
  /** Contacto general: pedidos de demo, la web, los correos de Centra. */
  email: 'centra@gmail.com',
  /** Privacidad (Ley 25.326). Vacío = el de contacto. */
  emailPrivacidad: '',
  /** A dónde llegan los pedidos de soporte de los estudios. Vacío = el de contacto. */
  emailSoporte: '',
  /** WhatsApp de soporte con prefijo, «+54 9 …». Vacío = sin botón de WhatsApp. */
  whatsapp: '+5492994707622',
};

const correoPorDefecto = (): string => {
  const host = DOMINIO_CANONICO.replace(/^www\./, '').replace(/:\d+$/, '');
  // Con una IP o un host de relleno no hay correo que valga: mejor uno a la vista que uno de otra persona.
  return /^[\d.]+$/.test(host) || host.endsWith('.invalid') ? 'hola@centra.invalid' : `hola@${host}`;
};
const AR_EMAIL = TITULAR_ARGENTINA.email || /* @__PURE__ */ correoPorDefecto();

export const LEGAL = {
  marca: 'Centra',
  // ⚠️ CON www, y no es un capricho de estilo.
  //
  // El host que sirve el sitio de verdad es `www.tentare.app`: el ápice
  // (`tentare.app`) devuelve un 308 hacia él, en los dos sentidos que importan
  // —la home y cualquier ruta interna—. Medido el 2026-08-11.
  //
  // Mientras esto decía `tentare.app` a secas, TODAS las páginas declaraban un
  // canonical que apuntaba a una URL que redirige. Google lo resuelve siguiendo
  // el 308, pero es exactamente la señal que un canonical existe para evitar: la
  // página se sirve en un sitio y dice ser otro.
  //
  // Si algún día se quita el redirect y el ápice pasa a servir directamente,
  // esto vuelve a `https://tentare.app` — y con ese cambio se mueve el sitio
  // entero, porque de aquí salen canonicals, sitemap, robots y JSON-LD.
  dominio: DOMINIO_CANONICO,
  url: URL_CANONICA,
  // Fecha de última revisión del contenido legal (no la de render).
  // ⚠️ Si cambia, cambia también `VERSION_TEXTOS_LEGALES` (abajo): es lo que se
  // guarda como aceptado en cada alta. Lo vigila lib/legal-info.test.ts.
  actualizado: '6 de octubre de 2026',

  // ── Identificación del titular (LSSI-CE art. 10) ────────────────────────────
  // Persona física (autónomo). Sin datos registrales (ver cabecera).
  // En Argentina, los de TITULAR_ARGENTINA (arriba).
  titular: ES ? 'Marcos Roca Rodríguez' : TITULAR_ARGENTINA.titular || 'Centra',
  nif: ES ? '27361301H' : TITULAR_ARGENTINA.cuit,
  /** Cómo se llama el número de identificación fiscal en el país del titular. */
  etiquetaNif: ES ? 'NIF' : 'CUIT',
  domicilio: ES ? 'Barcelona' : TITULAR_ARGENTINA.domicilio || 'Argentina',

  // ── Contacto ────────────────────────────────────────────────────────────────
  email: ES ? 'hola@tentare.app' : AR_EMAIL,
  emailPrivacidad: ES ? 'privacidad@tentare.app' : TITULAR_ARGENTINA.emailPrivacidad || AR_EMAIL,
  /** A dónde llegan los pedidos de soporte del panel, de Network y de la app nativa. */
  emailSoporte: ES ? 'soporte@tentare.app' : TITULAR_ARGENTINA.emailSoporte || AR_EMAIL,
  /** WhatsApp de soporte (con prefijo). Vacío = no hay WhatsApp de soporte y no se pinta el botón. */
  whatsappSoporte: ES ? '+34603556580' : TITULAR_ARGENTINA.whatsapp,
} as const;

// La versión de las condiciones de uso y la política de privacidad que acepta
// quien crea su estudio en el alta nueva (decisión del fundador del 21-oct-2026:
// se guarda la fecha y la versión aceptadas, en `altas_estudio.condiciones_version`
// y `condiciones_aceptadas_en`). Es la fecha de «Última actualización» que
// enseñan /terminos y /privacidad (`LEGAL.actualizado`, la pinta su layout), en
// ISO (AAAA-MM-DD) porque la base de datos la guarda con un formato fijo y
// descarta cualquier otra cosa.
//
// Es un literal y no se calcula a partir de `actualizado` a propósito: cambiar
// el texto legal es una decisión, y la versión aceptada tiene que cambiar con
// ella, no por un retoque de redacción de la fecha. Si las dos dejan de decir el
// mismo día, lib/legal-info.test.ts falla.
export const VERSION_TEXTOS_LEGALES = '2026-10-06';

// Encargados/subencargados del tratamiento realmente usados por el producto
// (RGPD art. 28). Se listan en la Política de Privacidad. Mantener en sync con
// las integraciones reales del código.
export const PROVEEDORES: { nombre: string; uso: string; ubicacion: string }[] = [
  { nombre: 'Supabase', uso: 'Base de datos, autenticación y almacenamiento', ubicacion: 'UE' },
  { nombre: 'Vercel', uso: 'Alojamiento y entrega de la aplicación', ubicacion: 'UE / EE. UU.' },
  ES
    ? { nombre: 'Stripe', uso: 'Procesamiento de pagos y facturación', ubicacion: 'UE / EE. UU.' }
    : { nombre: 'Mercado Pago', uso: 'Procesamiento de pagos', ubicacion: 'Argentina' },
  { nombre: 'Resend', uso: 'Envío de correos transaccionales', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Spacemail', uso: 'Correo saliente de Centra', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Cloudflare', uso: 'Copias de seguridad cifradas (R2, en la UE), archivos, vídeo (Stream) y verificación anti-bots (Turnstile)', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Sentry', uso: 'Monitorización de errores', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Inngest', uso: 'Ejecución de tareas y automatizaciones', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Anthropic', uso: 'Asistente de IA: redacción de mensajes, notas de sesión dictadas y análisis de ficheros importados', ubicacion: 'EE. UU.' },
  { nombre: 'PostHog', uso: 'Analítica de uso del producto y del sitio', ubicacion: 'UE' },
  { nombre: 'Ahrefs', uso: 'Analítica del sitio web público', ubicacion: 'Fuera de la UE' },
  { nombre: 'OpenStreetMap', uso: 'Mapas y ubicación aproximada en Centra Network', ubicacion: 'Reino Unido / UE' },
  // Sin Google Fonts: las letras se sirven desde el propio dominio (app/_fuentes).
  // Sin Gmail: se retiró el 1-oct-2026.
  { nombre: 'Google', uso: 'Inicio de sesión con Google e integración con Google Calendar, si la activas', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Meta (opcional)', uso: 'Píxel publicitario en la web comercial y en el alta, solo si aceptas sus cookies; y WhatsApp Business, si el estudio lo activa', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Klaviyo (opcional)', uso: 'Sincronización de audiencias de marketing, si el estudio lo activa', ubicacion: 'EE. UU.' },
  { nombre: 'Mailchimp (opcional)', uso: 'Sincronización de audiencias de marketing, si el estudio lo activa', ubicacion: 'EE. UU.' },
  { nombre: 'Kisi (opcional)', uso: 'Control de acceso, si el estudio lo activa', ubicacion: 'UE / EE. UU.' },
  { nombre: 'Zoom (opcional)', uso: 'Integración de videollamadas, si la activas', ubicacion: 'UE / EE. UU.' },
  // La API pública con OAuth (app/api/oauth/v1, app/api/v1): solo lo que el estudio autorice.
  { nombre: 'Zapier (opcional)', uso: 'Datos que el estudio autorice (clientas y reservas) hacia otras aplicaciones', ubicacion: 'EE. UU.' },
  // Vídeos que el estudio inserta en la app de sus alumnas (lib/portal-home-bloques.ts).
  { nombre: 'Vimeo (opcional)', uso: 'Vídeos que el estudio inserta en la app de sus alumnas', ubicacion: 'EE. UU.' },
  { nombre: 'YouTube, de Google (opcional)', uso: 'Vídeos que el estudio inserta en la app de sus alumnas', ubicacion: 'UE / EE. UU.' },
];

// ⚠️ El apex (`tentare.app` a secas) redirige 308 al host canónico con www —
// ver el comentario de `dominio` arriba. Un <script> sigue redirects, pero un
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
