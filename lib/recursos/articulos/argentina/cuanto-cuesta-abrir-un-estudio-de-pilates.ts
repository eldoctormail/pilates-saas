import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Reformers: precios publicados por dos fabricantes argentinos en su tienda.
// Local: el relevamiento de Finaer que publicaron El Cronista y Revista Mercado
// (pedidos de garantía de alquiler, no contratos firmados) y los precios de
// publicación de los portales. Con la inflación, cada cifra lleva su fecha.

const articulo: Articulo = {
  slug: 'cuanto-cuesta-abrir-un-estudio-de-pilates',
  titulo: 'Cuánto cuesta abrir un estudio de pilates en Argentina: reformers, local y gastos del mes',
  tituloSeo: 'Cuánto cuesta abrir un estudio de pilates en 2026',
  descripcion:
    'Reformers de fabricantes argentinos, alquiler de un local comercial en CABA y GBA, trámites y gastos del mes, con precios publicados en noviembre de 2026.',
  resumen:
    'Lo que cuesta cada partida de un estudio de pilates en Argentina, con precios publicados por fabricantes y relevamientos de alquileres, y un ejemplo para seis reformers.',
  categoria: 'abrir',
  seccion: 'Abrir un estudio',
  publicado: '2026-11-27',
  consultaPrincipal: 'cuánto cuesta abrir un estudio de pilates',
  consultas: [
    'inversión para abrir un estudio de pilates en Argentina',
    'precio cama reformer pilates Argentina',
    'cuánto sale montar un estudio de pilates',
    'alquiler local comercial precio CABA',
    'cuántos reformers necesito para abrir un estudio',
  ],
  respuesta:
    'En noviembre de 2026, una cama reformer de fabricante argentino se publica entre $1.700.000 y $4.200.000, así que seis máquinas van de unos $10 a $25 millones. A eso se suma el local: el alquiler comercial medio en CABA ronda $1,15 millones al mes, y entrar pide unos $2,3 millones entre primer mes y depósito. Después, cada mes, instructoras, servicios, impuestos y software.',
  entradilla:
    'Las máquinas son la partida más grande, pero no la única: el local, la obra, los trámites y lo que cuesta cada mes deciden si el estudio aguanta los primeros meses. Aquí tienes cada partida con precios publicados y su fecha, para armar tu propio presupuesto.',
  secciones: [
    {
      id: 'partidas',
      titulo: 'Cuánto cuesta abrir un estudio de pilates: las partidas',
      bloques: [
        {
          t: 'p',
          texto:
            'Separa siempre lo que pagas **una vez** (máquinas, entrada al local, obra, alta en los organismos) de lo que pagas **cada mes** (alquiler, sueldos u honorarios, servicios, impuestos, software). El primer grupo decide cuánto necesitas para abrir; el segundo, cuántas alumnas necesitas para no perder plata.',
        },
        {
          t: 'lista',
          items: [
            '**Equipamiento**: reformers y, si los vas a usar, torre, silla o cadillac, más el material chico (colchonetas, aros, pelotas).',
            '**Local**: primer mes, depósito, gastos de la inmobiliaria y de la garantía, y la obra (vestuario, baño, piso, iluminación).',
            '**Trámites**: alta en ARCA, Ingresos Brutos y la habilitación de tu municipio, que en algunos casos pide un profesional que firme planos.',
            '**Gastos del mes**: alquiler y expensas, equipo, luz, gas e internet, seguro, monotributo o impuestos del régimen general, y el software de reservas y cobros.',
          ],
        },
      ],
    },
    {
      id: 'precio-de-un-reformer',
      titulo: 'Cuánto cuesta un reformer en Argentina',
      bloques: [
        {
          t: 'p',
          texto:
            'Hay fabricantes argentinos que publican el precio en su web, algo que las marcas internacionales casi nunca hacen. Estos son los de dos de ellos, consultados el mismo día:',
        },
        {
          t: 'tabla',
          cabecera: ['Fabricante y modelo', 'Precio publicado', 'Qué incluye'],
          filas: [
            ['iProfe, reformer de estructura metálica reforzada', '$1.700.000', 'Box, tabla de pique y agarres; envío hasta Vía Cargo'],
            ['iProfe, reformer de madera de guatambú', '$1.800.000', 'Box tapizado, tabla de pique y agarres; 5 % menos por transferencia'],
            ['iProfe, reformer premium importado', '$3.100.000', 'Box, tabla de pique y tabla de extensión'],
            ['Xtend, Max Reformer', '$4.200.000', 'Box, jump board y extensión de pie; IVA incluido'],
            ['Xtend, Max Reformer clínico completo', '$4.500.000', 'Versión para uso clínico'],
            ['Xtend, Max Reformer con medio trapecio', '$5.700.000', 'Reformer con media torre'],
            ['Xtend, Max Reformer con trapecio completo', '$6.900.000', 'Reformer con cadillac'],
          ],
          nota: 'Precios de lista publicados en la tienda de cada fabricante, consultados el 27-nov-2026. iProfe muestra un precio rebajado sobre uno anterior de $1.900.000 o $3.500.000 y pide una seña del 30 % o del 50 % para reservar. Todos dan un año de garantía. Pregunta siempre si el envío y el armado están incluidos.',
        },
        {
          t: 'p',
          texto:
            'La diferencia entre el más barato y el más caro es de más del doble por máquina. Antes de elegir solo por precio, prueba la máquina: el carro, los resortes y el tapizado son lo que usan tus alumnas en cada clase, y lo que más se nota con el uso diario.',
        },
      ],
    },
    {
      id: 'local-y-obra',
      titulo: 'Cuánto cuesta el local: alquiler, entrada y gastos fijos',
      bloques: [
        {
          t: 'p',
          texto:
            'El relevamiento de la empresa de garantías Finaer, publicado el 25 de noviembre de 2026, da un alquiler comercial medio de **$1.146.657 al mes en CABA** y valores parecidos en el conurbano. Sale de los pedidos de garantía que recibió esa empresa en tres meses, no de todos los contratos del mercado.',
        },
        {
          t: 'tabla',
          cabecera: ['Zona', 'Alquiler comercial medio al mes'],
          filas: [
            ['CABA', '$1.146.657'],
            ['GBA Norte', '$1.144.620'],
            ['GBA Sur', '$919.819'],
            ['GBA Oeste', '$828.234'],
          ],
          nota: 'Relevamiento interno de Finaer sobre pedidos de garantía de los últimos tres meses, publicado por El Cronista y Revista Mercado el 25-nov-2026. No hay datos del interior del país en ese informe: para Córdoba, Rosario, Mendoza o Neuquén, compara con los avisos de tu zona.',
        },
        {
          t: 'p',
          texto:
            'Un estudio de seis reformers necesita espacio para que las máquinas no se toquen, más recepción y vestuario, así que suele buscar locales más grandes que la media. Según la mediana de los avisos de los portales en CABA, el metro cuadrado se pide a **$24.038 al mes**, con barrios por encima: Villa Urquiza $40.000, Belgrano $35.000, Recoleta $33.846 y Palermo $28.875. Son precios de publicación, no de cierre.',
        },
        {
          t: 'p',
          texto:
            'El alquiler no es todo. El mismo artículo arma un ejemplo de un local de 90 m² sobre avenida Santa Fe: $4.200.000 de alquiler, más expensas, ABL, luz, gas, internet y seguro, **$5,39 millones al mes en total**, de los cuales $1,19 millones no son alquiler. Para entrar, calcula además el primer mes y un mes de depósito: en el alquiler medio, unos $2,3 millones.',
        },
        {
          t: 'nota',
          titulo: 'Antes de firmar, la habilitación',
          texto:
            'No firmes el alquiler hasta saber que el local se puede habilitar para la actividad: zonificación, salidas, baños y accesibilidad. Lo que pide cada municipio, y en CABA la Ley 139 de gimnasios, está en [los requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'tramites-impuestos-y-musica',
      titulo: 'Trámites, impuestos y música',
      bloques: [
        {
          t: 'p',
          texto:
            'El alta en ARCA y en el monotributo es gratuita, pero desde el primer mes pagas la cuota de tu categoría, que en CABA incluye desde 2026 los Ingresos Brutos. Ojo: la categoría no depende solo de lo que facturas, también de la superficie del local, la luz que consumes y el alquiler que pagas, así que un local grande puede subirte de categoría desde el principio. Haz la cuenta con tu contador antes de elegir local.',
        },
        {
          t: 'p',
          texto:
            'La habilitación municipal tiene su propio costo, que cambia mucho según la ciudad, y a veces pide planos firmados por un profesional. Pide el presupuesto al municipio y al gestor antes de comprometerte.',
        },
        {
          t: 'p',
          texto:
            'Si pasas música en clase, un gimnasio sigue pagando derechos de autor e intérpretes: SADAIC por la música y AADI-CAPIF por intérpretes y productores. Desde los cambios de 2024 y 2025 la tarifa se fija por categoría (superficie, capacidad, equipos), sin un número único: pídela por escrito antes de abrir.',
        },
      ],
    },
    {
      id: 'gastos-del-mes',
      titulo: 'Lo que cuesta el estudio cada mes',
      bloques: [
        {
          t: 'p',
          texto:
            'La partida mensual más grande, después del local, es el equipo. Si contratas en relación de dependencia, el convenio de gimnasios (UTEDYC, CCT 738/16) fija en octubre de 2026 un básico de **$1.351.856 a $1.547.040 al mes** por 176 horas, según la categoría, más presentismo, antigüedad, aguinaldo y cargas sociales. Si tus instructoras facturan como monotributistas, pagas la hora que acuerden. El detalle está en [cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates).',
        },
        {
          t: 'p',
          texto:
            'Suma también el seguro de responsabilidad civil, el servicio de emergencias médicas (obligatorio en CABA por la Ley 139), la limpieza, el mantenimiento de las máquinas (resortes y tapizado se gastan), la comisión de lo que cobras con tarjeta o Mercado Pago y el software de reservas y cobros.',
        },
        {
          t: 'llamada',
          texto:
            'Con Centra tus alumnas reservan y pagan sus packs desde el teléfono, y ves qué clases se llenan y cuáles no desde el primer mes.',
        },
      ],
    },
    {
      id: 'presupuesto-de-ejemplo',
      titulo: 'Inversión para un estudio de pilates: ejemplo con 6 reformers',
      bloques: [
        {
          t: 'p',
          texto:
            'Esto es un **ejemplo**, no un presupuesto cerrado: usa solo los precios publicados de arriba y deja fuera lo que depende de tu local, tu ciudad y tus decisiones (obra, habilitación, mobiliario).',
        },
        {
          t: 'tabla',
          cabecera: ['Partida', 'Con reformers de $1.800.000', 'Con reformers de $4.200.000'],
          filas: [
            ['6 reformers', '$10.800.000', '$25.200.000'],
            ['Entrada al local: primer mes y depósito (alquiler medio de CABA)', '$2.300.000', '$2.300.000'],
            ['Total antes de obra, trámites y material chico', '$13.100.000', '$27.500.000'],
          ],
          nota: 'Ejemplo con los precios de lista de iProfe (guatambú) y Xtend (Max Reformer) del 27-nov-2026 y la entrada al local del relevamiento de Finaer publicado el 25-nov-2026. No incluye envío, armado, obra, habilitación, mobiliario ni el colchón para los primeros meses.',
        },
        {
          t: 'p',
          texto:
            'Guarda además el equivalente a **tres meses de gastos fijos**: los primeros meses casi ningún estudio llena sus clases, y lo que se paga igual (alquiler, sueldos, servicios) no espera. Con la inflación, vuelve a pedir precios justo antes de comprar: los de este artículo pueden haber cambiado en pocas semanas.',
        },
        { t: 'herramienta', id: 'calculadora-rentabilidad' },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuánto sale un reformer de pilates en Argentina?',
      a: 'En noviembre de 2026, los fabricantes argentinos que publican precio piden entre $1.700.000 y $4.200.000 por un reformer, y hasta $6.900.000 con trapecio completo.',
    },
    {
      q: '¿Cuántos reformers necesito para abrir?',
      a: 'Depende del local y de cuántas alumnas quieres por clase: cada reformer es una plaza. Haz la cuenta al revés, desde las plazas que necesitas llenar para cubrir los gastos del mes, con la calculadora de este artículo.',
    },
    {
      q: '¿Cuánto cuesta alquilar un local para un estudio en Buenos Aires?',
      a: 'El alquiler comercial medio en CABA ronda $1,15 millones al mes según el relevamiento de Finaer de noviembre de 2026, con el metro cuadrado de publicación en $24.038 de mediana y más caro en barrios como Villa Urquiza o Belgrano.',
    },
    {
      q: '¿Tengo que pagar SADAIC si pongo música en clase?',
      a: 'Si el estudio pasa música a sus alumnas, sí: SADAIC y AADI-CAPIF cobran a los gimnasios. La tarifa depende de la categoría del local; pídela por escrito.',
    },
    {
      q: '¿Puedo empezar con mat y sin máquinas?',
      a: 'Sí, y la inversión baja mucho: necesitas colchonetas y material chico en lugar de reformers. Lo que no baja es el local, los trámites ni los gastos del mes.',
    },
  ],
  fuentes: [
    { titulo: 'iProfe: cama de pilates reformer con estructura metálica reforzada', url: 'https://www.iprofe.com.ar/producto/reformer-metalicos-pilates/', consultada: '2026-11-27' },
    { titulo: 'iProfe: cama de pilates reformer de guatambú con box y tabla de pique', url: 'https://www.iprofe.com.ar/producto/cama-de-pilates-reformer/', consultada: '2026-11-27' },
    { titulo: 'iProfe: cama de pilates reformer premium importada', url: 'https://www.iprofe.com.ar/producto/cama-de-pilates-reformer-calidad-premium-importada/', consultada: '2026-11-27' },
    { titulo: 'Xtend Pilates: Max Reformer', url: 'https://xtendpilates.com.ar/producto/max-reformer/', consultada: '2026-11-27' },
    { titulo: 'Xtend Pilates: reformers (catálogo)', url: 'https://xtendpilates.com.ar/product-category/equipamiento/reformer-pilates/', consultada: '2026-11-27' },
    { titulo: 'El Cronista: el alquiler de un comercio promedia $1.146.657; cuánto cuesta mantenerlo en total (25-nov-2026)', url: 'https://www.cronista.com/negocios/el-alquiler-de-un-comercio-promedia-1146657-cuanto-cuesta-mantenerlo-en-total-con-impuestos-servicios-y-seguro/', consultada: '2026-11-27' },
    { titulo: 'Revista Mercado: alquiler de locales comerciales, el promedio ronda $1 millón (25-nov-2026)', url: 'https://mercado.com.ar/ladrillos-y-proyectos/alquiler-de-locales-comerciales-el-promedio-ronda-1-millon-y-en-caba-supera-114-millones', consultada: '2026-11-27' },
    { titulo: 'Argentina.gob.ar: Inscribirme como monotributista', url: 'https://www.argentina.gob.ar/servicio/inscribirme-como-monotributista', consultada: '2026-11-24' },
    { titulo: 'Asistente Laboral Argentino: escala salarial UTEDYC, rama gimnasios (CCT 738/16)', url: 'https://www.asistentelaboralargentino.com/escalas/utedyc-rama-gimnasios-738-16.html', consultada: '2026-11-24' },
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-24' },
    { titulo: 'Derecho en Zapatillas: música en tu local, qué se paga hoy, a quién y cuánto (30-jul-2026)', url: 'https://www.derechoenzapatillas.com/2026/musica-en-tu-local-que-se-paga-hoy-a-quien-cuando-y-cuanto/', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
    '/recursos/precio-clase-de-pilates',
    '/recursos/cuanto-cobra-una-instructora-de-pilates',
    '/funcionalidades/informes-y-rentabilidad',
    '/precios',
  ],
  cta: {
    titulo: 'Comprueba desde el primer mes si cada clase se paga',
    texto:
      'Centra te enseña la rentabilidad de cada clase (lo que ingresa menos lo que cuesta la instructora) y cobra packs y abonos con Mercado Pago desde el primer día. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Precios de reformers (iProfe, Xtend) del 27-nov-2026: con la inflación cambian cada pocas semanas, revisarlos en cada actualización.',
    'El alquiler medio sale de un relevamiento de Finaer (pedidos de garantía, no contratos) y solo cubre CABA y GBA: sumar una fuente del interior si aparece.',
    'Música: la regla de SADAIC y AADI-CAPIF sale de un blog jurídico (Derecho en Zapatillas), no del Boletín Oficial; citar el decreto vigente si se confirma.',
    'Falta una cifra sourced para el seguro de responsabilidad civil y para la habilitación municipal: no se escribió ninguna.',
  ],
};

export default articulo;
