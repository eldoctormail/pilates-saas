import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// El protocolo es el mismo; cambia la parte de la licencia médica: Ley de
// Contrato de Trabajo (arts. 208 a 211, sin cambios en el 208 con la Ley
// 27.802; el aviso del 209 y los certificados digitales, sí) y la instructora
// monotributista, que no tiene licencia paga del estudio.

// Rehecho el 7-oct-2026 a partir de la guía antigua del mismo nombre (TSX), que
// contaba el proceso con Centra pero no decía nada de lo que pregunta quien
// busca esto: qué hacer esta noche, cuánto esperar a cada compañera, quién paga
// la baja médica y si se puede contratar a alguien. Mantiene la URL.
//
// La regla del margen por candidata (un tercio de lo que falta, entre 2 y 45
// minutos, recordatorio y después la siguiente) es la del motor de Centra
// (lib/sustituciones/ventanas.ts): si cambia allí, cambia aquí.

const articulo: Articulo = {
  slug: 'cubrir-baja-instructora',
  titulo: 'Cómo cubrir la baja de una instructora: protocolo, plazos y lo que dice la ley',
  tituloSeo: 'Cómo cubrir la baja de una instructora de pilates',
  descripcion: 'Qué preparar antes de la primera baja, cuánto esperar a cada sustituta, qué decir a las alumnas y quién paga una licencia por enfermedad en Argentina.',
  resumen: 'El protocolo para cubrir una clase cuando una instructora no puede darla: lo que hay que tener preparado, el orden para avisar, cuánto esperar y lo que dice la Ley de Contrato de Trabajo.',
  categoria: 'sustituciones',
  seccion: 'Sustituciones y equipo',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'cubrir baja instructora',
  consultas: [
    'sustituir a una instructora de pilates',
    'qué hacer si una profesora no puede dar la clase',
    'quién paga la licencia por enfermedad de una profesora',
    'contrato eventual para reemplazar a una empleada',
    'buscar sustituta para una clase',
  ],
  respuesta:
    'Para cubrir la baja de una instructora sin pasar la noche al teléfono necesitas tres cosas preparadas antes de que pase: quién puede dar cada formato y a qué horas, en qué orden avisarlas y cuánto esperar a cada una antes de pasar a la siguiente. Si la baja es médica y la instructora es tu empleada, del día 4 al 15 le pagas tú el 60 % de su base reguladora, y puedes contratar a alguien con un contrato de sustitución.',
  entradilla:
    'Son las once de la noche y una instructora te escribe que mañana no puede dar la clase de las nueve. Cubrirla no debería depender de cuántas compañeras te contesten al WhatsApp. Este es el protocolo, desde lo que conviene tener preparado hasta lo que dice la ley si la ausencia es por enfermedad.',
  secciones: [
    {
      id: 'el-problema',
      titulo: 'Por qué una baja se come la noche',
      bloques: [
        {
          t: 'p',
          texto: 'Cubrir una clase parece cosa de cinco minutos, pero casi nunca lo es. Lo difícil no es la baja, es todo lo que va detrás: saber quién puede dar esa clase en concreto, escribir a una, esperar, escribir a otra, cambiar el horario y avisar a las alumnas antes de que se presenten.',
        },
        {
          t: 'p',
          texto: 'Cada paso depende de ti y llega a la peor hora. Por eso lo que más tiempo ahorra no es avisar más rápido, sino tener decidido de antemano lo que siempre acabas improvisando.',
        },
      ],
    },
    {
      id: 'preparar-antes',
      titulo: 'Lo que tienes que tener preparado antes de la primera baja',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Quién da cada formato.** No todas pueden dar reformer, suelo, prenatal o barre. Una tabla sencilla, instructora por formato, evita escribir a quien no puede.',
            '**Cuándo puede cada una.** Su disponibilidad semanal, sus vacaciones y las clases que ya tiene. Así no se le ofrece una clase que se pisa con otra suya.',
            '**El orden.** A quién avisar primero: quien mejor conoce a ese grupo, quien vive más cerca o quien menos horas lleva ese mes.',
            '**Un solo canal para avisar de la baja.** Si una avisa por WhatsApp, otra llama y otra lo dice en el grupo, alguna se pierde.',
            '**Lo que se le paga a la sustituta.** Que lo sepa antes de aceptar: si lo cobra como una clase suya o con un extra por avisar tarde.',
            '**El mensaje a las alumnas.** Escrito de antemano, en dos versiones: cambia la instructora o se cancela la clase.',
          ],
        },
      ],
    },
    {
      id: 'protocolo',
      titulo: 'El protocolo, paso a paso',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Que avise cuanto antes y por el canal acordado',
              texto: 'Cada hora de margen cuenta. Pídele que avise en cuanto sepa que no puede, aunque sea de noche, y siempre por el mismo sitio.',
            },
            {
              titulo: 'Mira quién puede de verdad',
              texto: 'Las que dan ese formato, están libres a esa hora y no tienen otra clase que se pise. Ese es tu listado, en el orden que decidiste.',
            },
            {
              titulo: 'Avisa de una en una, con un plazo para contestar',
              texto: 'Escribir a todas a la vez parece más rápido, pero acaba con dos que dicen que sí y una que se queda mal. Una cada vez, con un plazo claro, y si no contesta, se lo recuerdas y pasas a la siguiente.',
            },
            {
              titulo: 'Si nadie puede, decide pronto',
              texto: 'Fija una hora límite para decidir: cambiar el formato con la instructora que haya, darla tú o cancelarla. Cancelar con tiempo molesta menos que una clase cancelada en la puerta.',
            },
            {
              titulo: 'Confírmalo por escrito y cambia el horario',
              texto: 'La sustituta tiene que saber la hora, la sala y cuántas alumnas hay apuntadas, y el horario tiene que decir quién da la clase.',
            },
            {
              titulo: 'Avisa a las alumnas apuntadas',
              texto: 'Que sepan quién da la clase o que se ha cancelado antes de salir de casa. Es el paso que más caro sale cuando falla.',
            },
            {
              titulo: 'Apunta las horas',
              texto: 'Para la nómina o para la factura de la sustituta, y para saber a fin de mes quién cubre más.',
            },
          ],
        },
      ],
    },
    {
      id: 'cuanto-esperar',
      titulo: 'Cuánto esperar a que conteste cada sustituta',
      bloques: [
        {
          t: 'p',
          texto: 'Un plazo fijo no sirve: media hora es muy poco para una clase de pasado mañana y demasiado para una que empieza dentro de una hora. La regla que seguimos en el motor de sustituciones de Centra es dar a cada candidata **un tercio del tiempo que falta para la clase, con un mínimo de 2 minutos y un máximo de 45**. Si no contesta en ese plazo, se le recuerda; si en otro plazo igual sigue sin contestar, se pasa a la siguiente (en Centra, eso lo hace solo el modo autónomo; en el asistido, te avisa a ti para que decidas).',
        },
        {
          t: 'tabla',
          cabecera: ['Falta para la clase', 'Plazo para contestar', 'Hasta pasar a otra'],
          filas: [
            ['24 horas', '45 min', '1 h 30 min'],
            ['6 horas', '45 min', '1 h 30 min'],
            ['2 horas', '40 min', '1 h 20 min'],
            ['1 hora', '20 min', '40 min'],
            ['30 minutos', '10 min', '20 min'],
          ],
          nota: 'El plazo es un tercio de lo que falta, con un mínimo de 2 y un máximo de 45 minutos; se vuelve a calcular con cada candidata. Así queda margen para avisar a las alumnas, salvo en una baja de último minuto.',
        },
      ],
    },
    {
      id: 'baja-medica',
      titulo: 'Si es por enfermedad: quién paga y si puedes tomar a alguien',
      bloques: [
        {
          t: 'p',
          texto: 'Depende de si la instructora es tu empleada en relación de dependencia o trabaja como monotributista y te factura por clase. Si es empleada, una enfermedad o un accidente no relacionados con el trabajo («enfermedad inculpable») le dan una licencia paga que pagas tú, el estudio:',
        },
        {
          t: 'tabla',
          cabecera: ['Antigüedad de la empleada', 'Sin cargas de familia', 'Con cargas de familia'],
          filas: [
            ['Menos de 5 años', 'Hasta 3 meses pagos', 'Hasta 6 meses pagos'],
            ['5 años o más', 'Hasta 6 meses pagos', 'Hasta 12 meses pagos'],
          ],
          nota: 'Artículo 208 de la Ley de Contrato de Trabajo (Ley 20.744), que la Ley de Modernización Laboral 27.802 de 2026 no cambió: la empleada cobra su remuneración entera durante la licencia. Terminado ese plazo, el estudio le conserva el puesto un año más, sin sueldo (artículo 211). Para un caso concreto, consulta con tu contador o un abogado laboral.',
        },
        {
          t: 'p',
          texto: 'La empleada tiene que avisarte durante el primer día hábil de ausencia y decirte dónde va a estar (artículo 209). Desde la reforma de 2026, si avisa tarde solo cobra esos días si demuestra que no pudo avisar a tiempo, y el certificado médico tiene que ser digital, de una plataforma registrada, con diagnóstico, tratamiento y días de reposo (Decreto 407/2026). Puedes pedir un control con tu médico (artículo 210).',
        },
        {
          t: 'p',
          texto: 'Si la instructora es **monotributista**, el estudio no le paga nada por estar enferma: cobra solo las clases que da. Tampoco tienes un puesto que guardarle, pero conviene acordar de antemano cómo avisa y quién la cubre.',
        },
        {
          t: 'p',
          texto: 'Si la que falta es tu empleada y la ausencia va a ser larga, puedes tomar a otra persona para reemplazarla con un **contrato eventual** (artículo 99 de la Ley de Contrato de Trabajo), que dura mientras dure la necesidad y que tienes que poder justificar. Para clases sueltas, lo habitual es que las cubran las compañeras o una instructora monotributista que factura por clase.',
        },
        {
          t: 'p',
          texto: 'Cuánto se paga por hora a una instructora, en relación de dependencia o monotributista, está en [cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates).',
        },
      ],
    },
    {
      id: 'avisar-alumnas',
      titulo: 'Qué decir a las alumnas',
      bloques: [
        {
          t: 'p',
          texto: 'Corto, pronto y con la decisión ya tomada. Dos mensajes que sirven tal cual:',
        },
        {
          t: 'nota',
          titulo: 'Si cambia la instructora',
          texto: 'Hola, mañana a las 9:00 la clase de reformer la da Lucía en lugar de Ana. Todo lo demás sigue igual. Si prefieres cancelar, puedes hacerlo sin perder la sesión hasta las 7:00.',
        },
        {
          t: 'nota',
          titulo: 'Si se cancela la clase',
          texto: 'Hola, sentimos tener que cancelar la clase de mañana a las 9:00. Te hemos devuelto la sesión y tienes plaza en la de las 19:00 si te viene bien.',
        },
        {
          t: 'p',
          texto: 'Lo de dejar cancelar sin perder la sesión cuando cambia la instructora es una decisión tuya, pero cuesta poco y evita la queja de quien venía por ella.',
        },
      ],
    },
    {
      id: 'no-depender',
      titulo: 'Que una baja no pare el estudio',
      bloques: [
        {
          t: 'p',
          texto: 'El mejor protocolo no salva un horario en el que una sola instructora da todo el reformer de la mañana. Si una baja te deja sin nadie que pueda dar un formato, el problema no es la noche de la baja: es que ese formato depende de una persona.',
        },
        {
          t: 'lista',
          items: [
            '**Al menos dos instructoras por formato.** Aunque la segunda dé solo una clase a la semana, ya conoce la sala y al grupo.',
            '**Que se roten las franjas.** Un grupo que solo ha tenido una instructora se va con ella.',
            '**Disponibilidad al día.** Una lista de quién puede cubrir que tiene seis meses no sirve de mucho.',
          ],
        },
      ],
    },
    {
      id: 'con-tentare',
      titulo: 'Cómo lo hace Centra',
      bloques: [
        {
          t: 'p',
          texto: 'En Centra, la instructora avisa desde la app del estudio o desde un enlace en el móvil, sin instalar nada. El sistema mira quién da ese formato, su disponibilidad, sus vacaciones y bajas y las clases que ya tiene, y te propone la candidata. En el modo asistido, el que viene puesto, no escribe a nadie hasta que das el visto bueno; después la avisa por correo, con un enlace para aceptar o rechazar, se lo recuerda con los plazos de arriba (también por WhatsApp si lo conectaste) y, si sigue sin contestar, te avisa para que decidas a quién escribir. En el modo autónomo (según tu plan) pasa sola a la siguiente y lo hace todo sin ti.',
        },
        {
          t: 'p',
          texto: 'Cuando una acepta, la clase se reasigna y las alumnas reciben el aviso por correo y en su app (viene encendido y se puede apagar). Si se acaban las candidatas, te avisa con las opciones: buscar otra vez, cambiar la clase o cancelarla avisando a las alumnas. Lo que no hace es reorganizar solas las clases ya programadas cuando apuntas unas vacaciones: te avisa de las que se quedan sin quien las dé. Todo está en [sustituciones](/funcionalidades/sustituciones).',
        },
        {
          t: 'producto',
          titulo: 'Que una baja no te cueste la noche',
          texto: 'Da de alta a tu equipo con lo que da y cuándo puede, y la próxima baja empieza con la candidata ya propuesta.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Quién paga la licencia por enfermedad de una instructora?',
      a: 'Si es tu empleada, la pagas tú: cobra su sueldo entero hasta 3 meses (6 si tiene 5 años o más de antigüedad), el doble con cargas de familia, según el artículo 208 de la Ley de Contrato de Trabajo. Si es monotributista, el estudio no le paga nada: cobra las clases que da.',
    },
    {
      q: '¿Puedo tomar a alguien mientras una instructora está de licencia?',
      a: 'Sí, con un contrato eventual para reemplazarla mientras dure la ausencia (artículo 99 de la Ley de Contrato de Trabajo). Para clases sueltas, lo habitual es que las cubra una compañera o una instructora monotributista.',
    },
    {
      q: '¿Cuánto hay que esperar a que conteste una sustituta?',
      a: 'Depende de lo que falte para la clase. Una regla que funciona: un tercio del tiempo que queda, entre 2 y 45 minutos. Si no contesta, se le recuerda, y si sigue sin contestar en otro plazo igual, se pasa a la siguiente o decides tú.',
    },
    {
      q: '¿Es mejor escribir a todas las instructoras a la vez?',
      a: 'Suele salir peor: dos dicen que sí y hay que decirle a una que ya no, o nadie contesta porque cada una cree que lo hará otra. Una a una, en un orden decidido de antemano y con un plazo, cubre la clase igual de rápido y sin malentendidos.',
    },
    {
      q: '¿Qué pasa si nadie puede cubrir la clase?',
      a: 'Decide pronto entre cambiar el formato, darla tú o cancelarla. Si la cancelas, devuelve la sesión a las alumnas apuntadas y ofréceles otra clase; cuanto antes lo sepan, menos molesta.',
    },
    {
      q: '¿Hay que pagar más a la sustituta por avisar tarde?',
      a: 'No hay una regla: lo decides tú. Lo importante es que lo sepa antes de aceptar. Un pequeño extra en las sustituciones de última hora hace que quieran cubrirlas.',
    },
  ],
  fuentes: [
    { titulo: 'Infoleg: Ley de Contrato de Trabajo 20.744, texto ordenado (arts. 99 y 208 a 211)', url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm', consultada: '2026-11-27' },
    { titulo: 'iProfesional: reforma laboral, qué cambia en la licencia por enfermedad y cómo avisar al empleador (2-jul-2026)', url: 'https://www.iprofesional.com/index.php/impuestos/458952-reforma-laboral-que-cambia-en-la-licencia-por-enfermedad-y-como-avisar-al-empleador', consultada: '2026-11-27' },
    { titulo: 'El Economista: licencias por enfermedad, qué cambia con la reforma laboral 2026 (27-jul-2026)', url: 'https://eleconomista.com.ar/economia/licencias-por-enfermedad-que-cambia-reforma-laboral-2026-n96967', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/funcionalidades/sustituciones',
    '/recursos/cuanto-cobra-una-instructora-de-pilates',
    '/funcionalidades/gestion-de-instructoras',
    '/recursos/como-gestionar-un-estudio-de-pilates',
  ],
  cta: {
    titulo: 'La próxima baja, con la sustituta ya propuesta',
    texto: 'Empieza gratis con Centra, sin tarjeta: da de alta a tu equipo con sus formatos y su disponibilidad, y arranca en modo asistido, aprobando cada aviso.',
  },
  revision: [
    'Licencia por enfermedad: art. 208 de la LCT sin cambios con la Ley 27.802 según iProfesional (2-jul-2026); el texto de Infoleg que se leyó llegaba cortado antes del art. 208: verificar la tabla contra el texto oficial actualizado.',
    'Certificados digitales y aviso tardío: Decreto 407/2026, leído en prensa; enlazar el Boletín Oficial.',
    'Plazo por candidata: lib/sustituciones/ventanas.ts (un tercio, entre 2 y 45 minutos); si cambia, cambiar la tabla.',
  ],
};

export default articulo;
