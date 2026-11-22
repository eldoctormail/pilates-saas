// WSFEv1: pedir el CAE de una factura, saber el último número y consultar uno.

import { ENDPOINTS, fechaDeArca, type EntornoArca, type Solicitud } from './reglas.ts';
import { aXml, etiqueta, etiquetas, fault, llamarSoap, texto, type Fetch } from './soap.ts';

const NS = 'http://ar.gov.afip.dif.FEV1/';

export interface Credenciales { token: string; sign: string; cuit: string }

export interface MensajeArca { tipo: 'error' | 'observacion' | 'evento'; codigo: string; mensaje: string }

function sobre(metodo: string, cuerpo: Record<string, unknown>): string {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="${NS}">`
    + `<soapenv:Header/><soapenv:Body><ar:${metodo}>${aXml(cuerpo)}</ar:${metodo}></soapenv:Body></soapenv:Envelope>`;
}

function auth(c: Credenciales) {
  return { Auth: { Token: c.token, Sign: c.sign, Cuit: c.cuit } };
}

function mensajes(xml: string): MensajeArca[] {
  const de = (bloque: string, item: string, tipo: MensajeArca['tipo']) =>
    etiquetas(etiqueta(xml, bloque) ?? '', item).map(x => ({ tipo, codigo: texto(x, 'Code') ?? '', mensaje: texto(x, 'Msg') ?? '' }));
  return [...de('Errors', 'Err', 'error'), ...de('Observaciones', 'Obs', 'observacion'), ...de('Events', 'Evt', 'evento')];
}

async function llamar(f: Fetch, entorno: EntornoArca, metodo: string, cuerpo: Record<string, unknown>): Promise<string> {
  const { xml } = await llamarSoap(f, ENDPOINTS[entorno].wsfe, `${NS}${metodo}`, sobre(metodo, cuerpo));
  const fl = fault(xml);
  if (fl) throw new ErrorArca([{ tipo: 'error', codigo: 'SOAP', mensaje: fl }]);
  return xml;
}

export class ErrorArca extends Error {
  readonly mensajes: MensajeArca[];
  constructor(mensajes: MensajeArca[]) {
    super(mensajes.map(m => `${m.codigo} ${m.mensaje}`.trim()).join(' · ') || 'Error de ARCA');
    this.mensajes = mensajes;
  }
}

/** El último número autorizado de ese punto de venta y tipo (0 si no hay ninguno). */
export async function ultimoAutorizado(f: Fetch, entorno: EntornoArca, c: Credenciales, puntoVenta: number, tipoCbte: number): Promise<number> {
  const xml = await llamar(f, entorno, 'FECompUltimoAutorizado', { ...auth(c), PtoVta: puntoVenta, CbteTipo: tipoCbte });
  const nro = texto(xml, 'CbteNro');
  if (nro === null) throw new ErrorArca(mensajes(xml));
  return Number(nro);
}

export type ResultadoCae =
  | { resultado: 'A'; cae: string; caeVto: string; mensajes: MensajeArca[] }
  | { resultado: 'R'; mensajes: MensajeArca[] };

export function leerRespuestaCae(xml: string): ResultadoCae {
  const det = etiqueta(xml, 'FECAEDetResponse') ?? '';
  const resultado = texto(det, 'Resultado') ?? texto(xml, 'Resultado');
  const ms = mensajes(xml);
  const cae = texto(det, 'CAE');
  const vto = texto(det, 'CAEFchVto');
  if (resultado === 'A' && cae && /^\d{14}$/.test(cae) && vto) return { resultado: 'A', cae, caeVto: fechaDeArca(vto), mensajes: ms };
  return { resultado: 'R', mensajes: ms };
}

export async function solicitarCae(f: Fetch, entorno: EntornoArca, c: Credenciales, s: Solicitud): Promise<ResultadoCae> {
  const { Iva, ...resto } = s.detalle;
  const detalle: Record<string, unknown> = { ...resto };
  if (Iva.length) detalle.Iva = { AlicIva: Iva };
  const xml = await llamar(f, entorno, 'FECAESolicitar', {
    ...auth(c),
    FeCAEReq: {
      FeCabReq: { CantReg: 1, PtoVta: s.puntoVenta, CbteTipo: s.tipoCbte },
      FeDetReq: { FECAEDetRequest: detalle },
    },
  });
  return leerRespuestaCae(xml);
}

export type ResultadoConsulta =
  | { existe: true; cae: string; caeVto: string; importe: number; fecha: string }
  | { existe: false };

/** ¿ARCA tiene ese comprobante? Sirve para recuperar uno cuya respuesta se perdió. */
export async function consultar(f: Fetch, entorno: EntornoArca, c: Credenciales, puntoVenta: number, tipoCbte: number, numero: number): Promise<ResultadoConsulta> {
  const xml = await llamar(f, entorno, 'FECompConsultar', {
    ...auth(c), FeCompConsReq: { CbteTipo: tipoCbte, CbteNro: numero, PtoVta: puntoVenta },
  });
  const res = etiqueta(xml, 'ResultGet');
  const cae = res ? texto(res, 'CodAutorizacion') : null;
  if (res && cae && /^\d{14}$/.test(cae)) {
    return {
      existe: true, cae,
      caeVto: fechaDeArca(texto(res, 'FchVto') ?? ''),
      importe: Number(texto(res, 'ImpTotal') ?? 0),
      fecha: fechaDeArca(texto(res, 'CbteFch') ?? ''),
    };
  }
  // 602: «No existen datos en nuestros registros…». Otro error es otra cosa.
  const ms = mensajes(xml);
  if (ms.some(m => m.codigo === '602') || (!res && ms.length === 0)) return { existe: false };
  throw new ErrorArca(ms);
}
