// WSAA: el ticket de acceso (token + sign) para usar WSFEv1.
//
// Se firma un «ticket de pedido» (TRA, un XML corto) con la clave privada y el
// certificado del estudio, en CMS (PKCS#7 SignedData con el contenido dentro),
// y se manda a LoginCms. ARCA devuelve un token y un sign que valen unas 12 h.
// ⚠️ Pedir otro con uno vigente lo rechaza ARCA («ya posee un TA válido»): el
// ticket se guarda y se reutiliza (lib/arca/servidor.ts).

import forge from 'node-forge';
import { ENDPOINTS, type EntornoArca } from './reglas.ts';
import { fault, llamarSoap, texto, desescaparXml, etiqueta, type Fetch } from './soap.ts';

/** Fecha con la hora de Argentina (UTC−3, sin horario de verano): 2026-11-22T10:00:00-03:00. */
export function isoArgentina(d: Date): string {
  const t = new Date(d.getTime() - 3 * 3600_000);
  return `${t.toISOString().slice(0, 19)}-03:00`;
}

export function armarTra(servicio: string, ahora: Date): string {
  const desde = new Date(ahora.getTime() - 10 * 60_000);
  const hasta = new Date(ahora.getTime() + 10 * 60_000);
  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<loginTicketRequest version="1.0"><header>'
    + `<uniqueId>${Math.floor(ahora.getTime() / 1000)}</uniqueId>`
    + `<generationTime>${isoArgentina(desde)}</generationTime>`
    + `<expirationTime>${isoArgentina(hasta)}</expirationTime>`
    + `</header><service>${servicio}</service></loginTicketRequest>`;
}

/** El TRA firmado en CMS, en base64. */
export function firmarTra(tra: string, certificadoPem: string, clavePem: string): string {
  const cert = forge.pki.certificateFromPem(certificadoPem);
  const clave = forge.pki.privateKeyFromPem(clavePem);
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key: clave,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() as unknown as string },
    ],
  });
  p7.sign();
  return forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes());
}

export interface Ticket { token: string; sign: string; vence: string }

export type ResultadoWsaa =
  | { ok: true; ticket: Ticket }
  | { ok: false; error: string; yaTieneTicket: boolean };

export function leerRespuestaLogin(xml: string): ResultadoWsaa {
  const f = fault(xml);
  if (f) {
    return { ok: false, error: f, yaTieneTicket: /ya posee un TA valido|TA valido/i.test(f) };
  }
  const ret = etiqueta(xml, 'loginCmsReturn');
  if (!ret) return { ok: false, error: 'ARCA contestó sin ticket.', yaTieneTicket: false };
  const interno = desescaparXml(ret);
  const token = texto(interno, 'token');
  const sign = texto(interno, 'sign');
  const vence = texto(interno, 'expirationTime');
  if (!token || !sign || !vence) return { ok: false, error: 'El ticket de ARCA llegó incompleto.', yaTieneTicket: false };
  return { ok: true, ticket: { token, sign, vence: new Date(vence).toISOString() } };
}

export async function pedirTicket(p: {
  fetch: Fetch; entorno: EntornoArca; certificadoPem: string; clavePem: string; ahora?: Date;
}): Promise<ResultadoWsaa> {
  const cms = firmarTra(armarTra('wsfe', p.ahora ?? new Date()), p.certificadoPem, p.clavePem);
  const sobre = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">'
    + `<soapenv:Header/><soapenv:Body><wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms></soapenv:Body></soapenv:Envelope>`;
  const { xml } = await llamarSoap(p.fetch, ENDPOINTS[p.entorno].wsaa, '', sobre);
  return leerRespuestaLogin(xml);
}

/** Vale para usarlo si le quedan más de 5 minutos. */
export function ticketVigente(vence: string | null | undefined, ahora: Date = new Date()): boolean {
  return !!vence && new Date(vence).getTime() - ahora.getTime() > 5 * 60_000;
}
