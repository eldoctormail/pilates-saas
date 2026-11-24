// ─────────────────────────────────────────────────────────────────────────────
// Festivos laborales oficiales (nacionales + autonómicos) de las comunidades
// donde trabaja Centra. Puro: lo leen el aviso de la bandeja, «Comprobar mi
// horario» y «Repetir este mes».
//
// ⚠️ Esto son FECHAS LEGALES: se copian a mano del boletín oficial, nunca las
// propone un modelo ni se calculan. Cada calendario cita su fuente (diario,
// número, fecha y enlace) y se ha contrastado contra el texto publicado. Si
// una fecha no se puede comprobar contra su boletín, NO entra: mejor un
// festivo sin aviso que un aviso falso que haga cerrar un día laborable.
//
// Fuera a propósito: las dos fiestas LOCALES de cada municipio (cambian de un
// pueblo a otro y no hay una fuente única); el aviso lo dice.
//
// Cada noviembre se añade el año siguiente: la guardia de `oficiales.test.ts`
// falla a partir del 1-nov si falta (el BOE publica la relación a finales de
// octubre; los boletines autonómicos, antes).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zona con calendario propio. `ARAN` es Cataluña con las sustituciones que la
 * propia norma catalana fija para el Valle de Arán (17-jun, Festa d'Aran).
 */
export type ZonaFestivos = 'CATALUNA' | 'ARAN' | 'MADRID' | 'ANDALUCIA' | 'ARGENTINA';

/** Zonas de España (las que comparten el BOE). Argentina va aparte: un solo calendario nacional. */
export const ZONAS_ESPANA: readonly ZonaFestivos[] = ['CATALUNA', 'ARAN', 'MADRID', 'ANDALUCIA'];

export interface FestivoOficial {
  /** YYYY-MM-DD, día civil en España (sin hora). */
  fecha: string;
  nombre: string;
}

interface CalendarioOficial {
  anio: number;
  zona: ZonaFestivos;
  /** Norma y diario oficial del que se ha copiado. */
  fuente: string;
  url: string;
  festivos: readonly FestivoOficial[];
}

/** Para la etiqueta «Festivo en Cataluña». */
export const NOMBRE_ZONA: Record<ZonaFestivos, string> = {
  CATALUNA: 'Cataluña',
  ARAN: 'el Valle de Arán',
  MADRID: 'la Comunidad de Madrid',
  ANDALUCIA: 'Andalucía',
  ARGENTINA: 'Argentina',
};

const BOE_2026 =
  'Resolución de 17 de octubre de 2025, de la Dirección General de Trabajo, por la que se publica la relación de fiestas laborales para el año 2026 (BOE núm. 259, de 28 de octubre de 2025, BOE-A-2025-21667)';
const BOE_2026_URL = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-21667';

const CATALUNA_2026: readonly FestivoOficial[] = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo' },
  { fecha: '2026-01-06', nombre: 'Reyes' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo' },
  { fecha: '2026-04-06', nombre: 'Lunes de Pascua' },
  { fecha: '2026-05-01', nombre: 'Fiesta del Trabajo' },
  { fecha: '2026-06-24', nombre: 'San Juan' },
  { fecha: '2026-08-15', nombre: 'Asunción' },
  { fecha: '2026-09-11', nombre: 'Diada de Cataluña' },
  { fecha: '2026-10-12', nombre: 'Fiesta Nacional de España' },
  { fecha: '2026-12-08', nombre: 'Inmaculada' },
  { fecha: '2026-12-25', nombre: 'Navidad' },
  { fecha: '2026-12-26', nombre: 'San Esteban' },
];

const CATALUNA_2027: readonly FestivoOficial[] = [
  { fecha: '2027-01-01', nombre: 'Año Nuevo' },
  { fecha: '2027-01-06', nombre: 'Reyes' },
  { fecha: '2027-03-26', nombre: 'Viernes Santo' },
  { fecha: '2027-03-29', nombre: 'Lunes de Pascua' },
  { fecha: '2027-05-01', nombre: 'Fiesta del Trabajo' },
  { fecha: '2027-06-24', nombre: 'San Juan' },
  { fecha: '2027-09-11', nombre: 'Diada de Cataluña' },
  { fecha: '2027-10-12', nombre: 'Fiesta Nacional de España' },
  { fecha: '2027-11-01', nombre: 'Todos los Santos' },
  { fecha: '2027-12-06', nombre: 'Día de la Constitución' },
  { fecha: '2027-12-08', nombre: 'Inmaculada' },
  { fecha: '2027-12-25', nombre: 'Navidad' },
];

/** En Arán, la norma catalana cambia UN festivo por el 17 de junio. */
function conFestaDAran(base: readonly FestivoOficial[], sustituida: string, anio: number): readonly FestivoOficial[] {
  return [...base.filter((f) => f.fecha !== sustituida), { fecha: `${anio}-06-17`, nombre: "Festa d'Aran" }].sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );
}

