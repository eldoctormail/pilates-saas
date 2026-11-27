import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// La habilitación es municipal: se toma la Ciudad de Buenos Aires como ejemplo
// porque es la única con una guía oficial para «Gimnasios y Pilates»; el resto
// del país se dice que cambia, sin inventar requisitos de otros municipios.

const articulo: Articulo = {
  slug: 'requisitos-para-abrir-un-estudio-de-pilates',
  titulo: 'Requisitos para abrir un estudio de pilates en Argentina: ARCA, habilitación, profesor y seguridad',
  tituloSeo: 'Requisitos para abrir un estudio de pilates',
  descripcion: 'CUIT y monotributo, Ingresos Brutos, habilitación municipal, profesor de educación física, apto físico y emergencias: los trámites en orden, con su norma.',
  resumen: 'Los trámites para abrir un estudio de pilates en Argentina, en orden y con su fuente: ARCA, Ingresos Brutos, la habilitación de tu municipio, quién puede dar clase y qué controla la inspección.',
  categoria: 'abrir',
  seccion: 'Abrir un estudio',
  publicado: '2026-11-24',
  actualizado: '2026-11-26',
  consultaPrincipal: 'requisitos para abrir un estudio de pilates',
  consultas: [
    'qué necesito para abrir un estudio de pilates en Argentina',
    'habilitación estudio de pilates CABA',
    'monotributo estudio de pilates',
    'profesor de educación física pilates requisito',
    'certificado de aptitud física gimnasio',
  ],
  respuesta:
    'Para abrir un estudio de pilates en Argentina necesitas: CUIT y clave fiscal, el alta en el monotributo o como responsable inscripto en ARCA, el alta en Ingresos Brutos de tu provincia, la habilitación o autorización de tu municipio para el local y, en la Ciudad de Buenos Aires, cumplir la Ley 139 de gimnasios: clases supervisadas por un profesor de Educación Física, certificado de aptitud física de cada alumna y un servicio de emergencias médicas contratado.',
  entradilla:
    'Los requisitos para abrir un estudio de pilates no están en una sola ley: se los reparten ARCA, tu provincia y tu municipio. Aquí los tienes en el orden en que conviene hacerlos, con la norma o la página oficial de cada uno, y con la Ciudad de Buenos Aires como ejemplo de lo que mira una inspección.',
  secciones: [
    {
      id: 'lista-de-requisitos',
      titulo: 'Requisitos para abrir un estudio de pilates, en orden',
      bloques: [
        {
          t: 'pasos',
          items: [
            { titulo: 'CUIT y clave fiscal', texto: 'Sin CUIT y clave fiscal no hay ningún otro trámite: son la puerta de ARCA, de tu provincia y, en muchos municipios, de la habilitación.' },
            { titulo: 'Monotributo o responsable inscripto en ARCA', texto: 'Si empiezas sola o con pocos ingresos, el monotributo es lo habitual; si lo superas o abres una sociedad, pasas al régimen general (IVA y Ganancias).' },
            { titulo: 'Ingresos Brutos', texto: 'Es un impuesto provincial. En la Ciudad de Buenos Aires, desde 2026 se paga junto con el monotributo en una sola cuota.' },
            { titulo: 'Habilitación o autorización del local', texto: 'La da tu municipio, y es lo que más cambia de una ciudad a otra. Antes de firmar el alquiler, pregunta si el local admite el uso.' },
            { titulo: 'Quién da clase y qué piden a las alumnas', texto: 'En CABA, la Ley 139 exige profesor de Educación Física, certificado de aptitud física y emergencias médicas.' },
            { titulo: 'Seguridad del local', texto: 'Plan de evacuación, matafuegos, instalación eléctrica y sanitarios: lo que revisa la inspección.' },
            { titulo: 'Datos personales y de salud', texto: 'La ficha de salud de tus alumnas son datos sensibles para la Ley 25.326.' },
          ],
        },
      ],
    },
    {
      id: 'arca',
      titulo: 'ARCA: CUIT, clave fiscal y monotributo',
      bloques: [
        {
          t: 'p',
          texto:
            'Según la página oficial del trámite, antes de inscribirte en el monotributo necesitas tener **clave fiscal, CUIT y domicilio fiscal electrónico**. El alta es gratuita y se hace desde el servicio «Monotributo» de ARCA: eliges que trabajas de forma independiente, informas el mes de inicio, la actividad, la facturación anual que estimas y los datos del local (superficie y alquiler), declaras tus aportes jubilatorios y eliges obra social.',
        },
        {
          t: 'p',
          texto:
            'El monotributo tiene categorías de la A a la K según lo que facturas en doce meses, y también cuentan la superficie del local, la energía eléctrica y el alquiler. Un estudio con varios reformers en un local grande puede quedar en una categoría alta aunque recién empiece: haz la cuenta con esos tres datos antes de elegir local, no solo con la facturación.',
        },
        {
          t: 'tabla',
          cabecera: ['Categoría', 'Tope de ingresos anuales', 'Cuota mensual (servicios)'],
          filas: [
            ['A', '$12.009.410,45', '$49.527,18'],
            ['C', '$24.670.494,31', '$66.020,12'],
            ['E', '$36.028.231,33', '$119.811,45'],
            ['G', '$53.995.798,87', '$230.312,94'],
            ['H', '$81.924.660,37', '$522.706,68'],
            ['K', '$126.610.838,75', '$1.614.446,04'],
          ],
          nota: 'Valores vigentes desde el 1 de agosto de 2026 y en noviembre de 2026, según iProfesional (3-nov-2026) y MyContador (6-nov-2026), que publican la misma tabla. La cuota reúne impuesto integrado, aporte jubilatorio y obra social. La próxima recategorización vence el 5 de febrero de 2027.',
        },
        {
          t: 'p',
          texto:
            'Desde el primer cobro tienes que entregar factura electrónica. Si eres monotributista, emites factura C. Más detalle sobre impuestos en [las clases de pilates y el IVA](/recursos/iva-clases-de-pilates).',
        },
      ],
    },
    {
      id: 'ingresos-brutos',
      titulo: 'Ingresos Brutos: el impuesto de tu provincia',
      bloques: [
        {
          t: 'p',
          texto:
            'Ingresos Brutos lo cobra cada provincia y la Ciudad de Buenos Aires, así que el alta se hace donde está el estudio. En CABA, quien está en el monotributo y trabaja solo en la Ciudad va al **Régimen Simplificado de Ingresos Brutos**, con las mismas categorías de la A a la K.',
        },
        {
          t: 'p',
          texto:
            'Desde el 1 de enero de 2026, la Ciudad y ARCA cobran el monotributo y el Régimen Simplificado **en un único pago** (el «Monotributo Unificado»): la categoría es la misma en los dos y la recategorización de febrero y agosto vale para ambos. Quien se inscribe con domicilio fiscal en CABA lo declara al darse de alta. En otras provincias el régimen puede ser distinto: consulta el organismo de tu provincia antes de empezar a facturar.',
        },
      ],
    },
    {
      id: 'habilitacion',
      titulo: 'La habilitación del local: lo decide tu municipio',
      bloques: [
        {
          t: 'p',
          texto:
            'Abrir las puertas de un local al público necesita el permiso del municipio, y cada uno lo llama y lo tramita a su manera. Antes de firmar un alquiler, pide en el municipio que te confirmen que en esa dirección se puede dar clases de actividad física: es el error más caro, porque un local que no admite el uso no se arregla con obra.',
        },
        {
          t: 'p',
          texto:
            'En la Ciudad de Buenos Aires controla la **Agencia Gubernamental de Control (AGC)**, que publica una guía de inspección para «Gimnasios y Pilates». Pide el certificado de autorización de actividades económicas con su código QR, que el local esté librado al uso y que solo se ocupe la superficie autorizada, sin pasar la capacidad. La propia guía aclara que es orientativa y que la inspección puede pedir más.',
        },
        {
          t: 'nota',
          titulo: 'Fuera de CABA',
          texto:
            'Rosario, Córdoba, Mendoza o cualquier municipio del conurbano tienen su propio trámite y sus propios requisitos. No los copies de la Ciudad: consulta la oficina de habilitaciones de tu municipio.',
        },
      ],
    },
    {
      id: 'ley-139',
      titulo: 'Quién da clase y qué se pide a las alumnas (Ley 139 de CABA)',
      bloques: [
        {
          t: 'p',
          texto:
            'La Ley 139 de la Ciudad de Buenos Aires llama «gimnasio» a los establecimientos destinados a la enseñanza o práctica de actividades físicas no competitivas, y la guía de la AGC la aplica a los estudios de pilates. Lo que pide:',
        },
        {
          t: 'lista',
          items: [
            '**Profesor de Educación Física**: las actividades tienen que estar supervisadas por una profesora o un profesor con título reconocido por la Ciudad.',
            '**Certificado de aptitud física** de cada persona que entrena. La guía de la AGC pide que incluya estudios electrocardiográficos, que lo emita un especialista y que se actualice cada año.',
            '**Servicio de emergencias médicas** contratado, y el personal capacitado en reanimación cardiopulmonar y primeros auxilios, con su certificado.',
            '**Botiquín de primeros auxilios**, según la reglamentación.',
          ],
        },
        {
          t: 'producto',
          titulo: 'El apto físico de cada alumna, en su ficha',
          texto:
            'En Centra cada alumna tiene su ficha con los datos de salud, que solo ve quien debe verlos. Así sabes, antes de la clase, quién tiene el apto al día.',
        },
      ],
    },
    {
      id: 'seguridad-del-local',
      titulo: 'Lo que revisa una inspección en el local',
      bloques: [
        {
          t: 'p',
          texto: 'La guía de la AGC repasa, entre otras cosas:',
        },
        {
          t: 'lista',
          items: [
            'Un **sistema de autoprotección** (Ley 5920): plano de evacuación visible y visado, roles del personal y su capacitación.',
            'Salidas libres, sin obstáculos y señalizadas, y pasos de al menos 1,50 m de ancho.',
            '**Matafuegos**: al menos uno cada 200 m² o fracción por piso, con manómetro y marbete.',
            'Instalación eléctrica con tablero tapado, térmicas, disyuntor diferencial y medición de puesta a tierra.',
            'Espejos sobre estructura fija y vidrios laminados o templados en mamparas.',
            'Vestuarios, sanitarios, desinfección y limpieza de tanques de agua, con sus comprobantes.',
            'El libro de inspección, la prohibición de fumar y, si tienes cartel en la fachada, su permiso y un seguro de responsabilidad civil.',
          ],
        },
        {
          t: 'p',
          texto:
            'La guía no da costos ni tasas: el arancel de la habilitación depende del municipio y del local.',
        },
      ],
    },
    {
      id: 'datos-de-salud',
      titulo: 'Los datos de salud de tus alumnas',
      bloques: [
        {
          t: 'p',
          texto:
            'Lesiones, embarazo o una condición cardíaca son **datos sensibles** para la Ley 25.326 de Protección de los Datos Personales. Pide solo lo que necesitas para dar la clase con seguridad, guárdalo donde no lo vea cualquiera y explica a tus alumnas para qué lo usas.',
        },
        {
          t: 'llamada',
          texto: 'Centra guarda la ficha de salud de cada alumna con su consentimiento y con acceso por rol: recepción no ve el detalle.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Necesito ser profesora de Educación Física para abrir un estudio de pilates?',
      a: 'En la Ciudad de Buenos Aires, la Ley 139 exige que las actividades las supervise una profesora o un profesor de Educación Física con título reconocido por la Ciudad. La dueña puede no serlo, pero el estudio tiene que tener a alguien con ese título. En otras ciudades, consulta la norma local.',
    },
    {
      q: '¿Qué certificado médico tienen que traer las alumnas?',
      a: 'En CABA, un certificado de aptitud física. La guía de inspección de la AGC pide que incluya estudios electrocardiográficos, que lo emita un especialista y que se actualice todos los años.',
    },
    {
      q: '¿Puedo empezar en el monotributo?',
      a: 'Sí, si tu facturación anual y los parámetros de superficie, energía y alquiler entran en alguna categoría. El alta en ARCA es gratuita. Si los superas o abres una sociedad, vas al régimen general.',
    },
    {
      q: '¿Pago Ingresos Brutos aparte?',
      a: 'Depende de la provincia. En la Ciudad de Buenos Aires, desde enero de 2026, el monotributo y el Régimen Simplificado de Ingresos Brutos se pagan en una sola cuota.',
    },
    {
      q: '¿Cuánto cuesta la habilitación?',
      a: 'Lo fija cada municipio, y depende del local. La guía de inspección de la Ciudad de Buenos Aires no publica costos.',
    },
  ],
  fuentes: [
    { titulo: 'Argentina.gob.ar: Inscribirme como monotributista', url: 'https://www.argentina.gob.ar/servicio/inscribirme-como-monotributista', consultada: '2026-11-24' },
    { titulo: 'iProfesional: ARCA confirmó cuánto hay que pagar de monotributo en noviembre, categoría por categoría', url: 'https://www.iprofesional.com/impuestos/468222-arca-confirmo-cuanto-hay-que-pagar-monotributo-noviembre-2026-categoria-por-categoria', consultada: '2026-11-24' },
    { titulo: 'MyContador: ARCA confirmó las escalas del monotributo de noviembre de 2026', url: 'https://blog.mycontador.com.ar/arca-confirmo-las-escalas-del-monotributo-de-noviembre-2026-y-cuanto-hay-que-pagar-segun-cada-categoria/', consultada: '2026-11-24' },
    { titulo: 'El Cronista: así será el pago unificado de monotributo e Ingresos Brutos en CABA', url: 'https://www.cronista.com/columnistas/adios-a-la-doble-cuota-asi-sera-el-pago-unificado-de-monotributo-e-ingresos-brutos-en-caba', consultada: '2026-11-24' },
    { titulo: 'Agencia Gubernamental de Control (CABA): Guía de inspección de Gimnasios y Pilates', url: 'https://static.buenosaires.gob.ar/sites/default/files/2026-03/Guia%20Gimnasios%20y%20Pilates%20OK003.pdf', consultada: '2026-11-24' },
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-24' },
  ],
  relacionadas: [
    '/recursos/como-abrir-un-estudio-de-pilates',
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
    '/recursos/iva-clases-de-pilates',
    '/funcionalidades/ficha-de-clienta',
    '/funcionalidades/facturacion',
  ],
  cta: {
    titulo: 'Con los papeles en regla, que la gestión no te quite horas',
    texto: 'Centra lleva las reservas, los bonos, los cobros con Mercado Pago y la factura electrónica de ARCA de tu estudio desde el primer día, con la ficha de salud de cada alumna. Empieza gratis.',
  },
  revision: [
    'Ley 139: la página del Boletín Oficial indica que la Ley 6779/2024 derogó su artículo 1 (la definición de gimnasio) y que la Ley 6316/2020 sustituyó el artículo 3; se leyó el texto original. Revisar el texto actualizado del Digesto antes de publicar.',
    'Monotributo Unificado de CABA: la fuente es una nota de El Cronista; buscar la resolución conjunta de ARCA y AGIP para citarla.',
    'Tabla del monotributo: cambia cada semestre (agosto y febrero). Actualizar en la recategorización de febrero de 2027.',
  ],
};

export default articulo;
