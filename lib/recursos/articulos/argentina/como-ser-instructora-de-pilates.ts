import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// En Argentina no hay una cualificación oficial de pilates como la AFD805_3: hay
// instructorados privados (precios en pesos de cuatro institutos, 27-nov-2026),
// centros con licencia de STOTT PILATES y, en la Ciudad de Buenos Aires, la Ley
// 139 de gimnasios, que pide un profesor de Educación Física que supervise.

const articulo: Articulo = {
  slug: 'como-ser-instructora-de-pilates',
  titulo: 'Cómo ser instructora de pilates en Argentina: instructorado, título y trabajo',
  tituloSeo: 'Cómo ser instructora de pilates: cursos y precios',
  descripcion:
    'Instructorados de mat y reformer con horas y precio en pesos, qué pide la Ley 139 en la Ciudad, STOTT PILATES, el monotributo y cómo conseguir trabajo.',
  resumen:
    'El camino para ser instructora de pilates en Argentina: qué instructorados hay con sus horas y precios, qué título piden en la Ciudad de Buenos Aires, mat o reformer, el monotributo y cómo encontrar trabajo.',
  categoria: 'sustituciones',
  seccion: 'Sustituciones y equipo',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'cómo ser instructora de pilates',
  consultas: [
    'cómo ser profesora de pilates',
    'instructorado de pilates',
    'dónde estudiar para ser profesora de pilates',
    'cuánto cuesta un instructorado de pilates',
    'profesora de pilates trabajo',
  ],
  respuesta:
    'Para ser instructora de pilates en Argentina hay que formarse, sumar horas de práctica y cumplir lo que pida tu ciudad. No hay un título nacional de instructora de pilates: lo habitual es un instructorado privado de mat, de reformer o de los dos, que en cuatro institutos revisados cuesta entre $209.700 y $520.000. En la Ciudad de Buenos Aires, además, la Ley 139 pide que las clases las supervise un profesor de Educación Física.',
  entradilla:
    'Para dar clases de pilates no hay una sola puerta: instructorados privados con programas muy distintos, escuelas internacionales con licencia y normas que cambian de una ciudad a otra. Acá tienes cómo ser instructora de pilates paso a paso, con las horas y los precios que publica cada instituto y cómo conseguir tus primeras clases.',
  secciones: [
    {
      id: 'como-ser-instructora-de-pilates-paso-a-paso',
      titulo: 'Cómo ser instructora de pilates, paso a paso',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Prueba el método como alumna',
              texto: 'Antes de pagar un instructorado, toma clases: vas a saber si te gusta enseñarlo y qué estilo buscas.',
            },
            {
              titulo: 'Decide por dónde empezar: mat, reformer o los dos',
              texto: 'Es la decisión que más cambia el precio y la duración; la vemos más abajo.',
            },
            {
              titulo: 'Elige instituto y modalidad',
              texto: 'Presencial, mixta u online. Mira cuántas horas son con profesora delante y dónde vas a practicar en máquina, no solo el total.',
            },
            {
              titulo: 'Suma práctica y aprueba la evaluación',
              texto: 'Todos los instructorados que revisamos terminan con una evaluación o un examen final.',
            },
            {
              titulo: 'Averigua qué pide tu ciudad',
              texto: 'En la Ciudad de Buenos Aires, la Ley 139 pide un profesor de Educación Física que supervise las clases; en otras ciudades, consulta la norma local.',
            },
            {
              titulo: 'Date de alta en el monotributo y contrata un seguro',
              texto: 'Si vas a facturar por tu cuenta, antes de la primera clase.',
            },
            {
              titulo: 'Busca tus primeras clases y hazte visible',
              texto: 'En estudios, como reemplazo, en portales de empleo y por tu cuenta.',
            },
          ],
        },
      ],
    },
    {
      id: 'titulo-y-ley-139',
      titulo: 'Qué título hace falta: instructorado y profesor de Educación Física',
      bloques: [
        {
          t: 'p',
          texto:
            'En Argentina no existe un título oficial de instructora de pilates. Los instructorados son cursos privados: certifican lo que enseña cada instituto, y algunos suman el aval de una universidad o de una asociación privada, pero ninguno de los que revisamos dice ser un título oficial del Ministerio de Educación.',
        },
        {
          t: 'p',
          texto:
            'Lo que sí puede pesar es la norma de tu ciudad. La **Ley 139 de la Ciudad de Buenos Aires** regula los gimnasios, y la guía de inspección de la Agencia Gubernamental de Control la aplica a los estudios de pilates. Pide que las actividades las supervise una profesora o un profesor de **Educación Física** con título reconocido por la Ciudad, y que el personal tenga capacitación en reanimación cardiopulmonar (RCP) y primeros auxilios, con su certificado.',
        },
        {
          t: 'lista',
          items: [
            '**Si eres profesora de Educación Física**, el instructorado te suma el método; con tu título puedes ser quien supervisa en un estudio de la Ciudad.',
            '**Si no lo eres**, puedes dar clase con tu instructorado, pero el estudio donde trabajes en la Ciudad tiene que tener a alguien con ese título. Los estudios lo saben: pregunta cómo lo resuelven.',
            '**En todos los casos**, ten al día tu certificado de RCP y primeros auxilios: la Ley 139 lo pide al personal, y cualquier estudio lo va a valorar.',
          ],
        },
        {
          t: 'p',
          texto:
            'En otras ciudades y provincias la regla puede ser distinta. El resto de los trámites de un estudio, en [requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'donde-estudiar-para-ser-profesora-de-pilates',
      titulo: 'Dónde estudiar para ser profesora de pilates: instructorados en Argentina',
      bloques: [
        {
          t: 'p',
          texto: 'Estos son cuatro institutos que publican su instructorado con precio en pesos:',
        },
        {
          t: 'tabla',
          cabecera: ['Instituto', 'Programa', 'Qué cubre', 'Duración y modalidad', 'Precio en su web'],
          filas: [
            ['ESBA (CABA)', 'Instructorado de Pilates Mat y Reformer', 'Mat y reformer', '300 h, unos 4 meses, 100 % online', '$209.700 (hasta 3 cuotas de $69.900); certifica el Instituto Universitario River Plate'],
            ['AMAIP (Belgrano, CABA)', 'Instructorado de Pilates Reformer y Mat, mixto', 'Mat y reformer', '4 meses: 16 clases online y 4 encuentros presenciales', '$520.000 ($40.000 de matrícula y 4 cuotas de $120.000)'],
            ['AMAIP', 'Instructorado de Pilates Reformer y Mat, campus virtual', 'Mat y reformer', 'A tu ritmo, online', '$265.000 en un pago'],
            ['Escuela Core', 'Instructorado de Pilates Mat Virtual', 'Solo mat', 'Unos 4 meses, online, con un encuentro mensual en vivo', '$300.000; el reformer, aparte, otros $300.000'],
            ['Instituto ICAI (Liniers, CABA)', 'Curso Pilates Reformer', 'Solo reformer', '7 encuentros de 3 h, presencial u online', '$30.000 de matrícula y $190.000 online, o $35.000 por encuentro presencial'],
          ],
          nota:
            'Fuente: web oficial de cada instituto, consultada el 27-nov-2026 (enlaces en las fuentes). Precios de lista tal como los publican, sin fecha de vigencia salvo ESBA (actualizada el 24-nov-2026). Cambian a menudo y por convocatoria: pídelos por escrito antes de pagar.',
        },
        {
          t: 'p',
          texto:
            'También hay escuelas internacionales. STOTT PILATES (Merrithew) lista centros con licencia en la Ciudad de Buenos Aires, en Rosario y en Neuquén; su certificación pide un examen escrito y uno práctico, y como requisito previo, experiencia enseñando movimiento y conocimientos de anatomía. El precio lo fija cada centro: pídelo directamente.',
        },
        {
          t: 'p',
          texto:
            'Antes de anotarte, pregunta cuántas horas son presenciales, dónde vas a practicar en reformer si el curso es online, si la evaluación final va incluida y quién firma el certificado.',
        },
      ],
    },
    {
      id: 'cuanto-cuesta-la-formacion-de-pilates',
      titulo: 'Cuánto cuesta un instructorado de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'Con los precios de la tabla, un instructorado de mat y reformer va de $209.700 (ESBA, online) a $520.000 (AMAIP, mixto). Al comparar, suma lo que no siempre va en el precio:',
        },
        {
          t: 'lista',
          items: [
            '**La matrícula.** AMAIP e ICAI la cobran aparte de las cuotas.',
            '**El certificado.** Escuela Core cobra $30.000 más por un certificado internacional, además del suyo.',
            '**La práctica en máquina.** Si haces el reformer online, necesitas un estudio donde practicar: pregunta si el instituto te lo consigue o si lo pagas tú.',
            '**El curso de RCP y primeros auxilios**, si no lo tienes.',
            '**Viajes**, si los encuentros presenciales no son en tu ciudad.',
          ],
        },
      ],
    },
    {
      id: 'suelo-o-reformer',
      titulo: 'Instructorado de pilates: ¿mat o reformer?',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Mat.** El más corto y el más barato, y se puede estudiar online sin máquina. Te sirve para clases de colchoneta, con o sin accesorios.',
            '**Reformer.** Te abre los estudios de máquinas, que son la mayoría de los que buscan instructoras, pero pide practicar en un reformer.',
            '**Mat y reformer juntos.** La opción más común en los institutos que revisamos, y a veces más barata que pagar los dos por separado (en Escuela Core, $600.000 por separado contra $209.700 en el combinado de ESBA).',
          ],
        },
        {
          t: 'p',
          texto: 'Empezar por mat y sumar reformer cuando ya das clases reparte el gasto en el tiempo.',
        },
      ],
    },
    {
      id: 'profesora-de-pilates-trabajo',
      titulo: 'Profesora de pilates: trabajo en estudios, por tu cuenta, a domicilio u online',
      bloques: [
        { t: 'p', texto: 'Hay tres vías, y se pueden combinar:' },
        {
          t: 'lista',
          items: [
            '**En estudios y gimnasios.** Lleva tu CV a los de tu zona y ofrécete también para reemplazos: te dan horas de clase y te dan a conocer. Lo que se paga, en relación de dependencia o por hora, lo tienes en [cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates).',
            '**En portales de empleo.** Busca «instructora de pilates» en los portales de empleo generales y en los grupos de instructoras de tu ciudad.',
            '**Por tu cuenta.** Como monotributista puedes dar clases en varios estudios, a domicilio u online.',
          ],
        },
        {
          t: 'p',
          texto:
            '**Si trabajas por tu cuenta**, date de alta en el monotributo de ARCA con tu CUIT y clave fiscal antes de la primera clase: la categoría depende de lo que factures en doce meses, y cada clase cobrada lleva factura C. Ingresos Brutos se paga además en tu provincia (en la Ciudad de Buenos Aires, desde 2026, junto con el monotributo). Qué impuestos llevan tus clases, en [las clases de pilates y el IVA](/recursos/iva-clases-de-pilates).',
        },
        {
          t: 'p',
          texto:
            '**Contrata un seguro de responsabilidad civil** antes de la primera clase si trabajas por tu cuenta. Si una alumna se lesiona en clase, el reclamo te llega a ti. Si das clases a domicilio o al aire libre, comprueba que la póliza lo cubre.',
        },
      ],
    },
    {
      id: 'que-te-encuentren-los-estudios',
      titulo: 'Cómo hacer que los estudios te encuentren',
      bloques: [
        {
          t: 'p',
          texto:
            'Cuando un estudio necesita cubrir una baja o abrir un horario nuevo, busca rápido y cerca. Pónselo fácil:',
        },
        {
          t: 'lista',
          items: [
            'Di qué formación tienes (mat, reformer u otros aparatos), con qué instituto y cuántas horas.',
            'Di si eres profesora de Educación Física: en la Ciudad de Buenos Aires puede ser lo que decida.',
            'Indica tu zona y tu disponibilidad, también para reemplazos.',
            'Ten a mano tu certificado de RCP, tu constancia de monotributo y tu seguro.',
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto se tarda en ser instructora de pilates?',
      a: 'Los instructorados de mat y reformer que revisamos duran unos 4 meses (ESBA declara 300 horas), y el curso de reformer de ICAI son 7 encuentros. A eso súmale la práctica hasta que te sientas segura dando clase.',
    },
    {
      q: '¿Hay un título oficial de instructora de pilates?',
      a: 'No. Los instructorados son cursos privados; algunos los certifica una universidad privada o una asociación, pero ninguno de los que revisamos dice ser un título oficial. El título que sí reconoce la Ciudad de Buenos Aires para supervisar un gimnasio es el de profesor de Educación Física (Ley 139).',
    },
    {
      q: '¿Cuánto cuesta un instructorado de pilates?',
      a: 'En los cuatro institutos que revisamos (27-nov-2026), el de mat y reformer va de $209.700 online a $520.000 en modalidad mixta. Suma matrícula, certificado y la práctica en máquina si no van incluidos.',
    },
    {
      q: '¿Puedo hacer el instructorado online?',
      a: 'Sí: ESBA, Escuela Core y el campus virtual de AMAIP son online. Para reformer, asegúrate de tener dónde practicar en una máquina: sin eso, aprendes la teoría pero no el oficio.',
    },
    {
      q: '¿Es mejor empezar por mat o por reformer?',
      a: 'Mat es más corto y barato y se puede estudiar online; reformer te abre los estudios de máquinas, pero pide practicar en una. Varios institutos venden los dos juntos por menos que por separado.',
    },
    {
      q: '¿Qué necesito para dar clases de pilates por mi cuenta o a domicilio?',
      a: 'CUIT, clave fiscal y el alta en el monotributo de ARCA para facturar, Ingresos Brutos en tu provincia, un seguro de responsabilidad civil y, si tu ciudad lo pide, el título que exija su norma.',
    },
    {
      q: '¿Dónde encuentro trabajo de profesora de pilates?',
      a: 'En los estudios y gimnasios de tu zona, ofreciéndote también para reemplazos, y en los portales de empleo generales buscando «instructora de pilates».',
    },
  ],
  fuentes: [
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-27' },
    { titulo: 'Agencia Gubernamental de Control (CABA): Guía de inspección de Gimnasios y Pilates', url: 'https://static.buenosaires.gob.ar/sites/default/files/2026-03/Guia%20Gimnasios%20y%20Pilates%20OK003.pdf', consultada: '2026-11-27' },
    { titulo: 'ESBA: Instructorado de Pilates Mat y Reformer', url: 'https://extension.esba.edu.ar/curso/instructorado-pilates-mat-reformer/', consultada: '2026-11-27' },
    { titulo: 'AMAIP: Instructorado de Pilates Reformer y Mat (presencial-online)', url: 'https://amaip.com.ar/curso.php?id=76', consultada: '2026-11-27' },
    { titulo: 'AMAIP: Instructorado de Pilates Reformer y Mat (campus virtual)', url: 'https://amaip.com.ar/curso.php?id=143', consultada: '2026-11-27' },
    { titulo: 'Escuela Core: Instructorado de Pilates Mat Virtual', url: 'https://escuelacore.com.ar/producto/instructorado-de-pilates-mat-y-reformer/', consultada: '2026-11-27' },
    { titulo: 'Instituto ICAI: Curso Pilates Reformer', url: 'https://www.institutoicai.com.ar/productos/curso-pilates-reformer/', consultada: '2026-11-27' },
    { titulo: 'STOTT PILATES: centro con licencia en Buenos Aires', url: 'https://stottpilates.com/education/hostcenters/ARGENTINA_BuenosAires.html', consultada: '2026-11-27' },
    { titulo: 'STOTT PILATES: centro con licencia en Santa Fe (Rosario)', url: 'https://www.stottpilates.com/education/hostcenters/ARGENTINA_SantaFe.html', consultada: '2026-11-27' },
    { titulo: 'STOTT PILATES: centro con licencia en Neuquén', url: 'https://www.stottpilates.com/education/hostcenters/ARGENTINA_Neuquen.html', consultada: '2026-11-27' },
    { titulo: 'Argentina.gob.ar: Inscribirme como monotributista', url: 'https://www.argentina.gob.ar/servicio/inscribirme-como-monotributista', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
    '/recursos/cuanto-cobra-una-instructora-de-pilates',
    '/recursos/iva-clases-de-pilates',
    '/recursos/cubrir-baja-instructora',
  ],
  cta: {
    titulo: 'Y si algún día abres tu propio estudio',
    texto:
      'Muchas instructoras terminan armando el suyo. Antes de dar el paso, repasa habilitación, impuestos, local y lo que vas a necesitar para empezar.',
    enlace: { href: '/recursos/requisitos-para-abrir-un-estudio-de-pilates', texto: 'Qué necesitas para abrir tu estudio →' },
  },
  revision: [
    'Precios de los cuatro institutos tomados de su web el 27-nov-2026: cambian por convocatoria. Las fechas del curso de ICAI en su web eran confusas; no se citan.',
    'AMAIP habla de «aval internacional» y «certificación oficial» sin nombrar un organismo público; el texto no lo da por oficial.',
    'Ley 139: el requisito de profesor de Educación Física y de RCP sale de la propia ley y de la guía de la AGC (CABA). No se revisaron las normas de otras provincias o municipios.',
    'STOTT PILATES: centros listados en su web el 27-nov-2026; el precio no lo publican.',
  ],
};

export default articulo;