const CALENDARIOS: CalendarioOficial[] = [
  // ── 2026 ──────────────────────────────────────────────────────────────────
  {
    anio: 2026,
    zona: 'CATALUNA',
    fuente: `${BOE_2026}, anexo; recoge la Orden EMT/66/2025 de la Generalitat (DOGC de 6 de mayo de 2025)`,
    url: BOE_2026_URL,
    festivos: CATALUNA_2026,
  },
  {
    anio: 2026,
    zona: 'ARAN',
    fuente: `${BOE_2026}, anexo, nota (2): en Arán el 26 de diciembre se sustituye por el 17 de junio`,
    url: BOE_2026_URL,
    festivos: conFestaDAran(CATALUNA_2026, '2026-12-26', 2026),
  },
  {
    anio: 2026,
    zona: 'MADRID',
    fuente: `${BOE_2026}, anexo`,
    url: BOE_2026_URL,
    festivos: [
      { fecha: '2026-01-01', nombre: 'Año Nuevo' },
      { fecha: '2026-01-06', nombre: 'Reyes' },
      { fecha: '2026-04-02', nombre: 'Jueves Santo' },
      { fecha: '2026-04-03', nombre: 'Viernes Santo' },
      { fecha: '2026-05-01', nombre: 'Fiesta del Trabajo' },
      { fecha: '2026-05-02', nombre: 'Fiesta de la Comunidad de Madrid' },
      { fecha: '2026-08-15', nombre: 'Asunción' },
      { fecha: '2026-10-12', nombre: 'Fiesta Nacional de España' },
      { fecha: '2026-11-02', nombre: 'Todos los Santos, trasladado' },
      { fecha: '2026-12-07', nombre: 'Día de la Constitución, trasladado' },
      { fecha: '2026-12-08', nombre: 'Inmaculada' },
      { fecha: '2026-12-25', nombre: 'Navidad' },
    ],
  },
  {
    anio: 2026,
    zona: 'ANDALUCIA',
    fuente: `${BOE_2026}, anexo`,
    url: BOE_2026_URL,
    festivos: [
      { fecha: '2026-01-01', nombre: 'Año Nuevo' },
      { fecha: '2026-01-06', nombre: 'Reyes' },
      { fecha: '2026-02-28', nombre: 'Día de Andalucía' },
      { fecha: '2026-04-02', nombre: 'Jueves Santo' },
      { fecha: '2026-04-03', nombre: 'Viernes Santo' },
      { fecha: '2026-05-01', nombre: 'Fiesta del Trabajo' },
      { fecha: '2026-08-15', nombre: 'Asunción' },
      { fecha: '2026-10-12', nombre: 'Fiesta Nacional de España' },
      { fecha: '2026-11-02', nombre: 'Todos los Santos, trasladado' },
      { fecha: '2026-12-07', nombre: 'Día de la Constitución, trasladado' },
      { fecha: '2026-12-08', nombre: 'Inmaculada' },
      { fecha: '2026-12-25', nombre: 'Navidad' },
    ],
  },
  // ── 2027 (el BOE aún no ha publicado su relación: mandan los boletines
  //    autonómicos, que son la norma de origen) ────────────────────────────────
  {
    anio: 2027,
    zona: 'CATALUNA',
    fuente:
      'Ordre EMT/52/2026, de 25 de març, per la qual s’estableix el calendari oficial de festes laborals per a l’any 2027 (DOGC núm. 9637, d’1 d’abril de 2026), article 1',
    url: 'https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1040896',
    festivos: CATALUNA_2027,
  },
  {
    anio: 2027,
    zona: 'ARAN',
    fuente:
      'Ordre EMT/52/2026 (DOGC núm. 9637, d’1 d’abril de 2026), article 1: a l’Aran el 29 de març se substitueix pel 17 de juny (Festa d’Aran)',
    url: 'https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1040896',
    festivos: conFestaDAran(CATALUNA_2027, '2027-03-29', 2027),
  },
  {
    anio: 2027,
    zona: 'MADRID',
    fuente:
      'Decreto 82/2026, de 30 de septiembre, del Consejo de Gobierno, por el que se establecen las fiestas laborales para el año 2027 en la Comunidad de Madrid (BOCM núm. 234, de 1 de octubre de 2026), anexo',
    url: 'https://www.bocm.es/boletin/CM_Orden_BOCM/2026/10/01/BOCM-20261001-19.PDF',
    festivos: [
      { fecha: '2027-01-01', nombre: 'Año Nuevo' },
      { fecha: '2027-01-06', nombre: 'Reyes' },
      { fecha: '2027-03-19', nombre: 'San José' },
      { fecha: '2027-03-25', nombre: 'Jueves Santo' },
      { fecha: '2027-03-26', nombre: 'Viernes Santo' },
      { fecha: '2027-05-01', nombre: 'Fiesta del Trabajo' },
      { fecha: '2027-08-16', nombre: 'Asunción, trasladada' },
      { fecha: '2027-10-12', nombre: 'Fiesta Nacional de España' },
      { fecha: '2027-11-01', nombre: 'Todos los Santos' },
      { fecha: '2027-12-06', nombre: 'Día de la Constitución' },
      { fecha: '2027-12-08', nombre: 'Inmaculada' },
      { fecha: '2027-12-25', nombre: 'Navidad' },
    ],
  },
  {
    anio: 2027,
    zona: 'ANDALUCIA',
    fuente:
      'Decreto 84/2026, de 29 de abril, por el que se determina el calendario de fiestas laborales de la Comunidad Autónoma de Andalucía para el año 2027 (BOJA núm. 84, de 5 de mayo de 2026), anexo',
    url: 'https://www.juntadeandalucia.es/eboja/2026/84/BOJA26-084-00002-5812-01_00337048.pdf',
    festivos: [
      { fecha: '2027-01-01', nombre: 'Año Nuevo' },
      { fecha: '2027-01-06', nombre: 'Reyes' },
      { fecha: '2027-03-01', nombre: 'Día de Andalucía, trasladado' },
      { fecha: '2027-03-25', nombre: 'Jueves Santo' },
      { fecha: '2027-03-26', nombre: 'Viernes Santo' },
      { fecha: '2027-05-01', nombre: 'Fiesta del Trabajo' },
      { fecha: '2027-08-16', nombre: 'Asunción, trasladada' },
      { fecha: '2027-10-12', nombre: 'Fiesta Nacional de España' },
      { fecha: '2027-11-01', nombre: 'Todos los Santos' },
      { fecha: '2027-12-06', nombre: 'Día de la Constitución' },
      { fecha: '2027-12-08', nombre: 'Inmaculada' },
      { fecha: '2027-12-25', nombre: 'Navidad' },
    ],
  },
];

