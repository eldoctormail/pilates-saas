import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Tarifas de seis estudios de yoga del AMBA (27-nov-2026); IndraYoga se dejó
// fuera porque su web rotula la clase suelta como mensual. Sin epígrafe, CNAE ni
// RITE: trámites de ARCA, Ingresos Brutos y habilitación municipal, enlazados.
// Las cargas del yoga aéreo son de un fabricante y valen igual aquí.

const articulo: Articulo = {
  slug: 'como-abrir-un-estudio-de-yoga',
  titulo: 'Cómo abrir un estudio de yoga: estilos, local, material, trámites, formación y precios',
  tituloSeo: 'Abrir un estudio de yoga: requisitos y costos',
  descripcion:
    'Qué pide cada estilo al local (aéreo, sala caliente), material, trámites en ARCA y tu municipio, formación de profesoras y lo que cobran seis estudios del AMBA.',
  resumen:
    'Lo propio de armar un estudio de yoga en Argentina: qué pide cada estilo al local, el material, los trámites, la formación de las profesoras y lo que cobran seis estudios de Buenos Aires.',
  categoria: 'abrir',
  seccion: 'Abrir un estudio',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'cómo abrir un estudio de yoga',
  consultas: [
    'qué necesito para abrir un estudio de yoga',
    'abrir un centro de yoga',
    'cuánto cuesta abrir un estudio de yoga',
    'requisitos para abrir un centro de yoga',
    'es rentable un estudio de yoga',
  ],
  respuesta:
    'Para abrir un estudio de yoga, elige primero los estilos, porque deciden el local: el aéreo necesita anclajes al techo calculados por un profesional y el de sala caliente, calefacción y ventilación pensadas para eso. Después: material para tu cupo, CUIT y monotributo en ARCA, Ingresos Brutos, la habilitación de tu municipio, seguro, profesoras formadas y precios: en seis estudios de Buenos Aires, $25.000 la clase suelta y $70.000 al mes la clase semanal (medianas).',
  entradilla:
    'Cómo abrir un estudio de yoga sin pagar dos veces: antes que el alquiler, mira si el techo aguanta una hamaca, si la sala caliente se puede calefaccionar y ventilar bien y qué formación tienen de verdad tus profesoras. Acá va lo propio del yoga, con sus fuentes; lo que comparte con cualquier estudio, resumido y enlazado.',
  secciones: [
    {
      id: 'que-necesitas',
      titulo: 'Qué necesito para abrir un estudio de yoga: la lista, paso a paso',
      bloques: [
        {
          t: 'p',
          texto:
            'Lo común a cualquier estudio está, con su norma, en [requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates), y el recorrido completo, en [cómo abrir un estudio de pilates](/recursos/como-abrir-un-estudio-de-pilates): valen para el yoga. Esto es lo que cambia:',
        },
        {
          t: 'tabla',
          cabecera: ['Paso', 'Lo propio del yoga'],
          filas: [
            ['1. Estilos', 'El aéreo y el de sala caliente condicionan el local'],
            ['2. Local', 'Metros por colchoneta; anclajes calculados o calefacción y ventilación, si los necesitas'],
            ['3. Material', 'Colchonetas, bloques, cinturones, mantas, bolsters y almohadones para todo el cupo'],
            ['4. Trámites', 'Los de cualquier estudio: ARCA, Ingresos Brutos y la habilitación de tu municipio'],
            ['5. Profesoras', 'Un profesorado o una formación privada: no hay título oficial de yoga'],
            ['6. Precios', 'En la muestra, $25.000 la clase suelta y $70.000 al mes la clase semanal'],
            ['7. Sistema', 'Reservas, cobros y lista de espera funcionando antes de abrir'],
          ],
          nota: 'Orden recomendado. Cada dato lleva su fuente en las secciones siguientes; los precios son de una muestra de seis estudios (27-nov-2026).',
        },
      ],
    },
    {
      id: 'estilos-y-local',
      titulo: 'Estilos de yoga y lo que cada uno le exige al local',
      bloques: [
        { t: 'p', texto: 'El estilo decide el local antes que el precio del alquiler. Un hatha y un aéreo pueden compartir horario, pero no techo:' },
        {
          t: 'tabla',
          cabecera: ['Estilo', 'Cómo es la clase', 'Qué le exige al local'],
          filas: [
            ['Hatha', 'Posturas mantenidas, a ritmo tranquilo', 'Sala amplia y piso cálido y fácil de limpiar'],
            ['Vinyasa y ashtanga', 'Posturas encadenadas, más dinámicas', 'Más espacio entre colchonetas y buena ventilación'],
            ['Yin y restaurativo', 'Posturas largas con apoyos', 'Lugar para guardar el material; sala templada y silenciosa'],
            ['Aéreo', 'Con una hamaca colgada del techo', 'Anclajes calculados por un profesional y altura libre'],
            ['En sala caliente', 'Sala a unos 40 ºC y con humedad alta', 'Calefacción y ventilación calculadas, y duchas'],
          ],
          nota: 'Orientativo. Los 40 ºC son la temperatura habitual del yoga en sala caliente, no una norma; el detalle, abajo.',
        },
        {
          t: 'p',
          texto:
            '**Yoga aéreo.** El punto débil no es la hamaca, sino el techo. Uplift Active, fabricante de hamacas, las certifica para 200 kg, pero avisa que algunos movimientos generan fuerzas de 2 a 4 veces el peso de la alumna y que cada anclaje debería aguantar con holgura 1.000 libras (unos 450 kg) y tener una capacidad nominal de 3.000 libras (unos 1.360 kg) o más. Que un ingeniero o un arquitecto matriculado revise el techo antes de colgar nada: si necesita refuerzo, es obra, con su permiso municipal. Y pregúntale a tu aseguradora qué revisiones exige.',
        },
        {
          t: 'p',
          texto:
            '**Yoga en sala caliente.** Calentar una sala a unos 40 ºC con humedad alta y a la vez renovar el aire es una instalación, no una estufa: pide el cálculo a un instalador matriculado antes de firmar el alquiler, y suma el consumo de gas o de luz a tus gastos fijos, que con las tarifas actuales puede pesar.',
        },
        {
          t: 'p',
          texto:
            '**Metros por alumna, un ejemplo.** Una colchoneta estándar mide unos 180 × 60 cm. Si reservas para cada una 2,4 × 1,2 m (unos 30 cm de paso alrededor: una decisión tuya, no una norma), cada puesto ocupa casi 2,9 m², y una clase de 15 pide unos 43 m², sin contar el lugar de la profesora, el depósito ni los vestuarios.',
        },
      ],
    },
    {
      id: 'material-y-precios',
      titulo: 'Material para un estudio de yoga',
      bloques: [
        {
          t: 'p',
          texto:
            'Sin máquinas, el material es barato por unidad, pero se multiplica por el cupo. Para una clase de 15, calcula una unidad por alumna de colchoneta, cinturón, manta, bolster y almohadón de meditación, y dos bloques por alumna.',
        },
        {
          t: 'cifras',
          titulo: 'La partida más grande, en un ejemplo',
          cifras: [
            { valor: '$33.620', etiqueta: 'una colchoneta de 10 mm de caucho, en Mercado Libre' },
            { valor: '$504.300', etiqueta: '15 colchonetas para una clase completa' },
          ],
          nota: 'Precio publicado el 27-nov-2026 (fuente en la lista). Es un ejemplo, no un presupuesto: pide precio por cantidad a las tiendas de yoga, que suelen tener condiciones para estudios.',
        },
        {
          t: 'p',
          texto:
            'Bloques, cinturones, mantas, bolsters y almohadones se compran en tiendas de yoga y en Mercado Libre, y los precios cambian mucho de una semana a otra: compara al menos tres antes de equipar la sala. Si das aéreo, suma las hamacas, los herrajes certificados y el cálculo del techo; si das sala caliente, la instalación.',
        },
      ],
    },
    {
      id: 'requisitos-epigrafe-cnae-iva',
      titulo: 'Requisitos para abrir un centro de yoga: ARCA, Ingresos Brutos y habilitación',
      bloques: [
        {
          t: 'p',
          texto:
            'Los trámites son los de cualquier estudio, y están con su norma en [requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates). En corto:',
        },
        {
          t: 'lista',
          items: [
            '**ARCA.** CUIT, clave fiscal y el alta en el monotributo o como responsable inscripto. La categoría del monotributo cuenta también la superficie del local, la luz y el alquiler.',
            '**Ingresos Brutos.** El alta en la provincia donde está el estudio; en la Ciudad de Buenos Aires, desde 2026, se paga junto con el monotributo.',
            '**Habilitación.** La da tu municipio, y el trámite cambia de una ciudad a otra. Pregunta antes de firmar el alquiler si el local admite la actividad.',
            '**Ley 139, en la Ciudad de Buenos Aires.** Regula los establecimientos de actividades físicas no competitivas (profesor de Educación Física que supervise, apto físico, emergencias médicas). Pregunta en la Agencia Gubernamental de Control si tu estudio de yoga entra.',
            '**Impuestos de las clases.** Si eres monotributista emites factura C; si eres responsable inscripta, las clases llevan IVA. El detalle, en [las clases de pilates y el IVA](/recursos/iva-clases-de-pilates), que vale también para el yoga.',
          ],
        },
      ],
    },
    {
      id: 'titulacion-para-dar-clases-de-yoga',
      titulo: 'Formación para dar clases de yoga: qué es oficial y qué no',
      bloques: [
        {
          t: 'p',
          texto:
            'En Argentina no hay un título oficial de profesora de yoga: los profesorados y las formaciones son privados, de escuelas e institutos que certifican su propio programa. Antes de contratar a una profesora, pregunta con qué escuela se formó, cuántas horas y cuánta práctica.',
        },
        {
          t: 'p',
          texto:
            '**Yoga Alliance.** Un certificado de Yoga Alliance (RYT 200, por ejemplo) viene de una organización estadounidense sin fines de lucro que se presenta como un registro voluntario de escuelas y profesoras; su credencial de escuela básica, RYS 200, corresponde a una formación de 200 horas. Puede ser buena formación, pero es una acreditación privada, no un título oficial.',
        },
        {
          t: 'p',
          texto:
            'Lo que sí puede pesar es la norma de tu ciudad, como la Ley 139 en la Ciudad de Buenos Aires. Y en todos los casos, que tu equipo tenga al día el certificado de RCP y primeros auxilios.',
        },
      ],
    },
    {
      id: 'precios-de-clases-de-yoga',
      titulo: 'Cuánto cobrar: precios de clases de yoga en seis estudios',
      bloques: [
        {
          t: 'p',
          texto:
            'Estas son las tarifas que publican seis estudios de yoga de la Ciudad de Buenos Aires y el conurbano. Es una muestra chica y no aleatoria (estudios con precios claros en su web): tómala como referencia, no como estadística del mercado.',
        },
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Zona', 'Clase suelta', 'Una clase semanal, al mes'],
          filas: [
            ['Escuela de Yoga Verónica Belloli', 'Belgrano (CABA)', '$45.000', '$70.000'],
            ['Andy Yoga Estudio', 'Colegiales - Palermo (CABA)', '$30.000', '$70.000'],
            ['Yoga con Elementos', 'Buenos Aires', '$25.000', '$83.000 (grupos de hasta 5)'],
            ['Shanti Yoga', 'Recoleta (CABA)', '$20.000', '$60.000 (4 clases, en efectivo)'],
            ['Arama Yoga', 'Ingeniero Maschwitz', '$23.000', '$70.000'],
            ['Centro Argentino de Yoga', 'Quilmes', '—', '$52.640'],
          ],
          nota: 'Tarifas publicadas en la web de cada estudio, consultadas el 27-nov-2026; casi ninguno publica desde cuándo valen (Shanti dice «junio 2026»). Muestra no aleatoria. «—»: no la publica. Los barrios de Belloli y Shanti salen de su dirección.',
        },
        {
          t: 'cifras',
          titulo: 'Lo que cobra la muestra',
          cifras: [
            { valor: '$25.000', etiqueta: 'Mediana de la clase suelta (de $20.000 a $45.000)' },
            { valor: '$70.000', etiqueta: 'Mediana al mes por una clase semanal (de $52.640 a $83.000)' },
            { valor: '25 %', etiqueta: 'Rebaja mediana por clase del abono frente a la suelta' },
          ],
          nota: 'Clase suelta: 5 estudios; abono: 6. La rebaja, en los 5 que publican las dos tarifas, contando cuatro clases al mes (27-nov-2026).',
        },
        {
          t: 'p',
          texto:
            'Con el abono mediano, cada clase sale a $17.500 si cuentas cuatro al mes, y la rebaja frente a la suelta va del 17 % al 61 %. Con la inflación, estas cifras caducan rápido: compárate con estudios de tu zona y revisa tus precios cada pocos meses. Cómo armar la escalera de packs y abonos, en [packs de pilates](/recursos/bonos-de-pilates); qué pasa cuando alguien falta, en tu [política de cancelación de clases](/recursos/politica-de-cancelacion-de-clases).',
        },
      ],
    },
    {
      id: 'cuanto-cuesta-y-rentabilidad',
      titulo: '¿Cuánto cuesta abrir un estudio de yoga y es rentable?',
      bloques: [
        {
          t: 'p',
          texto:
            'La inversión se va sobre todo en el local y la obra: las colchonetas para 15 alumnas cuestan, en el ejemplo de arriba, unos $504.300, cuando en pilates cada reformer se lleva millones de pesos. El resto (depósito, obra, habilitación, seguros, colchón) tiene su desglose en [cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'Que sea rentable depende de la ocupación y de lo que pagues por clase a tus profesoras. El método, con calculadora, está en [¿es rentable un estudio de pilates?](/recursos/rentabilidad-estudio-de-pilates). En Centra, el informe de rentabilidad por clase le resta a lo que ingresa cada clase lo que cuesta su profesora.',
        },
        {
          t: 'nota',
          titulo: 'Ejemplo con cifras inventadas',
          texto:
            'Con el abono mediano de la muestra ($70.000 al mes; unos $66.900 después del 4,39 % de Mercado Pago a 10 días), si tus gastos fijos, profesoras incluidas, fueran $3.500.000 al mes, necesitarías 53 alumnas con una clase semanal: unas cuatro clases llenas de 15 por semana. No son cifras de mercado: cámbialas por las tuyas.',
        },
      ],
    },
    {
      id: 'reservas-y-cobros',
      titulo: 'Reservas, packs y cobros desde la primera clase',
      bloques: [
        {
          t: 'p',
          texto:
            'Tus alumnas tienen que poder reservar y cancelar sin escribirte, y los packs, descontarse y vencer sin planillas. En Centra reservan y cancelan desde el celular, con la app del estudio en su pantalla de inicio con tu nombre y tu ícono; la lista de espera es automática, y los abonos y packs se cobran con Mercado Pago. Es gratis hasta 150 reservas al mes, sin permanencia: [Centra para estudios de yoga](/soluciones/estudio-de-yoga).',
        },
        {
          t: 'llamada',
          texto: 'Centra funciona igual para yoga que para pilates: reservas, packs, abonos y lista de espera, gratis hasta 150 reservas al mes, sin permanencia.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Qué necesito para abrir un estudio de yoga?',
      a: 'Un local que admita la actividad y encaje con tus estilos, material para tu cupo, CUIT y monotributo o responsable inscripto en ARCA, Ingresos Brutos, la habilitación de tu municipio, seguro, profesoras formadas y un sistema de reservas y cobros.',
    },
    {
      q: '¿Cuánto cuesta abrir un estudio de yoga?',
      a: 'Depende sobre todo del local y de la obra. Las colchonetas para 15 alumnas rondan los $504.300 en nuestro ejemplo (nov-2026); súmale bloques y demás material, depósito, obra, habilitación, seguros y un colchón.',
    },
    {
      q: '¿Hace falta un título oficial para dar clases de yoga?',
      a: 'No hay un título oficial de profesora de yoga en Argentina: los profesorados son privados. Lo que puede pesar es la norma de tu ciudad, como la Ley 139 en la Ciudad de Buenos Aires.',
    },
    {
      q: '¿Las clases de yoga pagan impuestos?',
      a: 'Sí. Si eres monotributista emites factura C y pagas la cuota de tu categoría; si eres responsable inscripta, tus clases llevan IVA. Además, Ingresos Brutos en tu provincia. Confírmalo con tu contador.',
    },
    {
      q: '¿Es rentable un estudio de yoga?',
      a: 'Puede serlo si llenas las clases: sin máquinas la inversión es menor, pero el abono también ($70.000 al mes de mediana en nuestra muestra). Calcula cuántas alumnas necesitas antes de firmar el alquiler.',
    },
    {
      q: '¿Cuánto cobrar por una clase de yoga?',
      a: 'En los seis estudios revisados del AMBA (nov-2026), la clase suelta va de $20.000 a $45.000 (mediana: $25.000) y el abono de una clase semanal, de $52.640 a $83.000 al mes (mediana: $70.000).',
    },
  ],
  fuentes: [
    { titulo: 'Escuela de Yoga Verónica Belloli: aranceles', url: 'https://www.eyoga.com.ar/index.php/clases/aranceles', consultada: '2026-11-27' },
    { titulo: 'Andy Yoga Estudio: horarios y aranceles', url: 'https://www.andyogaestudio.com/horarios-y-aranceles', consultada: '2026-11-27' },
    { titulo: 'Yoga con Elementos: horario y aranceles', url: 'https://www.yoga-elementos.com.ar/horario-y-aranceles', consultada: '2026-11-27' },
    { titulo: 'Shanti Yoga: aranceles (junio 2026)', url: 'https://www.shantiyoga.com.ar/tarifas', consultada: '2026-11-27' },
    { titulo: 'Arama Yoga: abonos', url: 'https://aramayoga.com.ar/abonos/', consultada: '2026-11-27' },
    { titulo: 'Centro Argentino de Yoga: abono mensual', url: 'https://www.centroargentinoyoga.com.ar/product-page/clases-de-yoga-abono-mensual', consultada: '2026-11-27' },
    { titulo: 'MejoresCompras: mat de yoga y pilates 10 mm de caucho NBR (precio en Mercado Libre)', url: 'https://mejorescompras.com.ar/precio/MLA41459514--mat-yoga-10-mm-colchoneta-pilates-caucho-nbr-180x62-bolso-verde', consultada: '2026-11-27' },
    { titulo: 'Uplift Active: guía para armar un estudio de yoga aéreo (cargas y anclajes)', url: 'https://upliftactive.com/pages/aerial-yoga-studio-set-up-guide', consultada: '2026-09-25' },
    { titulo: 'Yoga Alliance: historia y naturaleza de la organización', url: 'https://yogaalliance.org/meet-yoga-alliance/', consultada: '2026-09-25' },
    { titulo: 'Yoga Alliance: credenciales para escuelas (RYS 200, 300 y 500)', url: 'https://yogaalliance.org/explore-credentialing-options/', consultada: '2026-09-25' },
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-27' },
    { titulo: 'Argentina.gob.ar: Inscribirme como monotributista', url: 'https://www.argentina.gob.ar/servicio/inscribirme-como-monotributista', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/soluciones/estudio-de-yoga',
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/politica-de-cancelacion-de-clases',
  ],
  cta: {
    titulo: 'Abre tu estudio de yoga con las reservas resueltas',
    texto:
      'Centra deja listos las reservas, los packs, los abonos y la lista de espera de tu estudio antes de la primera clase, con la app del estudio para tus alumnas. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Tarifas de los seis estudios consultadas el 27-nov-2026: con la inflación caducan rápido. IndraYoga quedó fuera (rotula la clase suelta como «/mes», a $5.000) y Sivananda no se pudo leer.',
    'Centro Argentino de Yoga publica el mismo precio para 1 y 2 veces por semana; se tomó como abono de una vez.',
    'Ley 139: no se confirmó si la AGC la aplica a los estudios de yoga (su guía nombra gimnasios y pilates). El texto manda a preguntar.',
    'Cargas del yoga aéreo: de un fabricante estadounidense (Uplift Active), en libras convertidas a kg redondeando.',
  ],
};

export default articulo;
