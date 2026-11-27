import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Plazos de cinco estudios porteños con su fecha; la parte legal, Ley 24.240
// (arts. 4, 10 bis, 10 ter, 34 y 37), el Código Civil y Comercial (arts. 794,
// 985, 988, 1110, 1111 y 1116) y la Disposición 954/2025. La plantilla en Word
// de la versión española NO se ofrece aquí: lleva euros y leyes de España.

const articulo: Articulo = {
  slug: 'politica-de-cancelacion-de-clases',
  titulo: 'Política de cancelación de clases: plantilla para tu estudio y lo que dice la ley',
  tituloSeo: 'Política de cancelación de clases: plantilla y ley',
  descripcion:
    'Plantilla de política de cancelación para tu estudio de pilates o yoga: plazos de estudios porteños, clases perdidas, recuperos y qué permite la ley argentina.',
  resumen:
    'Qué tiene que decir la política de cancelación de tu estudio, con cuánta anticipación piden avisar estudios de Buenos Aires, qué permite la ley (Ley 24.240 y Código Civil y Comercial) y una plantilla lista para adaptar.',
  categoria: 'operacion',
  seccion: 'Operación',
  publicado: '2026-11-27',
  consultaPrincipal: 'política de cancelación de clases',
  consultas: [
    'plantilla de política de cancelación para un estudio',
    'política de cancelación pilates',
    'se puede cobrar una clase no cancelada',
    'reglamento de un estudio de pilates',
    'botón de arrepentimiento en un pack de clases',
  ],
  respuesta:
    'Una política de cancelación de clases dice con cuánta anticipación se puede cancelar sin perder la clase (entre 2 y 24 horas en cinco estudios de Buenos Aires revisados), qué pasa si se cancela tarde o no se viene, cómo se recuperan clases y qué ocurre si cancela el estudio. Para aplicarla, la alumna tiene que conocerla antes de pagar, y no puede tener cláusulas abusivas: la Ley 24.240 las tiene por no escritas.',
  entradilla:
    'Tu política de cancelación no es un cartel en la recepción: es parte del contrato con cada alumna. Acá tienes lo que tiene que decir, los plazos que publican estudios porteños, dónde pone la ley argentina los límites y una plantilla, cláusula a cláusula, para tu estudio.',
  secciones: [
    {
      id: 'que-debe-decir',
      titulo: 'Qué tiene que decir una política de cancelación de clases',
      bloques: [
        {
          t: 'p',
          texto:
            'Para que se cancele menos, tienes las tácticas en [cómo reducir las cancelaciones de último momento](/recursos/reducir-cancelaciones-ultima-hora). Esto va del texto que acepta tu alumna al comprar, que en muchos estudios se llama reglamento y tiene que responder a estas preguntas:',
        },
        {
          t: 'lista',
          items: [
            '**Plazo:** con cuántas horas de anticipación se cancela sin perder nada, y si cambia según el tipo de clase.',
            '**Qué se pierde:** qué pasa con la clase del pack o del abono, o con la clase suelta, si se cancela tarde o no se viene.',
            '**Recuperos:** si las clases canceladas a tiempo se recuperan, hasta cuándo y si dependen de que haya lugar.',
            '**Lista de espera:** qué pasa con el lugar liberado y cuánto tiempo tiene la siguiente para aceptarlo.',
            '**Packs y abonos:** vencimiento, si son personales, si se pueden pausar y cómo se da de baja un abono.',
            '**Feriados y cierres:** si una clase que cae en feriado se recupera o alarga el pack.',
            '**Fuerza mayor:** enfermedad o accidente, y qué certificado pides.',
            '**Cuando cancela el estudio:** qué recibe la alumna si se suspende o cambia una clase.',
            '**Comunicación:** por dónde se cancela (la app, la web, WhatsApp) y por dónde avisas tú.',
          ],
        },
      ],
    },
    {
      id: 'plazos-reales',
      titulo: 'Cuántas horas de anticipación: lo que piden estudios de Buenos Aires',
      bloques: [
        {
          t: 'p',
          texto: 'Ninguna ley fija el plazo: lo decide cada estudio. Estos son los que publican cinco estudios de pilates de la Ciudad de Buenos Aires:',
        },
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Plazo para cancelar', 'Qué dice su web'],
          filas: [
            ['Raquel Sosa Pilates Clásico (Palermo)', '24 horas', 'Más tarde, o sin aviso, la clase se da por perdida; los packs vencen a los 30 días del pago'],
            ['Flow Pilates Estudio', '24 horas', 'Es el aviso para no perder la clase'],
            ['Axis Pilates Studio', '24 horas', 'El aviso tardío o la inasistencia cuenta como clase tomada; se recupera dentro del mismo mes, si hay lugar'],
            ['Releve Pilates (Congreso)', '2 horas', 'Más tarde se pierde el lugar y la clase se paga igual; se recupera dentro del mismo mes'],
            ['Espacio Activa (Caballito, Primera Junta y Flores)', '2 horas', 'Fuera de plazo, la clase se cuenta como tomada'],
          ],
          nota: 'Condiciones publicadas en la web o el reglamento de cada estudio, consultadas el 27-nov-2026. Cambian a menudo: confírmalas con cada estudio antes de citarlas.',
        },
        {
          t: 'p',
          texto:
            'Ninguno de los cinco anuncia una multa: la consecuencia es perder la clase. Releve y Espacio Activa además piden que se cancele desde su app de turnos, no por WhatsApp, para que quede registro de la hora. Un plazo largo deja tiempo para ocupar el lugar desde la lista de espera; uno corto es más cómodo para la alumna. Cómo encaja con el vencimiento de los packs, en [packs y abonos de pilates](/recursos/bonos-de-pilates).',
        },
      ],
    },
    {
      id: 'lo-que-dice-la-ley',
      titulo: 'Política de cancelación y ley: información previa y cláusulas abusivas',
      bloques: [
        {
          t: 'p',
          texto:
            'Tu reglamento es un contrato por adhesión: lo redactas tú y la alumna lo acepta o no, sin negociarlo. Lo regulan la Ley de Defensa del Consumidor (Ley 24.240) y el Código Civil y Comercial (CCyC). Lo que te exigen:',
        },
        {
          t: 'lista',
          items: [
            '**Informar antes de cobrar.** Le debes a la alumna información cierta, clara y detallada sobre las condiciones de lo que vendes (artículo 4 de la Ley 24.240 y 1.100 del CCyC): el plazo para cancelar, el vencimiento y qué se pierde son parte de eso.',
            '**Que se entienda.** En un contrato por adhesión las cláusulas tienen que ser comprensibles y autosuficientes, con redacción clara (artículo 985 del CCyC), y ante la duda se interpretan a favor de la alumna (artículo 3 de la Ley 24.240).',
            '**Sin cláusulas abusivas.** Se tienen por no escritas las que desnaturalizan tus obligaciones, las que restringen los derechos de la alumna o amplían los tuyos, y las que no son razonablemente previsibles (artículo 37 de la Ley 24.240 y 988 del CCyC).',
            '**Si incumples tú.** Si el estudio no da la clase, la alumna puede exigir que la des, aceptar otra equivalente o rescindir y recuperar lo pagado (artículo 10 bis de la Ley 24.240).',
            '**Bajas sin obstáculos.** Un abono que se renueva solo se tiene que poder dar de baja por el mismo medio por el que se contrató, y desde la Disposición 954/2025 con un «Botón de baja de servicio» a la vista en tu web o tu app (artículo 10 ter de la Ley 24.240).',
          ],
        },
        {
          t: 'p',
          texto:
            'Si además cobras algo por cancelar tarde, eso es una cláusula penal, y un juez puede reducirla si su monto es desproporcionado con la falta (artículo 794 del CCyC). Lo prudente es que la consecuencia normal sea perder la clase, y que un cargo, si lo pones, sea moderado y responda a un perjuicio real: el lugar que no pudiste ofrecer.',
        },
      ],
    },
    {
      id: 'arrepentimiento',
      titulo: 'Arrepentimiento: un pack de clases comprado online',
      bloques: [
        {
          t: 'p',
          texto:
            'Quien compra a distancia (en tu web, tu app o por un link de pago, sin pasar por el estudio) puede revocar la compra dentro de los 10 días corridos, sin dar explicaciones y sin gastos (artículo 34 de la Ley 24.240 y 1.110 del CCyC). Las excepciones del artículo 1.116 del CCyC son productos hechos a medida, archivos digitales descargados y diarios o revistas: no hay ninguna para clases o servicios con fecha.',
        },
        {
          t: 'tabla',
          cabecera: ['Compra', 'Arrepentimiento de 10 días', 'Por qué'],
          filas: [
            ['Pack o abono online, sin usar', 'Sí', 'Es una compra a distancia y no entra en ninguna excepción'],
            ['Pack online ya empezado', 'Dudoso', 'La ley no dice cómo se descuentan las clases ya tomadas'],
            ['Clase suelta online, para un día y una hora', 'Probablemente sí, hasta la clase', 'El CCyC no excluye los servicios con fecha'],
            ['Compra en recepción', 'No, salvo que tú lo ofrezcas', 'La ley lo da en compras a distancia o fuera del local'],
          ],
          nota: 'Lectura orientativa de los artículos 1.110, 1.111 y 1.116 del CCyC y 34 de la Ley 24.240. No reemplaza el criterio de un abogado ni de la oficina de defensa del consumidor.',
        },
        {
          t: 'p',
          texto:
            'Tienes que informar ese derecho de forma destacada antes de la compra; si no lo haces, no se extingue a los 10 días (artículo 1.111 del CCyC). Y si vendes por internet, la Disposición 954/2025 te obliga a tener un «Botón de arrepentimiento» a simple vista. Para tu caso, consulta en la [oficina de defensa del consumidor](https://www.argentina.gob.ar/defensadelconsumidor) de tu provincia o con un abogado.',
        },
      ],
    },
    {
      id: 'plantilla',
      titulo: 'Plantilla de política de cancelación para un estudio',
      bloques: [
        {
          t: 'p',
          texto:
            'Copia cada cláusula, cambia lo que va entre corchetes (los números son ejemplos para rellenar, no recomendaciones) y borra lo que no aplique. Revísala con tu abogado o tu contador antes de publicarla.',
        },
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Alcance',
              texto:
                'Este reglamento se aplica a todas las clases de [nombre del estudio] ([razón social y CUIT], [dirección]), se reserven en la web, en la app o en recepción, y a sus packs, abonos y clases sueltas. Forma parte de las condiciones de compra.',
            },
            {
              titulo: 'Reserva',
              texto:
                'Para venir hay que reservar. La reserva es personal, queda confirmada cuando recibes el aviso y descuenta una clase de tu pack o de tu abono, o requiere pagar la clase suelta.',
            },
            {
              titulo: 'Cancelación a tiempo',
              texto:
                'Puedes cancelar sin perder la clase hasta [24] horas antes ([12] en [mat / grupales]) desde [la app / la web]. La clase vuelve a tu pack o a tu abono y, si pagaste una clase suelta, [te devolvemos el importe / queda como saldo para otra].',
            },
            {
              titulo: 'Cancelación tardía e inasistencia',
              texto:
                'Si cancelas con menos de [24] horas de anticipación o no vienes sin avisar, la clase se da por tomada: se descuenta de tu pack o de tu abono, y la clase suelta no se devuelve.',
            },
            {
              titulo: 'Recuperos',
              texto:
                'Las clases canceladas a tiempo se recuperan [dentro del mismo mes / hasta [15] días después del vencimiento, si renuevas], según los lugares libres.',
            },
            {
              titulo: 'Lista de espera',
              texto:
                'Si una clase está completa, puedes anotarte en la lista de espera. Cuando se libera un lugar, se ofrece a la primera de la lista [y se confirma solo / y tiene [60] minutos para aceptarlo]. Desde entonces se aplican las mismas reglas de cancelación.',
            },
            {
              titulo: 'Cancelación o cambios por parte del estudio',
              texto:
                'Solo suspenderemos una clase o cambiaremos su horario o su instructora por [enfermedad de la instructora sin reemplazo / menos de [3] reservas [2] horas antes / corte de luz o cierre obligado del local], y te avisaremos en cuanto lo sepamos por [canal]. Si suspendemos, recuperas la clase [o te devolvemos lo pagado por ella]; si el cambio no te sirve, puedes cancelar sin perderla.',
            },
            {
              titulo: 'Packs, abonos y bajas',
              texto:
                'Los packs son personales y vencen a los [30] días del pago. El abono se renueva cada [mes] y se paga del [1] al [10]; puedes darte de baja cuando quieras por la misma vía por la que te anotaste, desde el «Botón de baja de servicio» de [la web / la app], y si lo haces antes del día [1] no se te cobra el mes siguiente.',
            },
            {
              titulo: 'Feriados, fuerza mayor y certificados',
              texto:
                'Las clases que caen en feriado [se recuperan / alargan tu pack]. Si no puedes avisar a tiempo por enfermedad o accidente, envíanos un certificado en los [2] días siguientes y te devolvemos la clase.',
            },
            {
              titulo: 'Arrepentimiento, aceptación y cambios',
              texto:
                'Si compraste por internet, puedes arrepentirte dentro de los 10 días corridos desde el «Botón de arrepentimiento» de [la web / la app]. Al comprar aceptas este reglamento, que tienes siempre en [enlace]. Si lo cambiamos, te avisaremos con [15] días de anticipación y regirá para las compras y renovaciones siguientes, nunca para lo ya pagado.',
            },
          ],
        },
      ],
    },
    {
      id: 'como-aplicarla',
      titulo: 'Cómo aplicar tu política de cancelación sin discusiones',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Publícala donde se compra:** en la web y en la app, junto a los precios, y en recepción, en un cartel a la vista.',
            '**Pide que la acepte al comprar:** una casilla sin marcar con el enlace al texto, guardando qué versión aceptó y cuándo. Sin eso, es su palabra contra la tuya.',
            '**Que se cancele por un solo canal:** la app o la web dejan la hora registrada; un audio de WhatsApp a las 7 de la mañana, no.',
            '**Recuérdasela a tiempo:** en la confirmación de la reserva y en el recordatorio, con la hora límite para cancelar.',
            '**Aplícala igual a todas:** la excepción de hoy es la queja de mañana de quien sí cumplió. Si perdonas, que sea con certificado, no a ojo.',
          ],
        },
        {
          t: 'llamada',
          texto: 'Para que la política se aplique sola, tus alumnas cancelan desde el celular dentro del plazo que fijas para cada tipo de clase.',
        },
      ],
    },
    {
      id: 'con-tentare',
      titulo: 'Tu política de cancelación, aplicada sola en Centra',
      bloques: [
        {
          t: 'p',
          texto:
            'En Centra, las alumnas cancelan solas desde el celular, y las reglas se fijan por tipo de clase, entre ellas la anticipación para cancelar sin perder la clase (puedes cerrar el reformer antes que el mat). La hora queda registrada, y el lugar liberado pasa solo a la [lista de espera](/funcionalidades/lista-de-espera), al momento o con un plazo para aceptarlo. Las clases canceladas a tiempo vuelven al pack y las tardías se descuentan, sin que tengas que anotarlas a mano: [cancelaciones y políticas](/funcionalidades/cancelaciones-y-politicas).',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Se puede cobrar una clase no cancelada?',
      a: 'Sí, si tu reglamento lo decía y la alumna lo conocía antes de pagar: lo habitual es dar la clase por tomada y descontarla del pack. Cobrar además un cargo es una cláusula penal, y un juez puede reducirla si es desproporcionada (artículo 794 del Código Civil y Comercial).',
    },
    {
      q: '¿Con cuántas horas de anticipación se puede cancelar una clase?',
      a: 'Lo decide cada estudio. En los cinco estudios porteños revisados va de 2 a 24 horas: Raquel Sosa, Flow y Axis piden 24, y Releve y Espacio Activa, 2.',
    },
    {
      q: '¿Tiene botón de arrepentimiento un pack de clases?',
      a: 'Si se compró por internet, sí: 10 días corridos para revocar la compra, y la Disposición 954/2025 obliga a mostrar el botón a la vista. Cómo se descuentan las clases ya tomadas no lo dice la ley; consulta a un abogado. Lo comprado en recepción no tiene este derecho por ley.',
    },
    {
      q: '¿Qué pasa si el estudio suspende la clase?',
      a: 'Tu reglamento tiene que decir qué recibe la alumna: recuperar la clase o que se le devuelva lo pagado por ella. Si no das el servicio, la Ley 24.240 le deja elegir entre exigirlo, aceptar otro equivalente o rescindir con devolución (artículo 10 bis).',
    },
    {
      q: '¿Puedo cambiar el reglamento a alumnas que ya pagaron?',
      a: 'No sobre lo ya pagado: una cláusula que te deja cambiar el contrato a tu voluntad amplía tus derechos y restringe los de la alumna, y la ley la tiene por no escrita (artículo 37 de la Ley 24.240 y 988 del CCyC). Avisa con anticipación y aplica el nuevo a las compras y renovaciones siguientes.',
    },
    {
      q: '¿Puedo exigir que cancelen solo por la app?',
      a: 'Sí, si lo dice el reglamento y la app está a su alcance: varios estudios porteños lo hacen para que quede registrada la hora. Lo que no puedes es poner trabas para dar de baja un abono: tiene que poder hacerse por el mismo medio por el que se contrató.',
    },
  ],
  fuentes: [
    { titulo: 'Infoleg: Ley 24.240 de Defensa del Consumidor (arts. 3, 4, 10 bis, 10 ter, 34 y 37), texto actualizado', url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm', consultada: '2026-11-27' },
    { titulo: 'Código Civil y Comercial de la Nación: art. 1.110 (revocación)', url: 'https://codigocivilonline.com.ar/articulo-1110/', consultada: '2026-11-27' },
    { titulo: 'Código Civil y Comercial de la Nación: art. 1.111 (deber de informar la revocación)', url: 'https://codigocivilonline.com.ar/articulo-1111/', consultada: '2026-11-27' },
    { titulo: 'Código Civil y Comercial de la Nación: art. 1.116 (excepciones al derecho de revocar)', url: 'https://codigocivilonline.com.ar/articulo-1116/', consultada: '2026-11-27' },
    { titulo: 'Código Civil y Comercial de la Nación: art. 794 (ejecución de la cláusula penal)', url: 'https://codigocivilonline.com.ar/articulo-794/', consultada: '2026-11-27' },
    { titulo: 'Microjuris: Disposición 954/2025, botón de arrepentimiento y de baja (4-sep-2025)', url: 'https://aldiaargentina.microjuris.com/2025/09/04/legislacion-los-proveedores-de-bienes-y-servicios-deberan-activar-un-boton-de-arrepentimiento-para-que-los-consumidores-puedan-cancelar-compras/amp/', consultada: '2026-11-27' },
    { titulo: 'Raquel Sosa Pilates Clásico (Palermo): términos y condiciones', url: 'https://raquelsosa.com.ar/terminos-y-condiciones/', consultada: '2026-11-27' },
    { titulo: 'Flow Pilates Estudio: preguntas frecuentes', url: 'https://flowpilatesestudio.com.ar/', consultada: '2026-11-27' },
    { titulo: 'Axis Pilates Studio: ficha de ingreso y reglamento interno (1-ago-2026)', url: 'https://axispilates.com.ar/wp-content/uploads/2026/08/FICHA-DE-INGRESO-Y-REGLAMENTO-INTERNO-Actualizado-01-08-26.pdf', consultada: '2026-11-27' },
    { titulo: 'Releve Pilates (Congreso): clases y condiciones', url: 'https://relevepilates.com.ar/', consultada: '2026-11-27' },
    { titulo: 'Espacio Activa: reglamento para alumnos', url: 'https://www.espacioactiva.com/pdf/Reglamento_alumnos_Activa.pdf', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/reducir-cancelaciones-ultima-hora',
    '/funcionalidades/cancelaciones-y-politicas',
    '/recursos/bonos-de-pilates',
    '/funcionalidades/lista-de-espera',
    '/recursos/como-abrir-un-estudio-de-yoga',
  ],
  cta: {
    titulo: 'Que tu política se aplique sola, igual para todas',
    texto:
      'Con Centra, tus alumnas cancelan desde el celular dentro del plazo que fijas para cada tipo de clase, y el lugar pasa solo a la lista de espera. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Parte legal (Ley 24.240, CCyC y Disposición 954/2025): que la revise un abogado de consumo antes de publicar. La tabla de arrepentimiento es una lectura de los arts. 1.110 y 1.116 del CCyC; no se encontró jurisprudencia sobre packs de clases ya empezados.',
    'Plazos de los cinco estudios consultados el 27-nov-2026: cambian a menudo. Espacio Activa da en su FAQ reglas de recupero distintas a las de su reglamento; se citó el reglamento.',
    'Plantilla: las cifras entre corchetes (horas, plazos, días) son ejemplos para rellenar, no recomendaciones ni datos de mercado. No se ofrece la descarga en Word de la versión española.',
  ],
};

export default articulo;
