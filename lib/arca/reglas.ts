// Factura electrónica de ARCA (WSFEv1, RG 4291): las reglas puras.
//
// Qué letra corresponde, cómo se identifica al receptor, cómo se reparten los
// importes y cómo queda la solicitud que va a ARCA. Sin red ni base: se prueba
// con `node --test` (lib/arca/reglas.test.ts).
//
// Fuentes: manual del desarrollador de WSFEv1 (ARCA), RG 5616/2024 (condición
// frente al IVA del receptor, obligatoria; ARCA rechaza sin ella desde el
// 1-dic-2026), RG 5700/2025 (al consumidor final se lo identifica desde
// $10.000.000) y RG 4892 (QR del comprobante).

export type CondicionEmisor = 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO';
export type EntornoArca = 'homologacion' | 'produccion';

export const ENDPOINTS: Record<EntornoArca, { wsaa: string; wsfe: string }> = {
  homologacion: {
    wsaa: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  },
  produccion: {
    wsaa: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
  },
};

/** Tipos de comprobante (tabla de ARCA). */
export const TIPO_CBTE = { FACTURA_A: 1, NOTA_CREDITO_A: 3, FACTURA_B: 6, NOTA_CREDITO_B: 8, FACTURA_C: 11, NOTA_CREDITO_C: 13 } as const;
export type Letra = 'A' | 'B' | 'C';
export const TIPO_FACTURA: Record<Letra, number> = { A: 1, B: 6, C: 11 };
export function letraDeTipo(tipo: number): Letra | null {
  return tipo === 1 || tipo === 3 ? 'A' : tipo === 6 || tipo === 8 ? 'B' : tipo === 11 || tipo === 13 ? 'C' : null;
}

/** Tipos de documento del receptor. */
export const DOC_TIPO = { CUIT: 80, CUIL: 86, DNI: 96, SIN_IDENTIFICAR: 99 } as const;

/** Condición frente al IVA del receptor (FEParamGetCondicionIvaReceptor). */
export const CONDICIONES_IVA_RECEPTOR = [
  { id: 5, nombre: 'Consumidor final' },
  { id: 1, nombre: 'IVA responsable inscripto' },
  { id: 6, nombre: 'Responsable monotributo' },
  { id: 13, nombre: 'Monotributista social' },
  { id: 16, nombre: 'Monotributo trabajador independiente promovido' },
  { id: 4, nombre: 'IVA sujeto exento' },
  { id: 7, nombre: 'Sujeto no categorizado' },
  { id: 15, nombre: 'IVA no alcanzado' },
] as const;
export const CONSUMIDOR_FINAL = 5;

export function nombreCondicionIva(id: number): string {
  return CONDICIONES_IVA_RECEPTOR.find(c => c.id === id)?.nombre ?? `Condición ${id}`;
}

export function nombreCondicionEmisor(c: CondicionEmisor): string {
  return c === 'MONOTRIBUTO' ? 'Responsable monotributo' : 'IVA responsable inscripto';
}

/** Desde este total, al consumidor final hay que identificarlo (RG 5700/2025). */
export const UMBRAL_IDENTIFICAR_CF = 10_000_000;

/**
 * La letra de la factura. Monotributo: siempre C. Responsable inscripto: A a
 * otro responsable inscripto o a un monotributista (RG 5003/2021), B al resto
 * (consumidor final, exento, no categorizado).
 */
export function letraDeFactura(emisor: CondicionEmisor, condicionReceptor: number): Letra {
  if (emisor === 'MONOTRIBUTO') return 'C';
  return [1, 6, 13, 16].includes(condicionReceptor) ? 'A' : 'B';
}

