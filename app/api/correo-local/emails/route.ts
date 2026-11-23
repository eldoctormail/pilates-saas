import nodemailer from 'nodemailer';
import { autorizado, configSmtpLocal, mensajeDesdeResend, type CuerpoResend } from '@/lib/emails/smtp-local';

// Pasarela Resend → SMTP de la instalación propia (ver lib/emails/smtp-local.ts).
// El SDK de Resend apunta aquí con RESEND_BASE_URL y hace `POST /emails`; esta
// ruta contesta con la misma forma que Resend (`{ id }` o `{ name, message }`).
// Apagada (404) salvo con RESEND_API_KEY=local_… y SMTP_HOST puestos.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function errorResend(statusCode: number, name: string, message: string) {
  return Response.json({ statusCode, name, message }, { status: statusCode });
}

export async function POST(req: Request) {
  const config = configSmtpLocal();
  if (!config) return errorResend(404, 'not_found', 'Pasarela SMTP apagada.');
  if (!autorizado(req.headers.get('authorization'), config.clave)) {
    return errorResend(401, 'missing_api_key', 'Clave no válida.');
  }

  let cuerpo: CuerpoResend;
  try {
    cuerpo = (await req.json()) as CuerpoResend;
  } catch {
    return errorResend(422, 'validation_error', 'El cuerpo no es JSON.');
  }

  const mensaje = mensajeDesdeResend(cuerpo, process.env.SMTP_FROM || process.env.SMTP_USER);
  if (typeof mensaje === 'string') return errorResend(422, 'validation_error', mensaje);

  try {
    const transporte = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.pass ?? '' } : undefined,
    });
    const info = await transporte.sendMail(mensaje);
    return Response.json({ id: info.messageId ?? crypto.randomUUID() });
  } catch (err) {
    // El motivo del servidor SMTP (credenciales, remitente rechazado…) es lo
    // que hace falta para arreglarlo; no lleva datos de la destinataria.
    const motivo = err instanceof Error ? err.message : 'Error SMTP';
    console.error('[correo-local]', motivo);
    return errorResend(502, 'application_error', `El servidor SMTP no aceptó el correo: ${motivo}`);
  }
}