// ── Argentina: feriados nacionales ──────────────────────────────────────────
// Inamovibles y trasladables de la Ley 27.399 (arts. 1 y 6), los días no
// laborables (Jueves Santo) y los «no laborables con fines turísticos» que fija
// el Poder Ejecutivo cada año. Fuera: los feriados provinciales y municipales
// (cambian de una provincia a otra; se buscan en «Buscar los de tu localidad»)
// y los días no laborables por religión (solo para quien la profesa).
// En un día no laborable cada empresa decide si trabaja: se avisa igual.

const AR_2026_FUENTE =
  'Ley 27.399 de feriados nacionales (B.O. 18/10/2017) y Resolución 164/2025 de la Jefatura de Gabinete de Ministros, días no laborables con fines turísticos 2026 (B.O. núm. 35.818, de 26/12/2025); calendario oficial en argentina.gob.ar';
const AR_2026_URL = 'https://www.argentina.gob.ar/jefatura/feriados-nacionales-2026';

const ARGENTINA_2026: readonly FestivoOficial[] = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo' },
  { fecha: '2026-02-16', nombre: 'Carnaval' },
  { fecha: '2026-02-17', nombre: 'Carnaval' },
  { fecha: '2026-03-23', nombre: 'Día no laborable con fines turísticos' },
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia' },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas · Jueves Santo (no laborable)' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador' },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo' },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes, trasladado' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano' },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia' },
  { fecha: '2026-07-10', nombre: 'Día no laborable con fines turísticos' },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín' },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural' },
  { fecha: '2026-11-23', nombre: 'Día de la Soberanía Nacional, trasladado' },
  { fecha: '2026-12-07', nombre: 'Día no laborable con fines turísticos' },
  { fecha: '2026-12-08', nombre: 'Día de la Inmaculada Concepción de María' },
  { fecha: '2026-12-25', nombre: 'Navidad' },
];

// 2027: lo que fija la propia ley. Los inamovibles van en su fecha; Carnaval y
// Semana Santa salen de la Pascua (28-mar-2027); los trasladables siguen el
// art. 6 (martes y miércoles al lunes anterior, jueves y viernes al siguiente).
// FALTAN a propósito hasta que se publiquen: los tres días turísticos de 2027 y
// el Día de la Soberanía (sábado 20-nov), que el Decreto 614/2025 permite mover
// a viernes o lunes. Cuando salga la resolución, se completa con su cita.
const AR_2027_FUENTE =
  'Ley 27.399 de feriados nacionales (B.O. 18/10/2017), arts. 1 y 6; sin los días no laborables con fines turísticos 2027, todavía no publicados';
