import type { Articulo } from '../tipos.ts';

// Versión argentina del pilar de «gestión» (27-nov-2026). Las cifras salen de las
// versiones argentinas de /recursos que ya las publican con su fuente (precio de
// la clase, packs, rentabilidad, instructoras, IVA, política de cancelación), y
// se repiten aquí con la misma fuente. Sin Stripe, SEPA ni Veri*Factu: en
// Argentina se cobra con Mercado Pago y se factura con ARCA.

const articulo: Articulo = {
  slug: 'como-gestionar-un-estudio-de-pilates',
  titulo: 'Cómo gestionar un estudio de pilates: los cinco sistemas y la rutina semanal que lo sostienen',
  tituloSeo: 'Cómo gestionar un estudio de pilates: 5 sistemas',
  descripcion: 'Cómo gestionar un estudio de pilates sin vivir pegada al celular: horario y cupos, reservas, packs y cobros, equipo y los números de cada semana.',
  resumen: 'Los cinco sistemas que mantienen un estudio de pilates en marcha (horario, reservas, cobros, equipo y números), con cifras de estudios argentinos y una rutina semanal de media hora.',
  categoria: 'operacion',
  seccion: 'Operación',
  publicado: '2026-11-27',
  actualizado: '2026-11-27',
  consultaPrincipal: 'cómo gestionar un estudio de pilates',
  consultas: [
    'gestión de un estudio de pilates',
    'cómo organizar un estudio de pilates',
    'cómo administrar un estudio de pilates',
    'cómo llevar las reservas de un estudio de pilates',
    'qué hay que controlar en un estudio de pilates',
  ],
  respuesta:
    'Gestionar un estudio de pilates es mantener cinco sistemas en marcha a la vez: el horario y el cupo de cada clase, las reservas con su política de cancelación y su lista de espera, la venta y el cobro de packs y abonos, el equipo de instructoras con un plan para las ausencias, y unos pocos números que mirás cada semana: ocupación, cobros pendientes y margen por clase. Lo que se repite cada día conviene automatizarlo; tu criterio, para lo que no se repite.',
  entradilla:
    'Un estudio de pilates rara vez se complica por las clases. Se complica por todo lo que pasa alrededor: el mensaje de las once de la noche para cambiar un turno, el pack que venció sin que nadie avisara, la instructora que se enferma a primera hora o la transferencia que nunca llegó. Acá tenés la gestión ordenada en cinco sistemas y una rutina semanal, con cifras de estudios argentinos.',
  secciones: [
    {
      id: 'cinco-sistemas',
      titulo: 'Los cinco sistemas de un estudio de pilates',
      bloques: [
        {
          t: 'p',
          texto: 'Cada uno responde a una pregunta que te vas a hacer todas las semanas. Si alguno vive solo en tu cabeza o en un grupo de WhatsApp, es justo ese el que te va a quitar las noches.',
        },
        {
          t: 'pasos',
          items: [
            { titulo: 'Horario y cupos', texto: '¿Qué clases doy, a qué hora, en qué sala, con cuántos lugares y quién las da? Es la base de todo lo demás.' },
            { titulo: 'Reservas y cancelaciones', texto: '¿Quién viene a cada clase, hasta cuándo puede cancelar sin perder la clase y qué pasa con el lugar que se libera?' },
            { titulo: 'Packs, abonos y cobros', texto: '¿Qué vendés, cuánto sale cada clase, cuándo vence y cómo entra la plata sin perseguir a nadie?' },
            { titulo: 'Equipo', texto: '¿Quién puede dar cada clase, cuánto te cuesta y qué hacés cuando alguien no puede venir?' },
            { titulo: 'Números', texto: '¿Qué clases se llenan, cuáles no, qué te deben y cuánto deja cada clase después de pagarle a la instructora?' },
          ],
        },
      ],
    },
    {
      id: 'horario-y-cupos',
      titulo: 'Horario y cupos: el cupo sale de la sala, no de una cifra',
      bloques: [
        {
          t: 'p',
          texto: 'En un estudio de reformer el cupo de una clase es la cantidad de camas que tiene la sala, y una cama en reparación lo baja. En mat depende del espacio por colchoneta. Por eso conviene definir primero las salas y su capacidad, y después colgar de ellas las clases. Si combinás reformer y mat, son dos tipos de clase con sus propias reglas y su propio precio.',
        },
        {
          t: 'lista',
          items: [
            '**Armá el horario como una grilla** que se repite cada semana, y revisala por trimestre: no clase por clase.',
            '**Separá las franjas que se llenan de las que no.** La primera hora de la mañana y la salida del trabajo suelen llenarse; la media mañana y la siesta, menos. Qué hacer con esas, en [cómo llenar las clases valle](/recursos/ocupacion-clases-valle).',
            '**Decidí quién da cada clase** con la disponibilidad real de tu equipo adelante, no de memoria.',
            '**Dejá lugar para lo excepcional**: feriados, el receso de verano, un taller. Mejor marcarlo en la grilla que avisar clase por clase.',
          ],
        },
        {
          t: 'p',
          texto: 'Cómo lo hace un estudio de camas, lugar por lugar, en [software para estudios de pilates reformer](/soluciones/estudio-de-pilates-reformer).',
        },
      ],
    },
    {
      id: 'reservas-y-cancelaciones',
      titulo: 'Reservas, cancelaciones y lista de espera',
      bloques: [
        {
          t: 'p',
          texto: 'La reserva es el momento en que la alumna se compromete, y la cancelación es donde se pierden lugares. Un lugar cancelado a último momento es peor que uno que nunca se reservó: ya no hay tiempo de dárselo a otra. Tres decisiones lo resuelven casi todo:',
        },
        {
          t: 'tabla',
          cabecera: ['Decisión', 'Qué fijar', 'Referencia'],
          filas: [
            ['Plazo de cancelación', 'Con cuántas horas se cancela sin perder la clase', 'Entre 2 y 24 horas en los estudios argentinos revisados'],
            ['Lista de espera', 'Si el lugar pasa solo a la siguiente y con qué plazo para aceptarlo', 'Sin plazo, el lugar se confirma solo; con plazo, la alumna lo acepta (corto si la clase empieza pronto)'],
            ['Faltazos', 'Si se pierde la clase y si se puede recuperar', 'Perder la clase es lo habitual; algunos estudios dejan recuperarla dentro del mes'],
          ],
          nota: 'Plazos publicados por cinco estudios de pilates de Buenos Aires, consultados el 27-nov-2026: ver nuestra guía de la política de cancelación de clases.',
        },
        {
          t: 'p',
          texto: 'La política tiene que estar por escrito y la alumna tiene que conocerla antes de pagar: lo que dice la Ley de Defensa del Consumidor y una plantilla, en [política de cancelación de clases](/recursos/politica-de-cancelacion-de-clases). Y para que se cancele menos, en [cómo reducir las cancelaciones y los faltazos](/recursos/reducir-cancelaciones-ultima-hora).',
        },
      ],
    },
    {
      id: 'packs-abonos-y-cobros',
      titulo: 'Packs, abonos y cobros: que la plata entre sola',
      bloques: [
        {
          t: 'p',
          texto: 'Un catálogo corto vende mejor que uno largo: clase suelta o de prueba y packs de 4, 8 y 12 clases al mes cubren casi todo. Lo importante es que cada escalón salga más barato por clase que el anterior y que el vencimiento esté por escrito antes de vender. Con inflación, poné también por escrito cada cuánto actualizás los precios.',
        },
        {
          t: 'cifras',
          titulo: 'Lo que cobran los estudios argentinos por el reformer',
          cifras: [
            { valor: '$20.000 a $25.000', etiqueta: 'la clase suelta o de prueba' },
            { valor: '$16.000 a $22.000', etiqueta: 'cada clase dentro de un pack' },
            { valor: '25 % a 36 %', etiqueta: 'lo que baja la clase del pack de 12 frente al de 4' },
          ],
          nota: 'Tarifas publicadas por estudios de Buenos Aires, consultadas en noviembre de 2026: ver precio de una clase de pilates y packs de pilates. Con la inflación caducan rápido.',
        },
        {
          t: 'lista',
          items: [
            '**Cobrá por adelantado y online.** Lo que la alumna paga con un link o desde su app no hay que perseguirlo por WhatsApp ni conciliarlo transferencia por transferencia.',
            '**Contá la comisión.** Mercado Pago publica para el link de pago un 4,39 % si el dinero se acredita a los 10 días y un 6,29 % si lo querés al instante: es parte del costo de cada clase.',
            '**El IVA depende de tu categoría en ARCA.** Monotributista: va dentro de la cuota y emitís factura C. Responsable inscripto: la clase lleva IVA y emitís factura B. Los detalles, en [¿las clases de pilates llevan IVA?](/recursos/iva-clases-de-pilates).',
            '**Facturá desde el primer cobro**, con el facturador de ARCA o el sistema que te arme tu contador.',
          ],
        },
        {
          t: 'p',
          texto: 'Cómo diseñar la escalera de precios paso a paso, en [packs de pilates](/recursos/bonos-de-pilates).',
        },
        {
          t: 'llamada',
          texto: 'Con Mercado Pago conectado, en Centra la alumna compra su pack o paga su abono desde la app, y el lugar se reserva con lo que tiene vigente; vos ves en el panel quién pagó, qué vence este mes y qué queda pendiente.',
        },
      ],
    },
    {
      id: 'equipo',
      titulo: 'Equipo: disponibilidad, sueldos y un plan para las ausencias',
      bloques: [
        {
          t: 'p',
          texto: 'El equipo suele ser el costo más grande, por delante del alquiler, y el que más imprevistos genera. En relación de dependencia, el sueldo lo fija el convenio de UTEDYC para gimnasios (CCT 738/16): en la escala de octubre de 2026, la categoría de instructora y entrenadora tiene un básico de $1.351.856 por mes y la de profesora de Educación Física, de $1.466.432 a $1.547.040 según el tamaño del local, por 176 horas mensuales y antes de presentismo y antigüedad. Si la instructora factura como monotributista, el precio por hora o por clase lo acuerdan entre ustedes.',
        },
        {
          t: 'lista',
          items: [
            '**Tené la disponibilidad de cada instructora por escrito**, con sus vacaciones y licencias marcadas, antes de armar la grilla.',
            '**Cuidado con depender de una sola persona.** Si una instructora da la mitad de tus clases, su ausencia te deja media semana en el aire.',
            '**Decidí el orden de reemplazos antes de necesitarlo**: quién sabe dar esa clase, quién suele estar libre a esa hora, a quién se avisa primero.',
            '**Pagá por lo que se da**: llevá las horas de cada una por clase dada, no de memoria a fin de mes.',
          ],
        },
        {
          t: 'p',
          texto: 'Los números completos, en [cuánto cobra una instructora de pilates](/recursos/cuanto-cobra-una-instructora-de-pilates), y el protocolo para una ausencia, en [cómo cubrir la baja de una instructora](/recursos/cubrir-baja-instructora).',
        },
      ],
    },
    {
      id: 'numeros',
      titulo: 'Los números que hay que mirar cada semana',
      bloques: [
        {
          t: 'p',
          texto: 'No hacen falta veinte indicadores. Con cinco ves venir casi todos los problemas, y todos se calculan con lo que ya anotás al reservar y al cobrar:',
        },
        {
          t: 'tabla',
          cabecera: ['Indicador', 'Cómo se calcula', 'Qué te dice'],
          filas: [
            ['Ocupación', 'Lugares reservados sobre lugares ofrecidos, por clase y por franja', 'Qué horario sobra y qué clase pide otra igual'],
            ['Cobros pendientes', 'Packs y abonos sin pagar y desde cuándo', 'A quién hay que escribirle antes de que deje de venir'],
            ['Altas y bajas', 'Alumnas que empiezan y que dejan de venir en el mes', 'Si el estudio crece o solo rota'],
            ['Cancelaciones tardías y faltazos', 'Las que llegan fuera de plazo y las que no avisan', 'Si tu política funciona o hay que tocarla'],
            ['Margen por clase', 'Lo que pagaron sus asistentes menos lo que cuesta la instructora', 'Qué clases sostienen el estudio y cuáles no'],
          ],
        },
        {
          t: 'p',
          texto: 'Para saber a partir de qué ocupación ganás plata, hacé la cuenta con tus números en la calculadora de [¿es rentable un estudio de pilates?](/recursos/rentabilidad-estudio-de-pilates). En su ejemplo, 6 reformers con 30 clases por semana a $18.000 la clase cubren gastos hacia el 31 % de ocupación y necesitan cerca del 42 % para dejarte además $1.500.000 por mes.',
        },
      ],
    },
    {
      id: 'rutina-semanal',
      titulo: 'Una rutina de media hora por semana',
      bloques: [
        {
          t: 'p',
          texto: 'Con los cinco sistemas en marcha, la gestión entra en tres ratos cortos por semana y un cierre al mes:',
        },
        {
          t: 'pasos',
          items: [
            { titulo: 'Lunes: la semana que empieza', texto: 'Clases con poca ocupación, ausencias previstas del equipo y avisos que haya que mandar. Si una clase viene casi vacía, decidí hoy si la movés, la anunciás o la juntás con otra.' },
            { titulo: 'Miércoles: la plata', texto: 'Pagos que no entraron, packs que vencen este mes y alumnas a las que les queda una clase. Es el mejor momento para ofrecer la renovación.' },
            { titulo: 'Viernes: la semana que viene', texto: 'Lista de espera de las clases llenas, grilla de la semana siguiente y cualquier cambio de instructora ya cerrado y avisado.' },
            { titulo: 'Fin de mes: el cierre', texto: 'Ingresos, altas y bajas, ocupación por franja y margen por clase. Las facturas y la categoría del monotributo, con tu contador. Y una sola decisión para el mes siguiente, que muchas veces es la actualización de precios.' },
          ],
        },
      ],
    },
    {
      id: 'que-automatizar',
      titulo: 'Qué automatizar y qué dejar a tu criterio',
      bloques: [
        {
          t: 'p',
          texto: 'La regla es sencilla: lo que se repite igual cada vez, que lo haga el sistema; lo que depende de la persona o del momento, vos.',
        },
        {
          t: 'tabla',
          cabecera: ['Que lo haga el sistema', 'Que lo decidas vos'],
          filas: [
            ['Reservar y cancelar con tus reglas', 'La grilla y los precios'],
            ['Pasarle el lugar libre a la lista de espera', 'Las excepciones a tu política'],
            ['Recordar la clase del día siguiente', 'Quién entra en tu equipo'],
            ['Cobrar el pack y avisar del que vence', 'Cómo le hablás a una alumna que deja de venir'],
            ['Avisar a quien le queda una clase', 'Qué clase abrís o cerrás'],
          ],
        },
        {
          t: 'producto',
          titulo: 'Centra lleva los cinco sistemas en un solo panel',
          texto: 'La grilla con cupo por sala y por reformer, las reservas con lista de espera, los packs y abonos que la alumna paga desde su app con Mercado Pago, el equipo con sus reemplazos y los informes de ocupación y margen por clase. Gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Qué tiene que hacer el sistema con el que llevás el estudio?',
      a: 'Que reserve con el cupo de cada clase o de cada cama, que cobre packs y abonos online (en Argentina, con Mercado Pago), que les dé a tus alumnas una app para reservar y cancelar, y que lleve la grilla de tu equipo. Fijate también que publique su precio y si tiene permanencia.',
    },
    {
      q: '¿A partir de qué ocupación es rentable un estudio de pilates?',
      a: 'Depende de tus costos y tus precios. En el ejemplo de nuestra calculadora (6 reformers, 30 clases por semana y $18.000 por clase, con precios de noviembre de 2026), el estudio cubre gastos hacia el 31 % de ocupación y necesita cerca del 42 % para dejarte además $1.500.000 por mes.',
    },
    {
      q: '¿Con cuántas horas se puede cancelar una clase?',
      a: 'Lo decide cada estudio. En los estudios de Buenos Aires que revisamos, el plazo va de 2 a 24 horas. Lo importante es que esté por escrito y que la alumna lo conozca antes de pagar, como pide la Ley de Defensa del Consumidor.',
    },
    {
      q: '¿Cuánto cuesta una instructora de pilates?',
      a: 'En relación de dependencia, el convenio de UTEDYC para gimnasios (CCT 738/16) fija en octubre de 2026 un básico de $1.351.856 por mes para la categoría de instructora y entrenadora, por 176 horas, más presentismo, antigüedad y cargas sociales. Si factura como monotributista, el precio lo acuerdan entre ustedes.',
    },
    {
      q: '¿Las clases de pilates llevan IVA?',
      a: 'Si sos monotributista, el IVA va dentro de la cuota mensual y emitís factura C sin sumarlo al precio. Si sos responsable inscripto, la ley grava los servicios de gimnasios y la clase lleva IVA, con factura B a la alumna. Si tu caso tiene alguna exención, lo confirma tu contador.',
    },
    {
      q: '¿Cada cuánto conviene actualizar los precios?',
      a: 'No hay una regla, pero sí conviene que la alumna sepa de antemano cada cuánto lo hacés (por ejemplo, cada mes o cada trimestre) y que el aumento no cambie un pack ya pagado. Comparar con estudios de tu zona y con la fecha a la vista evita quedarte atrás sin darte cuenta.',
    },
  ],
  fuentes: [
    { titulo: 'Asistente Laboral Argentino: escala salarial UTEDYC, rama gimnasios (CCT 738/16)', url: 'https://www.asistentelaboralargentino.com/escalas/utedyc-rama-gimnasios-738-16.html', consultada: '2026-11-24' },
    { titulo: 'Biblioteca de ARCA: Ley de Impuesto al Valor Agregado (t.o. 1997), arts. 3 y 7', url: 'https://biblioteca.afip.gob.ar/dcp/TOR_C_020631_1997_03_26', consultada: '2026-11-24' },
    { titulo: 'Argentina.gob.ar: Monotributo, qué es', url: 'https://www.argentina.gob.ar/noticias/monotributo-que-es', consultada: '2026-11-24' },
    { titulo: 'Infoleg: Ley 24.240 de Defensa del Consumidor, texto actualizado', url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm', consultada: '2026-11-27' },
    { titulo: 'Mercado Pago: link de pago, costos por plazo de acreditación', url: 'https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago', consultada: '2026-11-27' },
  ],
  relacionadas: [
    '/recursos/rentabilidad-estudio-de-pilates',
    '/recursos/bonos-de-pilates',
    '/recursos/politica-de-cancelacion-de-clases',
    '/funcionalidades',
  ],
  cta: {
    titulo: 'Los cinco sistemas, en un solo lugar.',
    texto: 'Grilla, reservas, cobros, equipo y números en un panel, con una app con tu marca para tus alumnas. Gratis hasta 150 reservas al mes, sin tarjeta y sin permanencia.',
  },
  revision: [
    'Cifras de precios y packs: de las versiones argentinas de precio y packs (noviembre de 2026); si se actualizan, cambiar acá.',
    'Sueldos: escala UTEDYC de octubre de 2026; revisar con cada paritaria.',
    'Comisión de Mercado Pago (4,39 % / 6,29 %): revisar cuando la cambien.',
  ],
};

export default articulo;
