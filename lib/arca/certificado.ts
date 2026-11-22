// La clave y el certificado del estudio para hablar con ARCA.
//
// La clave privada se genera EN EL SERVIDOR y no sale nunca de él (se guarda
// cifrada). Al estudio se le da el pedido de certificado (CSR), que sube a
// ARCA: en homologación, con WSASS; en producción, con «Administración de
// Certificados Digitales». ARCA devuelve un certificado (.crt) que se pega acá.

import { generateKeyPairSync } from 'node:crypto';
import forge from 'node-forge';
import { cuitValido } from './reglas.ts';

export function generarClave(): string {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
}

/** El nombre del certificado en ARCA: letras, números y guiones. */
export function aliasDelCertificado(slug: string): string {
  return `tentare-${slug}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
}

/** El CSR que pide ARCA: C=AR, O=razón social, CN=alias, serialNumber=CUIT nnnnnnnnnnn. */
export function generarCsr(p: { clavePem: string; cuit: string; razonSocial: string; alias: string }): string {
  const clave = forge.pki.privateKeyFromPem(p.clavePem);
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = forge.pki.setRsaPublicKey(clave.n, clave.e);
  csr.setSubject([
    { shortName: 'C', value: 'AR' },
    { shortName: 'O', value: p.razonSocial.slice(0, 64) || p.alias },
    { shortName: 'CN', value: p.alias },
    { name: 'serialNumber', value: `CUIT ${p.cuit}` },
  ]);
  csr.sign(clave, forge.md.sha256.create());
  return forge.pki.certificationRequestToPem(csr);
}

export type CertificadoLeido =
  | { ok: true; pem: string; vence: string; sujeto: string }
  | { ok: false; error: string };

/**
 * Comprueba el certificado que devolvió ARCA antes de guardarlo: que sea un
 * certificado, que corresponda a NUESTRA clave, que sea del CUIT del estudio y
 * que no esté vencido.
 */
export function leerCertificado(texto: string, clavePem: string, cuit: string, ahora: Date = new Date()): CertificadoLeido {
  const limpio = texto.trim();
  const pem = /-----BEGIN CERTIFICATE-----/.test(limpio)
    ? limpio
    : `-----BEGIN CERTIFICATE-----\n${limpio.replace(/\s+/g, '').replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----`;
  let cert: forge.pki.Certificate;
  try {
    cert = forge.pki.certificateFromPem(pem);
  } catch {
    return { ok: false, error: 'No parece un certificado. Pegá el contenido completo del archivo .crt que te dio ARCA.' };
  }
  const clave = forge.pki.privateKeyFromPem(clavePem);
  const pub = cert.publicKey as forge.pki.rsa.PublicKey;
  if (!pub.n || pub.n.compareTo(clave.n) !== 0) {
    return { ok: false, error: 'Este certificado no es del pedido generado acá. Generá el pedido de nuevo y subilo a ARCA.' };
  }
  const serie = cert.subject.getField({ name: 'serialNumber' })?.value as string | undefined;
  const cuitDelCert = serie?.replace(/\D/g, '') ?? '';
  if (cuitValido(cuitDelCert) && cuitDelCert !== cuit) {
    return { ok: false, error: `El certificado es del CUIT ${cuitDelCert}, no del ${cuit}.` };
  }
  if (cert.validity.notAfter.getTime() <= ahora.getTime()) return { ok: false, error: 'El certificado ya venció.' };
  return { ok: true, pem: forge.pki.certificateToPem(cert), vence: cert.validity.notAfter.toISOString(), sujeto: cert.subject.getField('CN')?.value ?? '' };
}
