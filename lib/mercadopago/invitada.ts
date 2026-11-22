// Comprar sin cuenta (invitada) con Mercado Pago: qué se acepta del formulario.
// Puro: lo usan el checkout y los tests. Mismos criterios que
// `/api/public/checkout-embebido` (la puerta de Stripe):
//
//   · El email decide a qué ficha va lo comprado, así que se valida en serio y
//     sin `%` ni `_` (en PostgREST son comodines de `ilike`). Se normaliza una vez.
//   · El nombre es obligatorio: con él nace la ficha.
//   · El teléfono es un dato de contacto: si no encaja, no viaja, pero no frena.
//   · Lo demás (origen del enlace, sesión del widget, «información adicional»)
//     solo se guarda si tiene forma; si no, se descarta.
import { telefonoValido } from '../csv.ts';

export const EMAIL_INVITADA = /^[^\s@%_]+@[^\s@%_]+\.[^\s@%_]+$/;
const ORIGEN_VALIDO = /^[A-Za-z0-9_-]{1,40}$/;
const SESION_WIDGET = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export interface DatosInvitada {
  email: string;
  nombre: string;
  telefono: string | null;
  origenLead: string | null;
  widgetSesion: string | null;
  datosAdicionales: { genero: string | null; comoConociste: string | null; codigoPostal: string | null; fechaNacimiento: string | null };
}

const texto = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return t && t.length <= max ? t : null;
};

export function leerDatosInvitada(b: Record<string, unknown>):
  { ok: true; datos: DatosInvitada } | { ok: false; error: string } {
  const emailCrudo = typeof b.socioEmail === 'string' ? b.socioEmail.trim() : '';
  if (!emailCrudo || emailCrudo.length > 200 || !EMAIL_INVITADA.test(emailCrudo)) return { ok: false, error: 'Email no válido' };
  const nombre = texto(b.socioNombre, 120);
  if (!nombre) return { ok: false, error: 'Escribe tu nombre y apellido.' };
  const tel = texto(b.socioTelefono, 32);
  const fecha = texto(b.fechaNacimiento, 10);
  return {
    ok: true,
    datos: {
      email: emailCrudo.toLowerCase(),
      nombre,
      telefono: tel && telefonoValido(tel) ? tel : null,
      origenLead: typeof b.origenLead === 'string' && ORIGEN_VALIDO.test(b.origenLead) ? b.origenLead : null,
      widgetSesion: typeof b.widgetSesion === 'string' && SESION_WIDGET.test(b.widgetSesion) ? b.widgetSesion : null,
      datosAdicionales: {
        genero: texto(b.genero, 40),
        comoConociste: texto(b.comoConociste, 120),
        codigoPostal: texto(b.codigoPostal, 12),
        fechaNacimiento: fecha && FECHA_ISO.test(fecha) && !Number.isNaN(Date.parse(fecha)) ? fecha : null,
      },
    },
  };
}
