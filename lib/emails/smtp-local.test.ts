import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autorizado, configSmtpLocal, mensajeDesdeResend } from './smtp-local.ts';

const CLAVE = 'local_0123456789abcdef0123';

test('apagada sin SMTP_HOST, con una clave real de Resend o con una clave local corta', () => {
  assert.equal(configSmtpLocal({ RESEND_API_KEY: CLAVE }), null);
  assert.equal(configSmtpLocal({ RESEND_API_KEY: 're_abc', SMTP_HOST: 'smtp.example.com' }), null);
  assert.equal(configSmtpLocal({ RESEND_API_KEY: 'local_corta', SMTP_HOST: 'smtp.example.com' }), null);
  assert.equal(configSmtpLocal({ SMTP_HOST: 'smtp.example.com' }), null);
});

test('el puerto decide el TLS salvo que SMTP_SECURE diga otra cosa', () => {
  const base = { RESEND_API_KEY: CLAVE, SMTP_HOST: 'smtp.example.com' };
  assert.equal(configSmtpLocal({ ...base, SMTP_PORT: '465' })!.secure, true);
  assert.equal(configSmtpLocal({ ...base, SMTP_PORT: '587' })!.secure, false);
  assert.equal(configSmtpLocal(base)!.port, 587);
  assert.equal(configSmtpLocal({ ...base, SMTP_PORT: '1025', SMTP_SECURE: 'false' })!.secure, false);
  assert.equal(configSmtpLocal({ ...base, SMTP_PORT: '2465', SMTP_SECURE: 'true' })!.secure, true);
});

test('sin usuario no manda credenciales (Mailpit)', () => {
  const c = configSmtpLocal({ RESEND_API_KEY: CLAVE, SMTP_HOST: 'mailpit', SMTP_PORT: '1025' })!;
  assert.equal(c.user, undefined);
});

test('autorizado solo con la misma clave', () => {
  assert.ok(autorizado(`Bearer ${CLAVE}`, CLAVE));
  assert.ok(!autorizado('Bearer otra', CLAVE));
  assert.ok(!autorizado(null, CLAVE));
});

test('traduce el cuerpo de Resend al de nodemailer', () => {
  const m = mensajeDesdeResend({
    from: 'Estudio <hola@example.com>',
    to: 'alumna@example.com',
    cc: ['a@example.com'],
    reply_to: 'resp@example.com',
    subject: 'Hola',
    html: '<p>Hola</p>',
    headers: { 'List-Unsubscribe': '<https://example.com/baja>' },
    attachments: [{ filename: 'f.txt', content: Buffer.from('hola').toString('base64') }],
  });
  assert.ok(typeof m !== 'string');
  assert.deepEqual(m.to, ['alumna@example.com']);
  assert.deepEqual(m.cc, ['a@example.com']);
  assert.deepEqual(m.replyTo, ['resp@example.com']);
  assert.equal(m.attachments![0].content!.toString(), 'hola');
  assert.equal(m.headers!['List-Unsubscribe'], '<https://example.com/baja>');
});

test('usa el remitente por defecto y rechaza lo incompleto', () => {
  const m = mensajeDesdeResend({ to: ['x@example.com'], subject: 's', text: 't' }, 'yo@example.com');
  assert.ok(typeof m !== 'string' && m.from === 'yo@example.com');
  assert.equal(typeof mensajeDesdeResend({ to: 'x@example.com', subject: 's', text: 't' }), 'string');
  assert.equal(typeof mensajeDesdeResend({ from: 'a@example.com', subject: 's', text: 't' }), 'string');
  assert.equal(typeof mensajeDesdeResend({ from: 'a@example.com', to: 'x@example.com', text: 't' }), 'string');
  assert.equal(typeof mensajeDesdeResend({ from: 'a@example.com', to: 'x@example.com', subject: 's' }), 'string');
});
