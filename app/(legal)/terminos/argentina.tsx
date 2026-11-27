import { LEGAL } from '@/lib/legal-info';

// Los términos con el formato de Argentina (es-AR). La versión de España sigue en page.tsx (FUNCIONES_DE_ESPANA).
// Es un texto de base: conviene que lo revise un abogado. El punto 4 lo enlazan el aviso legal y el pie de la web
// («Botón de arrepentimiento»): si cambia el número o el ancla, cambian también ellos.
export function TerminosArgentina() {
  return (
    <>
      <h1>Términos y condiciones</h1>
      <p className="lead">
        Las condiciones para contratar y usar {LEGAL.marca}. Al registrarte y usar el servicio, las aceptás.
      </p>

      <h2>1. Quién presta el servicio</h2>
      <p>
        {LEGAL.marca} es un software como servicio (SaaS) para que estudios de Pilates y actividades afines gestionen
        su operación: reservas, alumnas, cobros, calendario, equipo y funciones relacionadas. Lo presta{' '}
        {LEGAL.titular}{LEGAL.nif ? ` (CUIT ${LEGAL.nif})` : ''}, con domicilio en {LEGAL.domicilio}, Argentina. Contacto:{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>2. Cuenta y registro</h2>
      <p>
        Para usar el servicio tenés que crear una cuenta con datos verdaderos y cuidar tus credenciales. Sos
        responsable de lo que se haga con tu cuenta y de las personas de tu equipo a las que les des acceso. Para
        crear la cuenta de un estudio hay que ser mayor de edad.
      </p>

      <h2>3. Planes, precios y pagos</h2>
      <ul>
        <li>
          <strong>Precios.</strong> Los planes y sus precios, en pesos argentinos, son los publicados en{' '}
          <a href="/precios">Precios</a> al momento de contratar.
        </li>
        <li>
          <strong>Prueba y plan gratis.</strong> Podés probar {LEGAL.marca} sin tarjeta durante el período de prueba
          que se indica al registrarte, y usar el plan gratis con los límites publicados.
        </li>
        <li>
          <strong>Cobro.</strong> Los planes pagos se cobran por mes y por adelantado con una suscripción de Mercado
          Pago, que se renueva sola cada mes hasta que la des de baja.
        </li>
        <li>
          <strong>Factura.</strong> Por cada pago se emite la factura electrónica que corresponde, a través de ARCA.
        </li>
        <li>
          <strong>Cambios de precio.</strong> Si cambia el precio de tu plan, te avisamos por correo con al menos 30
          días de anticipación. Si no estás de acuerdo, podés darte de baja antes de que se aplique.
        </li>
        <li>
          <strong>Baja.</strong> No hay permanencia. Podés dar de baja la suscripción cuando quieras desde el panel,
          con el mismo medio que usaste para contratar. Seguís teniendo el plan hasta el final del mes ya pagado y no
          se vuelve a cobrar.
        </li>
      </ul>

      <h2 id="arrepentimiento">4. Botón de arrepentimiento</h2>
      <p>
        Si contrataste como consumidor (Ley 24.240), tenés derecho a revocar la contratación dentro de los{' '}
        <strong>10 días corridos</strong> desde que la hiciste, sin costo y sin dar explicaciones (art. 34 de la Ley
        24.240 y Resolución 424/2020 de la Secretaría de Comercio Interior). Para hacerlo, escribí a{' '}
        <a href={`mailto:${LEGAL.email}?subject=${encodeURIComponent('Botón de arrepentimiento')}`}>{LEGAL.email}</a>{' '}
        con el asunto «Botón de arrepentimiento» y el correo de tu cuenta. Te respondemos dentro de las 24 horas con un
        código de trámite, cancelamos la suscripción y te devolvemos lo que hayas pagado por el mismo medio de pago.
      </p>

      <h2>5. Uso aceptable</h2>
      <p>
        Te comprometés a no usar el servicio con fines ilícitos, a no afectar derechos de terceros, a no subir código
        malicioso y a no intentar entrar sin autorización a la plataforma ni a datos de otros estudios. Podemos
        suspender las cuentas que no cumplan estas condiciones, avisándote antes salvo que la urgencia o la ley lo
        impidan.
      </p>

      <h2>6. Los datos de tus alumnas</h2>
      <p>
        Los datos que cargás sobre tus alumnas son tuyos y son tu responsabilidad: vos sos el responsable de esa base
        de datos y {LEGAL.marca} los trata por tu cuenta, solo para prestarte el servicio, como prestador de servicios
        informatizados (art. 25 de la Ley 25.326). No los usamos para otra finalidad ni se los cedemos a nadie, y al
        terminar el servicio los suprimimos, salvo lo que la ley obligue a conservar. Te corresponde informar a tus
        alumnas, pedirles el consentimiento cuando haga falta (en particular, para los datos de salud, que son
        sensibles) e inscribir tu base de datos en el registro de la Agencia de Acceso a la Información Pública si
        corresponde. Más detalle en la <a href="/privacidad">Política de privacidad</a>.
      </p>
      <p>
        <strong>Moderación en la app de las alumnas.</strong> Para cumplir las condiciones de las tiendas de
        aplicaciones, la app de las alumnas tiene normas de la comunidad, un filtro de contenido y herramientas para
        denunciar y bloquear. Vos revisás desde tu panel las denuncias sobre tu contenido. Nos autorizás a acceder al
        contenido denunciado y a decidir sobre él solo cuando la denuncia es contra tu propio estudio o contra una
        persona con rol de propietaria, o cuando no la revisaste en 24 horas. Ese acceso se limita al contenido
        denunciado y a su contexto inmediato, y queda registrado. Las denuncias resueltas se borran a los 12 meses.
      </p>

      <h2>7. Disponibilidad</h2>
      <p>
        Trabajamos para que el servicio sea estable, pero no garantizamos que funcione sin interrupciones. Podemos
        hacer tareas de mantenimiento y cambiar o mejorar funciones.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        El software, la marca y los contenidos de {LEGAL.marca} son del prestador o de quienes le dieron licencia.
        Contratar te da un derecho de uso no exclusivo e intransferible mientras la suscripción esté vigente; no te
        transfiere la titularidad del software.
      </p>

      <h2>9. Responsabilidad</h2>
      <p>
        En la medida en que la ley lo permite, {LEGAL.marca} no responde por daños indirectos ni por lucro cesante.
        Esto no limita las responsabilidades que la ley no deja excluir, en especial frente a consumidores.
      </p>

      <h2>10. Fin del servicio y tus datos</h2>
      <p>
        Podés dar de baja tu cuenta cuando quieras. Si decidiéramos dejar de prestar el servicio, te avisaríamos con
        al menos <strong>90 días</strong> de anticipación. Mientras la cuenta esté activa, y durante un tiempo
        razonable después de la baja, podés descargar tus datos (alumnas, reservas, cobros y facturación) en un
        formato legible, para que nunca dependas de {LEGAL.marca} para conservarlos.
      </p>

      <h2>11. Cambios en estos términos</h2>
      <p>
        Podemos cambiar estos términos por motivos legales, técnicos o del negocio. Te avisamos de los cambios
        importantes con anticipación, y la versión vigente está siempre en esta página.
      </p>

      <h2>12. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Para cualquier controversia son competentes
        los tribunales ordinarios de la provincia de Neuquén, salvo que seas consumidor: en ese caso, los de tu
        domicilio (art. 36 de la Ley 24.240).
      </p>
    </>
  );
}