/** Alícuota de IVA → su id en ARCA. */
const ALICUOTAS: Record<string, number> = { '0': 3, '10.5': 4, '21': 5, '27': 6, '5': 8, '2.5': 9 };
export function idAlicuota(pct: number): number | null {
  return ALICUOTAS[String(pct)] ?? null;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

export type ResultadoRegla<T> = { ok: true; valor: T } | { ok: false; error: string };

export interface Importes {
  total: number;
  neto: number;
  iva: number;
  /** Operaciones exentas (responsable inscripto con IVA 0 %). */
  exento: number;
  /** null = sin IVA (factura C) o todo exento. */
  alicuota: number | null;
  alicuotaId: number | null;
}

/**
 * Cómo se reparte el total (el precio lleva el IVA incluido).
 *   · C: todo neto, sin IVA.
 *   · A y B con 0 %: todo exento.
 *   · A y B: neto = total / (1 + alícuota), y el IVA es lo que falta hasta el
 *     total, para que neto + IVA sea exactamente el total cobrado.
 */
export function importes(total: number, letra: Letra, alicuotaPct: number): ResultadoRegla<Importes> {
  if (!Number.isFinite(total) || total <= 0) return { ok: false, error: 'El importe tiene que ser mayor que cero.' };
  const t = redondear(total);
  if (letra === 'C') return { ok: true, valor: { total: t, neto: t, iva: 0, exento: 0, alicuota: null, alicuotaId: null } };
  if (alicuotaPct === 0) return { ok: true, valor: { total: t, neto: 0, iva: 0, exento: t, alicuota: null, alicuotaId: null } };
  const id = idAlicuota(alicuotaPct);
  if (id === null) return { ok: false, error: `ARCA no tiene la alícuota del ${alicuotaPct} %.` };
  const neto = redondear(t / (1 + alicuotaPct / 100));
  return { ok: true, valor: { total: t, neto, iva: redondear(t - neto), exento: 0, alicuota: alicuotaPct, alicuotaId: id } };
}

/** Dígito verificador del CUIT/CUIL. */
export function cuitValido(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit) || /^(\d)\1{10}$/.test(cuit)) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((a, p, i) => a + p * Number(cuit[i]), 0);
  const r = 11 - (suma % 11);
  return Number(cuit[10]) === (r === 11 ? 0 : r === 10 ? 9 : r);
}

export interface Documento { docTipo: number; docNro: string }

/**
 * El documento del receptor a partir de lo que tiene su ficha («DNI o CUIT»,
 * con o sin puntos y guiones).
 *   · 11 cifras: CUIT (o CUIL), con su dígito verificador.
 *   · 7 u 8 cifras: DNI.
 *   · Vacío: sin identificar, solo para consumidor final y por debajo de
 *     $10.000.000. Una factura A siempre lleva CUIT.
 */
export function documentoDelReceptor(texto: string | null | undefined, letra: Letra, condicion: number, total: number): ResultadoRegla<Documento> {
  const n = (texto ?? '').replace(/[\s.\-/]/g, '');
  if (n === '') {
    if (letra === 'A') return { ok: false, error: 'Una factura A necesita el CUIT de quien la recibe.' };
    if (condicion !== CONSUMIDOR_FINAL) return { ok: false, error: 'Fuera del consumidor final hace falta el CUIT de quien la recibe.' };
    if (total >= UMBRAL_IDENTIFICAR_CF) return { ok: false, error: 'Desde $ 10.000.000 hay que identificar al consumidor final: poné su DNI o CUIT.' };
    return { ok: true, valor: { docTipo: DOC_TIPO.SIN_IDENTIFICAR, docNro: '0' } };
  }
  if (!/^\d+$/.test(n)) return { ok: false, error: 'El documento solo puede tener números.' };
  if (n.length === 11) {
    if (!cuitValido(n)) return { ok: false, error: 'Revisá el CUIT: el dígito verificador no cuadra.' };
    return { ok: true, valor: { docTipo: DOC_TIPO.CUIT, docNro: n } };
  }
  if (letra === 'A') return { ok: false, error: 'Una factura A necesita el CUIT (11 cifras) de quien la recibe.' };
  if (n.length === 7 || n.length === 8) return { ok: true, valor: { docTipo: DOC_TIPO.DNI, docNro: n } };
  return { ok: false, error: 'El documento tiene que ser un DNI (7 u 8 cifras) o un CUIT (11 cifras).' };
}

