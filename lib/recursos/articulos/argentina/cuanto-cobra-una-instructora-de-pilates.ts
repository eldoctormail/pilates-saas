import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// El sueldo de convenio sale del CCT 738/16 (UTEDYC, rama gimnasios) en las
// escalas que publican dos medios; no hay escala oficial del convenio a mano, se
// dice. Lo que cobra una instructora independiente por hora no se cifra: no hay
// fuente que lo sostenga.

const articulo: Articulo = {
  slug: 'cuanto-cobra-una-instructora-de-pilates',
  titulo: 'Cuánto cobra una instructora de pilates en Argentina: convenio, valor hora y monotributo',
  tituloSeo: 'Cuánto cobra una instructora de pilates en 2026',
  descripcion:
    'El sueldo del convenio de gimnasios (UTEDYC, CCT 738/16) de octubre de 2026, por mes y por hora, y qué cambia si la instructora factura como monotributista.',
  resumen:
    'Lo que cobra una instructora de pilates en Argentina según el convenio de gimnasios, pasado a valor hora, y qué cambia cuando trabaja como monotributista y le factura al estudio.',
  categoria: 'sustituciones',
  seccion: 'Sustituciones y equipo',
  publicado: '2026-11-24',
  actualizado: '2026-11-26',
  consultaPrincipal: 'cuánto cobra una instructora de pilates',
  consultas: [
    'sueldo instructora de pilates Argentina',
    'cuánto cobra un profesor de pilates por hora',
    'convenio UTEDYC gimnasios escala salarial',
    'CCT 738/16 instructor sueldo',
    'instructora de pilates monotributista',
  ],
  respuesta:
    'Si está en relación de dependencia en un gimnasio o estudio, su sueldo lo fija el convenio de UTEDYC para gimnasios (CCT 738/16). En la escala de octubre de 2026, una profesora de Educación Física cobra un básico de $1.466.432 a $1.547.040 por mes según el tamaño del local, y la categoría de instructora y entrenadora, $1.351.856, por 176 horas mensuales. Sobre eso se suman presentismo y antigüedad. Si factura como monotributista, el precio por hora lo acuerda con el estudio.',
  entradilla:
    'Cuánto cobra una instructora de pilates en Argentina depende, primero, de cómo trabaja: con recibo de sueldo bajo el convenio de gimnasios, o facturando al estudio como monotributista. Aquí tienes la escala del convenio, pasada a valor hora, y lo que cambia en cada caso.',
  secciones: [
    {
      id: 'convenio',
      titulo: 'El convenio de gimnasios: UTEDYC, CCT 738/16',
      bloques: [
        {
          t: 'p',
          texto:
            'El personal de gimnasios en relación de dependencia está bajo el **Convenio Colectivo de Trabajo 738/16**, que firma el sindicato UTEDYC con las cámaras del sector, en su rama gimnasios. El convenio distingue categorías; para un estudio de pilates las que importan son la de **profesora de Educación Física**, que a su vez cambia según el local tenga más o menos de cinco trabajadores, y la de **instructora y entrenadora**.',
        },
        {
          t: 'tabla',
          cabecera: ['Categoría', 'Básico mensual (176 h)', 'Por hora (cálculo)'],
          filas: [
            ['Profesora de Educación Física, local de más de 5 trabajadores', '$1.547.040', '$8.790'],
            ['Profesora de Educación Física, local de hasta 5 trabajadores', '$1.466.432', '$8.332'],
            ['Instructora y entrenadora', '$1.351.856', '$7.681'],
          ],
          nota: 'Básicos de la escala de octubre de 2026 publicada por Asistente Laboral Argentino, consultada el 24-nov-2026, para una jornada de 44 horas semanales (176 al mes). El valor hora es el básico dividido entre 176, redondeado al peso: un cálculo propio, no una cifra del convenio.',
        },
        {
          t: 'p',
          texto:
            'Las escalas se actualizan por acuerdos paritarios, a veces cada mes. iProfesional publicó a fines de septiembre de 2026 valores hora de $8.348, $7.914 y $7.295 para las mismas tres categorías, alrededor de un 5 % por debajo: es la diferencia entre un tramo y el siguiente. Antes de liquidar un sueldo, mira la escala del mes en curso.',
        },
      ],
    },
    {
      id: 'adicionales',
      titulo: 'Lo que se suma al básico',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Presentismo**: un 10 % del básico, según la escala publicada, si no hay faltas que lo hagan perder.',
            '**Antigüedad**: un 1 % del básico por cada año trabajado.',
            '**Aguinaldo y vacaciones**, como en cualquier relación de dependencia.',
            '**Cargas sociales** a cargo del estudio, que no se ven en el recibo pero sí en tu costo.',
          ],
        },
        {
          t: 'p',
          texto:
            'Así, una profesora de Educación Física con tres años de antigüedad en un local de hasta cinco personas cobra, con presentismo, aproximadamente un 13 % más que el básico de la tabla. Pídele a tu contador la liquidación exacta: los adicionales no remunerativos y los acuerdos del mes cambian el número.',
        },
      ],
    },
    {
      id: 'por-que-profesora',
      titulo: 'Profesora de Educación Física o instructora: por qué importa',
      bloques: [
        {
          t: 'p',
          texto:
            'En la Ciudad de Buenos Aires, la Ley 139 de gimnasios exige que las actividades las supervise un profesor o una profesora de Educación Física. Si tu estudio está en CABA, al menos una persona del equipo tiene que tener ese título, y su categoría de convenio es la más alta de la tabla. Más detalle en [los requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'Una certificación de método (reformer, mat, rehabilitación) no reemplaza ese título donde la norma lo pide. Sí suma para la calidad de la clase y suele pesar en lo que se acuerda por hora con una instructora que factura.',
        },
      ],
    },
    {
      id: 'monotributista',
      titulo: 'Si factura como monotributista',
      bloques: [
        {
          t: 'p',
          texto:
            'Muchas instructoras de pilates no están en relación de dependencia: dan clases en uno o varios estudios y facturan cada mes como monotributistas, con factura C. En ese caso no hay escala que aplicar: el valor de la hora lo acuerdan ella y el estudio, y no hay presentismo, antigüedad, aguinaldo ni cargas sociales.',
        },
        {
          t: 'p',
          texto:
            'Como referencia para negociar, el valor hora del convenio es un piso razonable: la instructora que factura paga su propio monotributo, con su jubilación y su obra social, y no cobra los días que no da clase. Por eso lo habitual es que su hora valga más que la del básico de convenio.',
        },
        {
          t: 'nota',
          titulo: 'Ojo con la relación encubierta',
          texto:
            'Si una instructora trabaja solo para ti, con horario fijo y bajo tus órdenes, puede ser una relación de dependencia aunque te facture. Es un riesgo laboral real: consúltalo con tu contador o con una abogada laboralista.',
        },
      ],
    },
    {
      id: 'cuanto-cuesta-al-estudio',
      titulo: 'Cuánto le cuesta una clase al estudio',
      bloques: [
        {
          t: 'p',
          texto:
            'Para tus precios, lo que cuenta no es el sueldo sino el **costo por clase**: lo que pagas por cada hora de clase dada, incluidas las cargas, el presentismo y las horas que la instructora está en el estudio sin dar clase. Con ese número sabes cuántas alumnas necesita cada clase para pagarse, y qué pasa cuando una instructora falta y otra la cubre: la sustituta puede tener otra categoría y otro costo, y conviene saberlo antes de pedirle que venga.',
        },
        {
          t: 'p',
          texto:
            'Por ejemplo, con un costo de unos $10.000 por hora de clase y packs a $18.000 por clase, una clase de reformer se paga con la primera alumna y deja margen desde la segunda; con el alquiler, los servicios y los impuestos, el punto de equilibrio sube. La cuenta completa está en [la rentabilidad de un estudio de pilates](/recursos/rentabilidad-estudio-de-pilates).',
        },
        {
          t: 'producto',
          titulo: 'La rentabilidad de cada clase, a la vista',
          texto:
            'Centra te enseña lo que ingresa cada clase menos lo que cuesta su instructora, con la tarifa por hora que pones a cada una.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto cobra por hora una instructora de pilates?',
      a: 'Con la escala de octubre de 2026 del convenio de gimnasios, el básico equivale a entre unos $7.700 y $8.800 por hora según la categoría. Si factura como monotributista, el valor lo acuerda con el estudio y suele ser más alto.',
    },
    {
      q: '¿Qué convenio se aplica a una instructora de pilates?',
      a: 'Si está en relación de dependencia en un gimnasio o estudio, el CCT 738/16 de UTEDYC, rama gimnasios.',
    },
    {
      q: '¿Cuántas horas son la jornada completa?',
      a: 'La escala publicada toma 44 horas semanales, 176 al mes. Una jornada parcial cobra en proporción.',
    },
    {
      q: '¿Qué se suma al básico?',
      a: 'Un 10 % de presentismo, un 1 % por año de antigüedad, aguinaldo y vacaciones. Además, el estudio paga las cargas sociales.',
    },
    {
      q: '¿Puede facturarme como monotributista?',
      a: 'Sí, si trabaja de forma independiente. Si en la práctica trabaja solo para ti, con horario fijo y bajo tus órdenes, puede considerarse una relación de dependencia: consúltalo con tu contador.',
    },
  ],
  fuentes: [
    { titulo: 'Asistente Laboral Argentino: escala salarial UTEDYC, rama gimnasios (CCT 738/16)', url: 'https://www.asistentelaboralargentino.com/escalas/utedyc-rama-gimnasios-738-16.html', consultada: '2026-11-24' },
    { titulo: 'iProfesional: aumento salarial en gimnasios, de cuánto es y escalas hasta octubre (28-sep-2026)', url: 'https://www.iprofesional.com/actualidad/465413-aumento-salarial-en-gimnasios-de-cuanto-es-y-escalas-hasta-octubre', consultada: '2026-11-24' },
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-24' },
  ],
  relacionadas: [
    '/funcionalidades/gestion-de-instructoras',
    '/funcionalidades/sustituciones',
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
  ],
  cta: {
    titulo: 'Sabe cuánto te cuesta cada clase',
    texto:
      'Con Centra ves la rentabilidad de cada clase, lo que ingresa menos lo que cuesta su instructora, y organizas las sustituciones con tu visto bueno. Empieza gratis, sin tarjeta y sin permanencia.',
  },
  revision: [
    'Las escalas de UTEDYC cambian casi cada mes: actualizar la tabla con la escala vigente y, si es posible, citar el acuerdo homologado en lugar de un medio.',
    'Confirmar con la escala oficial los porcentajes de presentismo (10 %) y antigüedad (1 % por año).',
    'Que una contadora o abogada laboralista revise el apartado de monotributo y relación encubierta.',
  ],
};

export default articulo;
