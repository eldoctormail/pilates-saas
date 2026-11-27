import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Mismo enfoque que la española (la economía de cada plaza), con cifras de aquí:
// costos del ejemplo de rentabilidad-estudio-de-pilates (Argentina), precios de
// reformers de iProfe, una colchoneta de Mercado Libre y tarifas publicadas por
// tres estudios. Ninguna tarifa pública separa reformer de mat: se dice.

const articulo: Articulo = {
  slug: 'precios-reformer-mat',
  titulo: 'Reformer vs. mat en Argentina: cuánto cuesta cada plaza, cuánto factura una máquina y qué cobrar',
  tituloSeo: 'Reformer vs mat: costo por plaza y facturación',
  descripcion:
    'Cuánto cuesta en pesos ofrecer una plaza de reformer y una de mat, cuánto factura un reformer al mes y qué publican hoy los estudios argentinos.',
  resumen:
    'La cuenta en pesos de una plaza de reformer frente a una de mat, lo que factura cada máquina según la ocupación y lo que cobran hoy tres estudios argentinos.',
  categoria: 'rentabilidad',
  seccion: 'Rentabilidad',
  publicado: '2026-11-27',
  consultaPrincipal: 'precio reformer vs mat',
  consultas: [
    'cuánto factura un reformer al mes',
    'costo por plaza de una clase de pilates',
    'diferencia de precio entre pilates reformer y mat',
    'cuánto cobrar una clase de reformer',
    'rentabilidad de un reformer',
  ],
  respuesta:
    'Una plaza de reformer cuesta más que una de mat porque la instructora y el local se reparten entre seis máquinas en lugar de entre doce colchonetas. Con los costos de nuestro ejemplo de CABA, la plaza de reformer cuesta $8.711 al 60 % de ocupación y la de mat, $4.163. Un reformer usado en 30 clases por semana, con $17.210 netos por sesión, factura $1.342.380 al mes al 60 %.',
  entradilla:
    'En Argentina casi ningún estudio publica un precio distinto para el reformer y para el mat: el mismo pack sirve para los dos. Puede estar bien, pero conviene saber cuánto te cuesta cada plaza antes de decidirlo. Aquí está la cuenta en pesos, lo que factura una máquina y lo que publican hoy tres estudios.',
  secciones: [
    {
      id: 'por-que-cuestan-distinto',
      titulo: 'Por qué una plaza de reformer cuesta más que una de mat',
      bloques: [
        {
          t: 'p',
          texto:
            'En mat, sumar una alumna cuesta casi nada: una colchoneta de caucho NBR de 10 mm se vendía en noviembre de 2026 a **$33.620** en Mercado Libre. En reformer, el aforo queda fijado el día que compras las máquinas, y un reformer nacional cuesta entre **$1.700.000 y $3.100.000** en la tienda de iProfe. La instructora y el alquiler cuestan lo mismo con seis alumnas que con doce, así que cada plaza de reformer carga con una parte más grande de esos costos.',
        },
        {
          t: 'lista',
          items: [
            '**Menos plazas por clase.** Una sala chica entra seis u ocho reformers; en mat, el límite es el espacio del piso.',
            '**Más inversión por plaza.** Un reformer de guatambú de $1.800.000 cuesta lo que 53 colchonetas. Doce colchonetas salen $403.440.',
            '**Más mantenimiento.** Resortes, sogas y tapizado se cambian; una colchoneta se repone.',
            '**Más precio en dólares.** Los repuestos y los equipos importados siguen al tipo de cambio: la reserva para renovar máquinas hay que revisarla más seguido que el resto de los costos.',
          ],
        },
      ],
    },
    {
      id: 'costo-por-plaza',
      titulo: 'Cuánto cuesta ofrecer una plaza: la cuenta en pesos',
      bloques: [
        {
          t: 'p',
          texto:
            'El costo de una plaza es lo que cuesta dar una clase (la instructora más su parte de los gastos fijos) dividido entre las plazas que de verdad se ocupan. Por debajo de esa cifra, llenar la clase te hace perder plata. Un ejemplo con los costos del caso de [la rentabilidad de un estudio de pilates](/recursos/rentabilidad-estudio-de-pilates): un local en CABA, 30 clases por semana y una instructora a $12.000 la clase.',
        },
        {
          t: 'tabla',
          cabecera: ['Concepto', 'Reformer (6 máquinas)', 'Mat (12 colchonetas)'],
          filas: [
            ['Instructora por clase', '$12.000', '$12.000'],
            ['Gastos fijos por clase', '$19.359 (local y reserva para máquinas)', '$17.974 (local)'],
            ['Costo de dar la clase', '$31.359', '$29.974'],
            ['Costo por plaza, con la clase llena', '$5.226', '$2.498'],
            ['Costo por plaza, al 60 % de ocupación', '$8.711', '$4.163'],
          ],
          nota:
            'Ejemplo: $2.516.657 de gastos fijos al mes (alquiler medio de un comercio en CABA según Finaer, $1.146.657, más $1.190.000 de otros gastos y $180.000 de reserva para renovar seis reformers, que en mat no va) y 130 clases al mes. La instructora a $12.000 por clase es un supuesto. Cámbialos por los tuyos.',
        },
        {
          t: 'p',
          texto:
            'La plaza de reformer cuesta algo más del doble que la de mat: el doble por tener la mitad de plazas para los mismos costos, y un poco más por la reserva para las máquinas. Y lo que más mueve la cifra no es el alquiler: es la ocupación. Pasar del 100 % al 60 % sube el costo de cada plaza ocupada un 67 %.',
        },
      ],
    },
    {
      id: 'cuanto-factura-un-reformer',
      titulo: 'Cuánto factura un reformer al mes',
      bloques: [
        {
          t: 'p',
          texto:
            'Lo que ingresa una máquina al mes es: clases por semana × 4,33 × ocupación × lo que te queda por sesión. Con 30 clases por semana y $18.000 por clase (el precio por clase del pack de 8 de un estudio de CABA), cobrado por link de pago de Mercado Pago con acreditación a 10 días (4,39 %), a cada sesión le quedan **$17.210**:',
        },
        {
          t: 'tabla',
          cabecera: ['Ocupación', 'Sesiones al mes por máquina', 'Ingreso neto al mes'],
          filas: [
            ['40 %', '52', '$894.920'],
            ['50 %', '65', '$1.118.650'],
            ['60 %', '78', '$1.342.380'],
            ['70 %', '91', '$1.566.110'],
            ['80 %', '104', '$1.789.840'],
          ],
          nota:
            'Cálculo: 30 clases × 52/12 semanas × ocupación × $17.210 ($18.000 por clase del pack de 8 de Aditi Pilates, 24-nov-2026, menos el 4,39 % de Mercado Pago a 10 días, 27-nov-2026). Sesiones redondeadas. Sin descontar impuestos: si eres responsable inscripta, réstale además el IVA.',
        },
        {
          t: 'p',
          texto:
            'Otra forma de verlo: un reformer de $1.800.000 se paga con unas 105 sesiones a $17.210, y uno de $4.200.000 (el Max Reformer de Xtend), con 244. Cada plaza que sale sin reservar retrasa esa cuenta y no se recupera: la clase de las 19 del martes no se puede vender el miércoles.',
        },
      ],
    },
    {
      id: 'que-publican-los-estudios',
      titulo: 'Qué cobran los estudios: casi nadie separa reformer de mat',
      bloques: [
        {
          t: 'p',
          texto:
            'Revisamos las tarifas que publican en su web estudios de distintos barrios de Buenos Aires. Ninguno publica un precio de mat distinto del de reformer: el mismo pack vale para las dos clases, o el estudio no dice a qué disciplina corresponde.',
        },
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Qué cubre', 'Pack u abono de 8', 'Por clase'],
          filas: [
            ['Aditi Pilates (CABA)', 'Cualquier clase: reformer, mat y otras', '$144.000', '$18.000'],
            ['Raquel Sosa Pilates Clásico (Palermo)', 'Clases grupales de reformer, wunda y mat', '$175.200', '$21.900'],
            ['Espacio Activa (Caballito, Primera Junta y Flores)', 'No lo dice en su página principal', '$82.500', '$10.313'],
          ],
          nota:
            'Precios de lista publicados en la web de cada estudio. Aditi, consultada el 24-nov-2026; Raquel Sosa (tienda online) y Espacio Activa (vigente desde el 1-sep-2026), el 27-nov-2026. Aditi y Espacio Activa publican además un precio más bajo en efectivo ($130.000 y $75.000).',
        },
        {
          t: 'p',
          texto:
            'Fíjate en el rango: el mismo pack de 8 va de $82.500 a $175.200 según el barrio y el tipo de estudio. Por eso la media no sirve: compárate con los estudios de tu zona. Y si cobras lo mismo por las dos clases, haz la cuenta de arriba: con el mismo precio, una clase de mat llena deja el doble que una de reformer llena (12 plazas contra 6), con un costo de dar la clase parecido.',
        },
        {
          t: 'p',
          texto:
            'Eso no quiere decir que el mat tenga que ser más caro, ni el reformer más barato. La alumna paga por la máquina lo que no pagaría por el piso, y el reformer en grupo es lo que más se busca. Lo que sí dice la cuenta es que una sala de mat que se llena es muy rentable, y que no conviene descuidarla.',
        },
      ],
    },
    {
      id: 'como-armar-los-precios',
      titulo: 'Cómo armar los precios de los dos formatos',
      bloques: [
        {
          t: 'pasos',
          items: [
            { titulo: 'Un pack para todo', texto: 'Lo más común en Argentina: el mismo pack sirve para reformer y mat. Es simple de explicar, pero el precio tiene que cubrir el costo de la plaza más cara, la de reformer.' },
            { titulo: 'Packs y abonos por formato', texto: 'Un pack de reformer y otro de mat, cada uno con su precio. Te deja ofrecer un mat más barato para quien empieza y sostener el precio del reformer.' },
            { titulo: 'Un pack con créditos', texto: 'Un solo producto en el que la clase de reformer descuenta más créditos que la de mat. Mantienes la diferencia sin multiplicar packs, pero hay que explicarlo bien en recepción.' },
            { titulo: 'La escalera dentro de cada formato', texto: 'Clase de prueba, pack de 4, de 8 y de 12, cada escalón más barato por clase que el anterior. Cómo armarla, en [los bonos de pilates](/recursos/bonos-de-pilates).' },
          ],
        },
        {
          t: 'nota',
          titulo: 'Con la inflación, revisa más seguido',
          texto:
            'Fija de antemano cada cuánto revisas precios (cada dos o tres meses, por ejemplo) y avisa con tiempo. Con packs de vencimiento corto, el precio nuevo entra en la siguiente renovación sin tocar lo que la alumna ya pagó. Lo que cobran otros estudios, con su fecha, está en [cuánto cuesta una clase de pilates](/recursos/precio-clase-de-pilates).',
        },
      ],
    },
    {
      id: 'proteger-el-precio',
      titulo: 'Protege el precio de las plazas vacías',
      bloques: [
        {
          t: 'p',
          texto:
            'El precio perfecto no sirve de nada si las plazas quedan vacías por cancelaciones de último momento. En reformer duele el doble, porque cada plaza cuesta el doble. Tres defensas que funcionan juntas:',
        },
        {
          t: 'lista',
          items: [
            '**Un plazo de cancelación claro**, más largo en reformer que en mat si quieres: quien cancela tarde pierde la clase. Cómo escribirlo, en [la política de cancelación de clases](/recursos/politica-de-cancelacion-de-clases).',
            '**Lista de espera que da la plaza sola** a la siguiente en cuanto alguien cancela a tiempo.',
            '**Recordatorio de la clase** el día antes: buena parte de las faltas son olvidos. Más ideas, en [cómo reducir las cancelaciones de último momento](/recursos/reducir-cancelaciones-ultima-hora).',
          ],
        },
        {
          t: 'producto',
          titulo: 'El reformer y el mat, cada uno con su precio y sus reglas',
          texto:
            'En Centra los packs y los abonos pueden ser de un tipo de clase concreto, la alumna elige su reformer al reservar si defines los puestos de la sala, y la plaza que se libera pasa sola a la primera de la lista de espera. Tus alumnas pagan con Mercado Pago desde el teléfono.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿El reformer tiene que ser más caro que el mat?',
      a: 'No necesariamente, y en Argentina la mayoría de los estudios cobra lo mismo por los dos. Pero con seis máquinas frente a doce colchonetas y los mismos costos, la plaza de reformer te cuesta el doble: si cobras igual, el precio tiene que cubrir la plaza de reformer.',
    },
    {
      q: '¿Cuánto factura un reformer al mes?',
      a: 'Usado en 30 clases por semana y con $17.210 netos por sesión, unos $894.920 al mes al 40 % de ocupación, $1.342.380 al 60 % y $1.789.840 al 80 % (noviembre de 2026).',
    },
    {
      q: '¿Cuánto cuesta un reformer en Argentina?',
      a: 'En noviembre de 2026, los reformers nacionales de iProfe cuestan de $1.700.000 a $3.100.000, y el Max Reformer de Xtend, $4.200.000 con IVA incluido. Una colchoneta de 10 mm se consigue por unos $33.600.',
    },
    {
      q: '¿Puedo cobrar reformer y mat con el mismo pack?',
      a: 'Sí, es lo más habitual. Si quieres mantener una diferencia sin multiplicar productos, usa un pack de créditos en el que la clase de reformer descuente más que la de mat.',
    },
    {
      q: '¿Qué pesa más en el costo de una plaza?',
      a: 'La ocupación. Con los mismos costos, pasar del 100 % al 60 % sube el costo de cada plaza ocupada un 67 %. Por eso una plaza vacía de reformer duele más que una de mat.',
    },
  ],
  fuentes: [
    { titulo: 'iProfe: cama de pilates reformer de guatambú con box y tabla de pique', url: 'https://www.iprofe.com.ar/producto/cama-de-pilates-reformer/', consultada: '2026-11-27' },
    { titulo: 'iProfe: cama de pilates reformer premium importada', url: 'https://www.iprofe.com.ar/producto/cama-de-pilates-reformer-calidad-premium-importada/', consultada: '2026-11-27' },
    { titulo: 'Xtend Pilates: Max Reformer', url: 'https://xtendpilates.com.ar/producto/max-reformer/', consultada: '2026-11-27' },
    { titulo: 'MejoresCompras: mat de yoga y pilates 10 mm de caucho NBR (precio en Mercado Libre)', url: 'https://mejorescompras.com.ar/precio/MLA41459514--mat-yoga-10-mm-colchoneta-pilates-caucho-nbr-180x62-bolso-verde', consultada: '2026-11-27' },
    { titulo: 'Aditi Pilates: tarifas', url: 'https://www.aditipilates.com/', consultada: '2026-11-24' },
    { titulo: 'Raquel Sosa Pilates Clásico: tienda', url: 'https://raquelsosa.com.ar/tienda/', consultada: '2026-11-27' },
    { titulo: 'Espacio Activa: precios de los abonos', url: 'https://www.espacioactiva.com/', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
    { titulo: 'El Cronista: el alquiler de un comercio promedia $1.146.657; cuánto cuesta mantenerlo en total (25-nov-2026)', url: 'https://www.cronista.com/negocios/el-alquiler-de-un-comercio-promedia-1146657-cuanto-cuesta-mantenerlo-en-total-con-impuestos-servicios-y-seguro/', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/precio-clase-de-pilates',
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/bonos-de-pilates',
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
  ],
  cta: {
    titulo: 'Cada formato con su precio, y ninguna plaza perdida.',
    texto:
      'Packs y abonos por tipo de clase, reserva por reformer, lista de espera automática y cobro con Mercado Pago. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Precios de reformers, colchoneta y tarifas de estudios: 24 y 27-nov-2026. Con la inflación, revisarlos en cada actualización.',
    'El ejemplo de costos es el de rentabilidad-estudio-de-pilates (Argentina); si cambia allí, cambia aquí.',
    'Si aparece un estudio que publique precios distintos para reformer y mat, sumarlo: hoy no hay ninguno en la muestra.',
  ],
};

export default articulo;