/** 2026-11-22 → 20261122 (la fecha de ARCA). */
export function fechaArca(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '');
}
/** 20261122 → 2026-11-22. */
export function fechaDeArca(f: string): string {
  return /^\d{8}$/.test(f) ? `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}` : f;
}

/** 00001-00000023 */
export function numeroCompleto(puntoVenta: number, numero: number): string {
  return `${String(puntoVenta).padStart(5, '0')}-${String(numero).padStart(8, '0')}`;
}

/** Lo que va dentro de FECAEDetRequest. Concepto 2: servicios (las clases). */
export interface DetalleSolicitud {
  Concepto: 2;
  DocTipo: number;
  DocNro: string;
  CbteDesde: number;
  CbteHasta: number;
  CbteFch: string;
  ImpTotal: number;
  ImpTotConc: number;
  ImpNeto: number;
  ImpOpEx: number;
  ImpTrib: number;
  ImpIVA: number;
  FchServDesde: string;
  FchServHasta: string;
  FchVtoPago: string;
  MonId: 'PES';
  MonCotiz: 1;
  CondicionIVAReceptorId: number;
  Iva: { Id: number; BaseImp: number; Importe: number }[];
}

export interface Solicitud {
  puntoVenta: number;
  tipoCbte: number;
  detalle: DetalleSolicitud;
}

export function armarSolicitud(p: {
  puntoVenta: number;
  letra: Letra;
  numero: number;
  /** Hoy, en Argentina (YYYY-MM-DD). */
  fecha: string;
  /** Cuándo se prestó: el día del cobro (YYYY-MM-DD). */
  fechaServicio: string;
  documento: Documento;
  condicionIvaReceptor: number;
  importes: Importes;
}): Solicitud {
  const hoy = fechaArca(p.fecha);
  const servicio = fechaArca(p.fechaServicio);
  const imp = p.importes;
  return {
    puntoVenta: p.puntoVenta,
    tipoCbte: TIPO_FACTURA[p.letra],
    detalle: {
      Concepto: 2,
      DocTipo: p.documento.docTipo,
      DocNro: p.documento.docNro,
      CbteDesde: p.numero,
      CbteHasta: p.numero,
      CbteFch: hoy,
      ImpTotal: imp.total,
      ImpTotConc: 0,
      ImpNeto: imp.neto,
      ImpOpEx: imp.exento,
      ImpTrib: 0,
      ImpIVA: imp.iva,
      // El servicio no puede terminar después de la factura.
      FchServDesde: servicio <= hoy ? servicio : hoy,
      FchServHasta: servicio <= hoy ? servicio : hoy,
      FchVtoPago: hoy,
      MonId: 'PES',
      MonCotiz: 1,
      CondicionIVAReceptorId: p.condicionIvaReceptor,
      Iva: imp.alicuotaId !== null ? [{ Id: imp.alicuotaId, BaseImp: imp.neto, Importe: imp.iva }] : [],
    },
  };
}

/** La URL del QR (RG 4892): un JSON en base64 tras `?p=`. */
export function urlQr(c: {
  fecha: string; cuit: string; puntoVenta: number; tipoCbte: number; numero: number;
  importe: number; docTipo: number; docNro: string; cae: string;
}): string {
  const datos = {
    ver: 1,
    fecha: c.fecha.slice(0, 10),
    cuit: Number(c.cuit),
    ptoVta: c.puntoVenta,
    tipoCmp: c.tipoCbte,
    nroCmp: c.numero,
    importe: c.importe,
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: c.docTipo,
    nroDocRec: Number(c.docNro),
    tipoCodAut: 'E',
    codAut: Number(c.cae),
  };
  // El JSON es ASCII: btoa vale igual en el navegador (el PDF) y en Node.
  return `https://www.afip.gob.ar/fe/qr/?p=${btoa(JSON.stringify(datos))}`;
}
