import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// El escenario usa SOLO cifras que ya llevan fuente en las otras guías argentinas
// (precio por clase de un pack, alquiler medio de Finaer, precio de un reformer,
// convenio de gimnasios) y la comisión publicada por Mercado Pago. El costo de
// instructora por clase es un supuesto del ejemplo, y se dice.

const articulo: Articulo = {
  slug: 'rentabilidad-estudio-de-pilates',
  titulo: '¿Es rentable un estudio de pilates en Argentina? Cómo calcularlo con tus números',
  tituloSeo: '¿Es rentable un estudio de pilates? Calculadora',
  descripcion:
    'Cuánto gana un estudio de pilates en Argentina: ingresos, costos y punto de equilibrio en pesos, con precios publicados en noviembre de 2026 y una calculadora.',
  resumen:
    'La cuenta que dice si tu estudio gana plata: plazas, clases, ocupación y precio por plaza, costos fijos y variables, punto de equilibrio y un ejemplo en pesos.',
  categoria: 'rentabilidad',
  seccion: 'Rentabilidad',
  publicado: '2026-11-27',
  consultaPrincipal: '¿es rentable un estudio de pilates?',
  consultas: [
    'cuánto gana un estudio de pilates en Argentina',
    'rentabilidad de un estudio de pilates',
    'cuánto se gana con un estudio de pilates por mes',
    'punto de equilibrio de un estudio de pilates',
    'negocio de pilates es rentable',
  ],
  respuesta:
    'Un estudio de pilates es rentable si vende suficientes plazas a un precio que cubra sus costos y tu sueldo. Los ingresos son plazas por clase × clases por semana × 4,33 × ocupación × lo que te deja cada plaza. En nuestro ejemplo de 6 reformers, 30 clases semanales y $18.000 por clase, el estudio cubre gastos hacia el 31 % de ocupación y necesita cerca del 42 % para dejarte además $1.500.000 al mes.',
  entradilla:
    '¿Es rentable un estudio de pilates? No hay una cifra que valga para todos: hay una cuenta. Te la damos entera, en pesos y con precios publicados, con un ejemplo que puedes cambiar por tus números en la calculadora.',
  secciones: [
    {
      id: 'es-rentable-un-estudio-de-pilates',
      titulo: '¿Es rentable un estudio de pilates? Depende de cuatro números',
      bloques: [
        {
          t: 'p',
          texto:
            'Un estudio de pilates vende plazas, y cada clase tiene un techo: sus reformers o sus colchonetas. La rentabilidad no depende de si el pilates está de moda, sino de cuatro números que puedes medir:',
        },
        {
          t: 'lista',
          items: [
            '**Plazas por clase:** cuántas máquinas o colchonetas entran en la sala.',
            '**Clases por semana:** cuántas franjas abres de verdad.',
            '**Ocupación:** qué parte de esas plazas vendes y no quedan vacías.',
            '**Lo que te deja cada plaza:** el precio medio por clase, menos impuestos y la comisión de cobro.',
          ],
        },
        {
          t: 'p',
          texto:
            'Enfrente, los costos: instructoras, local, máquinas y cobros. Por encima del punto de equilibrio ganas; por debajo pierdes, aunque las horas pico vayan llenas. Y cuenta tu sueldo como un costo más, o la cuenta engaña.',
        },
      ],
    },
    {
      id: 'formula-de-ingresos',
      titulo: 'La fórmula de ingresos de un estudio de pilates',
      bloques: [
        {
          t: 'nota',
          titulo: 'La fórmula',
          texto:
            '**Ingresos por mes = plazas por clase × clases por semana × 4,33 × ocupación × lo que te deja cada plaza.** 4,33 son las semanas de un mes promedio (52 ÷ 12).',
        },
        {
          t: 'p',
          texto:
            'El número más engañoso es el precio por plaza. Casi nadie paga la clase suelta: la mayoría compra packs, y en un pack cada clase sale más barata. Un estudio de Recoleta publica en noviembre de 2026 su pack de 8 clases a $144.000, es decir **$18.000 por clase**, cuando su clase de prueba vale $25.000. Más tarifas en [cuánto cuesta una clase de pilates](/recursos/precio-clase-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'Si eres monotributista, el IVA va dentro de tu cuota y no se resta del precio; si eres responsable inscripto, sí: la parte del IVA no es tuya. Lo explicamos en [el IVA de las clases de pilates](/recursos/iva-clases-de-pilates). Y a lo que cobras online réstale la comisión: Mercado Pago publica para el link de pago un **4,39 % si el dinero se acredita en 10 días** y un 6,29 % si lo quieres al instante.',
        },
        {
          t: 'p',
          texto:
            'Calcula el tuyo con datos reales: lo que cobraste por clases el último mes, sin impuestos ni comisiones, dividido por las plazas que se reservaron.',
        },
      ],
    },
    {
      id: 'costos-fijos-y-variables',
      titulo: 'Costos fijos y variables de un estudio de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'Casi todo lo que paga un estudio es fijo: se paga llenes o no la clase. Por eso la ocupación pesa tanto.',
        },
        {
          t: 'lista',
          items: [
            '**Local y gastos generales:** alquiler, expensas, ABL, luz, gas, internet y seguro. El alquiler comercial medio de CABA ronda $1.146.657 por mes, y en un ejemplo de 90 m² los gastos que no son alquiler suman $1,19 millones más (detalle en [cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates)).',
            '**Instructoras:** fijo por clase dada, haya dos alumnas o seis. El convenio de gimnasios fija en octubre de 2026 un básico de $8.790 por hora para una profesora de Educación Física, antes de presentismo, aguinaldo y cargas sociales ([cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates)).',
            '**Reserva para máquinas:** un reformer de fabricante argentino se publica desde $1.700.000. Aparta cada mes lo necesario para cambiar resortes, tapizado y, con los años, la máquina entera.',
            '**Variables:** la comisión de cobro y poco más. Por eso una plaza vendida de más es casi toda ganancia.',
          ],
        },
      ],
    },
    {
      id: 'punto-de-equilibrio',
      titulo: 'Punto de equilibrio de un estudio de pilates',
      bloques: [
        {
          t: 'pasos',
          items: [
            { titulo: 'Suma los costos fijos del mes', texto: 'Local y gastos generales, reserva para máquinas e instructoras de todas las clases del mes (costo por clase × clases por semana × 4,33).' },
            { titulo: 'Calcula las plazas del mes', texto: 'Plazas por clase × clases por semana × 4,33.' },
            { titulo: 'Calcula lo que deja cada plaza', texto: 'Precio medio por clase, menos IVA si eres responsable inscripto, menos la comisión de cobro.' },
            { titulo: 'Divide', texto: 'Ocupación de equilibrio = costos fijos del mes ÷ (plazas del mes × lo que deja cada plaza).' },
            { titulo: 'Súmate a ti', texto: 'Repite la cuenta sumando a los costos lo que quieres sacar por mes para ti. Esa es la ocupación que necesitas de verdad.' },
          ],
        },
        { t: 'herramienta', id: 'calculadora-rentabilidad' },
      ],
    },
    {
      id: 'cuanto-gana-un-estudio-de-pilates-al-mes',
      titulo: 'Cuánto gana un estudio de pilates por mes: un ejemplo en pesos',
      bloques: [
        {
          t: 'p',
          texto:
            'Un estudio monotributista con **6 reformers y 30 clases por semana**, todas dadas por una instructora a **$12.000 la clase** (un supuesto: algo más que la hora de convenio, para cubrir lo que se suma al básico). Cobra **$18.000 por clase** con Mercado Pago a 10 días, así que cada plaza le deja $17.210. Sus fijos: el alquiler medio de CABA, $1,19 millones de otros gastos y $180.000 de reserva para máquinas (6 reformers de $1.800.000 en cinco años).',
        },
        {
          t: 'cifras',
          titulo: 'El ejemplo, en números',
          cifras: [
            { valor: '779', etiqueta: 'plazas por mes (6 × 30 × 4,33)' },
            { valor: '$4.075.457', etiqueta: 'costos del mes: $1.558.800 de instructoras y $2.516.657 fijos' },
            { valor: '31 %', etiqueta: 'ocupación para no perder plata' },
            { valor: '42 %', etiqueta: 'ocupación para dejarte además $1.500.000' },
          ],
          nota: 'Ejemplo con las tarifas, el alquiler, el precio del reformer y la comisión de Mercado Pago citados en este artículo (noviembre de 2026). El costo de instructora por clase es un supuesto. No incluye la cuota del monotributo ni otros impuestos.',
        },
        {
          t: 'tabla',
          cabecera: ['Ocupación', 'Ingresos por mes', 'Resultado del mes'],
          filas: [
            ['40 %', '$5.365.390', '$1.289.933'],
            ['60 %', '$8.048.084', '$3.972.627'],
            ['80 %', '$10.730.779', '$6.655.322'],
          ],
          nota: 'Mismo ejemplo de arriba, cambiando solo la ocupación. Resultado antes del monotributo y de tu sueldo.',
        },
        {
          t: 'p',
          texto:
            'Con la inflación, lo que más cambia de un mes a otro es la relación entre tus precios y tus costos. Si el alquiler se actualiza cada tres meses y tus packs no, el punto de equilibrio sube solo. Rehaz la cuenta cada vez que cambie uno de los dos.',
        },
      ],
    },
    {
      id: 'palancas-para-mejorar-la-rentabilidad',
      titulo: 'Cuatro palancas para mejorar la rentabilidad de tu estudio',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Llenar las horas flojas** antes que abrir clases nuevas: una plaza vendida en una clase que ya se da es casi toda ganancia.',
            '**Actualizar precios con regla fija**, por ejemplo cada vez que se actualiza el alquiler, y avisarlo con anticipación.',
            '**Empujar los packs más grandes y los abonos:** bajan un poco el precio por clase pero aseguran la plaza y el ingreso del mes.',
            '**Cuidar las cancelaciones de último momento:** una plaza que se libera tarde casi nunca se vuelve a vender. Ver [cómo reducir cancelaciones](/recursos/reducir-cancelaciones-ultima-hora).',
          ],
        },
      ],
    },
    {
      id: 'errores-al-calcular-la-rentabilidad',
      titulo: 'Errores habituales al calcular la rentabilidad',
      bloques: [
        {
          t: 'lista',
          items: [
            '**Usar el precio de la clase suelta** como precio por plaza, cuando casi todas compran packs.',
            '**No contar tu sueldo:** si no te pagas, el estudio no es rentable, aunque la cuenta dé positiva.',
            '**Olvidar la comisión de cobro y el IVA** cuando eres responsable inscripto.',
            '**Hacer la cuenta una vez y no volver a mirarla** con precios y costos que cambian cada pocos meses.',
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto gana un estudio de pilates por mes?',
      a: 'Depende de tu ocupación y tus precios. En nuestro ejemplo de 6 reformers y 30 clases por semana a $18.000 por clase, el resultado va de unos $1,3 millones con el 40 % de ocupación a unos $6,7 millones con el 80 %, antes del monotributo y de tu sueldo.',
    },
    {
      q: '¿Con qué ocupación cubre gastos un estudio de pilates?',
      a: 'En el ejemplo, hacia el 31 %. Con tu sueldo dentro de los costos, hacia el 42 %. Haz la cuenta con tus números en la calculadora: el alquiler y el precio de tus packs la cambian mucho.',
    },
    {
      q: '¿Qué comisión cobra Mercado Pago?',
      a: 'Para el link de pago, Mercado Pago publica en noviembre de 2026 un 6,29 % si el dinero se acredita al instante, un 4,39 % a 10 días, un 3,39 % a 18 días y un 1,49 % a 35 días, más impuestos ajenos a Mercado Pago.',
    },
    {
      q: '¿Tengo que restar el IVA del precio?',
      a: 'Si eres monotributista, no: el IVA va dentro de tu cuota. Si eres responsable inscripto, sí, porque esa parte del precio se la debes a ARCA.',
    },
  ],
  fuentes: [
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
    { titulo: 'El Cronista: el alquiler de un comercio promedia $1.146.657; cuánto cuesta mantenerlo en total (25-nov-2026)', url: 'https://www.cronista.com/negocios/el-alquiler-de-un-comercio-promedia-1146657-cuanto-cuesta-mantenerlo-en-total-con-impuestos-servicios-y-seguro/', consultada: '2026-11-27' },
    { titulo: 'iProfe: cama de pilates reformer con estructura metálica reforzada', url: 'https://www.iprofe.com.ar/producto/reformer-metalicos-pilates/', consultada: '2026-11-27' },
    { titulo: 'iProfe: cama de pilates reformer de guatambú con box y tabla de pique', url: 'https://www.iprofe.com.ar/producto/cama-de-pilates-reformer/', consultada: '2026-11-27' },
    { titulo: 'Asistente Laboral Argentino: escala salarial UTEDYC, rama gimnasios (CCT 738/16)', url: 'https://www.asistentelaboralargentino.com/escalas/utedyc-rama-gimnasios-738-16.html', consultada: '2026-11-24' },
  ],
  relacionadas: [
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
    '/recursos/precio-clase-de-pilates',
    '/recursos/cuanto-cobra-una-instructora-de-pilates',
    '/funcionalidades/informes-y-rentabilidad',
    '/precios',
  ],
  cta: {
    titulo: 'Mira qué clases pagan su costo, una a una',
    texto:
      'Centra te enseña la ocupación y la rentabilidad de cada clase (lo que ingresa menos lo que cuesta la instructora), y tus alumnas pagan sus packs con Mercado Pago desde el teléfono. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'El precio por clase ($18.000) sale de un solo estudio de Recoleta (ver precio-clase-de-pilates): sumar estudios de otras zonas.',
    'El costo de instructora por clase ($12.000) es un supuesto del ejemplo: reemplazarlo por un costo de liquidación real si aparece una fuente.',
    'La comisión de Mercado Pago no aclara si incluye IVA: confirmarlo en su página de costos.',
  ],
};

export default articulo;
