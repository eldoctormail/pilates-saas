import { LEGAL, PROVEEDORES_ARGENTINA } from '@/lib/legal-info';

// La política de privacidad con el formato de Argentina (es-AR), según la Ley 25.326 y su Decreto 1558/2001. La
// versión de España (RGPD) sigue en page.tsx (FUNCIONES_DE_ESPANA). Es un texto de base: conviene que lo revise un
// abogado. Lo que se cuenta del producto (mensajes, tablón, denuncias, bloqueos) es lo mismo que en la de España,
// porque el producto es el mismo: si cambia allí, cambia acá.
export function PrivacidadArgentina() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="lead">
        Cómo tratamos tus datos personales según la Ley 25.326 de Protección de los Datos Personales y su Decreto
        reglamentario 1558/2001.
      </p>

      <h2>1. Responsable de la base de datos</h2>
      <ul>
        <li><strong>Responsable:</strong> {LEGAL.titular}{LEGAL.nif ? ` (CUIT ${LEGAL.nif})` : ''}</li>
        <li><strong>Domicilio:</strong> {LEGAL.domicilio}, Argentina</li>
        <li><strong>Contacto para temas de datos personales:</strong> <a href={`mailto:${LEGAL.emailPrivacidad}`}>{LEGAL.emailPrivacidad}</a></li>
      </ul>

      <h2>2. Cuándo somos responsables y cuándo prestadores</h2>
      <p>
        De los datos de las <strong>cuentas de los estudios y su equipo</strong> (registro, facturación, soporte),{' '}
        {LEGAL.marca} es el <strong>responsable</strong>. De los datos que cada estudio carga sobre{' '}
        <strong>sus alumnas</strong> para gestionar su actividad, el responsable es el estudio, y {LEGAL.marca} los
        trata por su cuenta como <strong>prestador de servicios informatizados</strong> (art. 25 de la Ley 25.326):
        solo para prestarle el servicio, sin usarlos para otra cosa ni cederlos. Si sos alumna de un estudio, las
        preguntas sobre tus datos se las hacés primero a tu estudio; nosotros te ayudamos a canalizarlas.
      </p>

      <h2>3. Qué datos tratamos y para qué</h2>
      <table>
        <thead>
          <tr><th>Datos</th><th>Para qué</th><th>Por qué podemos</th></tr>
        </thead>
        <tbody>
          <tr><td>Identificación y contacto (nombre, correo, teléfono)</td><td>Crear y gestionar tu cuenta y darte el servicio</td><td>El contrato que nos une</td></tr>
          <tr><td>Datos fiscales y de pago (CUIT, condición frente al IVA)</td><td>Cobrar la suscripción y emitir las facturas</td><td>El contrato y la obligación legal de facturar</td></tr>
          <tr><td>Datos de uso y registros técnicos</td><td>Seguridad, prevención del fraude y mejora del servicio</td><td>El contrato</td></tr>
          <tr><td>Comunicaciones y soporte</td><td>Responder tus consultas y avisarte sobre el servicio</td><td>El contrato</td></tr>
          <tr><td>Novedades comerciales</td><td>Contarte novedades del producto</td><td>Tu consentimiento, que podés retirar cuando quieras</td></tr>
          <tr><td>Descarga de plantillas (correo y, si lo indicás, el nombre de tu estudio)</td><td>Mandarte la plantilla y, solo si marcás la casilla y lo confirmás desde el correo, novedades y guías</td><td>Tu pedido y tu consentimiento</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Datos de salud.</strong> Son datos sensibles (art. 2 y 7 de la Ley 25.326). Un estudio puede
        registrar datos de salud de sus alumnas solo con su consentimiento expreso y por escrito; la app lo pide y
        guarda quién lo dio y cuándo. Esos datos se tratan por cuenta del estudio, con acceso restringido a las
        personas del equipo que los necesitan. Nadie está obligado a darlos.
      </p>
      <p>
        <strong>Automatizaciones.</strong> Algunas funciones que cada estudio decide activar actúan solas sobre sus
        alumnas: avisos y recomendaciones a partir de la actividad del estudio, la cancelación de una clase que no
        llega al mínimo de asistentes que fijó el estudio, o un recargo por cancelar tarde o no presentarse. Esas
        reglas las decide el estudio; si te afecta una, podés pedirle al estudio que la revise una persona.
      </p>

      <h2>4. Mensajes, tablón y moderación en la app de las alumnas</h2>
      <ul>
        <li>
          <strong>Quién lee lo que escribís.</strong> Un mensaje al estudio lo lee el equipo del estudio que atiende
          los mensajes. Un mensaje a tu instructora lo leen ella y vos, y también lo puede leer la persona responsable
          del estudio; te lo avisamos en la conversación. Un comentario en el tablón lo ve quien puede ver esa
          publicación.
        </li>
        <li>
          <strong>Tu nombre en el tablón.</strong> Tus compañeras te ven con tu nombre y la inicial de tu apellido
          (por ejemplo, «Lucía M.»).
        </li>
        <li>
          <strong>Avisos.</strong> Cuando te escriben, el aviso del celular no muestra el texto del mensaje.
        </li>
        <li>
          <strong>Normas y filtro.</strong> Antes de escribir por primera vez te pedimos que aceptes las normas de la
          comunidad, y guardamos qué versión aceptaste y cuándo. Si un mensaje tiene palabras que las normas no
          permiten, no se publica.
        </li>
        <li>
          <strong>Denuncias.</strong> Podés denunciar un mensaje o un comentario. Guardamos quién denunció, qué, quién
          lo escribió, lo que nos cuentes, la fecha y la decisión. La revisa el estudio; la revisa {LEGAL.marca} cuando
          va contra el propio estudio o cuando el estudio no la revisó en 24 horas. Para revisarla, quien la revisa lee
          el contenido denunciado, aunque esté en una conversación privada.
        </li>
        <li>
          <strong>Bloqueos.</strong> Podés bloquear a tu instructora en el chat o a una compañera en el tablón, y
          desbloquearla cuando quieras desde Perfil › Privacidad y datos. Quien fue bloqueada no recibe ningún aviso.
        </li>
      </ul>
      <p>
        Los mensajes y comentarios se guardan mientras exista tu ficha en el estudio o hasta que los borres. Las
        denuncias resueltas se borran solas 12 meses después. «Descargar mis datos» incluye tus mensajes, comentarios,
        «me gusta», denuncias, bloqueos y las normas que aceptaste. «Borrar mi cuenta» borra tu cuenta en el momento;
        tus mensajes y comentarios quedan en el estudio como parte de tu ficha, salvo que le pidas al estudio que la
        suprima con «Solicitar la eliminación de mis datos».
      </p>

      <h2>5. Cuánto tiempo los guardamos</h2>
      <p>
        Mientras la relación esté vigente y, después, durante los plazos que exige la ley (por ejemplo, la normativa
        fiscal obliga a conservar la facturación). Pasados esos plazos, los datos se suprimen o se anonimizan. Cuando
        un estudio deja {LEGAL.marca}, puede descargar sus datos y pedirnos que los suprimamos escribiendo a{' '}
        <a href={`mailto:${LEGAL.emailPrivacidad}`}>{LEGAL.emailPrivacidad}</a>; las facturas y los recibos se
        conservan bloqueados durante el plazo legal.
      </p>

      <h2>6. Con quién los compartimos</h2>
      <p>
        No vendemos ni cedemos tus datos. Para prestar el servicio usamos los proveedores de abajo; los marcados como
        opcionales solo intervienen si el estudio activa esa función. Tratan los datos solo por nuestra cuenta y con
        las mismas obligaciones de seguridad y confidencialidad.
      </p>
      <table>
        <thead>
          <tr><th>Proveedor</th><th>Uso</th><th>Ubicación</th></tr>
        </thead>
        <tbody>
          {PROVEEDORES_ARGENTINA.map((p) => (
            <tr key={p.nombre}><td>{p.nombre}</td><td>{p.uso}</td><td>{p.ubicacion}</td></tr>
          ))}
        </tbody>
      </table>
      <p>
        Cuando un proveedor está en un país que la Argentina no considera con protección adecuada, la transferencia se
        hace con las cláusulas contractuales modelo aprobadas por la Disposición 60/2016 o con tu consentimiento
        (art. 12 de la Ley 25.326). Además, la ley obliga a informar a ARCA los datos de cada factura.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Podés pedir <strong>acceso, rectificación, actualización y supresión</strong> de tus datos, y retirar un
        consentimiento que hayas dado, escribiendo a{' '}
        <a href={`mailto:${LEGAL.emailPrivacidad}`}>{LEGAL.emailPrivacidad}</a>. Respondemos el pedido de acceso
        dentro de los 10 días corridos y los de rectificación, actualización o supresión dentro de los 5 días hábiles
        (art. 14 y 16 de la Ley 25.326).
      </p>
      <p>
        El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
        gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
        lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
        en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y
        reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
        en materia de protección de datos personales (
        <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">argentina.gob.ar/aaip</a>).
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger los datos (art. 9 de la Ley 25.326): cifrado en
        tránsito, copias de seguridad cifradas, credenciales de las integraciones cifradas, verificación en dos pasos
        para el equipo de los estudios, acceso por roles, separación de los datos de cada estudio y registro de los
        accesos a los datos sensibles.
      </p>

      <h2>9. Menores</h2>
      <p>
        Para crear la cuenta de un estudio hay que ser mayor de edad. Un estudio puede registrar como alumnas a
        menores; en ese caso, el estudio es responsable de esos datos y de contar con la autorización de su madre,
        padre o tutor. El consentimiento para los datos de salud de una menor lo firma su madre, padre o tutor, y
        queda registrado con su nombre.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Podemos actualizar esta política por cambios legales o del servicio. La versión vigente está siempre en esta
        página, con su fecha de actualización.
      </p>
    </>
  );
}
