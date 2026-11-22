// Textos legales por defecto en Argentina (autoalojado, locale es-AR): citan la ley argentina, nunca
// la española. Los tests fijan es-ES (scripts/register-test-hooks.mjs): aquí se pasa el locale a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEYENDA_AAIP, identificacionResponsable, politicaPrivacidadPorDefecto, terminosServicioPorDefecto,
  textoConsentimientoSaludPanel,
} from './legal-textos.ts';

const AR = 'es-AR-u-hc-h23';
const ESTUDIO = {
  nombre: 'Pilates del Valle', razonSocial: 'Estudio del Valle SRL', nif: '30-71234567-1',
  direccion: 'Av. Siempreviva 742', ciudad: 'Neuquén', codigoPostal: '8300', email: 'hola@example.com',
  cancelacionVentanaHoras: 24,
};

test('la política cita la Ley 25.326 y lleva la leyenda de la AAIP tal cual', () => {
  const t = politicaPrivacidadPorDefecto(ESTUDIO, AR);
  assert.match(t, /Ley N° 25\.326/);
  assert.ok(t.includes(LEYENDA_AAIP), 'la leyenda completa, sin cambios');
  assert.match(LEYENDA_AAIP, /^El titular de los datos personales tiene la facultad de ejercer el derecho de acceso/);
  assert.match(LEYENDA_AAIP, /LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25\.326/);
  assert.ok(t.includes('hola@example.com'), 'dice dónde ejercer los derechos');
  assert.match(t, /datos sensibles: nadie puede obligarle a darlos/);
});

test('nada de la ley española en los textos argentinos', () => {
  const todo = [politicaPrivacidadPorDefecto(ESTUDIO, AR), terminosServicioPorDefecto(ESTUDIO, AR), textoConsentimientoSaludPanel(ESTUDIO, 'SOCIA', AR)].join('\n');
  for (const prohibido of [/RGPD/, /2016\/679/, /AEPD/, /Agencia Española/, /\bNIF\b/, /\bIVA\b/]) {
    assert.doesNotMatch(todo, prohibido, String(prohibido));
  }
});

test('el responsable se identifica con su CUIT y su domicilio', () => {
  const r = identificacionResponsable(ESTUDIO, AR)!;
  assert.ok(r.startsWith('Estudio del Valle SRL'));
  assert.ok(r.includes('CUIT: 30-71234567-1'));
  assert.ok(r.includes('Av. Siempreviva 742, 8300 Neuquén'));
  const sin = politicaPrivacidadPorDefecto({}, AR);
  assert.match(sin, /razón social, CUIT y domicilio/, 'sin datos, lo dice en vez de fingir');
});

test('los términos: precios finales, revocación de 10 días y baja, con la ventana real de cancelación', () => {
  const t = terminosServicioPorDefecto(ESTUDIO, AR);
  assert.match(t, /precios informados son finales/);
  assert.match(t, /10 días corridos/);
  assert.match(t, /artículo 34 de la Ley 24\.240/);
  assert.match(t, /BAJA DEL SERVICIO/);
  assert.match(t, /«Botón de arrepentimiento»/);
  assert.match(t, /«Botón de baja de servicio»/);
  assert.match(t, /menos de 24 horas/);
  assert.doesNotMatch(t, /cargo de/, 'sin penalización activa, sin cláusula de cargo');
  assert.match(terminosServicioPorDefecto({ ...ESTUDIO, penalizacionImporteEur: 5000 }, AR), /cargo de/);
});

test('el consentimiento de salud dice que es voluntario (art. 7)', () => {
  assert.match(textoConsentimientoSaludPanel(ESTUDIO, 'SOCIA', AR), /Darlos es voluntario/);
  assert.match(textoConsentimientoSaludPanel(ESTUDIO, 'TUTOR_LEGAL', AR), /Darlos es voluntario/);
  assert.doesNotMatch(textoConsentimientoSaludPanel(ESTUDIO, 'SOCIA', 'es-ES'), /Darlos es voluntario/, 'España no cambia');
});

test('España sigue con sus textos', () => {
  assert.match(politicaPrivacidadPorDefecto(ESTUDIO, 'es-ES'), /RGPD/);
  assert.match(identificacionResponsable(ESTUDIO, 'es-ES')!, /NIF\/CIF/);
});
