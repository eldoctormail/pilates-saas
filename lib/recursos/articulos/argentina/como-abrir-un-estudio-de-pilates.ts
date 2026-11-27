import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Es la guía «paraguas»: las cifras salen de las versiones argentinas de
// cuanto-cuesta-abrir (reformers de iProfe y Xtend, alquiler de Finaer),
// precios-reformer-mat (colchoneta) y requisitos (ARCA, Ingresos Brutos,
// habilitación municipal, Ley 139 de CABA). Si cambian allí, cambian aquí.
// Las medidas de los reformers son de fábrica y valen igual en los dos países.

const articulo: Articulo = {
  slug: 'como-abrir-un-estudio-de-pilates',
  titulo: 'Cómo abrir un estudio de pilates: guía paso a paso, de la idea a la primera semana abierta',
  tituloSeo: 'Cómo abrir un estudio de pilates en 2026: guía',
  descripcion:
    'De la idea a la primera clase: inversión, local, máquinas, trámites, precios y equipo para abrir tu estudio de pilates en Argentina. Con los pasos en orden.',
  resumen:
    'La guía completa para armar un estudio de pilates en Argentina: concepto, números, local, reformers, trámites, precios, equipo, reservas y los primeros 90 días, en orden.',
  categoria: 'abrir',
  seccion: 'Abrir un estudio',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'cómo abrir un estudio de pilates',
  consultas: [
    'armar un estudio de pilates',
    'abrir un centro de pilates',
    'qué necesito para abrir un estudio de pilates',
    'pasos para abrir un estudio de pilates',
    'emprendimiento de pilates',
  ],
  respuesta:
    'Para abrir un estudio de pilates, sigue este orden: decide el concepto (reformer, mat o mixto) y a quién te diriges; haz los números antes de firmar nada; busca un local donde quepan las máquinas y el municipio admita la actividad; elige el equipamiento; date de alta en ARCA y en Ingresos Brutos y tramita la habilitación; fija precios, packs y normas de cancelación; prepara equipo, reservas y cobros; y lanza con preventa y clases de prueba.',
  entradilla:
    'Cómo abrir un estudio de pilates sin tirar la plata: empezando por el concepto y los números, no por los reformers. Esta guía sigue el orden que evita los errores caros, con lo que cuesta cada paso, lo que pide la normativa y lo que conviene tener listo antes de abrir la puerta.',
  secciones: [
    {
      id: 'pasos-de-un-vistazo',
      titulo: 'Cómo abrir un estudio de pilates: los pasos de un vistazo',
      bloques: [
        {
          t: 'p',
          texto:
            'Un paso hecho antes de tiempo sale caro: firmar un local donde el municipio no admite la actividad, comprar máquinas antes de saber cuántas entran o abrir sin saber cuánto tienes que vender para cubrir gastos. Esta es la secuencia completa:',
        },
        {
          t: 'tabla',
          cabecera: ['Fase', 'Lo que tienes que tener hecho', 'Más detalle'],
          filas: [
            ['1. Concepto', 'Formato (reformer, mat o mixto), público y horario tipo', 'Paso 1, abajo'],
            ['2. Números', 'Inversión inicial, gastos fijos del mes y plazas que necesitas vender', '[Cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates)'],
            ['3. Local', 'Uso admitido por el municipio, metros para tus máquinas, techo, piso, vestuario y baños', 'Pasos 3 y 4, abajo'],
            ['4. Equipamiento', 'Máquinas elegidas, con plazo de entrega, armado y garantía', 'Precios por fabricante en el artículo de costos'],
            ['5. Trámites', 'CUIT, monotributo o responsable inscripto, Ingresos Brutos, habilitación, seguro y, en CABA, lo que pide la Ley 139', '[Requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates)'],
            ['6. Precios', 'Clase suelta, packs, abono, vencimiento y política de cancelación', '[Precio de una clase de pilates](/recursos/precio-clase-de-pilates)'],
            ['7. Equipo y sistema', 'Instructoras, horario publicado, reservas y cobros online funcionando', '[Cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates)'],
            ['8. Lanzamiento', 'Preventa, clases de prueba, perfil en Google y redes, y las primeras semanas medidas', 'Paso 8, abajo'],
          ],
          nota: 'Orden recomendado. Las fases 3 y 5 se solapan: la consulta al municipio sobre el uso del local va antes de firmar el alquiler, y el alta en ARCA, antes de facturar la primera clase.',
        },
      ],
    },
    {
      id: 'concepto',
      titulo: 'Paso 1: decide qué estudio vas a abrir (reformer, mat o mixto)',
      bloques: [
        {
          t: 'p',
          texto:
            'El formato decide casi todo lo demás: cuánto inviertes, cuántos metros necesitas, cuántas alumnas entran por clase y cómo pones precio. Un estudio de mat se equipa con colchonetas y accesorios; uno de reformer, con máquinas que cuestan millones de pesos cada una y que fijan el cupo de cada clase.',
        },
        {
          t: 'tabla',
          cabecera: ['Formato', 'Equipamiento por plaza', 'Cupo de la clase', 'Lo que implica'],
          filas: [
            ['Mat', 'Una colchoneta de 10 mm de caucho: unos $33.620', 'Lo marcan los metros de la sala', 'Menos inversión; puedes ampliar la clase sin comprar máquinas'],
            ['Reformer', 'Un reformer de fabricante argentino: de $1.700.000 a $4.200.000', 'Una alumna por máquina', 'Más inversión y más metros por plaza; el precio tiene que pagar la máquina'],
            ['Mixto', 'Las dos cosas', 'Mat en una sala y máquinas en otra, o por turnos', 'Llenas franjas distintas con públicos distintos, con más horario que coordinar'],
          ],
          nota: 'Precios de lista de iProfe y Xtend Pilates (reformers) y de Mercado Libre (colchoneta), consultados el 27-nov-2026. Más modelos, en el artículo de costos.',
        },
        {
          t: 'p',
          texto:
            'Después, el público. Lo que va a hacer que te elijan frente a un gimnasio o al estudio de la otra cuadra es a quién te diriges:',
        },
        {
          t: 'lista',
          items: [
            '**Embarazo y posparto**: clases específicas y horarios compatibles con la crianza.',
            '**Mayores**: grupos reducidos y un ritmo más tranquilo.',
            '**Deportistas**: fuerza y movilidad para corredoras, ciclistas o jugadoras de pádel y hockey.',
            '**Espalda y postura**: quien llega recomendada por su kinesiólogo. Ojo: la rehabilitación es una práctica de salud, con sus propias normas ([requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates)).',
          ],
        },
        {
          t: 'p',
          texto:
            'Con el concepto claro, escribe en una frase qué estudio eres y para quién: te va a guiar en el local, el horario y el nombre (hay ideas en [nombres para un estudio de pilates](/recursos/nombres-para-estudio-de-pilates)).',
        },
      ],
    },
    {
      id: 'numeros',
      titulo: 'Paso 2: los números de armar un estudio de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'Antes de firmar nada, separa dos cifras: la **inversión inicial** (máquinas, obra, depósito, habilitación, lanzamiento) y los **gastos fijos de cada mes** (alquiler, expensas, instructoras, seguros, software, monotributo). Con seis reformers, solo máquinas y entrada al local suman entre $13,1 y $27,5 millones; el detalle de cada partida está en [cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates).',
        },
        {
          t: 'p',
          texto: 'La pregunta que decide si el estudio se sostiene es cuántas plazas tienes que vender al mes para cubrir los gastos fijos:',
        },
        {
          t: 'lista',
          ordenada: true,
          items: [
            'Calcula el margen por plaza: lo que te deja de media cada alumna por clase, después de la comisión de cobro y de impuestos, menos lo que te cuesta esa plaza (lo que pagas a la instructora por la clase dividido entre las plazas).',
            'Divide tus gastos fijos mensuales entre ese margen: son las plazas que necesitas vender al mes.',
            'Compáralo con tu capacidad: clases por semana × plazas por clase × 4,33 semanas que tiene de media un mes.',
          ],
        },
        {
          t: 'nota',
          titulo: 'Ejemplo con cifras inventadas',
          texto:
            'Si tus gastos fijos fueran $4.000.000 al mes y cada plaza te dejara $10.000 de margen, necesitarías vender 400 plazas al mes. Con 6 reformers son unas 67 clases llenas al mes, o 100 clases con dos tercios de ocupación. No son cifras de mercado: cámbialas por las tuyas.',
        },
        {
          t: 'p',
          texto:
            'Si la cuenta solo cierra con el estudio lleno a toda hora, no se arregla abriendo: cambia de local, de número de máquinas o de precios antes de comprometerte. Y con la inflación, rehaz la cuenta cada vez que actualices precios o te aumenten el alquiler. Cómo se reparte ese margen entre clases y franjas, en [rentabilidad de un estudio de pilates](/recursos/rentabilidad-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'local-y-equipamiento',
      titulo: 'Pasos 3 y 4: qué necesitas en el local y qué máquinas comprar',
      bloques: [
        {
          t: 'p',
          texto:
            'Antes de firmar un alquiler, pregunta en la oficina de habilitaciones de tu municipio si ese local admite la actividad y qué trámite te toca. Es la comprobación más barata de todo el proceso. Y cuenta con la entrada: en el alquiler comercial medio de CABA ($1.146.657 en noviembre de 2026, según Finaer), primer mes y un mes de depósito son unos $2,3 millones, más expensas, ABL y servicios cada mes.',
        },
        {
          t: 'lista',
          items: [
            '**Superficie según las máquinas.** Un reformer mide unos 2,4-2,5 m de largo por 0,65-0,8 m de ancho (tabla de abajo), y alrededor necesitas paso para la instructora y lugar para brazos y piernas. Pídele al fabricante el espacio libre que recomienda.',
            '**Altura de techo**, si vas a usar torre o ejercicios de pie: Merrithew indica, en su SPX Max, un techo mínimo de 2,48 m para los ejercicios de pie.',
            '**Piso** nivelado y resistente: un reformer de estudio pesa unos 63-66 kg sin la alumna.',
            '**Salidas y emergencias**: el municipio va a mirar los medios de salida, los matafuegos y la instalación eléctrica; en CABA, además, el botiquín y el servicio de emergencias médicas de la Ley 139.',
            '**Vestuario, baños y vecinos**: lo que pida tu municipio, lo que esperan tus alumnas y dónde no va a molestar la música a primera hora.',
          ],
        },
        {
          t: 'tabla',
          cabecera: ['Modelo', 'Largo', 'Ancho', 'Fuente'],
          filas: [
            ['Merrithew SPX Max', '252,7 cm (barra de pies abajo)', '66 cm', 'Ficha del fabricante'],
            ['Align-Pilates C8 Pro', '244 cm', '66 cm', 'Ficha del fabricante'],
            ['Balanced Body Allegro 2', '239 cm', '79 cm con la barra de pies', 'Ficha del fabricante'],
          ],
          nota: 'Medidas publicadas por los fabricantes, consultadas el 25-sep-2026. Los reformers argentinos tienen medidas parecidas: pídeselas al fabricante. La superficie de la sala es la de las máquinas más los pasillos que decidas dejar.',
        },
        {
          t: 'p',
          texto:
            '**Ejemplo de cálculo** (la holgura es una decisión tuya, no una norma): si reservas para cada reformer un rectángulo de 3,5 × 1,7 m, es decir, la máquina más un metro de holgura a lo largo y a lo ancho, cada puesto ocupa casi 6 m², y seis reformers piden unos 36 m² de sala, sin contar recepción, vestuarios ni baños.',
        },
        {
          t: 'p',
          texto:
            'Con el local medido, eliges máquinas: material (metal o madera de guatambú), accesorios (box, tabla de pique, jump board, torre) y nuevas o usadas. Los fabricantes argentinos que revisamos dan un año de garantía y algunos piden una seña del 30 % o del 50 % para reservar. Pregunta por plazo de entrega, envío y armado. Todos los modelos, comparados en [cuánto cuesta abrir un estudio de pilates](/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates).',
        },
      ],
    },
    {
      id: 'tramites',
      titulo: 'Paso 5: los trámites para abrir un centro de pilates',
      bloques: [
        {
          t: 'p',
          texto:
            'Son pocos, pero van en orden. El detalle de cada uno, con su norma, está en [requisitos para abrir un estudio de pilates](/recursos/requisitos-para-abrir-un-estudio-de-pilates). La secuencia:',
        },
        {
          t: 'pasos',
          items: [
            { titulo: 'CUIT y clave fiscal', texto: 'Son la puerta de ARCA, de tu provincia y, en muchos municipios, de la habilitación.' },
            { titulo: 'Monotributo o responsable inscripto', texto: 'Si empiezas sola o con pocos ingresos, el monotributo es lo habitual. Ojo: la categoría depende también de la superficie del local, la energía eléctrica y el alquiler, no solo de lo que facturas. Si abres una sociedad o superas los topes, pasas al régimen general. Decídelo con tu contador.' },
            { titulo: 'Ingresos Brutos', texto: 'El alta va en la provincia donde está el estudio. En la Ciudad de Buenos Aires, desde 2026, se paga junto con el monotributo en una sola cuota.' },
            { titulo: 'Habilitación del local', texto: 'La da tu municipio, y es lo que más cambia de una ciudad a otra. Pide también el permiso de obra si reformas.' },
            { titulo: 'Ley 139, en la Ciudad de Buenos Aires', texto: 'Clases supervisadas por un profesor de Educación Física, certificado de aptitud física de cada alumna y un servicio de emergencias médicas contratado. En otras ciudades, consulta la norma local.' },
            { titulo: 'Seguro', texto: 'Responsabilidad civil para el estudio y para quien da clase: si una alumna se lesiona, el reclamo te llega a ti.' },
            { titulo: 'Datos de salud y música', texto: 'El apto físico y lo que te cuente cada alumna sobre lesiones o embarazo son datos sensibles para la Ley 25.326. Y si pasas música en clase, SADAIC y AADI-CAPIF cobran a los gimnasios.' },
          ],
        },
        {
          t: 'nota',
          titulo: '¿Y si no eres instructora?',
          texto:
            'Puedes ser la dueña sin dar clases. Lo que puede pedir tu ciudad es la titulación de quien las da o las supervisa: en la Ciudad de Buenos Aires, un profesor de Educación Física. Cómo se forma una instructora, en [cómo ser instructora de pilates](/recursos/como-ser-instructora-de-pilates).',
        },
      ],
    },
    {
      id: 'precios-y-bonos',
      titulo: 'Paso 6: precios, packs y normas de cancelación',
      bloques: [
        {
          t: 'p',
          texto:
            'Fija los precios desde tus números, no desde los del estudio de enfrente: cada plaza tiene que pagar su parte de alquiler, de máquina y de instructora. Cómo ponerle precio a una clase, en [precio de una clase de pilates](/recursos/precio-clase-de-pilates); la diferencia entre reformer y mat, en [reformer vs. mat](/recursos/precios-reformer-mat). La oferta mínima para abrir:',
        },
        {
          t: 'lista',
          items: [
            '**Clase suelta**, para quien quiere probar sin compromiso.',
            '**Packs** de 4, 8 o 12 clases al mes con vencimiento: cómo armarlos, en [packs de pilates](/recursos/bonos-de-pilates).',
            '**Abono mensual con horario fijo**, si buscas ingresos que se repitan.',
            '**Clase de prueba**, gratis o a precio reducido, con una fecha límite para pasar a un pack.',
            '**Política de cancelación**: con cuántas horas se puede cancelar sin perder la clase y qué pasa con quien no viene. Escríbela antes de abrir y aplícala igual a todas; tienes una plantilla en [política de cancelación de clases](/recursos/politica-de-cancelacion-de-clases).',
          ],
        },
        {
          t: 'p',
          texto:
            'Con la inflación, decide también cada cuánto actualizas precios y avísalo con anticipación: las alumnas lo llevan mejor cuando saben que va a pasar.',
        },
      ],
    },
    {
      id: 'equipo-reservas-y-cobros',
      titulo: 'Paso 7: equipo, reservas y cobros',
      bloques: [
        {
          t: 'p',
          texto:
            'Si no vas a dar todas las clases tú, necesitas instructoras antes de publicar el horario: en relación de dependencia, con el convenio de gimnasios, o monotributistas que te facturan. Lo que cobran, en [cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates). Y decide desde el primer mes quién cubre una baja: [cómo cubrir la baja de una instructora](/recursos/cubrir-baja-instructora).',
        },
        {
          t: 'p',
          texto:
            'Después, el sistema. El primer día tus alumnas tienen que poder reservar y cancelar sin escribirte, la lista de espera tiene que funcionar sola y los packs, descontarse y vencer sin planillas. Y tienes que cobrar online: con un link de pago de Mercado Pago, por ejemplo, no hay costo fijo y cada cobro paga una comisión según el plazo (un 4,39 % a 10 días, consultado el 27-nov-2026).',
        },
        {
          t: 'p',
          texto:
            'Es lo que hace [Centra](/funcionalidades/reservas-online): tus alumnas reservan y cancelan desde el celular e instalan la app del estudio en su pantalla de inicio con tu nombre y tu ícono; la lista de espera es automática; hay packs con vencimiento, abonos y clases sueltas, con reglas por tipo de clase; y cobras con Mercado Pago. Es gratis hasta 150 reservas al mes, sin permanencia ([precios](/precios)). Si ya tienes web, las reservas se ponen dentro con un widget: [reservas en tu web](/recursos/reservas-en-tu-web).',
        },
        {
          t: 'llamada',
          texto:
            'Que tus alumnas reserven, tengan su pack y paguen desde el celular el día que abres es cosa de dejarlo configurado antes: Centra lo trae de serie, gratis hasta 150 reservas al mes, sin permanencia.',
        },
      ],
    },
    {
      id: 'lanzamiento-y-primeros-90-dias',
      titulo: 'Paso 8: lanzamiento y primeros 90 días',
      bloques: [
        {
          t: 'pasos',
          items: [
            { titulo: 'Preventa', texto: 'Packs de fundadora a precio de apertura, con lugares y plazo limitados: caja para los primeros meses y alumnas desde el primer día.' },
            { titulo: 'Clases de prueba', texto: 'En las horas que prevés más flojas, y a cada alumna que prueba, una propuesta concreta para seguir.' },
            { titulo: 'Google, Instagram y WhatsApp', texto: 'Perfil de empresa en Google con horario, fotos reales y enlace para reservar; en Instagram, la sala, el equipo y cómo es una clase; y un WhatsApp del estudio para las consultas.' },
            { titulo: 'Alianzas de barrio', texto: 'Kinesiólogos, obstetras, clubes y comercios cercanos: ofréceles una clase para su equipo o su público.' },
            { titulo: 'Semana de apertura', texto: 'Puertas abiertas, horario completo publicado y reservas online funcionando.' },
          ],
        },
        {
          t: 'p',
          texto: 'En los tres primeros meses, no cambies nada a ciegas: mira cada semana tres números.',
        },
        {
          t: 'lista',
          items: [
            '**Ocupación por franja**: qué horas se llenan y cuáles no. Las franjas flojas se trabajan antes de quitarlas: [cómo llenar las clases valle](/recursos/ocupacion-clases-valle).',
            '**Conversión de la clase de prueba**: cuántas de las que prueban compran un pack o un abono.',
            '**Cancelaciones tardías y faltazos**: si se disparan, la política no se está aplicando.',
          ],
        },
        {
          t: 'p',
          texto:
            'Con esos datos, ajusta horario y oferta al final del primer mes y del tercero. Lo que conviene evitar es bajar precios después de una primera semana floja: primero llena franjas y convierte pruebas.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Qué necesito para abrir un estudio de pilates?',
      a: 'Un concepto claro, un local donde tu municipio admita la actividad y entren las máquinas, el equipamiento, CUIT y el alta en el monotributo o como responsable inscripto, Ingresos Brutos, la habilitación municipal, un seguro de responsabilidad civil, instructoras y, en la Ciudad de Buenos Aires, lo que pide la Ley 139.',
    },
    {
      q: '¿Cuánta plata hace falta para armar un estudio de pilates?',
      a: 'Depende del formato y del local. En reformer, las máquinas son la partida grande: un reformer de fabricante argentino va de $1.700.000 a $4.200.000 (nov-2026), así que seis suman de $10,2 a $25,2 millones. Súmale la entrada al local, obra, habilitación, seguros y un colchón para los primeros meses.',
    },
    {
      q: '¿Hace falta ser instructora para abrir un centro de pilates?',
      a: 'No. Puedes ser la dueña y contratar a quien dé las clases. En la Ciudad de Buenos Aires, la Ley 139 pide que las supervise un profesor de Educación Física; en otras ciudades, consulta la norma local.',
    },
    {
      q: '¿Necesito habilitación para abrir un estudio de pilates?',
      a: 'Sí: la da tu municipio, y el trámite y los requisitos cambian de una ciudad a otra. Pregunta si el local admite la actividad antes de firmar el alquiler.',
    },
    {
      q: '¿Cuántos reformers necesito para empezar?',
      a: 'Los que entren con holgura en tu sala y los que tus números necesiten para cubrir gastos con una ocupación realista. Si la cuenta solo cierra con todo lleno, necesitas otro local, otro número de máquinas u otros precios.',
    },
    {
      q: '¿Es rentable abrir un estudio de pilates?',
      a: 'Puede serlo, pero depende sobre todo de la ocupación: los gastos fijos se pagan igual con la sala llena que medio vacía. Calcula las plazas que necesitas vender antes de firmar nada y revisa la ocupación por franja cada semana desde que abras.',
    },
    {
      q: '¿Me inscribo en el monotributo o armo una sociedad?',
      a: 'Para empezar sola, el monotributo es lo más simple, pero su categoría cuenta también la superficie del local, la luz y el alquiler, y un estudio grande puede pasarse de los topes. Una sociedad limita tu responsabilidad y va al régimen general. Decídelo con tu contador según tus números.',
    },
  ],
  fuentes: [
    { titulo: 'iProfe: cama de pilates reformer con estructura metálica reforzada', url: 'https://www.iprofe.com.ar/producto/reformer-metalicos-pilates/', consultada: '2026-11-27' },
    { titulo: 'Xtend Pilates: Max Reformer', url: 'https://xtendpilates.com.ar/producto/max-reformer/', consultada: '2026-11-27' },
    { titulo: 'MejoresCompras: mat de yoga y pilates 10 mm de caucho NBR (precio en Mercado Libre)', url: 'https://mejorescompras.com.ar/precio/MLA41459514--mat-yoga-10-mm-colchoneta-pilates-caucho-nbr-180x62-bolso-verde', consultada: '2026-11-27' },
    { titulo: 'Merrithew: SPX Max Reformer, medidas y altura de techo', url: 'https://www.merrithew.com/shop/ProductDetail/ST01077_Spx-Max-Reformer', consultada: '2026-09-25' },
    { titulo: 'Align-Pilates: C8-Pro Pilates Reformer, medidas', url: 'https://align-pilates.com/products/pilates-reformers/commercial-pilates-reformers/c8-pro-pilates-reformer/', consultada: '2026-09-25' },
    { titulo: 'Balanced Body: Allegro 2 Reformer, medidas', url: 'https://www.pilates.com/products/allegro-2-pilates-reformer/', consultada: '2026-09-25' },
    { titulo: 'El Cronista: el alquiler de un comercio promedia $1.146.657; cuánto cuesta mantenerlo en total (25-nov-2026)', url: 'https://www.cronista.com/negocios/el-alquiler-de-un-comercio-promedia-1146657-cuanto-cuesta-mantenerlo-en-total-con-impuestos-servicios-y-seguro/', consultada: '2026-11-27' },
    { titulo: 'Argentina.gob.ar: Inscribirme como monotributista', url: 'https://www.argentina.gob.ar/servicio/inscribirme-como-monotributista', consultada: '2026-11-27' },
    { titulo: 'El Cronista: así será el pago unificado de monotributo e Ingresos Brutos en CABA', url: 'https://www.cronista.com/columnistas/adios-a-la-doble-cuota-asi-sera-el-pago-unificado-de-monotributo-e-ingresos-brutos-en-caba', consultada: '2026-11-27' },
    { titulo: 'Boletín Oficial de la Ciudad de Buenos Aires: Ley 139 (gimnasios)', url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/1278', consultada: '2026-11-27' },
    { titulo: 'Agencia Gubernamental de Control (CABA): Guía de inspección de Gimnasios y Pilates', url: 'https://static.buenosaires.gob.ar/sites/default/files/2026-03/Guia%20Gimnasios%20y%20Pilates%20OK003.pdf', consultada: '2026-11-27' },
    { titulo: 'Derecho en Zapatillas: música en tu local, qué se paga hoy, a quién y cuánto (30-jul-2026)', url: 'https://www.derechoenzapatillas.com/2026/musica-en-tu-local-que-se-paga-hoy-a-quien-cuando-y-cuanto/', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/cuanto-cuesta-abrir-un-estudio-de-pilates',
    '/recursos/requisitos-para-abrir-un-estudio-de-pilates',
    '/soluciones/estudio-de-pilates-reformer',
    '/recursos/precios-reformer-mat',
    '/precios',
  ],
  cta: {
    titulo: 'Abre con las reservas y los cobros resueltos',
    texto:
      'Centra deja listos las reservas, los packs, la lista de espera y los cobros de tu estudio antes de la primera clase. Empieza gratis, sin tarjeta.',
  },
  revision: [
    'Precios de reformers (iProfe, Xtend) y de la colchoneta consultados el 27-nov-2026: con la inflación caducan rápido, revisarlos antes de cada actualización.',
    'Medidas de los reformers: fichas de fabricantes extranjeros (25-sep-2026); no se encontraron medidas publicadas por iProfe o Xtend.',
    'Habilitación: solo se detalla CABA (Ley 139 y guía de la AGC); el resto de municipios se manda a consultar.',
  ],
};

export default articulo;
