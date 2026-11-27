import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// En Argentina la franquicia la regula el Código Civil y Comercial (arts. 1.512 a
// 1.524), no un real decreto: no hay plazo de 20 días ni documento obligatorio,
// sí la información de dos años de unidades similares (art. 1.514) y un plazo
// mínimo de cuatro años (art. 1.516). Solo se encontraron dos marcas con
// condiciones públicas (Namasté y Sporty Woman), en dólares, y se dice.

const articulo: Articulo = {
  slug: 'franquicia-de-pilates',
  titulo: 'Franquicia de pilates en Argentina: cuánto cuesta, cómo funciona y qué revisar antes de firmar',
  tituloSeo: 'Franquicia de pilates: cuánto cuesta y qué revisar',
  descripcion:
    'Canon, regalías e inversión de franquicias reales en Argentina, lo que dice el Código Civil y Comercial y cómo decidir entre franquicia o estudio propio.',
  resumen:
    'Cómo funciona una franquicia de pilates en Argentina, cuánto piden las marcas que publican sus condiciones, qué dice el Código Civil y Comercial y qué preguntar antes de firmar o de abrir tu propio estudio.',
  categoria: 'abrir',
  seccion: 'Abrir un estudio',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'franquicia de pilates',
  consultas: [
    'franquicia de pilates en Argentina',
    'franquicia de pilates reformer',
    'franquicia o estudio propio',
    'cuánto cuesta una franquicia de pilates',
  ],
  respuesta:
    'Una franquicia de pilates te cede una marca, un método y asistencia a cambio de un derecho de ingreso y de pagos periódicos, normalmente regalías sobre lo que facturas y un fondo de publicidad. En Argentina, las condiciones públicas que encontramos se dan en dólares: Namasté Pilates pide US$ 15.000 de ingreso más unos US$ 35.000 de equipamiento, con regalías del 5 %. Por ley, la marca tiene que darte antes de firmar la información económica de dos años de unidades similares.',
  entradilla:
    'Una franquicia de pilates no es un atajo ni una trampa: es un contrato por el que pagas una marca que ya funciona y aceptas sus reglas. Acá tienes lo que cuestan las que publican sus cifras en Argentina, qué te tienen que mostrar antes de firmar y cómo compararlo con abrir tu propio estudio.',
  secciones: [
    {
      id: 'como-funciona-una-franquicia-de-pilates',
      titulo: 'Cómo funciona una franquicia de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'El Código Civil y Comercial dice que hay franquicia cuando una empresa, el franquiciante, le permite a otra, el franquiciado, usar un sistema probado para vender bienes o servicios bajo su nombre, su emblema o su marca, y le presta asistencia técnica o comercial durante todo el contrato a cambio de un pago (artículo 1.512). El franquiciante tiene que ser el titular de esa marca y del resto de los derechos del sistema, o tener derecho a usarlos y transmitirlos.',
        },
        {
          t: 'p',
          texto: 'En la práctica, estos son los conceptos que vas a comparar entre marcas:',
        },
        {
          t: 'lista',
          items: [
            '**Derecho de ingreso (canon de entrada).** Un pago único al firmar por entrar en la red.',
            '**Regalías.** Un pago periódico mientras dura el contrato, normalmente un porcentaje de lo que facturas, a veces con un mínimo mensual.',
            '**Fondo de publicidad.** Otro porcentaje para las campañas de la marca, o la obligación de invertir tú en anuncios. Pregunta qué parte se gasta en tu ciudad.',
            '**Inversión total.** Ingreso, obra del local, máquinas, decoración, software y lanzamiento. Suele multiplicar varias veces el derecho de ingreso.',
            '**Exclusividad territorial.** La zona en la que la marca no puede abrir otra unidad sin tu acuerdo.',
            '**Duración.** Los años de contrato y cómo se renueva. Las dos marcas que revisamos fijan 5 años.',
            '**Formación.** Qué formación inicial incluye, cuál es la continua y quién va a formar a tus instructoras.',
          ],
        },
      ],
    },
    {
      id: 'cuanto-cuesta-una-franquicia-de-pilates',
      titulo: 'Cuánto cuesta una franquicia de pilates en Argentina',
      bloques: [
        {
          t: 'p',
          texto:
            'Pocas marcas publican sus condiciones. Estas son las dos que encontramos con cifras, una de pilates con reformer y un gimnasio para mujeres con clases de pilates mat: no es una lista completa ni una recomendación, sirve para ver el orden de magnitud.',
        },
        {
          t: 'tabla',
          cabecera: ['Marca', 'Inversión', 'Derecho de ingreso', 'Regalías y publicidad', 'Contrato y local'],
          filas: [
            ['Namasté Pilates & Training (zona norte del Gran Buenos Aires)', 'US$ 35.000 de equipamiento (reformers y bicicletas), más la obra', 'US$ 15.000', '5 % de regalías y 2 % de publicidad sobre los ingresos del mes', '5 años; local desde 80 m²'],
            ['Sporty Woman, formato Circuit (gimnasio para mujeres)', 'Desde US$ 35.000, ingreso incluido', 'US$ 20.000', 'Del 3 % al 5 % desde el segundo mes, con un piso de US$ 300; US$ 500 al mes en anuncios de Meta, a tu cargo', '5 años con exclusividad; local desde unos 60 m²'],
            ['Sporty Woman, formato Full (con clases de yoga, pilates mat y barre)', 'Desde US$ 73.000, ingreso incluido', 'US$ 20.000', 'Las mismas', '5 años con exclusividad; local desde 300 m²'],
          ],
          nota: 'Namasté: ficha en Expansión Franquicia, sin fecha visible (© 2023), consultada el 27-nov-2026. Sporty Woman: nota de iProfesional del 18-oct-2026. Pueden estar desactualizadas: la única cifra que vale es la que te den por escrito antes de firmar.',
        },
        {
          t: 'p',
          texto:
            'El costo se parte en tres: lo que pagas por entrar, lo que inviertes en armar el estudio y lo que pagas cada mes mientras dura el contrato. Unas regalías del 5 % más un 2 % de publicidad salen de lo que facturas todos los meses, ganes o no ese mes: métetelas en la previsión desde el primer día. Y como las cifras están en dólares y tus clases se cobran en pesos, haz la cuenta con el tipo de cambio de hoy y con uno peor. Para compararlo con armarlo por tu cuenta, tienes el desglose en [cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'franquicia-o-estudio-propio',
      titulo: 'Franquicia o estudio propio: pros y contras',
      bloques: [
        {
          t: 'tabla',
          cabecera: ['Aspecto', 'Franquicia', 'Estudio propio'],
          filas: [
            ['Marca', 'Conocida desde el primer día, si lo es en tu ciudad', 'La construyes tú desde cero'],
            ['Método y formación', 'Te lo dan hecho y probado', 'Lo defines tú y eliges dónde formarte'],
            ['Inversión inicial', 'Derecho de ingreso y un local con el estándar de la marca', 'Sin ingreso; tú decides el nivel de obra y de máquinas'],
            ['Pagos cada mes', 'Regalías y publicidad sobre lo que facturas', 'Ninguno a terceros por usar una marca'],
            ['Libertad', 'Imagen, proveedores y software, muchas veces marcados por la central', 'Total, también para equivocarte'],
            ['Salida', 'La que diga el contrato: duración, preaviso y no competencia', 'Vendes, traspasas o cierras cuando quieras'],
          ],
        },
        {
          t: 'p',
          texto:
            'Una franquicia conviene sobre todo si no vienes del sector o si la marca tiene tirón en tu zona. Si ya eres instructora y tienes alumnas, pagarías en parte por algo que ya tienes. En los dos casos la pregunta de fondo es cuánto te queda a fin de mes. Lo explicamos en [rentabilidad de un estudio de pilates](/recursos/rentabilidad-estudio-de-pilates) y, si vas por tu cuenta, en [cómo abrir un estudio de pilates](/recursos/como-abrir-un-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'lo-que-dice-la-ley',
      titulo: 'Lo que dice el Código Civil y Comercial',
      bloques: [
        {
          t: 'p',
          texto:
            'La franquicia está en los artículos 1.512 a 1.524 del Código Civil y Comercial. Lo que más te importa antes de firmar:',
        },
        {
          t: 'lista',
          items: [
            '**Información antes de firmar.** El franquiciante tiene que darte la información económica y financiera de la evolución de **dos años** de unidades similares a la que vas a abrir, que hayan funcionado un tiempo suficiente, en el país o en el extranjero (artículo 1.514).',
            '**Manual y asistencia.** También tiene que transmitirte el saber hacer, darte un manual de operaciones y asistencia técnica durante todo el contrato (artículo 1.514).',
            '**Plazo mínimo de cuatro años.** Si el contrato dice menos o no dice nada, dura cuatro años; al vencer, se renueva solo por un año salvo que una parte avise con 30 días (artículos 1.516 y 1.506).',
            '**Exclusividad.** Salvo que el contrato la limite, la marca no puede abrir otra unidad en tu territorio sin tu consentimiento, y tú no puedes tener negocios que compitan (artículo 1.517).',
            '**La rentabilidad es tuya.** El franquiciante no responde por la rentabilidad del sistema ni por tus deudas, y en tus facturas tiene que constar que eres un contratista independiente (artículo 1.520).',
            '**Salida.** Para no renovar hay que avisar con un mes por cada año de contrato, hasta seis meses, y una cláusula de no competencia después del contrato vale como máximo un año y en un territorio razonable (artículo 1.522).',
          ],
        },
        {
          t: 'nota',
          titulo: 'La información de dos años, por escrito',
          texto:
            'La ley no fija con cuántos días de anticipación ni en qué formato te la tienen que dar. Pídela por escrito, antes de pagar nada, y que se refiera a unidades parecidas a la tuya en tamaño y zona. Si una marca te pide una seña antes de mostrártela, desconfía.',
        },
      ],
    },
    {
      id: 'preguntas-antes-de-firmar',
      titulo: 'Preguntas antes de firmar una franquicia de pilates',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: '¿La marca es suya y está registrada?',
              texto:
                'Pide el título de la marca y compruébalo tú en el [buscador de marcas del INPI](https://www.argentina.gob.ar/registro-de-marcas). Si el nombre no está registrado en Argentina, lo que compras vale menos. Cómo buscarla lo explicamos en [nombres para estudio de pilates](/recursos/nombres-para-estudio-de-pilates).',
            },
            {
              titulo: '¿Cuántas unidades cerraron y por qué?',
              texto:
                'Pide también hablar con dos o tres franquiciadas actuales y pregúntales cuánto tardaron en cubrir gastos.',
            },
            {
              titulo: '¿De dónde salen las cifras de recupero?',
              texto:
                'Algunas marcas publican en cuántos meses se recupera la inversión: Namasté dice unos 30. Pide los números reales de dos años de unidades comparables, como manda el artículo 1.514, no la media de las mejores.',
            },
            {
              titulo: '¿Sobre qué se calculan las regalías?',
              texto:
                'Si son sobre la facturación con o sin impuestos, si hay un mínimo mensual aunque factures poco (Sporty Woman fija un piso de US$ 300) y si se cobran en dólares o en pesos.',
            },
            {
              titulo: '¿Qué zona es mía?',
              texto:
                'Exclusividad por barrio, por radio o por localidad, y qué pasa si la marca vende clases online en tu zona.',
            },
            {
              titulo: '¿Qué estoy obligada a comprar y a usar?',
              texto:
                'Máquinas, proveedores, reformas, uniformes y programa de reservas. Pregunta si el software va incluido o se paga aparte y si podrás llevarte los datos de tus alumnas si te vas.',
            },
            {
              titulo: '¿Cómo salgo, y cuánto cuesta renovar?',
              texto:
                'Duración, renovación, traspaso y no competencia. Namasté, por ejemplo, cobra la renovación por otros 5 años: un 20 % de la inversión total. Una no competencia de más de un año va contra el artículo 1.522: que la revise tu abogado.',
            },
            {
              titulo: '¿Quién me asesora a mí?',
              texto:
                'El franquiciante asesora a su red, no a ti. Lleva el contrato y el plan financiero a un abogado y a un contador independientes antes de firmar.',
            },
          ],
        },
      ],
    },
    {
      id: 'si-montas-tu-estudio-propio',
      titulo: 'Si al final armas tu estudio propio',
      bloques: [
        {
          t: 'p',
          texto:
            'Lo que te da una franquicia se puede armar por partes: el método, con tu formación; la marca, con un buen nombre registrado; y el sistema, con tus procesos y tu software. Para el nombre tienes ideas y pasos en [nombres para estudio de pilates](/recursos/nombres-para-estudio-de-pilates), y para los trámites, [requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'En el software, Centra cubre lo que en algunas franquicias pone la central: tus alumnas reservan y cancelan solas desde el celular, vendes packs y abonos, cobras con Mercado Pago, la lista de espera funciona sola y gestionas los reemplazos de instructoras con tu visto bueno. Es gratis hasta 150 reservas al mes, sin permanencia, y si abres más sedes, el plan Cadena las reúne en [un solo acceso](/funcionalidades/multi-centro).',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto cuesta una franquicia de pilates en Argentina?',
      a: 'En las dos marcas con condiciones públicas que encontramos, la inversión arranca en unos US$ 35.000 y el derecho de ingreso va de US$ 15.000 a US$ 20.000. A eso se suman las regalías, del 3 % al 5 % de lo que facturas, y la publicidad.',
    },
    {
      q: '¿Es rentable una franquicia de pilates?',
      a: 'Depende del local, de la zona y de cuánto se lleve la marca cada mes. Pide la información de dos años de unidades similares que te debe dar por ley, habla con franquiciadas actuales y haz tu propia previsión con tu contador.',
    },
    {
      q: '¿Qué diferencia hay entre el derecho de ingreso y las regalías?',
      a: 'El derecho de ingreso se paga una vez, al firmar, por entrar en la red. Las regalías se pagan mientras dura el contrato, normalmente cada mes, como porcentaje de lo que facturas, a veces con un mínimo.',
    },
    {
      q: '¿Qué tiene que darme el franquiciante antes de firmar?',
      a: 'La información económica y financiera de la evolución de dos años de unidades similares a la tuya (artículo 1.514 del Código Civil y Comercial). Durante el contrato, además, el saber hacer, un manual de operaciones y asistencia técnica.',
    },
    {
      q: '¿Cuánto dura un contrato de franquicia?',
      a: 'Al menos cuatro años: si el contrato dice menos o no dice nada, el Código Civil y Comercial lo fija en cuatro (artículo 1.516). Las dos marcas que revisamos ofrecen 5 años.',
    },
    {
      q: '¿Franquicia o estudio propio: qué es mejor?',
      a: 'La franquicia te da marca, método y apoyo a cambio de ingreso y regalías; el estudio propio te da libertad y todo el margen, con más riesgo al empezar. Si ya tienes experiencia y alumnas, el estudio propio suele tener más sentido; si partes de cero, una red probada acorta el aprendizaje.',
    },
  ],
  fuentes: [
    {
      titulo: 'Infoleg: Código Civil y Comercial de la Nación (Ley 26.994), arts. 1.506 y 1.512 a 1.524',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      consultada: '2026-11-27',
    },
    {
      titulo: 'GAF Franquicias: capítulo de franquicias del Código Civil y Comercial (copia en PDF)',
      url: 'https://www.gaf-franquicias.com/Codigo_Civil_Comercial-Libro_tercero-Titulo4-Capitulo19Franquicias.pdf',
      consultada: '2026-11-27',
    },
    {
      titulo: 'Expansión Franquicia: ficha de Namasté Pilates & Training',
      url: 'https://expansionfranquicia.com/Listings/namaste/',
      consultada: '2026-11-27',
    },
    {
      titulo: 'iProfesional: un gimnasio para mujeres lanza franquicias desde US$ 35.000 (18-oct-2026)',
      url: 'https://www.iprofesional.com/negocios/466305-cuanto-cuesta-la-franquicia-del-gimnasio-para-mujeres-sporty-woman',
      consultada: '2026-11-27',
    },
    {
      titulo: 'Argentina.gob.ar: registro de marcas (INPI)',
      url: 'https://www.argentina.gob.ar/registro-de-marcas',
      consultada: '2026-11-27',
    },
  ],
  relacionadas: [
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/como-abrir-un-estudio-de-pilates',
    '/recursos/nombres-para-estudio-de-pilates',
    '/precios',
  ],
  cta: {
    titulo: 'Si armas tu propio estudio, empieza con el sistema listo',
    texto:
      'Reservas desde el celular, packs, cobros con Mercado Pago, lista de espera y reemplazos en un solo programa. Gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia.',
  },
  revision: [
    'Solo dos marcas con condiciones públicas: Namasté (ficha sin fecha, © 2023) y Sporty Woman (iProfesional, 18-oct-2026). La ficha de Tantien Pilates en Franchising Company no se pudo leer. Reconfirmar la tabla en cada revisión.',
    'Los artículos del CCyC se leyeron en la copia en PDF de GAF Franquicias; cotejarlos con Infoleg antes de publicar.',
    'Precio del plan Cadena en pesos: no se escribe (se edita en /interno/precios).',
  ],
};

export default articulo;
