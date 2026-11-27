import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// En Argentina el «bono» se llama pack o abono, y la escalera publicada es la de
// 4, 8 y 12 clases al mes. Tarifas de tres estudios de Buenos Aires con su
// fecha; la parte legal, Ley 24.240 y la Disposición 954/2025 (botón de
// arrepentimiento). La calculadora es la de packs (calcularPacks).

const articulo: Articulo = {
  slug: 'bonos-de-pilates',
  titulo: 'Packs y abonos de pilates: cómo armarlos (clases, precio, vencimiento y cancelaciones)',
  tituloSeo: 'Packs y abonos de pilates: cómo armarlos y su precio',
  descripcion:
    'Clase suelta, pack de 4, 8 o 12 clases: cuánto descontar, qué publican hoy tres estudios porteños, el vencimiento y qué hacer con las cancelaciones.',
  resumen:
    'Cómo armar la escalera de packs y abonos de un estudio de pilates en Argentina: cuánto descontar, tarifas reales con su fecha, vencimiento, cancelaciones y lo que pide la ley.',
  categoria: 'rentabilidad',
  seccion: 'Rentabilidad',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'packs de pilates: cómo armarlos',
  consultas: [
    'pack de clases de pilates',
    'abono de pilates 8 clases',
    'cuántas clases debe tener un pack de pilates',
    'vencimiento de un pack de pilates',
    'pack o abono mensual de pilates',
  ],
  respuesta:
    'Para armar packs de pilates que funcionen, ofrece pocas opciones (clase suelta o de prueba y packs de 4, 8 y 12 clases al mes), haz que cada una salga más barata por clase que la anterior y deja por escrito, antes de venderlas, el vencimiento y qué pasa si se cancela tarde. En tres estudios de Buenos Aires, el pack de 12 sale entre un 25 % y un 36 % más barato por clase que el de 4.',
  entradilla:
    'Un pack mal armado no se nota el día que lo vendes, sino semanas después: clases vencidas, discusiones por una cancelación de último momento o un descuento que se come el margen. Así arman hoy sus packs tres estudios de Buenos Aires, y lo que puedes copiar de ellos.',
  secciones: [
    {
      id: 'tipos-de-pack-de-pilates',
      titulo: 'Clase suelta, pack y abono mensual: qué es cada uno',
      bloques: [
        { t: 'p', texto: 'En Argentina casi todos los estudios combinan tres productos, cada uno con su alumna y su riesgo:' },
        {
          t: 'tabla',
          cabecera: ['Producto', 'Cómo funciona', 'Para quién', 'Riesgo para el estudio'],
          filas: [
            ['Clase suelta o de prueba', 'Paga una clase', 'Quien prueba o viene de vez en cuando', 'Ingreso imprevisible'],
            ['Pack de clases', 'Compra varias clases y las usa en un plazo, casi siempre un mes', 'Quien tiene horarios cambiantes', 'Clases vencidas y reclamos si el plazo no estaba claro'],
            ['Abono con frecuencia fija', 'Una, dos o tres clases por semana, a menudo en el mismo horario', 'Quien quiere rutina', 'Faltas y recuperaciones que hay que ordenar'],
          ],
        },
        {
          t: 'p',
          texto:
            'En la práctica, el pack mensual y el abono se parecen mucho: un pack de 8 clases al mes es un abono de dos veces por semana. La diferencia está en las reglas: si la alumna elige cada semana cuándo viene o tiene su horario fijo, y qué pasa con la clase que no usó.',
        },
      ],
    },
    {
      id: 'que-publican-los-estudios',
      titulo: 'Qué cobran hoy tres estudios de Buenos Aires',
      bloques: [
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Pack de 4', 'Pack de 8', 'Pack de 12', 'Pack de 12 frente al de 4'],
          filas: [
            ['Aditi Pilates (CABA)', '$88.000 ($22.000 por clase)', '$144.000 ($18.000)', '$199.000 ($16.583)', '25 % menos por clase'],
            ['Raquel Sosa Pilates Clásico (Palermo), introducción', '$112.800 ($28.200)', '$175.200 ($21.900)', '$220.800 ($18.400)', '35 % menos'],
            ['Espacio Activa (Caballito, Primera Junta y Flores)', '$57.500 ($14.375)', '$82.500 ($10.313)', '$110.000 ($9.167)', '36 % menos'],
          ],
          nota:
            'Precios de lista publicados en la web de cada estudio. Aditi, consultada el 24-nov-2026; Raquel Sosa (tienda online, packs de introducción al pilates) y Espacio Activa (abonos de 4, 8 y 12 clases, vigentes desde el 1-sep-2026), el 27-nov-2026. Precio por clase redondeado.',
        },
        {
          t: 'p',
          texto:
            'Tres cosas que se repiten. Primero, **la escalera es siempre de 4, 8 y 12**: una, dos o tres clases por semana. Segundo, **el salto grande está entre el de 4 y el de 8**: en Espacio Activa, la clase pasa de $14.375 a $10.313. Tercero, **dos de los tres publican un precio en efectivo**: Aditi cobra el pack de 8 a $130.000 en efectivo y Espacio Activa, el abono de 8 a $75.000, entre un 9 % y un 11 % menos.',
        },
        {
          t: 'p',
          texto:
            'Fíjate también en el rango: el mismo pack de 8 va de $82.500 a $175.200. La media nacional no te sirve; compárate con los estudios de tu zona y de tu tipo de clase, y mira la fecha: con la inflación, un precio de hace seis meses ya no es una referencia. Más tarifas, en [cuánto cuesta una clase de pilates](/recursos/precio-clase-de-pilates).',
        },
      ],
    },
    {
      id: 'como-armar-la-escalera',
      titulo: 'Cómo armar la escalera de precios',
      bloques: [
        {
          t: 'p',
          texto:
            'Una escalera funciona si cada escalón sale más barato por clase que el anterior y la diferencia se ve. Este ejemplo parte de la clase de prueba y los packs de Aditi Pilates, con el pack de 12 redondeado:',
        },
        {
          t: 'tabla',
          cabecera: ['Producto', 'Precio', 'Por clase', 'Ahorro frente a la suelta'],
          filas: [
            ['Clase suelta o de prueba', '$25.000', '$25.000', '—'],
            ['Pack de 4 clases', '$88.000', '$22.000', '12 %'],
            ['Pack de 8 clases', '$144.000', '$18.000', '28 %'],
            ['Pack de 12 clases', '$198.000', '$16.500', '34 %'],
          ],
          nota:
            'Ejemplo con la clase de prueba ($25.000) y los packs de 4 y 8 de Aditi Pilates (24-nov-2026). Su pack de 12 cuesta $199.000; aquí va a $198.000 para que salga una cifra redonda por clase.',
        },
        {
          t: 'lista',
          items: [
            '**Nunca por debajo de tu costo por plaza.** El escalón más barato tiene que cubrir lo que te cuesta una plaza ocupada; cómo calcularlo, en [¿es rentable un estudio de pilates?](/recursos/rentabilidad-estudio-de-pilates). Si eres responsable inscripto, compáralo sin el IVA.',
            '**Muestra el precio por clase.** La alumna compara sin hacer cuentas, y ve por qué le conviene el pack más grande.',
            '**Pocas opciones.** Suelta y tres packs alcanzan. Cada producto de más es una pregunta más en recepción.',
            '**Descuenta la comisión.** A lo que se cobra por link de pago, Mercado Pago le resta un 4,39 % si el dinero se acredita a 10 días. Por eso muchos estudios publican un precio en efectivo más bajo.',
          ],
        },
        { t: 'p', texto: 'Haz la cuenta con tus precios: la calculadora parte del ejemplo de la tabla y te avisa si un pack queda por debajo de tu costo o si no baja el precio por clase.' },
        { t: 'herramienta', id: 'calculadora-bonos' },
        {
          t: 'p',
          texto:
            'Después, llévalo a tu programa de reservas para no controlar vencimientos a mano. En Centra configuras [packs, abonos y clases sueltas](/funcionalidades/bonos-y-membresias), con el vencimiento de cada uno y reglas por tipo de clase.',
        },
        {
          t: 'llamada',
          texto: 'En Centra la alumna compra su pack con Mercado Pago desde la app, y el sistema le descuenta cada clase y le avisa antes de que venza.',
        },
      ],
    },
    {
      id: 'vencimiento-de-un-pack',
      titulo: 'Vencimiento: qué plazo ponerle a un pack',
      bloques: [
        {
          t: 'p',
          texto:
            'Lo habitual en Argentina es que el pack venza al mes. Aditi lo dice en su web: sus packs son «por mes». Espacio Activa describe sus abonos como «una clase a la semana», «dos» y «tres»: la cuenta es también mensual. Con precios que suben cada pocos meses, el vencimiento corto tiene una ventaja clara: el precio nuevo entra en la siguiente compra sin tocar lo que la alumna ya pagó.',
        },
        {
          t: 'p',
          texto:
            'La regla: que el pack se pueda usar en su plazo al ritmo real de la alumna. Doce clases en un mes son tres por semana sin fallar ninguna; si una se enferma una semana, las pierde. Decide de antemano qué haces con eso (dar unos días más, dejar pasar una o dos clases al mes siguiente, o nada) y escríbelo.',
        },
        {
          t: 'nota',
          titulo: 'Lo que dice la ley, en general',
          texto:
            'La Ley de Defensa del Consumidor (Ley 24.240) obliga a informar de forma cierta, clara y detallada las condiciones de lo que vendes (artículo 4): el vencimiento y la política de cancelación son parte de eso, así que escríbelos antes de vender. Si vendes por internet, la alumna puede arrepentirse de la compra (artículo 34 de esa ley y 1.110 del Código Civil y Comercial), y la Disposición 954/2025 obliga a tener un botón de arrepentimiento a simple vista; no aplica a un servicio que ya se usó. Para tu caso concreto, consulta con un abogado o con la oficina de defensa del consumidor de tu provincia.',
        },
      ],
    },
    {
      id: 'cancelaciones-y-recuperaciones',
      titulo: 'Cancelaciones y recuperaciones: qué pasa con la clase del pack',
      bloques: [
        {
          t: 'p',
          texto:
            'La regla más extendida: si la alumna cancela a tiempo, la clase vuelve al pack o se recupera otro día; si cancela tarde o no viene, se pierde. Lo que tienes que decidir es:',
        },
        {
          t: 'lista',
          items: [
            '**Con cuánta anticipación se cancela sin perder la clase.** Cuanta más demanda tenga una franja, más largo conviene el plazo, y solo sirve si la plaza que se libera se ofrece enseguida a la lista de espera.',
            '**Hasta cuándo se recupera.** Una recuperación que se puede usar dentro del mismo mes, o hasta el vencimiento del pack, no se acumula sin fin.',
            '**Qué pasa en un feriado o si el estudio cierra.** Avisa con tiempo y di si la clase se recupera o se descuenta del próximo pack.',
            '**Si se puede pausar un abono.** Por viaje o por lesión: cuántas veces al año, por cuánto tiempo y con qué aviso.',
          ],
        },
        {
          t: 'p',
          texto:
            'Cómo escribir la política, en [la política de cancelación de clases](/recursos/politica-de-cancelacion-de-clases), y más ideas para que no queden plazas vacías, en [cómo reducir las cancelaciones de último momento](/recursos/reducir-cancelaciones-ultima-hora). En Centra fijas esas reglas por tipo de clase, y la lista de espera ofrece la plaza liberada al momento: [cancelaciones y políticas](/funcionalidades/cancelaciones-y-politicas).',
        },
      ],
    },
    {
      id: 'pack-de-reformer-o-de-mat',
      titulo: '¿Un pack para reformer y otro para mat, o uno para todo?',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Un pack para todo.** Lo más común: Aditi deja usar sus packs en cualquier clase (reformer, mat y otras) y Raquel Sosa vende packs grupales de «reformer, wunda y mat». Simple, pero el precio tiene que cubrir la plaza más cara, la de reformer.',
            '**Packs separados por formato.** Uno de reformer y otro de mat, cada uno con su precio. Te deja ofrecer un mat más barato para quien empieza.',
            '**Un pack con créditos.** La clase de reformer descuenta más créditos que la de mat: mantienes la diferencia sin multiplicar productos.',
          ],
        },
        {
          t: 'p',
          texto:
            'Con seis máquinas frente a doce colchonetas y los mismos costos, la plaza de reformer cuesta el doble. La cuenta completa, en [reformer vs. mat](/recursos/precios-reformer-mat).',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto cuesta un pack de 8 clases de pilates?',
      a: 'En tres estudios de Buenos Aires, en noviembre de 2026, entre $82.500 y $175.200 de lista: de unos $10.300 a $21.900 por clase. Varía mucho según el barrio y el tipo de estudio.',
    },
    {
      q: '¿Es legal que venza un pack de pilates?',
      a: 'La Ley 24.240 obliga a informar las condiciones de forma clara y detallada antes de la compra. Pon el vencimiento por escrito y, para tu caso concreto, consulta con un abogado o con defensa del consumidor de tu provincia.',
    },
    {
      q: '¿Qué pasa si una alumna cancela tarde?',
      a: 'Lo habitual es que pierda la clase. Lo que tienes que fijar es con cuánta anticipación se puede cancelar sin perderla, y escribirlo antes de vender el pack.',
    },
    {
      q: '¿Cuántas clases debe tener un pack de pilates?',
      a: 'La escalera más vista es la de 4, 8 y 12 clases al mes: una, dos o tres por semana. Con esas tres y la clase suelta o de prueba cubres a casi todas las alumnas.',
    },
    {
      q: '¿Conviene dar descuento por efectivo?',
      a: 'Dos de los tres estudios revisados lo hacen, de entre un 9 % y un 11 %, para compensar la comisión del cobro con tarjeta o billetera. Si lo das, anúncialo igual en todos lados y registra esos cobros.',
    },
  ],
  fuentes: [
    { titulo: 'Aditi Pilates: tarifas', url: 'https://www.aditipilates.com/', consultada: '2026-11-24' },
    { titulo: 'Raquel Sosa Pilates Clásico: tienda', url: 'https://raquelsosa.com.ar/tienda/', consultada: '2026-11-27' },
    { titulo: 'Espacio Activa: precios de los abonos', url: 'https://www.espacioactiva.com/', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
    { titulo: 'Microjuris: Disposición 954/2025, botón de arrepentimiento (4-sep-2025)', url: 'https://aldiaargentina.microjuris.com/2025/09/04/legislacion-los-proveedores-de-bienes-y-servicios-deberan-activar-un-boton-de-arrepentimiento-para-que-los-consumidores-puedan-cancelar-compras/amp/', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/precio-clase-de-pilates',
    '/recursos/precios-reformer-mat',
    '/funcionalidades/bonos-y-membresias',
    '/funcionalidades/cancelaciones-y-politicas',
  ],
  cta: {
    titulo: 'Tus packs y abonos, con sus reglas, en un solo sitio',
    texto:
      'En Centra configuras packs, abonos y clases sueltas con su vencimiento y reglas por tipo de clase, y tus alumnas pagan con Mercado Pago desde el teléfono. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Tarifas de Aditi (24-nov-2026), Raquel Sosa y Espacio Activa (27-nov-2026). Con la inflación, revisarlas en cada actualización.',
    'La escalera de ejemplo son las tarifas de Aditi; su pack de 12 se redondeó de $199.000 a $198.000. Si cambia, cambiar también EJEMPLO_AR en CalculadoraBonos y su test.',
    'Parte legal: Ley 24.240 (arts. 4 y 34), art. 1.110 del Código Civil y Comercial y la Disposición 954/2025, leída en la reproducción de Microjuris (el Boletín Oficial no se pudo leer): conviene enlazar el texto oficial.',
    'No se encontraron políticas de cancelación publicadas por estudios argentinos con plazos concretos: si aparecen, sumarlas como en la versión española.',
  ],
};

export default articulo;
