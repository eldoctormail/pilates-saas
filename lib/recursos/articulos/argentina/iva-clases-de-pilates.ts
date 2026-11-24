import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Solo lo que dicen la Ley de IVA (texto de la biblioteca de ARCA), la página de
// comprobantes de ARCA y la de monotributo del Estado. El encaje de la exención
// educativa con un estudio concreto no se afirma: lo decide su contador.

const articulo: Articulo = {
  slug: 'iva-clases-de-pilates',
  titulo: '¿Las clases de pilates llevan IVA en Argentina? Monotributo, responsable inscripto y factura',
  tituloSeo: '¿Llevan IVA las clases de pilates en Argentina?',
  descripcion:
    'Si eres monotributista, no cobras IVA aparte y emites factura C. Si eres responsable inscripto, el gimnasio paga IVA: qué dice la ley y qué factura toca.',
  resumen:
    'Qué pasa con el IVA de una clase de pilates en Argentina según tu situación frente a ARCA, con la ley que grava a los gimnasios y la factura que corresponde en cada caso.',
  categoria: 'espana',
  seccion: 'Argentina e impuestos',
  publicado: '2026-11-24',
  consultaPrincipal: '¿las clases de pilates llevan IVA?',
  consultas: [
    'IVA clases de pilates Argentina',
    'monotributo estudio de pilates IVA',
    'gimnasio paga IVA',
    'factura C o factura B estudio de pilates',
    'clases de pilates exentas de IVA',
  ],
  respuesta:
    'Depende de tu situación en ARCA. Si eres monotributista, el IVA va dentro de la cuota mensual del monotributo: no lo sumas al precio y emites factura C. Si eres responsable inscripto, la Ley de IVA grava los servicios de gimnasios, así que la clase lleva IVA y emites factura B a la alumna consumidora final. La exención de la ley es para la enseñanza incorporada a planes oficiales; si encaja con tu estudio lo confirma tu contador.',
  entradilla:
    'La pregunta por el IVA de una clase de pilates tiene en Argentina una respuesta que empieza por otra pregunta: ¿eres monotributista o responsable inscripto? De eso depende si sumas el impuesto al precio, qué factura emites y qué tienes que presentar cada mes.',
  secciones: [
    {
      id: 'depende-de-tu-situacion',
      titulo: 'El IVA de una clase de pilates depende de tu situación en ARCA',
      bloques: [
        {
          t: 'p',
          texto:
            'En Argentina no hay una tasa de IVA «para el pilates». Lo que decide es cómo estás inscripta en ARCA: como **monotributista**, el régimen simplificado para pequeños contribuyentes, o en el **régimen general** como responsable inscripta en IVA. La mayoría de los estudios que empiezan con una sola dueña lo hacen en el monotributo, y ahí el IVA no se cobra aparte.',
        },
        {
          t: 'tabla',
          cabecera: ['Tu situación', '¿Sumas IVA al precio?', 'Factura a la alumna'],
          filas: [
            ['Monotributista', 'No: va dentro de la cuota mensual', 'C'],
            ['Responsable inscripta, alumna consumidora final', 'Sí', 'B'],
            ['Responsable inscripta, cliente responsable inscripto o monotributista (por ejemplo, una empresa que paga clases a su equipo)', 'Sí', 'A'],
            ['Exenta en IVA', 'No', 'C'],
          ],
          nota: 'Las letras salen de la tabla «Clases de comprobantes a emitir» de la página de comprobantes de ARCA, consultada el 24-nov-2026. Que la clase lleve IVA en el régimen general sale de la Ley de IVA, que grava los servicios de gimnasios (art. 3, inc. e, ap. 13).',
        },
      ],
    },
    {
      id: 'monotributo',
      titulo: 'Si eres monotributista: el IVA va dentro de la cuota',
      bloques: [
        {
          t: 'p',
          texto:
            'Según la página del Estado sobre el régimen, el monotributo es un régimen para pequeños contribuyentes que **unifica el pago de IVA y de Ganancias** con los aportes jubilatorios y la obra social en una cuota mensual. Por eso una monotributista no suma el 21 % a sus clases ni presenta declaraciones juradas de IVA: paga la cuota de su categoría y factura.',
        },
        {
          t: 'p',
          texto:
            'La factura que emite una monotributista es siempre la **C**, sea quien sea la alumna. La página de comprobantes de ARCA la define como la que emiten «monotributistas o sujetos exentos en el impuesto al valor agregado por todas sus operaciones», salvo exportaciones. El precio que pones es el precio final: lo que cobras es lo que figura en la factura.',
        },
        {
          t: 'p',
          texto:
            'Lo que sí tienes que vigilar es la categoría. Cada semestre se recategoriza según lo facturado en los últimos doce meses, la superficie del local, la energía y el alquiler. Si te pasas del tope de la categoría más alta, sales del monotributo y pasas al régimen general, y desde ahí tus clases llevan IVA. Los topes y cuotas vigentes están en [los requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates).',
        },
        {
          t: 'nota',
          titulo: 'Un detalle que confunde',
          texto:
            'Si una empresa te paga clases para su equipo y te pide factura A, como monotributista no puedes emitirla: tu comprobante es la C. La empresa no podrá tomarse crédito fiscal por esa factura, y eso no lo arreglas tú cambiando la letra.',
        },
      ],
    },
    {
      id: 'responsable-inscripto',
      titulo: 'Si eres responsable inscripta: la ley grava a los gimnasios',
      bloques: [
        {
          t: 'p',
          texto:
            'La Ley de IVA (texto ordenado en 1997) enumera en su artículo 3 los servicios que pagan el impuesto. En el inciso e), apartado 13, aparecen las prestaciones «efectuadas por piscinas de natación y gimnasios». Un estudio de pilates que cobra clases o abonos es, a estos efectos, un servicio de ese tipo: no hay un apartado propio para el pilates ni una tasa reducida para las actividades físicas.',
        },
        {
          t: 'p',
          texto:
            'La tasa general del IVA es del **21 %**; existen además una reducida del 10,5 % y una incrementada del 27 % para casos concretos que no incluyen a los gimnasios. Así, si tu abono mensual cuesta $100.000 más IVA, la alumna paga $121.000; si prefieres anunciar precios finales, en $100.000 de precio van unos $82.645 de neto y unos $17.355 de IVA.',
        },
        {
          t: 'tabla',
          cabecera: ['Precio anunciado', 'Neto', 'IVA (21 %)', 'Total'],
          filas: [
            ['$100.000 + IVA', '$100.000', '$21.000', '$121.000'],
            ['$100.000 final', '$82.645', '$17.355', '$100.000'],
          ],
          nota: 'Ejemplo de cálculo con la tasa general del 21 %, redondeado al peso. No es un precio recomendado.',
        },
        {
          t: 'p',
          texto:
            'Como responsable inscripta presentas la declaración jurada de IVA cada mes: el IVA que cobraste en tus facturas, menos el que pagaste en tus compras (alquiler con factura A, equipamiento, servicios). Si compras reformers o pagas el alquiler con factura A, ese IVA lo descuentas; con el monotributo, no.',
        },
        {
          t: 'p',
          texto:
            'A la alumna, que casi siempre es consumidora final, le emites **factura B**. A otro responsable inscripto o a una monotributista, **factura A**. Así lo dice la tabla de comprobantes de ARCA.',
        },
      ],
    },
    {
      id: 'exenciones',
      titulo: '¿Hay clases de pilates exentas de IVA?',
      bloques: [
        {
          t: 'p',
          texto:
            'El artículo 7 de la ley, inciso h), exime a los establecimientos educacionales privados **incorporados a los planes de enseñanza oficial** y a las clases particulares sobre materias de esos planes. Es una exención pensada para la enseñanza formal, no para el entrenamiento. Una clase de pilates para alumnas que vienen a moverse no es, en principio, enseñanza de un plan oficial.',
        },
        {
          t: 'p',
          texto:
            'Puede haber casos distintos, como una formación de instructoras que forme parte de un plan reconocido, o un servicio de salud prestado por una profesional del área. Son situaciones que dependen de cómo estás inscripta y de qué vendes exactamente: confírmalas con tu contador antes de facturar sin IVA, porque una exención mal aplicada se paga después con intereses.',
        },
      ],
    },
    {
      id: 'que-elegir',
      titulo: '¿Monotributo o responsable inscripto?',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Monotributo**: una cuota fija por mes, precios finales sin IVA y factura C. Te conviene mientras tu facturación y tu local entren en una categoría, y si tus alumnas son consumidoras finales.',
            '**Régimen general**: IVA del 21 % sobre tus clases, declaración mensual y Ganancias aparte, pero descuentas el IVA de tus compras. Llegas ahí si superas el monotributo o si abres una sociedad.',
            'Cambiar de régimen cambia tus precios: si pasas al régimen general y no subes nada, el 21 % lo pagas tú. Haz la cuenta antes de la recategorización, no después.',
          ],
        },
        {
          t: 'producto',
          titulo: 'La factura, desde el mismo cobro',
          texto:
            'Centra emite la factura electrónica de ARCA desde el recibo cobrado: factura A, B o C según tu condición y la de la alumna, con su CAE.',
        },
      ],
    },
    {
      id: 'en-tus-facturas',
      titulo: 'Cómo queda en tus facturas',
      bloques: [
        {
          t: 'p',
          texto:
            'Desde el primer cobro, en Argentina se factura de forma electrónica: cada comprobante lleva su **CAE**, el código de autorización que devuelve ARCA, con su fecha de vencimiento. Puedes hacerlo desde la web de ARCA o desde un sistema conectado a su servicio de factura electrónica, con tu certificado y tu punto de venta.',
        },
        {
          t: 'lista',
          items: [
            'Monotributista: factura C con el precio final de la clase o del abono.',
            'Responsable inscripta a consumidora final: factura B con el precio final.',
            'Responsable inscripta a una empresa: factura A con el neto y el IVA aparte.',
          ],
        },
        {
          t: 'p',
          texto:
            'Cómo se arma cada comprobante lo explica [la página de facturación de Centra](/funcionalidades/facturacion). Nada de esto es asesoramiento fiscal: tu situación concreta la confirma tu contador.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Tengo que cobrar IVA si soy monotributista?',
      a: 'No como un importe aparte. El monotributo unifica el IVA y Ganancias en tu cuota mensual, así que pones el precio final y emites factura C.',
    },
    {
      q: '¿Qué tasa de IVA lleva una clase de pilates si soy responsable inscripta?',
      a: 'La general, del 21 %. La Ley de IVA grava los servicios de gimnasios y no prevé una tasa reducida para las actividades físicas.',
    },
    {
      q: '¿Qué factura le doy a una alumna?',
      a: 'Si eres monotributista, factura C. Si eres responsable inscripta y la alumna es consumidora final, factura B.',
    },
    {
      q: '¿Una empresa me puede pedir factura A?',
      a: 'Solo si eres responsable inscripta. Como monotributista tu comprobante es siempre la factura C.',
    },
    {
      q: '¿Las clases de pilates pueden estar exentas?',
      a: 'La exención de la ley es para la enseñanza incorporada a planes oficiales. Un estudio de pilates de entrenamiento no encaja en principio; ante un caso distinto, consulta a tu contador.',
    },
  ],
  fuentes: [
    { titulo: 'Biblioteca de ARCA: Ley de Impuesto al Valor Agregado (t.o. 1997), arts. 3 y 7', url: 'https://biblioteca.afip.gob.ar/dcp/TOR_C_020631_1997_03_26', consultada: '2026-11-24' },
    { titulo: 'ARCA: Régimen general, comprobantes (clases de comprobantes a emitir)', url: 'https://www.afip.gob.ar/facturacion/regimen-general/comprobantes.asp', consultada: '2026-11-24' },
    { titulo: 'Argentina.gob.ar: Monotributo, qué es', url: 'https://www.argentina.gob.ar/noticias/monotributo-que-es', consultada: '2026-11-24' },
    { titulo: 'BBVA Argentina: IVA en Argentina, cuáles son las tasas y cómo se calcula', url: 'https://www.bbva.com/es/ar/salud-financiera/iva-en-argentina-cuales-son-las-tasas-como-se-calcula-y-que-impacto-tiene-el-impuesto-en-el-bolsillo/', consultada: '2026-11-24' },
    { titulo: 'Diario Judicial: las clases particulares no pagan IVA (alcance del art. 7 inc. h)', url: 'https://www.diariojudicial.com/news-53895-las-clases-particulares-no-pagan-iva', consultada: '2026-11-24' },
  ],
  relacionadas: [
    '/funcionalidades/facturacion',
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
    '/recursos/precio-clase-de-pilates',
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
  ],
  cta: {
    titulo: 'Cada cobro con su factura de ARCA',
    texto:
      'Centra lleva las reservas, los abonos y los cobros con Mercado Pago, y emite la factura electrónica desde el mismo recibo. Empieza gratis, sin tarjeta y sin permanencia.',
  },
  revision: [
    'Tasa general del 21 %: la fuente es BBVA Argentina; confirmarla contra el art. 28 del texto vigente de la Ley de IVA antes de publicar.',
    'Que una contadora revise el apartado de exenciones (art. 7 inc. h) y el caso de prestaciones de salud.',
    'La página de comprobantes de ARCA cita la RG 5762 (vigente desde 1-dic-2025); revisar si cambia algo de la tabla de letras.',
  ],
};

export default articulo;
