// Correo de la app por SMTP, en la instalación propia (autoalojada).
//
// La app manda sus ~40 correos con el SDK de Resend. En vez de tocar cada
// envío, esta pasarela imita el único endpoint que usan (`POST /emails`) y lo
// reenvía por SMTP con nodemailer. Se enciende solo desde el entorno:
//
//   RESEND_API_KEY=local_<secreto>      (nunca empieza por «re_»)
//   RESEND_BASE_URL=http://127.0.0.1:3000/api/correo-local
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS   (Gmail, el del estudio, Mailpit…)
//
// Con una clave real de Resend (`re_…`) la pasarela está apagada y todo va a
// Resend como siempre. Sin `@/`: lo prueba `node --test` (smtp-local.test.ts).

import { timingSafeEqual } from 'node:crypto';

export const PREFIJO_CLAVE_LOCAL = 'local_';

export interface ConfigSmtp {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  clave: string;
}

type Entorno = Record<string, string | undefined>;

/** La config de la pasarela, o null si está apagada. */
export function configSmtpLocal(env: Entorno = process.env): ConfigSmtp | null {
  const clave = env.RESEND_API_KEY ?? '';
  const host = env.SMTP_HOST?.trim();
  if (!host || !clave.startsWith(PREFIJO_CLAVE_LOCAL) || clave.length < PREFIJO_CLAVE_LOCAL.length + 16) return null;
  const port = Number(env.SMTP_PORT) || 587;
  const seguro = env.SMTP_SECURE?.trim().toLowerCase();
  return {
    host,
    port,
    // 465 es TLS directo; 587 y 25 empiezan en claro y suben con STARTTLS.
    secure: seguro ? seguro === 'true' : port === 465,
    user: env.SMTP_USER || undefined,
    pass: env.SMTP_PASS || undefined,
    clave,
  };
}

/** ¿La cabecera Authorization trae la clave local? (comparación de tiempo constante) */
export function autorizado(cabecera: string | null, clave: string): boolean {
  const recibido = Buffer.from(cabecera?.replace(/^Bearer\s+/i, '') ?? '');
  const esperado = Buffer.from(clave);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

interface AdjuntoResend {
  filename?: string;
  content?: string;
  path?: string;
  content_type?: string;
  content_id?: string;
}

/** Lo que manda el SDK de Resend (snake_case, tal cual llega a la API). */
export interface CuerpoResend {
  from?: string;
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: AdjuntoResend[];
}

export interface MensajeSmtp {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: { filename?: string; content?: Buffer; path?: string; contentType?: string; cid?: string }[];
}

const lista = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map(s => s.trim()).filter(Boolean);

/**
 * Traduce el cuerpo de Resend a un mensaje de nodemailer. Devuelve un texto de
 * error (como lo diría Resend) si falta algo imprescindible.
 */
export function mensajeDesdeResend(c: CuerpoResend, remitentePorDefecto?: string): MensajeSmtp | string {
  const from = c.from?.trim() || remitentePorDefecto?.trim();
  const to = lista(c.to);
  if (!from) return 'Falta el remitente (from).';
  if (to.length === 0) return 'Falta el destinatario (to).';
  if (!c.subject) return 'Falta el asunto (subject).';
  if (!c.html && !c.text) return 'Falta el cuerpo (html o text).';
  const m: MensajeSmtp = { from, to, subject: c.subject };
  if (c.html) m.html = c.html;
  if (c.text) m.text = c.text;
  if (lista(c.cc).length) m.cc = lista(c.cc);
  if (lista(c.bcc).length) m.bcc = lista(c.bcc);
  if (lista(c.reply_to).length) m.replyTo = lista(c.reply_to);
  if (c.headers && Object.keys(c.headers).length) m.headers = c.headers;
  if (c.attachments?.length) {
    m.attachments = c.attachments.map(a => ({
      filename: a.filename,
      // Resend recibe el contenido en base64; una URL va en `path`.
      ...(a.content != null ? { content: Buffer.from(a.content, 'base64') } : {}),
      ...(a.path ? { path: a.path } : {}),
      ...(a.content_type ? { contentType: a.content_type } : {}),
      ...(a.content_id ? { cid: a.content_id } : {}),
    }));
  }
  return m;
}
