import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Cifras de tarifas publicadas por dos estudios en su web y del rango que da un
// blog del sector (proveedor de software, metodología no explicada: se dice).
// Con la inflación, cada cifra lleva su fecha y se revisa a menudo.

const articulo: Articulo = {
  slug: 'precio-clase-de-pilates',
  titulo: 'Cuánto cuesta una clase de pilates en Argentina: clase suelta, packs y abonos en 2026',
  tituloSeo: 'Precio de una clase de pilates en Argentina',
  descripcion:
    'Tarifas publicadas en noviembre de 2026: clase suelta, packs de 4, 8 y 12 clases y el descuento por efectivo. Cómo poner el precio de tu estudio.',
  resumen:
    'Lo que cobran hoy los estudios de pilates en Argentina por una clase suelta y por sus packs, con tarifas publicadas y su fecha, y cómo calcular el precio del tuyo.',
  categoria: 'rentabilidad',
  seccion: 'Rentabilidad',
  publicado: '2026-11-24',
  consultaPrincipal: 'precio de una clase de pilates',
  consultas: [
    'cuánto sale una clase de pilates',
    'precio clase de pilates reformer CABA',
    'cuánto cobrar una clase de pilates',
    'abono pilates 8 clases precio',
    'clase suelta de pilates precio',
  ],
  respuesta:
    'En noviembre de 2026, las tarifas que publican los estudios de pilates reformer en Argentina van de unos $16.000 a $22.000 por clase dentro de un pack, y de $20.000 a $25.000 la clase suelta o de prueba. Un estudio de Recoleta cobra $88.000 el pack de 4 clases y $199.000 el de 12. Con la inflación, estas cifras caducan rápido: compara siempre con estudios de tu zona y con la fecha a la vista.',
  entradilla:
    'Poner precio a una clase de pilates en Argentina tiene un problema que en otros países no existe: lo que hoy es caro, en seis meses es barato. Aquí tienes tarifas reales publicadas por estudios, con la fecha en que se consultaron, y una forma de calcular la tuya que aguanta las actualizaciones.',
  secciones: [
    {
      id: 'precios-publicados',
      titulo: 'Precio de una clase de pilates: lo que publican los estudios',
      bloques: [
        {
          t: 'p',
          texto:
            'No hay una estadística oficial del precio del pilates en Argentina. Lo más fiable son las tarifas que los estudios publican en su propia web. Estas son dos, de lugares distintos del país, consultadas el mismo día:',
        },
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Clase suelta o de prueba', 'Pack de 4', 'Pack de 8', 'Pack de 12'],
          filas: [
            ['Aditi Pilates (Recoleta, CABA)', '$25.000 (prueba)', '$88.000', '$144.000', '$199.000'],
            ['Allegra Brc Pilates (Bariloche)', '$20.000', 'publica packs, sin decir de cuántas clases', '', ''],
          ],
          nota: 'Tarifas de lista publicadas en la web de cada estudio, consultadas el 24-nov-2026. Aditi publica además un precio en efectivo más bajo para cada pack (ver abajo). Allegra publica packs de $72.800, $96.800 y $132.800 sin indicar el número de clases, por eso no se reparten en columnas.',
        },
        {
          t: 'p',
          texto:
            'Pasado a precio por clase, los packs de Aditi quedan en **$22.000** (pack de 4), **$18.000** (pack de 8) y unos **$16.600** (pack de 12). Es el patrón de casi todos los estudios: cuantas más clases compras, más barata sale cada una, y la clase suelta es la más cara.',
        },
      ],
    },
    {
      id: 'rangos-del-sector',
      titulo: 'Los rangos que da el sector',
      bloques: [
        {
          t: 'p',
          texto:
            'Un blog de SyncroFitness, un software de gestión para gimnasios argentino, publicó en abril de 2026 una guía de precios con rangos por tipo de estudio. No explica de dónde salen, y es de un proveedor del sector, así que tómala como orientación y no como estadística:',
        },
        {
          t: 'tabla',
          cabecera: ['Tipo de estudio', 'Abono de 8 clases'],
          filas: [
            ['Premium (zonas caras de grandes ciudades)', '$90.000 a $140.000'],
            ['Estándar', '$65.000 a $85.000'],
            ['Interior del país', '$45.000 a $65.000'],
          ],
          nota: 'Rangos del blog de SyncroFitness publicado el 4-abr-2026, sin metodología explicada. Para la clase suelta da de $7.000 a $22.000. Con la inflación de 2026, en noviembre ya quedan por debajo de las tarifas publicadas por estudios de CABA.',
        },
        {
          t: 'p',
          texto:
            'Que el pack de 8 de Aditi esté en $144.000 en noviembre, por encima del rango premium de abril, no quiere decir que sea caro: dice cuánto envejece un precio en siete meses. Por eso aquí cada cifra lleva su fecha.',
        },
      ],
    },
    {
      id: 'efectivo-y-transferencia',
      titulo: 'El descuento por efectivo o transferencia',
      bloques: [
        {
          t: 'p',
          texto:
            'Muchos estudios argentinos publican dos precios: uno de lista y otro, más bajo, para quien paga en efectivo o por transferencia. Aditi cobra el pack de 4 a $78.000 en efectivo (contra $88.000), el de 8 a $130.000 ($144.000) y el de 12 a $178.000 ($199.000): un descuento de entre un 10 % y un 11 %.',
        },
        {
          t: 'p',
          texto:
            'El motivo es la comisión que cobra el medio de pago con tarjeta o billetera, y el tiempo que tarda en acreditarse. Si lo haces, anúncialo claro y en todos lados igual, y registra también esos cobros: el efectivo que no se apunta es el que después no cuadra.',
        },
        {
          t: 'llamada',
          texto:
            'En Tentare la alumna paga su pack con Mercado Pago desde la app, y lo que se cobra en efectivo o por transferencia se apunta en el mostrador, en el mismo histórico.',
        },
      ],
    },
    {
      id: 'como-calcular',
      titulo: 'Cómo calcular el precio de tu clase',
      bloques: [
        {
          t: 'pasos',
          items: [
            { titulo: 'Suma tus costos fijos del mes', texto: 'Alquiler, expensas, servicios, la instructora, el monotributo o tus impuestos, el software y el mantenimiento de los reformers.' },
            { titulo: 'Calcula las plazas que de verdad vendes', texto: 'Clases por semana, por plazas por clase, por la ocupación real (no la ideal). Un 60 % o 70 % es una base prudente para empezar.' },
            { titulo: 'Divide', texto: 'Costos del mes entre plazas vendidas: ese es tu costo por plaza. Tu precio por clase dentro del pack tiene que estar por encima, con margen.' },
            { titulo: 'Compara con tu zona', texto: 'Mira tres o cuatro estudios cerca del tuyo, con la fecha en que miras. Si estás muy por encima, tiene que verse por qué.' },
            { titulo: 'Decide cuándo actualizas', texto: 'Fija de antemano cada cuánto revisas precios (por ejemplo, cada dos o tres meses) y avísalo a tus alumnas con tiempo.' },
          ],
        },
        {
          t: 'p',
          texto:
            'Si eres responsable inscripta, recuerda que el precio que cobra la alumna incluye el IVA: está explicado en [las clases de pilates y el IVA](/recursos/iva-clases-de-pilates). Para el cálculo completo de ingresos y costos, [la rentabilidad de un estudio de pilates](/recursos/rentabilidad-estudio-de-pilates) tiene una calculadora.',
        },
      ],
    },
    {
      id: 'packs-y-abonos',
      titulo: 'Clase suelta, pack o abono mensual',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Clase suelta o de prueba**: la más cara por clase. Sirve para quien quiere probar; muchos estudios la descuentan si después compra un pack.',
            '**Pack de clases**: un número de clases con fecha de vencimiento (por ejemplo, 8 clases en un mes). Es el formato más visto en las tarifas publicadas.',
            '**Abono mensual con frecuencia fija**: una o dos veces por semana, siempre el mismo horario. Da previsibilidad al estudio y a la alumna.',
          ],
        },
        {
          t: 'p',
          texto:
            'En un contexto de precios que suben, el pack con vencimiento corto te deja actualizar el precio en cada renovación sin cambiar las condiciones de lo que la alumna ya pagó. Cómo armarlos está en [los bonos de pilates](/recursos/bonos-de-pilates).',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto sale una clase de pilates en Buenos Aires?',
      a: 'Un estudio de reformer de Recoleta publica, en noviembre de 2026, $25.000 la clase de prueba y entre $16.600 y $22.000 por clase dentro de sus packs. En otros barrios y en el interior suele ser menos.',
    },
    {
      q: '¿Cuánto cuesta un pack de 8 clases de pilates?',
      a: 'En CABA, unos $144.000 de lista en un estudio de Recoleta (noviembre de 2026). Un blog del sector daba en abril entre $45.000 y $140.000 según la zona, cifras que ya quedaron atrás por la inflación.',
    },
    {
      q: '¿Conviene dar descuento por efectivo?',
      a: 'Muchos estudios lo hacen, del orden del 10 %, para compensar la comisión de la tarjeta o la billetera. Si lo das, anúncialo igual en todos lados y registra esos cobros.',
    },
    {
      q: '¿Cada cuánto actualizo el precio?',
      a: 'Decide una frecuencia fija, por ejemplo cada dos o tres meses, y avisa con tiempo. Con packs de vencimiento corto, el precio nuevo entra en la siguiente renovación.',
    },
    {
      q: '¿El precio lleva IVA?',
      a: 'Si eres monotributista, no lo sumas aparte. Si eres responsable inscripta, la clase lleva el 21 % de IVA.',
    },
  ],
  fuentes: [
    { titulo: 'Aditi Pilates: tarifas', url: 'https://www.aditipilates.com/', consultada: '2026-11-24' },
    { titulo: 'Allegra Brc Pilates: pilates reformer', url: 'https://allegrabrcpilates.com/pilates-reformer', consultada: '2026-11-24' },
    { titulo: 'SyncroFitness: cuánto cobrar las clases de pilates en Argentina (4-abr-2026)', url: 'https://www.syncrofitness.com/blog/cuanto-cobrar-clases-pilates-argentina', consultada: '2026-11-24' },
  ],
  relacionadas: [
    '/recursos/bonos-de-pilates',
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/iva-clases-de-pilates',
    '/funcionalidades/bonos-y-membresias',
  ],
  cta: {
    titulo: 'Packs, abonos y clases sueltas en un mismo sitio',
    texto:
      'En Tentare configuras packs, abonos mensuales y clases sueltas con su vencimiento, y tus alumnas reservan y pagan con Mercado Pago desde el teléfono. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Las tarifas cambian cada pocos meses con la inflación: revisar las de Aditi y Allegra (y su fecha) antes de cada actualización del artículo.',
    'Sumar tarifas publicadas de estudios de otras ciudades (Córdoba, Rosario, Mendoza) para no depender de dos estudios.',
    'El rango de SyncroFitness es de un proveedor y sin metodología: si aparece una fuente independiente, reemplazarlo.',
  ],
};

export default articulo;