const AR_2027_URL = 'https://www.argentina.gob.ar/normativa/nacional/ley-27399-281835/texto';

const ARGENTINA_2027: readonly FestivoOficial[] = [
  { fecha: '2027-01-01', nombre: 'Año Nuevo' },
  { fecha: '2027-02-08', nombre: 'Carnaval' },
  { fecha: '2027-02-09', nombre: 'Carnaval' },
  { fecha: '2027-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia' },
  { fecha: '2027-03-25', nombre: 'Jueves Santo' },
  { fecha: '2027-03-26', nombre: 'Viernes Santo' },
  { fecha: '2027-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
  { fecha: '2027-05-01', nombre: 'Día del Trabajador' },
  { fecha: '2027-05-25', nombre: 'Día de la Revolución de Mayo' },
  { fecha: '2027-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano' },
  { fecha: '2027-06-21', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes, trasladado' },
  { fecha: '2027-07-09', nombre: 'Día de la Independencia' },
  { fecha: '2027-08-16', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín, trasladado' },
  { fecha: '2027-10-11', nombre: 'Día del Respeto a la Diversidad Cultural, trasladado' },
  { fecha: '2027-12-08', nombre: 'Día de la Inmaculada Concepción de María' },
  { fecha: '2027-12-25', nombre: 'Navidad' },
];

CALENDARIOS.push(
  { anio: 2026, zona: 'ARGENTINA', fuente: AR_2026_FUENTE, url: AR_2026_URL, festivos: ARGENTINA_2026 },
  { anio: 2027, zona: 'ARGENTINA', fuente: AR_2027_FUENTE, url: AR_2027_URL, festivos: ARGENTINA_2027 },
);

/** Solo para los tests y la guardia: los calendarios tal cual. */
export const CALENDARIOS_OFICIALES = CALENDARIOS;

/** Años con calendario cargado para una zona. */
export function aniosConFestivos(zona: ZonaFestivos): number[] {
  return CALENDARIOS.filter((c) => c.zona === zona).map((c) => c.anio);
}

/**
 * Festivos de la zona entre dos días (YYYY-MM-DD, ambos incluidos), en orden.
 * Un año sin calendario cargado no devuelve nada: sin dato, no se avisa.
 */
export function festivosEntre(zona: ZonaFestivos, desde: string, hasta: string): FestivoOficial[] {
  const out: FestivoOficial[] = [];
  for (const c of CALENDARIOS) {
    if (c.zona !== zona) continue;
    for (const f of c.festivos) if (f.fecha >= desde && f.fecha <= hasta) out.push(f);
  }
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** El festivo de ese día en la zona, o null. */
export function festivoDe(zona: ZonaFestivos, fecha: string): FestivoOficial | null {
  return festivosEntre(zona, fecha, fecha)[0] ?? null;
}

/** ¿Hay calendario cargado para el año de esa fecha? (para decir «no lo sé»). */
export function hayCalendario(zona: ZonaFestivos, fecha: string): boolean {
  const anio = Number(fecha.slice(0, 4));
  return CALENDARIOS.some((c) => c.zona === zona && c.anio === anio);
}

/** La norma de la que se copió el calendario de esa zona y año (para citarla en el módulo Festivos). */
export function fuenteDe(zona: ZonaFestivos, anio: number): { fuente: string; url: string } | null {
  const c = CALENDARIOS.find((x) => x.zona === zona && x.anio === anio);
  return c ? { fuente: c.fuente, url: c.url } : null;
}

/**
 * ¿Nacional o de la comunidad? La relación del BOE no lo marca fila a fila, así
 * que se deduce: es nacional si ese día es festivo en TODAS las comunidades
 * cargadas ese año (Arán no cuenta: es Cataluña con un día cambiado). Basta para
 * la chapa de la lista; no decide nada.
 */
export function ambitoOficial(zona: ZonaFestivos, fecha: string): 'nacional' | 'autonomico' {
  // Argentina: solo se cargan los nacionales.
  if (zona === 'ARGENTINA') return 'nacional';
  const anio = Number(fecha.slice(0, 4));
  const delAnio = CALENDARIOS.filter((c) => c.anio === anio && ZONAS_ESPANA.includes(c.zona) && c.zona !== 'ARAN');
  const enTodas = delAnio.length > 1 && delAnio.every((c) => c.festivos.some((f) => f.fecha === fecha));
  return enTodas && festivoDe(zona, fecha) ? 'nacional' : 'autonomico';
}
