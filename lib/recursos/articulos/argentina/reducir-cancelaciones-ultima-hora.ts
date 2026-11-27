import type { Articulo } from '../tipos.ts';

// Versión argentina (formato es-AR). Mismo slug que la de España: ver ./index.ts.
// Cambia lo que era de España: los plazos de estudios porteños (enlazados a la
// política de cancelación argentina), el ejemplo en pesos y lo que hace Centra
// en este fork (sin cobro de penalización a tarjeta guardada: eso iba por Stripe).
//
// Historia de la versión española: rehecha el 7-oct-2026 a partir de la guía antigua del mismo nombre (TSX). Se
// queda la URL y lo que ya recibía, y cambia lo que no se sostenía: las tarifas
// de cancelación salían de un resumen de un blog de terceros (y alguna no
// cuadraba con la web de la cadena), y la «evidencia clínica» no tenía cita.
// Ahora cada cifra va con su artículo o su página oficial.
//
// Reparto con politica-de-cancelacion-de-clases: aquella es la REGLA (qué dice,
// la ley, la plantilla); esta es el COMPORTAMIENTO (por qué se falta y qué hace
// que se falte menos). No repetir aquí su tabla de ventanas: se enlaza.

const articulo: Articulo = {
  slug: 'reducir-cancelaciones-ultima-hora',
  titulo: 'Cómo reducir las cancelaciones de último momento y los faltazos en tus clases',
  tituloSeo: 'Reducir cancelaciones de último momento y faltazos',
  descripcion: 'Lo que miden los estudios sobre recordatorios, las ventanas que usan SoulCycle, Barry\'s o CorePower y seis medidas para que no se pierda ninguna plaza.',
  resumen: 'Por qué se falta a una clase, lo que dicen cinco estudios sobre los recordatorios, las reglas de las cadenas grandes y un plan en seis pasos para perder menos plazas.',
  categoria: 'operacion',
  seccion: 'Operación',
  publicado: '2026-11-27',
  consultaPrincipal: 'reducir cancelaciones de último momento',
  consultas: [
    'cómo reducir los no-shows en clases',
    'alumnas que reservan y no vienen',
    'faltazos en clases de pilates',
    'recordatorio de clase reduce ausencias',
    'cuántos recordatorios mandar antes de una clase',
  ],
  respuesta:
    'Para perder menos lugares por cancelaciones de último momento y faltazos hacen falta tres cosas: dos recordatorios (uno el día anterior y otro poco antes), cancelar desde el celular sin tener que escribirle a nadie y una lista de espera que ocupe el lugar liberado. En citas médicas, la revisión Cochrane de 2013 midió que un recordatorio por SMS sube la asistencia del 67,8 % al 78,6 %. Una consecuencia clara, como perder la clase, ayuda si la alumna la conoce antes de reservar.',
  entradilla:
    'Una alumna que avisa a las nueve de la noche que mañana a las nueve no viene no es el problema. El problema es la que no avisa, y la plaza que nadie llega a ocupar. Esto es lo que se sabe de por qué se falta, lo que funciona para que se falte menos y cómo medirlo en tu estudio.',
  secciones: [
    {
      id: 'por-que-cuesta',
      titulo: 'Por qué una cancelación tardía cuesta más que una plaza vacía',
      bloques: [
        {
          t: 'p',
          texto: 'Una plaza que nunca se reservó estuvo a la venta toda la semana. Una cancelada a último momento estuvo ocupada justo cuando alguien la habría querido, y vuelve a estar libre cuando ya no da tiempo a ofrecérsela a nadie. En las clases con lista de espera, cada cancelación tardía es una alumna que se quedó fuera.',
        },
        {
          t: 'p',
          texto: 'Conviene separar tres casos, porque se arreglan con cosas distintas:',
        },
        {
          t: 'lista',
          items: [
            '**El olvido.** Reservó el domingo para el jueves y se le pasó. Lo arregla un recordatorio.',
            '**El imprevisto.** Se enfermó o le cambió el turno. Lo arregla que cancelar sea fácil y rápido, para que la plaza vuelva a tiempo.',
            '**La decisión.** Sabe que no va a ir y no avisa, porque no le cuesta nada. Lo arregla una consecuencia clara, que conozca antes de reservar.',
          ],
        },
        {
          t: 'p',
          texto: 'Hay un matiz que se olvida al hacer cuentas: si la alumna paga un abono o un pack y no viene, ya pagó. Lo que pierdes no es su dinero, es la plaza que otra habría pagado y, a la larga, a ella: quien falla mucho suele acabar dejando de venir. Por eso la cuenta importa sobre todo en las franjas que se llenan.',
        },
      ],
    },
    {
      id: 'lo-que-dicen-los-estudios',
      titulo: 'Lo que dicen los estudios sobre los recordatorios',
      bloques: [
        {
          t: 'p',
          texto: 'No hay ensayos publicados sobre recordatorios en estudios de pilates o de yoga. Donde sí se ha medido, y mucho, es en las citas médicas, que se parecen bastante a una clase: una reserva con día y hora, gratis o ya pagada, a la que se falta sin avisar.',
        },
        {
          t: 'tabla',
          cabecera: ['Estudio', 'Qué se comparó', 'Grupo de control', 'Con el aviso estudiado'],
          filas: [
            ['Revisión Cochrane (2013): 8 ensayos, 6.615 personas', 'Asistencia: sin recordatorio frente a un SMS', '67,8 %', '78,6 %'],
            ['Metaanálisis en BMJ Open (2016): 21 estudios', 'Ausencias: sin aviso frente a avisos digitales', '21 %', '15 %'],
            ['Oftalmología en un hospital de Londres (2008)', 'Ausencias: sin aviso frente a un SMS', '18,1 %', '11,2 %'],
            ['Ensayo en una clínica pediátrica (2016)', 'Ausencias: llamada automática frente a llamada más SMS', '38,1 %', '23,5 %'],
            ['Ensayo de Penn Medicine (2026): 59.994 pacientes con alto riesgo de faltar', 'Ausencias: SMS frente a SMS más llamada automática', '11,3 %', '9,6 %'],
          ],
          nota: 'Cifras de los resúmenes de cada artículo (enlaces en las fuentes, consultados el 7-oct-2026). Son citas médicas, no clases. El de Londres es observacional; los demás, ensayos o revisiones de ensayos. En los dos últimos, el grupo de control ya recibía un aviso.',
        },
        {
          t: 'p',
          texto: 'De esos cinco trabajos salen tres ideas que sirven para un estudio:',
        },
        {
          t: 'lista',
          items: [
            '**El recordatorio funciona, y es barato.** En la revisión Cochrane, el SMS consiguió casi lo mismo que una llamada (80,3 % de asistencia) costando bastante menos por cada persona que acabó yendo.',
            '**Dos avisos funcionan mejor que uno.** El metaanálisis de BMJ Open encontró más efecto con varias notificaciones que con una sola. En la clínica pediátrica, añadir un SMS a la llamada que ya recibían bajó las ausencias del 38,1 % al 23,5 %, y Penn Medicine las bajó un poco más (del 11,3 % al 9,6 %) añadiendo una llamada a quien ya recibía el SMS.',
            '**Mucha gente falta porque no se acuerda.** En la encuesta de Penn Medicine a 186 pacientes que faltaron, el motivo más repetido (22 %) fue no saber que tenían cita.',
          ],
        },
      ],
    },
    {
      id: 'lo-que-hacen-las-cadenas',
      titulo: 'Qué reglas ponen SoulCycle, Barry\'s, CorePower o ClassPass',
      bloques: [
        {
          t: 'p',
          texto: 'Las grandes cadenas de clases dirigidas tienen todas una ventana fija y una consecuencia escrita, y ClassPass también se la pone a los estudios que venden en ella. Esto es lo que publican en sus propias páginas:',
        },
        {
          t: 'tabla',
          cabecera: ['Cadena', 'Hasta cuándo se cancela', 'Si se cancela tarde o no se va'],
          filas: [
            ['SoulCycle', 'Hasta las 17:00 del día anterior', 'La clase se da por usada'],
            ['Barry\'s', '12 horas antes', 'Se pierde la clase y, con membresía, hay un cargo que cambia según la ciudad'],
            ['CorePower Yoga (Nueva York)', '10 horas antes', 'USD 15 por cancelar tarde y USD 25 por no presentarse'],
            ['CorePower Yoga (resto de estudios)', '2 horas antes', 'USD 15; con pack de clases, se pierde la clase en lugar del cargo'],
            ['ClassPass (en los estudios que venden en ella)', '12 horas antes, salvo en los estudios que no tienen ventana', 'Cuenta como cancelación tardía y el estudio suele cobrar igual la reserva'],
          ],
          nota: 'Páginas de ayuda y preguntas frecuentes de cada empresa, consultadas el 7-oct-2026. SoulCycle, Barry\'s y CorePower son cadenas de Estados Unidos y Reino Unido.',
        },
        {
          t: 'p',
          texto: 'Los estudios porteños van más suaves: en los cinco que revisamos para nuestra [plantilla de política de cancelación](/recursos/politica-de-cancelacion-de-clases), el plazo va de 2 a 24 horas y ninguno anuncia una multa; la consecuencia es perder la clase. Esa guía tiene la tabla completa y lo que dice la ley argentina sobre cobrar un cargo.',
        },
      ],
    },
    {
      id: 'seis-medidas',
      titulo: 'Seis medidas para perder menos plazas, por orden',
      bloques: [
        {
          t: 'pasos',
          items: [
            {
              titulo: 'Dos recordatorios, no uno',
              texto: 'Uno el día anterior, para que quien no puede ir cancele a tiempo, y otro una o dos horas antes, para el olvido. En el primero, la hora límite para cancelar sin perder la clase y un botón para hacerlo.',
            },
            {
              titulo: 'Que cancelar sea más fácil que no ir',
              texto: 'Si cancelar exige escribirte a las once de la noche, mucha gente no lo hará. Desde el celular, en dos toques y sin hablar con nadie, la plaza vuelve antes.',
            },
            {
              titulo: 'Una ventana por tipo de clase',
              texto: 'El reformer, con pocas plazas y lista de espera, merece más antelación que una clase de suelo con sitio de sobra. Una sola regla para todo el horario es demasiado dura en unas clases o demasiado blanda en otras.',
            },
            {
              titulo: 'Una lista de espera que se mueva sola',
              texto: 'La plaza que se libera tiene que llegar a la siguiente de la cola sin que nadie lo haga a mano. Si la clase es en menos de una hora, mejor preguntarle antes de meterla: si no, el faltazo simplemente cambia de nombre.',
            },
            {
              titulo: 'Una consecuencia clara y proporcional',
              texto: 'Lo habitual es dar la clase por usada. Un cargo aparte solo tiene sentido si las plazas se pierden a menudo, y exige que la alumna lo haya aceptado antes de pagar.',
            },
            {
              titulo: 'Mirar los números cada mes',
              texto: 'Casi nunca es un problema de todo el estudio: suele ser una franja, un día o un grupo de alumnas. Sin datos, endureces la regla para todas por culpa de unas pocas.',
            },
          ],
        },
        {
          t: 'nota',
          titulo: 'Antes de cobrar por no venir',
          texto: 'Empieza por los recordatorios y por cancelar desde el celular, que no molestan a nadie. Si al cabo de un mes sigues perdiendo plazas en las mismas clases, entonces plantéate endurecer la regla en esas clases, no en todas.',
        },
      ],
    },
    {
      id: 'como-medirlo',
      titulo: 'Cómo medir las cancelaciones tardías y los faltazos',
      bloques: [
        {
          t: 'p',
          texto: 'Bastan dos cifras, calculadas cada mes y por franja: cuántas reservas se cancelan fuera de plazo y cuántas alumnas no aparecen sin cancelar. Un ejemplo con un mes de 400 reservas:',
        },
        {
          t: 'tabla',
          cabecera: ['Cifra', 'Cómo se calcula', 'Ejemplo'],
          filas: [
            ['Cancelaciones tardías', 'Canceladas fuera de plazo ÷ reservas', '24 ÷ 400 = 6 %'],
            ['Faltazos', 'No presentadas sin cancelar ÷ reservas', '16 ÷ 400 = 4 %'],
            ['Lugares recolocados', 'Plazas liberadas que acabó ocupando otra alumna', '9 de 24'],
            ['Lugares perdidos', 'Tardías no recolocadas + faltazos', '15 + 16 = 31'],
          ],
          nota: 'Cifras de ejemplo para explicar la cuenta; pon las de tu estudio.',
        },
        {
          t: 'p',
          texto: 'La que manda es la última. Con 31 lugares perdidos al mes y un precio medio de $18.000 la clase, son $558.000 de lugares que se podrían haber vendido, aunque solo cuentan de verdad las que tenían a alguien esperando. Para saber cuánto te cuesta cada plaza, mira la cuenta de [reformer y mat](/recursos/precios-reformer-mat).',
        },
        {
          t: 'p',
          texto: 'Mira también quién acumula los faltazos. Si son siempre las mismas cuatro alumnas, una conversación arregla más que cambiar la regla para las doscientas restantes.',
        },
      ],
    },
    {
      id: 'con-tentare',
      titulo: 'Recordatorios, cancelaciones y lista de espera en Centra',
      bloques: [
        {
          t: 'p',
          texto: 'En Centra el recordatorio de clase viene puesto desde el primer día y son dos: el largo, con aviso en la app de la alumna, correo y WhatsApp si conectas el WhatsApp Business de tu estudio, y el corto, con aviso en la app. Tú eliges la antelación de cada uno: el largo, medio día, un día o dos días antes; el corto, 30, 60 o 120 minutos antes.',
        },
        {
          t: 'p',
          texto: 'La alumna cancela desde su app con la ventana que fijas para cada tipo de clase, y la plaza pasa a la primera de la [lista de espera](/funcionalidades/lista-de-espera), al momento o con un plazo para aceptarla. Las clases canceladas a tiempo vuelven a su pack y las tardías se descuentan solas. Lo explica [cancelaciones y políticas](/funcionalidades/cancelaciones-y-politicas).',
        },
        {
          t: 'producto',
          titulo: 'Que las plazas no se pierdan por un olvido',
          texto: 'Recordatorios que salen solos, cancelación desde el celular con la ventana de cada clase y una lista de espera que ocupa la plaza sin que tengas que escribir a nadie.',
        },
      ],
    },
  ],
  faq: [
    {
      q: '¿Cuántos recordatorios hay que mandar antes de una clase?',
      a: 'Dos funcionan mejor que uno: el día anterior, para que quien no puede ir cancele a tiempo, y una o dos horas antes, para quien se olvida. Más de dos empieza a molestar sin cambiar mucho.',
    },
    {
      q: '¿Es mejor avisar por SMS, por correo o por notificación?',
      a: 'Por el canal que se lee a tiempo. En citas médicas, el SMS consiguió casi lo mismo que una llamada y costó menos. En un estudio, la notificación del celular y el WhatsApp se leen antes que el correo; lo mejor es combinar dos.',
    },
    {
      q: '¿Qué porcentaje de faltazos es normal en un estudio de pilates?',
      a: 'No hay un dato publicado y fiable para estudios de pilates o de yoga en Argentina. En citas médicas, sin recordatorio, falta entre el 18 % y el 32 % según el estudio. Lo útil es medir el tuyo cada mes y por franja, y ver si baja.',
    },
    {
      q: '¿Cobrar por no venir reduce los faltazos?',
      a: 'Las cadenas que lo hacen lo tienen como norma desde siempre, pero no hay estudios publicados que comparen con y sin cargo en clases. Lo que sí está claro es que la alumna tiene que conocerlo antes de pagar y que el importe tiene que ser proporcional.',
    },
    {
      q: '¿Qué hago con una alumna que siempre falla?',
      a: 'Habla con ella antes de cambiar la regla para todas. A veces es un horario que ya no le encaja y prefiere otra franja; otras, simplemente no sabía cómo cancelar. Si sigue igual, aplícale la política como a cualquiera.',
    },
    {
      q: '¿Sirve de algo la lista de espera si cancelan a último momento?',
      a: 'Sí, si se mueve sola y avisa por un canal que se lee al momento. Con menos de una hora, conviene que la alumna confirme la plaza antes de dársela; si no, el faltazo solo cambia de persona.',
    },
  ],
  fuentes: [
    { titulo: 'Gurol-Urganci I. et al. Mobile phone messaging reminders for attendance at healthcare appointments. Cochrane Database of Systematic Reviews, 2013 (CD007458.pub3)', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD007458.pub3/full', consultada: '2026-10-07' },
    { titulo: 'Robotham D. et al. Using digital notifications to improve attendance in clinic: systematic review and meta-analysis. BMJ Open, 2016', url: 'https://pubmed.ncbi.nlm.nih.gov/27798006/', consultada: '2026-10-07' },
    { titulo: 'Lin C.-L. et al. Text Message Reminders Increase Appointment Adherence in a Pediatric Clinic: A Randomized Controlled Trial. International Journal of Pediatrics, 2016', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5227159/', consultada: '2026-10-07' },
    { titulo: 'Koshy E., Car J., Majeed A. Effectiveness of mobile-phone short message service (SMS) reminders for ophthalmology outpatient appointments. BMC Ophthalmology, 2008', url: 'https://link.springer.com/article/10.1186/1471-2415-8-9', consultada: '2026-10-07' },
    { titulo: 'Penn Medicine (PAIR). Automated Calls Added to SMS Reminders Reduce Missed Appointments among High-Risk Patients. NEJM Catalyst, 2026', url: 'https://pair.upenn.edu/publication/automated-calls-added-to-sms-reminders-reduce-missed-appointments-among-high-risk-patients/', consultada: '2026-10-07' },
    { titulo: 'SoulCycle: preguntas frecuentes (cancelaciones)', url: 'https://www.soul-cycle.com/faq/', consultada: '2026-10-07' },
    { titulo: 'Barry\'s: preguntas frecuentes (cancelación tardía y no presentarse)', url: 'https://www.barrys.com/faq/', consultada: '2026-10-07' },
    { titulo: 'CorePower Yoga: centro de ayuda, política de cancelación de clases en estudio', url: 'https://www.corepoweryoga.com/content/help-center?category=1kMJdJtKnEvJ8nkKj6Qfpu&subcategory=MlDn3t3lFomFj71NpyrQI&faq=7mle8U1Lzs6dDayKlkNLmB', consultada: '2026-10-07' },
    { titulo: 'ClassPass para estudios asociados: preguntas frecuentes', url: 'https://classpass.com/partners/faqs', consultada: '2026-10-07' },
  ],
  relacionadas: [
    '/recursos/politica-de-cancelacion-de-clases',
    '/funcionalidades/cancelaciones-y-politicas',
    '/funcionalidades/lista-de-espera',
    '/funcionalidades/automatizaciones-y-avisos',
  ],
  cta: {
    titulo: 'Menos lugares perdidos, sin estar pendiente del celular',
    texto: 'Empieza gratis con Centra, sin tarjeta: pon tu plazo de cancelación por tipo de clase, deja que los recordatorios salgan solos y que la lista de espera ocupe los lugares que se liberan.',
  },
  revision: [
    'Reglas de SoulCycle, Barry\'s, CorePower y ClassPass: sus páginas, 7-oct-2026; cambian sin aviso, revisar cada seis meses.',
    'Precio medio de $18.000 del ejemplo de la medición: cifra para explicar la cuenta, cerca de la clase suelta de los estudios porteños de precio-clase-de-pilates (nov-2026).',
    'Antelaciones del recordatorio (12/24/48 h y 30/60/120 min): lib/notificaciones/antelacion-recordatorio.ts; si cambian, cambiar aquí.',
  ],
};

export default articulo;
