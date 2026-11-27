import { LEGAL } from '@/lib/legal-info';

// El aviso legal con el formato de Argentina (es-AR). La versión de España (LSSI-CE) sigue en page.tsx: se
// elige con FUNCIONES_DE_ESPANA, igual que el resto de lo que es solo de un país, para poder seguir trayendo
// cambios del original sin conflictos. Es un texto de base: conviene que lo revise un abogado.
export function AvisoLegalArgentina() {
  return (
    <>
      <h1>Aviso legal</h1>
      <p className="lead">
        Quién está detrás de {LEGAL.marca} y en qué condiciones se puede usar este sitio.
      </p>

      <h2>1. Datos del titular</h2>
      <p>
        El sitio <strong>{LEGAL.dominio}</strong> y el servicio <strong>{LEGAL.marca}</strong> son de:
      </p>
      <ul>
        <li><strong>Titular:</strong> {LEGAL.titular}</li>
        {LEGAL.nif && <li><strong>CUIT:</strong> {LEGAL.nif}</li>}
        <li><strong>Domicilio:</strong> {LEGAL.domicilio}, Argentina</li>
        <li><strong>Correo de contacto:</strong> <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
      </ul>

      <h2>2. Qué es {LEGAL.marca}</h2>
      <p>
        {LEGAL.marca} es un software como servicio (SaaS) para estudios de Pilates y actividades afines: reservas,
        alumnas, cobros, calendario, equipo y el resto de la operación del estudio. Este aviso regula el acceso y el
        uso del sitio. La contratación del servicio se rige por los <a href="/terminos">Términos y condiciones</a>.
      </p>

      <h2>3. Acceso y uso</h2>
      <p>
        Entrar al sitio es gratis, salvo el costo de tu conexión. Para usar la plataforma hay que registrarse y
        aceptar los Términos y condiciones. Te comprometés a usarla de buena fe, conforme a la ley y a este aviso, y a
        no usarla con fines ilícitos ni de forma que pueda dañar, sobrecargar o inutilizar el sitio.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Los textos, el código, los diseños, los logotipos, la marca y las imágenes del sitio son de {LEGAL.marca} o de
        terceros que autorizaron su uso, y están protegidos por la Ley 11.723 de Propiedad Intelectual y por la Ley
        22.362 de Marcas. No se pueden reproducir, distribuir ni modificar sin autorización, salvo los usos que la
        ley permite.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        Procuramos que el sitio funcione y esté al día, pero no garantizamos que esté disponible sin interrupciones ni
        que no tenga errores. En la medida en que la ley lo permite, {LEGAL.marca} no responde por los daños que
        causen una caída temporal, un fallo técnico o el mal uso del servicio por parte de terceros. Nada de esto
        limita los derechos que te da la Ley 24.240 de Defensa del Consumidor cuando sos consumidor.
      </p>

      <h2>6. Enlaces a otros sitios</h2>
      <p>
        El sitio puede tener enlaces a sitios de terceros. {LEGAL.marca} no responde por sus contenidos ni por sus
        políticas.
      </p>

      <h2>7. Datos personales</h2>
      <p>
        Los datos personales se tratan según la Ley 25.326 de Protección de los Datos Personales, como se explica en
        la <a href="/privacidad">Política de privacidad</a> y en la <a href="/cookies">Política de cookies</a>.
      </p>

      <h2>8. Botón de arrepentimiento</h2>
      <p>
        Si contrataste {LEGAL.marca} como consumidor, podés revocar la contratación dentro de los 10 días corridos
        desde que la hiciste, sin costo ni explicación (art. 34 de la Ley 24.240 y Resolución 424/2020). Cómo
        hacerlo está en <a href="/terminos#arrepentimiento">Términos y condiciones, punto 4</a>.
      </p>

      <h2>9. Ley aplicable y jurisdicción</h2>
      <p>
        Este aviso se rige por las leyes de la República Argentina. Para cualquier controversia son competentes los
        tribunales ordinarios de la provincia de Neuquén, salvo que seas consumidor: en ese caso, los de tu domicilio.
      </p>
    </>
  );
}
