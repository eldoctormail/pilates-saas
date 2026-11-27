import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Fuera lo que no existe o no aplica aquí: Square Citas (no opera en Argentina),
// Bonsai y Flowstark (de España), la aplicación de la AEAT y Facilita RGPD.
// Entran el link de pago de Mercado Pago, la factura electrónica gratuita de
// ARCA y la Ley 25.326. Sin precios de Centra en pesos: se editan en
// /interno/precios, así que el texto manda a /precios.

const articulo: Articulo = {
  slug: 'software-pilates-gratis',
  titulo: 'Software de pilates gratis: qué puedes armar sin pagar y qué pierdes',
  tituloSeo: 'Software de pilates gratis: qué sirve y límites',
  descripcion:
    'Google, WhatsApp, una planilla, Mercado Pago y la factura de ARCA: qué puedes armar gratis en tu estudio de pilates, qué pierdes y cuándo conviene pagar.',
  resumen:
    'Lo que de verdad puedes usar sin pagar en un estudio de pilates en Argentina, con los límites que publica cada herramienta, el costo oculto de hacerlo a mano y cuándo conviene pagar.',
  categoria: 'software',
  seccion: 'Elegir software',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'software de pilates gratis',
  consultas: [
    'programa de gestión de pilates gratis',
    'app para reservar clases gratis',
    'sistema de turnos online gratuito',
  ],
  respuesta:
    'Sí hay software de pilates gratis, pero con límites. Con una cuenta de Google personal puedes publicar una página de reservas, WhatsApp Business es gratuita, el link de pago de Mercado Pago no tiene costo fijo (solo comisión por cobro) y ARCA te deja emitir la factura electrónica sin pagar. Centra, que escribe esta guía, es gratis hasta 150 reservas al mes. Sirven para arrancar con pocas alumnas; con packs, abonos y varias instructoras, el trabajo a mano crece rápido.',
  entradilla:
    'Cuando abres un estudio, cada peso cuenta y pagar un programa antes de tener alumnas da vértigo. Esto es lo que de verdad puedes armar con software de pilates gratis y herramientas sin costo, con los límites que publica cada una, y las señales de que llegó el momento de pagar.',
  secciones: [
    {
      id: 'que-puedes-montar-gratis',
      titulo: 'Software de pilates gratis: qué puedes armar de verdad',
      bloques: [
        {
          t: 'p',
          texto:
            'Hay dos caminos: juntar herramientas generales que puedes usar sin pagar (Google, WhatsApp, una planilla, Mercado Pago) o usar el plan gratuito de un programa de reservas. Esto es lo que ofrece cada opción según su web oficial:',
        },
        {
          t: 'tabla',
          cabecera: ['Herramienta', 'Qué te da gratis', 'El límite que más se nota en un estudio'],
          filas: [
            ['Agenda de citas de Google Calendar', 'Con una cuenta personal, una página de reservas que puedes enlazar o insertar en tu web', 'Está pensada para citas; tener más de una agenda, recordatorios automáticos por correo o cobrar la reserva exige suscripción'],
            ['WhatsApp Business', 'App gratuita con perfil de empresa, respuestas rápidas, mensajes de ausencia y etiquetas', 'Cada reserva y cada cambio pasan por tu celular'],
            ['Planilla de cálculo', 'Llevar asistencia y packs con fórmulas, como la plantilla que te dejamos', 'No avisa, no cobra y depende de que la actualices'],
            ['Mercado Pago, link de pago', 'Crear links para cobrar packs y abonos, sin costo fijo', 'Cada cobro paga comisión: un 4,39 % si cobras a 10 días; y nadie te avisa de quién no pagó'],
            ['SimplyBook.me, plan Free', 'Hasta 50 reservas al mes, un proveedor y widget de reservas', 'Con clases de grupo, 50 reservas al mes se acaban pronto'],
            ['ARCA: Comprobantes en línea y Facturador', 'Emitir factura electrónica con clave fiscal, desde la web o el celular', 'Va aparte de reservas y cobros: cada factura la cargas tú'],
            ['Centra, plan Founding Studio', 'Gratis hasta 150 reservas al mes: todas sus funciones menos varias sedes, con la app con tu marca', 'Si pasas de ahí, un plan de pago, sin tope de alumnas ni de reservas'],
          ],
          nota:
            'Fuente: web oficial de cada herramienta (enlaces en las fuentes). Google, WhatsApp y SimplyBook.me, consultadas el 25-sep-2026; Mercado Pago, ARCA y Centra, el 27-nov-2026. Las condiciones de los planes gratuitos cambian: compruébalas antes de empezar.',
        },
        {
          t: 'p',
          texto:
            'Con una combinación sensata —una página de reservas, WhatsApp Business para las dudas, links de pago y la [plantilla de control de asistencia](/recursos/plantilla-control-de-asistencia-pilates) para los packs— un estudio chico puede funcionar sin pagar suscripción. Un aviso sobre Google: según su ayuda, la página de reservas es siempre pública y muestra el nombre y la foto de la cuenta, así que mejor créala con una cuenta del estudio y no con la tuya personal.',
        },
        {
          t: 'p',
          texto:
            'Varios estudios porteños usan además apps de turnos argentinas como TomoTurnos o SigueFit para que sus alumnas reserven y cancelen. Si te interesan, revisa en su web qué incluye cada plan y cuánto cuesta.',
        },
      ],
    },
    {
      id: 'sistema-de-reservas-online-gratuito',
      titulo: 'Cómo armar un sistema de turnos online gratuito, paso a paso',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Abre una cuenta de Google para el estudio',
              texto:
                'Que sea distinta de la tuya personal. En ella tendrás juntas la agenda de citas, los formularios y las planillas.',
            },
            {
              titulo: 'Publica tus clases',
              texto:
                'Si das clases privadas o en dúo, la agenda de citas de Google encaja. Si son de grupo, busca una herramienta que admita varias personas por clase, como el plan gratuito de SimplyBook.me, o publica un formulario con las clases de la semana.',
            },
            {
              titulo: 'Lleva la asistencia y los packs en una planilla',
              texto:
                'Anota quién reserva, quién viene y quién cancela tarde, y deja que las fórmulas descuenten las clases. La plantilla gratuita que te enlazamos arriba ya lo hace.',
            },
            {
              titulo: 'Cobra con un link de pago',
              texto:
                'Un link por pack o por abono, que mandas por WhatsApp. Elige el plazo de acreditación: cuanto antes quieres la plata, más comisión pagas.',
            },
            {
              titulo: 'Usa WhatsApp Business para lo que no entra',
              texto:
                'Respuestas rápidas para «¿queda lugar?», un mensaje de ausencia fuera de horario y etiquetas para saber quién tiene pack y a quién le toca renovar.',
            },
            {
              titulo: 'Factura desde ARCA',
              texto:
                'Si eres monotributista o responsable inscripta, emites la factura electrónica con tu clave fiscal desde Comprobantes en línea o desde el Facturador de ARCA, sin pagar nada. Pregúntale a tu contador qué tipo de comprobante te toca.',
            },
          ],
        },
      ],
    },
    {
      id: 'app-para-reservar-clases-gratis',
      titulo: 'App para reservar clases gratis: lo que hay y lo que no',
      bloques: [
        {
          t: 'p',
          texto:
            'Si buscas una app con el nombre de tu estudio en el celular de tus alumnas, no la vas a encontrar en los planes gratuitos de terceros que revisamos: en SimplyBook.me, la app de cliente con tu marca no está entre las opciones del plan Free. La de Centra, que escribe esta guía, sí la incluye, gratis hasta 150 reservas al mes.',
        },
        {
          t: 'p',
          texto:
            'Lo que sí es gratis es la página de reservas: la de Google o la de tu plan gratuito se abre con un enlace desde cualquier celular, y tus alumnas pueden guardarla en la pantalla de inicio. Para empezar, alcanza. Si quieres ponerla en tu web, tienes los pasos para WordPress, Wix y Squarespace en [cómo poner las reservas en tu web](/ayuda/widget).',
        },
      ],
    },
    {
      id: 'lo-que-pierdes',
      titulo: 'Lo que pierdes con un programa de gestión de pilates gratis',
      bloques: [
        {
          t: 'p',
          texto:
            'Armarlo gratis funciona mientras todo pase por ti. Lo que se pierde, sobre todo con el kit de Google, WhatsApp y planilla:',
        },
        {
          t: 'lista',
          items: [
            '**Packs con vencimiento que se controlan solos.** Una planilla calcula las clases que quedan, pero nadie le avisa a la alumna que su pack vence el viernes. Si todavía los estás diseñando, mira [cómo armar los packs de pilates](/recursos/bonos-de-pilates).',
            '**Lista de espera.** Cuando alguien cancela, eres tú quien le escribe a la siguiente, si te enteras a tiempo.',
            '**Cobros que se siguen solos.** Con links de pago sueltos, cada mes revisas quién pagó y le recuerdas a quien no. La agenda de Google, por ejemplo, solo deja cobrar la cita con una suscripción de pago.',
            '**Facturación conectada.** ARCA emite la factura, pero no sabe qué vendiste ni a quién: lo copias tú.',
            '**Reservas de verdad en autoservicio.** Con WhatsApp, cada reserva es un mensaje que contestas tú; con una agenda de citas, cada clase de grupo es un parche.',
            '**Reglas que se cumplen solas.** Plazo de cancelación, cupo por máquina, qué pasa con una cancelación tarde: todo depende de que lo recuerdes y lo apliques igual a todas.',
          ],
        },
      ],
    },
    {
      id: 'coste-oculto',
      titulo: 'El costo oculto de lo gratis: horas, errores y pagos atrasados',
      bloques: [
        {
          t: 'p',
          texto:
            'Lo gratis se paga en tiempo. Haz la cuenta con tus números; acá va un ejemplo para que veas el orden de magnitud.',
        },
        {
          t: 'cifras',
          titulo: 'Ejemplo: lo que cuesta llevarlo todo a mano',
          cifras: [
            { valor: '7 h', etiqueta: 'al mes, si dedicas 20 minutos cada día hábil a reservas y cambios' },
            { valor: '$105.000', etiqueta: 'lo que valen esas horas si tu hora vale $15.000' },
            { valor: '$288.000', etiqueta: 'un abono de $144.000 que nadie reclama durante dos meses' },
          ],
          nota:
            'Cifras de ejemplo, no medidas: 20 minutos por 21 días hábiles son 420 minutos (7 horas); 7 horas por $15.000 son $105.000; dos meses de un abono de $144.000 (el pack de 8 de Aditi Pilates, nov-2026) son $288.000. Cambia cada número por los tuyos.',
        },
        {
          t: 'p',
          texto:
            'Súmale los errores: dos alumnas en el mismo lugar porque una reservó por WhatsApp y otra por el formulario, un pack que se descuenta dos veces o ninguna, una cancelación tarde que le cobras a una y le perdonas a otra. Cada uno cuesta poca plata y bastante confianza.',
        },
        {
          t: 'p',
          texto:
            'Y los datos: una planilla con los teléfonos y correos de tus alumnas es una base de datos personales para la Ley 25.326. Protégela con contraseña, no metas datos de salud (son datos sensibles) e inscríbela en el registro de la Agencia de Acceso a la Información Pública (AAIP).',
        },
      ],
    },
    {
      id: 'cuando-compensa-pagar',
      titulo: 'Cuándo conviene pagar un software',
      bloques: [
        {
          t: 'lista',
          items: [
            'Vendes abonos mensuales y cada mes persigues pagos.',
            'La lista de espera vive en tu WhatsApp y se te escapan lugares.',
            'Hay más de una persona reservando o dando clase: la planilla se desordena y las bajas de instructoras las cubres a fuerza de llamadas.',
            'Facturas cada cobro a mano en ARCA y se te acumula.',
            'Pasas más horas cuadrando que dando clase.',
          ],
        },
        {
          t: 'p',
          texto:
            'La cuenta es sencilla: conviene cuando el software cuesta menos que las horas que te ahorra. Ejemplo: con tu hora a $15.000, uno de $30.000 al mes se paga en cuanto te ahorra dos horas al mes. Para comparar precios, planes y permanencias, tienes la [comparativa del mejor software para estudios de pilates](/recursos/mejor-software-para-estudios-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'Si llegas a ese punto, Centra es gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia, y cobra con Mercado Pago. Si empezaste con una planilla, su importador lee Excel y te muestra un acta de lo importado, con botón de deshacer. Tienes los planes en [precios](/precios).',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Existe un software de pilates gratis de verdad?',
      a: 'Sí, con límites. SimplyBook.me tiene un plan gratuito con 50 reservas al mes, la agenda de citas de Google es gratis con una cuenta personal y Centra es gratis hasta 150 reservas al mes. Ninguno es ilimitado: el tope está en las reservas, en las funciones o en las comisiones por cobro.',
    },
    {
      q: '¿Qué app para reservar clases gratis puedo usar?',
      a: 'Para tus alumnas sirve cualquier página de reservas que se abra en el celular: la agenda de citas de Google o la de un plan gratuito como el de SimplyBook.me. Una app con el nombre y el ícono de tu estudio no aparece en los planes gratuitos de terceros que revisamos; en Centra va incluida, gratis hasta 150 reservas al mes.',
    },
    {
      q: '¿Puedo tener un sistema de turnos online gratuito en mi web?',
      a: 'Sí. Google permite insertar la página de reservas o un botón en tu web copiando un código, y SimplyBook.me incluye un widget de reservas en su plan Free.',
    },
    {
      q: '¿Puedo facturar gratis?',
      a: 'Sí: ARCA te deja emitir factura electrónica con tu clave fiscal desde Comprobantes en línea o desde el Facturador, en la web o en el celular, sin costo. Lo que no hace es saber qué vendiste: cada factura la cargas tú. Confirma con tu contador qué comprobante te toca.',
    },
    {
      q: '¿Cuánto cobra Mercado Pago por un link de pago?',
      a: 'No tiene costo fijo: paga una comisión por cada cobro, que depende de en cuántos días quieres tener la plata. A 10 días es un 4,39 % (consultado el 27-nov-2026). Revisa la tabla vigente en su web antes de fijar tus precios.',
    },
    {
      q: '¿Pierdo mis datos si después paso a un software de pago?',
      a: 'No, si los tienes ordenados: una fila por alumna con nombre, teléfono, correo, pack, clases y vencimiento. Antes de cambiar, pregúntale al programa nuevo si importa planillas, en qué formato y si puedes revisar la importación antes de darla por buena.',
    },
  ],
  fuentes: [
    { titulo: 'Google Calendar: información sobre las agendas de citas', url: 'https://support.google.com/calendar/answer/10729749?hl=es', consultada: '2026-09-25' },
    { titulo: 'Google Calendar: comparar las funciones premium de las agendas de citas', url: 'https://support.google.com/calendar/answer/16287038?hl=es', consultada: '2026-09-25' },
    { titulo: 'Google Calendar: compartir una agenda de citas', url: 'https://support.google.com/calendar/answer/10733297?hl=es', consultada: '2026-09-25' },
    { titulo: 'WhatsApp Business en App Store (WhatsApp Inc.)', url: 'https://apps.apple.com/ar/app/whatsapp-business/id1386412985', consultada: '2026-09-25' },
    { titulo: 'SimplyBook.me: pricing', url: 'https://simplybook.me/en/pricing', consultada: '2026-09-25' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
    { titulo: 'ARCA: modalidades de facturación electrónica para monotributistas', url: 'https://www.arca.gob.ar/facturacion/monotributo/modalidades.asp', consultada: '2026-11-27' },
    { titulo: 'ARCA: qué es el Facturador', url: 'https://www.arca.gob.ar/facturador/caracteristicas-y-funciones/que-es.asp', consultada: '2026-11-27' },
    { titulo: 'Infoleg: Ley 25.326 de Protección de los Datos Personales', url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/mejor-software-para-estudios-de-pilates',
    '/recursos/plantilla-control-de-asistencia-pilates',
    '/comparativa',
    '/precios',
  ],
  cta: {
    titulo: 'Gratis y con todo en un solo lugar',
    texto:
      'Empieza gratis con Centra, sin tarjeta: packs con vencimiento, lista de espera automática y cobros con Mercado Pago, gratis hasta 150 reservas al mes y sin permanencia.',
  },
  revision: [
    'Planes gratuitos de terceros (Google, SimplyBook.me) revisados el 25-sep-2026 y Mercado Pago el 27-nov-2026: cambian a menudo, repasarlos cada trimestre.',
    'Precio de Centra pasado el plan gratis: no se escribe, se edita en /interno/precios; el texto manda a /precios.',
    'TomoTurnos y SigueFit: solo se dice que los usan estudios porteños (Espacio Activa, Bive, Releve, nov-2026); no se revisaron sus planes.',
    'El ejemplo de $15.000 la hora es un supuesto para la cuenta, no un dato de mercado.',
  ],
};

export default articulo;
