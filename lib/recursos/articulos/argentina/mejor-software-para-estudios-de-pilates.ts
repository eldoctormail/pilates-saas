import type { Articulo } from '../tipos.ts';

// Versión argentina de la comparativa (27-nov-2026). En vez de los 13 programas
// de España (bsport, TIMP, Veri*Factu…), los que venden en Argentina con precio
// en pesos y Mercado Pago. De cada uno, solo lo que dice su web pública
// (consultada el 27-nov-2026); lo que no dice, «no consta». El precio de Centra
// no se escribe en pesos: se edita en /interno/precios, así que se manda a /precios.

const articulo: Articulo = {
  slug: 'mejor-software-para-estudios-de-pilates',
  titulo: 'Mejor software para estudios de pilates en Argentina (2026)',
  tituloSeo: 'Mejor software para estudios de pilates en Argentina',
  descripcion: '¿Cuál te conviene? Precio en pesos, prueba, permanencia, Mercado Pago y cupos por reformer de seis programas para pilates, según la web de cada uno.',
  resumen:
    'Comparativa escrita por Centra: lo que necesita un estudio de pilates en Argentina, una tabla con seis programas según su web pública y una ficha breve de cada uno.',
  categoria: 'software',
  seccion: 'Elegir software',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'mejor software para estudios de pilates',
  consultas: [
    'software para estudio de pilates',
    'software de gestión de pilates',
    'sistema para estudio de pilates',
    'app para estudio de pilates',
    'programa para gestionar un estudio de pilates',
    'software para pilates en Argentina',
    'qué sistema usan los estudios de pilates',
    'cuál es el mejor software para un estudio de pilates',
  ],
  respuesta:
    'Para elegir un sistema para tu estudio de pilates en Argentina, comprueba cuatro cosas: que reserve con cupo por clase y por reformer, que cobre packs y abonos online con Mercado Pago, que tus alumnas puedan reservar y cancelar desde el celular, y que publique su precio y si tiene permanencia. Entre los programas comparados, los que publican tarifa van de $9.900 a $129.900 por mes. Centra, que escribe esta guía, es gratis hasta 150 reservas al mes.',
  entradilla:
    'Esta comparativa la escribe Centra, que también aparece en la tabla. Para que te sirva aunque no nos elijas, de cada programa solo contamos lo que dice hoy su web pública, con la fuente enlazada, y cuando algo no consta, lo decimos tal cual.',
  secciones: [
    {
      id: 'como-esta-hecha-esta-comparativa',
      titulo: 'Cómo está hecha esta comparativa y quién la escribe',
      bloques: [
        {
          t: 'nota',
          titulo: 'Aviso de transparencia',
          texto:
            'Centra es uno de los programas de la tabla, así que no somos neutrales. Para compensarlo, de los otros solo recogemos lo que publican en su web, revisada el 27 de noviembre de 2026 y enlazada en las fuentes. «No consta» significa que su web no lo dice, no que no lo tengan. Con la inflación, los precios en pesos cambian seguido: confírmalos antes de decidir.',
        },
        {
          t: 'p',
          texto:
            'Los programas son AgendaPro, Slottin, GymSmartAccess, SyncroFitness y My Gym Online, además de Centra. Elegimos los que venden a estudios de pilates en Argentina y publican en su web, en pesos, al menos parte de sus condiciones. Lo que mejor te encaje depende de cuántas alumnas tienes, de si das reformer o mat, de si vendes packs o abonos y de quién atiende la recepción. Para preparar la prueba, usa el [checklist para elegir el software de tu estudio](/recursos/checklist-elegir-software-estudio).',
        },
      ],
    },
    {
      id: 'que-necesita-un-estudio-de-pilates',
      titulo: 'Qué necesita de verdad un sistema para estudio de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'Antes de mirar precios, conviene tener clara la lista de lo que no puede faltar. Un estudio de pilates no es una peluquería con turnos uno a uno ni un gimnasio de pase libre: vende lugares en clases grupales con cupo, muchas veces atados a una máquina concreta.',
        },
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Reservas con cupo por clase, y por cama si das reformer',
              texto: 'Si la sala tiene seis reformers, la clase tiene seis lugares, y una cama en reparación lo baja. El sistema tiene que saberlo sin que lo corrijas a mano.',
            },
            {
              titulo: 'Packs, abonos y clase suelta, con vencimiento',
              texto: 'El pack de 8 clases que vence a fin de mes, el abono de dos veces por semana y la clase de prueba tienen que descontarse solos al reservar.',
            },
            {
              titulo: 'Cobro online con Mercado Pago',
              texto: 'Que la alumna pague el pack o el abono desde el celular y el dinero llegue a tu cuenta, sin perseguir transferencias por WhatsApp. Pregunta si el sistema cobra una comisión propia además de la de Mercado Pago.',
            },
            {
              titulo: 'Lista de espera automática',
              texto: 'Cuando alguien cancela, el lugar pasa solo a la siguiente de la lista y le llega el aviso.',
            },
            {
              titulo: 'Política de cancelación aplicada sola',
              texto: 'Que la alumna no pueda cancelar sin perder la clase pasado el plazo que fijaste, y que lo vea antes de reservar.',
            },
            {
              titulo: 'Reemplazos de instructoras',
              texto: 'Cuando una instructora no puede venir, saber quién puede cubrir la clase y avisarle sin hacer diez llamadas.',
            },
            {
              titulo: 'Una forma cómoda de reservar para tus alumnas',
              texto: 'Una app o una web que se abre desde el celular. Lo importante es que reserve y cancele en pocos toques, no si se descarga de una tienda.',
            },
            {
              titulo: 'Precio público y sin permanencia',
              texto: 'Si el precio no está en la web, vas a tener que pedirlo; si hay contrato mínimo, vas a pagar aunque no te sirva.',
            },
            {
              titulo: 'Factura de ARCA',
              texto: 'Que el sistema emita la factura electrónica, o al menos te deje los cobros listos para cargarlos en ARCA o pasárselos a tu contador.',
            },
          ],
        },
      ],
    },
    {
      id: 'tabla-comparativa',
      titulo: 'Software para estudios de pilates en Argentina: la tabla comparativa',
      bloques: [
        {
          t: 'p',
          texto:
            'Esto es lo que publica cada programa en su web. Los precios son por mes, en pesos, y del plan de entrada salvo que se diga otra cosa.',
        },
        {
          t: 'tabla',
          cabecera: ['Programa', 'Precio publicado', 'Prueba', 'Permanencia', 'Cobro online', 'Cupo por reformer'],
          filas: [
            ['AgendaPro', 'De $9.900 a $129.900 por mes según el plan, IVA incluido', 'Empezar gratis (días: no consta)', 'No consta', 'Mercado Pago integrado', 'Sí, asigna reformers'],
            ['Slottin', '$30.000 por mes, plan único, IVA incluido', 'Demo sin registro', 'Sin permanencia ni contrato', 'Señas por Mercado Pago, sin comisión propia', 'No consta (cupo por clase)'],
            ['GymSmartAccess', 'Desde $34.900 por mes', '30 días, sin tarjeta', 'Sin permanencia', 'Mercado Pago y débito automático', 'No consta (cupo por turno)'],
            ['SyncroFitness', 'Gratis, $33.000 o $44.000 por mes', '14 días sin pago previo', 'No consta', 'Cobro a alumnos (medio: no consta)', 'Sí, cupos y camillas por clase'],
            ['My Gym Online', 'No consta en la página revisada', '7 días con el plan Pro, sin tarjeta', 'Sin permanencia', 'Cuotas y packs (medio: no consta)', 'Sí, cupo según la cantidad de reformers'],
            ['Centra', 'Gratis hasta 150 reservas al mes; los planes de pago, en /precios', 'El plan gratis no vence', 'Sin permanencia', 'Mercado Pago, desde la app de la alumna', 'Sí, por sala y por reformer'],
          ],
          nota: 'Fuente: web pública de cada programa, consultada el 27-nov-2026 (enlaces en las fuentes). «No consta» = su web no lo dice. Precios en pesos argentinos; cuando la web no aclara si incluye IVA, no lo indicamos.',
        },
        {
          t: 'p',
          texto:
            'Fíjate en dos cosas que la tabla no resuelve sola. La primera, si la comisión que pagas por cobrar es solo la de Mercado Pago (para el link de pago, un 4,39 % si el dinero se acredita a los 10 días) o si el sistema suma la suya. La segunda, qué pasa con tus datos si te vas: si puedes exportar alumnas, packs y pagos, y en qué formato.',
        },
      ],
    },
    {
      id: 'ficha-de-cada-programa',
      titulo: 'Ficha de cada programa',
      bloques: [
        {
          t: 'lista',
          items: [
            '**AgendaPro.** Sistema de agenda para muchos rubros, con una página propia para pilates. Publica cuatro planes en pesos con IVA incluido (Individual $9.900, Básico $19.900, Premium $39.900 y Pro IA $129.900 por mes) y un descuento del 15 % pagando el año. Integra Mercado Pago, controla cupos en tiempo real y asigna reformers. La factura electrónica figura como complemento «próximamente».',
            '**Slottin.** Pensado para estudios de pilates, con un plan único de $30.000 por mes con IVA incluido, sin permanencia ni contrato e instalación sin cargo. Las señas se cobran por Mercado Pago directo a tu cuenta y Slottin dice no cobrar comisión propia. Las alumnas no instalan app: reservan desde el navegador del celular. Tiene lugar fijo y lista de espera.',
            '**GymSmartAccess.** Sistema para gimnasios con una guía para pilates y yoga. Publica planes desde $34.900 por mes y una prueba de 30 días sin tarjeta, sin permanencia. Cobra con Mercado Pago y débito automático, el dinero cae en tu cuenta de Mercado Pago, y la alumna entra escaneando un QR, sin app.',
            '**SyncroFitness.** Tiene página para estudios de pilates con tres planes: uno gratis («ideal para individuos»), básico de $33.000 y premium de $44.000 por mes, y 14 días de prueba sin pago previo. Controla cupos y camillas por clase. La alumna usa una app web (PWA), sin descargar nada de una tienda. No consta con qué medio cobra a las alumnas.',
            '**My Gym Online.** Su guía para estudios de pilates habla de clases con cupo según la cantidad de reformers, cobro de cuotas y packs, alumnos ilimitados en todos los planes y una prueba de una semana con el plan Pro, sin contrato. El precio está en su página de precios, que no revisamos para esta guía.',
            '**Centra.** Es el sistema que escribe esta guía. Cupo por sala y por reformer, packs y abonos que se descuentan al reservar, lista de espera automática, política de cancelación aplicada sola, reemplazos de instructoras y una app con la marca de tu estudio. Cobra con Mercado Pago y puede emitir la factura electrónica de ARCA con tu certificado. Gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia; los planes de pago están en [precios](/precios).',
          ],
        },
      ],
    },
    {
      id: 'app-para-estudio-de-pilates',
      titulo: 'La app para tus alumnas: de tienda, instalable o web',
      bloques: [
        {
          t: 'p',
          texto:
            'Casi ninguno de los programas comparados obliga a la alumna a bajar una app de una tienda. Lo habitual es una web que se abre desde el celular (Slottin, GymSmartAccess, My Gym Online) o una app web que se puede agregar a la pantalla de inicio (SyncroFitness, Centra). Para la alumna la diferencia es pequeña: lo que cuenta es que entre rápido, vea sus clases y su pack, y reserve o cancele en dos o tres toques.',
        },
        {
          t: 'p',
          texto:
            'Lo que sí cambia es la marca. Si la app se llama como el sistema, tus alumnas ven otro nombre cada vez que reservan; si lleva tu logo y tus colores, el estudio es lo primero que ven. Pregunta por esto en la prueba.',
        },
      ],
    },
    {
      id: 'donde-encaja-centra',
      titulo: 'Dónde encaja Centra',
      bloques: [
        {
          t: 'p',
          texto:
            'Centra nació para estudios de pilates con clases grupales y reformers, y en Argentina cobra con Mercado Pago. Encaja bien si:',
        },
        {
          t: 'lista',
          items: [
            'Das reformer y necesitas el cupo por cama, con lista de espera que se mueve sola.',
            'Vendes packs con vencimiento y abonos con frecuencia fija, y quieres que se descuenten solos.',
            'Tienes varias instructoras y te pasa que alguna falta a último momento.',
            'Quieres empezar sin pagar: es gratis hasta 150 reservas al mes, sin tarjeta.',
          ],
        },
        {
          t: 'p',
          texto:
            'Si das solo clases individuales con turno uno a uno, una agenda general puede bastarte. Y si recién empiezas con pocas alumnas, en [software de pilates gratis](/recursos/software-pilates-gratis) tienes lo que se puede armar sin pagar nada.',
        },
      ],
    },
    {
      id: 'como-elegir',
      titulo: 'Cómo elegir el tuyo en cinco pasos',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Anota tus tres problemas',
              texto: 'Los mensajes de WhatsApp para reservar, los packs que vencen sin aviso, las transferencias que no aparecen: lo que hoy te quita más tiempo es lo que el sistema tiene que resolver primero.',
            },
            {
              titulo: 'Descarta por precio y compromiso',
              texto: 'Saca de la lista lo que no publica precio o te ata con contrato si no lo necesitas. Haz la cuenta con la comisión de cobro incluida.',
            },
            {
              titulo: 'Prueba con tu semana real',
              texto: 'Carga tu grilla, dos o tres alumnas de prueba y un pack. Reserva, cancela fuera de plazo y paga desde el celular, como lo haría una alumna.',
            },
            {
              titulo: 'Pregunta por la salida antes que por la entrada',
              texto: 'Si mañana te vas, ¿puedes descargar alumnas, packs y pagos? ¿En qué formato? Una respuesta clara ahora te ahorra un problema después.',
            },
            {
              titulo: 'Cierra la migración por escrito',
              texto: 'Qué datos se pasan, quién los pasa y cuándo. Avisa a tus alumnas con una semana de anticipación y deja el sistema viejo en solo lectura un mes.',
            },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuál es el mejor software para un estudio de pilates en Argentina?',
      a: 'Depende de tu estudio. Si das reformer, busca cupo por cama; si vendes packs, que se descuenten solos; y que cobre con Mercado Pago. Entre los comparados, AgendaPro, SyncroFitness, My Gym Online y Centra dicen manejar cupos por reformer o camilla. Centra, que escribe esta guía, es gratis hasta 150 reservas al mes.',
    },
    {
      q: '¿Cuánto cuesta un software para estudio de pilates?',
      a: 'Entre los programas comparados que publican precio, de $9.900 a $129.900 por mes según el plan, con consulta del 27 de noviembre de 2026. Hay planes gratis con límites (SyncroFitness y Centra). Suma la comisión de Mercado Pago por cada cobro.',
    },
    {
      q: '¿Hay software de pilates que cobre con Mercado Pago?',
      a: 'Sí. AgendaPro, Slottin y GymSmartAccess lo dicen en su web, y Centra cobra con Mercado Pago desde la app de la alumna. Pregunta si el sistema cobra una comisión propia además de la de Mercado Pago: Slottin, por ejemplo, dice que no.',
    },
    {
      q: '¿Mis alumnas tienen que bajar una app?',
      a: 'En casi todos los comparados, no: reservan desde el navegador del celular o desde una app web que se agrega a la pantalla de inicio. Lo importante es que puedan reservar y cancelar en pocos toques.',
    },
    {
      q: '¿El sistema me hace la factura de ARCA?',
      a: 'Depende. AgendaPro la anuncia como complemento próximamente; en los demás comparados, salvo Centra, no consta en la página revisada. Centra puede emitir la factura electrónica de ARCA con tu certificado. Qué comprobante te toca (C si eres monotributista, B si eres responsable inscripta) te lo confirma tu contador.',
    },
    {
      q: '¿Puedo cambiar de sistema sin perder a mis alumnas?',
      a: 'Sí, si el sistema viejo te deja exportar tus datos. Pide el listado de alumnas con sus packs vigentes, cárgalo en el nuevo y avisa a tus alumnas con tiempo. Las tarjetas guardadas no pasan de un sistema a otro: cada alumna vuelve a pagar en el nuevo.',
    },
  ],
  fuentes: [
    { titulo: 'AgendaPro: planes y precios en Argentina', url: 'https://agendapro.com/ar/planes', consultada: '2026-11-27' },
    { titulo: 'AgendaPro: software para estudio de pilates', url: 'https://agendapro.com/ar/pilates/software-para-estudio-de-pilates', consultada: '2026-11-27' },
    { titulo: 'Slottin Pilates: plan y condiciones', url: 'https://estudios.slottin.com.ar/', consultada: '2026-11-27' },
    { titulo: 'GymSmartAccess: gestión para pilates y yoga en Argentina', url: 'https://gymsmartaccess.com/blog/software-estudio-pilates-yoga-argentina', consultada: '2026-11-27' },
    { titulo: 'SyncroFitness: app para estudio de pilates', url: 'https://www.syncrofitness.com/app-para-estudio-de-pilates', consultada: '2026-11-27' },
    { titulo: 'My Gym Online: software para estudios de pilates', url: 'https://www.my-gym.online/blog/software-estudio-pilates', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/checklist-elegir-software-estudio',
    '/recursos/software-pilates-gratis',
    '/soluciones/cambiar-de-software',
    '/precios',
  ],
  cta: {
    titulo: 'Pruébalo con tu semana real.',
    texto: 'Carga tu grilla, tus packs y un par de alumnas y reserva desde el celular. Gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia.',
  },
  revision: [
    'Precios y condiciones de la competencia consultados el 27-nov-2026: con la inflación, revisarlos cada pocos meses.',
    'My Gym Online: falta leer su página de precios (/precios) y añadir la cifra.',
    'Pilates App (pilatesapp.online) quedó fuera porque su web no se pudo leer; revisarla.',
    'Que Centra emita la factura de ARCA depende de que el estudio cargue su certificado (lib/arca); confirmarlo antes de publicar.',
  ],
};

export default articulo;
