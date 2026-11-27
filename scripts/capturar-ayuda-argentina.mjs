// Capturas del CENTRO DE AYUDA para la versión argentina (public/help/ar/).
//
//   npm run build && E2E_TEST=1 npx next start -p 3100 &
//   node scripts/capturar-ayuda-argentina.mjs
//
// Las de public/help/ son del software original (su logo, euros, Stripe). Estas
// salen del panel ACTUAL con la misma técnica que scripts/capturar-producto.mjs
// (token falso + API mockeada) y un estudio inventado con datos argentinos:
// pesos, Mercado Pago, teléfonos +54 y la zona de Buenos Aires. Nada sale de un
// estudio real. `AyudaCaptura` las sirve en Argentina; España sigue con las suyas.
// Si la pantalla cambia, se vuelve a correr.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAPTURA_BASE ?? 'http://localhost:3100';
const DESTINO = path.join(process.cwd(), 'public', 'help', 'ar');

const AUTH_UID = 'auth-captura';
const STUDIO_ID = 'studio-test';
const STORAGE_KEY = 'sb-example-auth-token';
// Miércoles. Un día entre semana con el estudio a pleno rendimiento.
const HOY = '2026-09-16';
const TZ = '-03:00';
const LUNES = '2026-09-14';

const STUDIO = {
  id: STUDIO_ID, nombre: 'Estudio Aura', slug: 'aura',
  owner_auth_user_id: AUTH_UID, email: 'hola@example.com', moneda: 'ARS',
};

const INSTRUCTORAS = [
  { id: 'i1', nombre: 'Valeria Gómez', color: '#5A6142' },
  { id: 'i2', nombre: 'Florencia Díaz', color: '#3E7C86' },
  { id: 'i3', nombre: 'Camila Herrera', color: '#C79A2E' },
].map((i) => ({ ...i, studio_id: STUDIO_ID, activo: true, rol: 'INSTRUCTOR' }));

const TIPOS = [
  { id: 't1', nombre: 'Reformer', duracion_min: 50, color: '#5A6142' },
  { id: 't2', nombre: 'Mat', duracion_min: 55, color: '#3E7C86' },
  { id: 't3', nombre: 'Prenatal', duracion_min: 50, color: '#C79A2E' },
].map((t) => ({ ...t, studio_id: STUDIO_ID }));

const SALAS = [
  { id: 's1', nombre: 'Sala Reformer', capacidad: 8, color: '#5A6142' },
  { id: 's2', nombre: 'Sala Mat', capacidad: 14, color: '#3E7C86' },
].map((s) => ({ ...s, studio_id: STUDIO_ID }));

// Horario semanal. `ocup` es cuántas plazas están cogidas: se nota a propósito
// que la franja de media mañana va floja y la tarde va llena — es la forma que
// reconoce cualquier propietaria, y es de lo que hablan las páginas.
const SEMANA = [
  // [díaOffset, inicio, fin, tipo, sala, instructora, ocupadas]
  [0, '07:00', '07:50', 't1', 's1', 'i1', 8], [0, '09:00', '09:50', 't1', 's1', 'i2', 7],
  [0, '10:30', '11:25', 't2', 's2', 'i3', 5], [0, '17:00', '17:50', 't1', 's1', 'i1', 8],
  [0, '18:00', '18:50', 't1', 's1', 'i3', 8], [0, '19:00', '19:55', 't2', 's2', 'i2', 12],
  [1, '07:00', '07:50', 't1', 's1', 'i2', 6], [1, '09:00', '09:50', 't1', 's1', 'i1', 8],
  [1, '11:00', '11:50', 't3', 's1', 'i3', 4], [1, '18:00', '18:50', 't1', 's1', 'i1', 8],
  [1, '19:00', '19:55', 't2', 's2', 'i2', 11],
  [2, '07:00', '07:50', 't1', 's1', 'i1', 8], [2, '09:00', '09:50', 't1', 's1', 'i2', 7],
  [2, '10:30', '11:25', 't2', 's2', 'i3', 4], [2, '17:00', '17:50', 't1', 's1', 'i1', 8],
  [2, '18:00', '18:50', 't1', 's1', 'i3', 8], [2, '19:00', '19:55', 't2', 's2', 'i2', 12],
  [2, '20:00', '20:50', 't1', 's1', 'i1', 6],
  [3, '07:00', '07:50', 't1', 's1', 'i2', 7], [3, '09:00', '09:50', 't1', 's1', 'i1', 8],
  [3, '11:00', '11:50', 't3', 's1', 'i3', 3], [3, '18:00', '18:50', 't1', 's1', 'i1', 8],
  [3, '19:00', '19:55', 't2', 's2', 'i2', 13],
  [4, '07:00', '07:50', 't1', 's1', 'i1', 6], [4, '09:00', '09:50', 't1', 's1', 'i2', 8],
  [4, '17:00', '17:50', 't1', 's1', 'i3', 7], [4, '18:00', '18:50', 't1', 's1', 'i1', 8],
  [5, '10:00', '10:50', 't1', 's1', 'i2', 8], [5, '11:00', '11:55', 't2', 's2', 'i3', 9],
];

// ── Clientas, cobros y planes ────────────────────────────────────────────────
// Nombres inventados. La MEZCLA sí es la de un estudio real: mayoría con bono,
// unas cuantas con mensualidad, y siempre alguna que lleva semanas sin venir.
const NOMBRES = [
  ['Sofía Romero', 'MENSUAL'], ['Martina Álvarez', 'BONO'], ['Agustina Pereyra', 'BONO'],
  ['Julieta Benítez', 'MENSUAL'], ['Milagros Acosta', 'BONO'], ['Lucía Medina', 'BONO'],
  ['Carolina Suárez', 'MENSUAL'], ['Rocío Domínguez', 'BONO'], ['Paula Molina', 'BONO'],
  ['Victoria Castro', 'MENSUAL'], ['Antonella Ríos', 'BONO'], ['Belén Navarro', 'BONO'],
];

const PLANES = [
  { id: 'p1', studio_id: STUDIO_ID, nombre: 'Bono 10 sesiones', tipo: 'BONO', precio: 96000, sesiones: 10, activo: true },
  { id: 'p2', studio_id: STUDIO_ID, nombre: 'Bono 20 sesiones', tipo: 'BONO', precio: 176000, sesiones: 20, activo: true },
  { id: 'p3', studio_id: STUDIO_ID, nombre: 'Mensual ilimitado', tipo: 'MENSUAL', precio: 63000, sesiones: null, activo: true },
  { id: 'p4', studio_id: STUDIO_ID, nombre: 'Clase suelta', tipo: 'PUNTUAL', precio: 18000, sesiones: 1, activo: true },
];

// ⚠️ Las filas llevan TODAS las columnas del `select` del arranque del panel,
// no las cuatro obvias. Con filas a medias la pantalla no se queda coja: monta
// el error boundary entero ("Algo se ha roto") sin dejar ni un error en
// consola, porque React se lo traga. Costó una bisección averiguarlo.
const socios = NOMBRES.map(([nombre, tipo], i) => ({
  id: `soc-${i}`, studio_id: STUDIO_ID,
  nombre: nombre.split(' ')[0], apellidos: nombre.split(' ').slice(1).join(' '),
  email: `${nombre.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}@example.com`,
  telefono: `+54 9 11 ${String(4000 + i * 137).slice(0, 4)}-${String(1000 + i * 71).slice(0, 4)}`,
  nif: null, fecha_alta: `2026-0${(i % 8) + 1}-1${i % 9}`, activo: true,
  lead_stage: 'ACTIVA', tags: [], avatar: null,
  stripe_customer_id: null, stripe_payment_method_id: null,
  tarjeta_exp_mes: null, tarjeta_exp_anio: null, tarjeta_marca: null, tarjeta_ultimos4: null,
  metodo_pago_preferido: null, sepa_mandate_id: null, sepa_payment_method_id: null,
  fecha_nacimiento: null, direccion: null, foto_url: null, referido_por: null,
  campos_extra: {}, aceptacion_fecha: '2026-03-01', aceptacion_firma: '',
  aceptacion_origen: 'MOSTRADOR', aceptacion_por: null,
  consentimiento_salud_fecha: null, consentimiento_salud_registrado_por: null,
  consentimiento_salud_revocado_en: null,
  tipo_plan: tipo,
}));

const suscripciones = socios.map((s, i) => ({
  id: `sus-${i}`, studio_id: STUDIO_ID, socio_id: s.id,
  plan_id: s.tipo_plan === 'MENSUAL' ? 'p3' : (i % 3 === 0 ? 'p2' : 'p1'),
  estado: 'ACTIVA', fecha_inicio: '2026-09-01', fecha_fin: '2026-10-01',
  sesiones_restantes: s.tipo_plan === 'MENSUAL' ? null : (i % 7) + 1,
  stripe_subscription_id: null,
}));

// La mayoría cobrados, dos pendientes y uno fallido: lo que hace útil la
// pantalla de cobros es justo lo que NO está en verde.
const recibos = socios.slice(0, 9).map((s, i) => ({
  id: `rec-${i}`, studio_id: STUDIO_ID, socio_id: s.id, suscripcion_id: `sus-${i}`,
  concepto: i % 3 === 0 ? 'Mensual ilimitado' : 'Bono 10 sesiones',
  importe: i % 3 === 0 ? 63000 : 96000,
  estado: i === 2 ? 'FALLIDO' : (i < 2 ? 'PENDIENTE' : 'COBRADO'),
  fecha_vencimiento: '2026-09-01', fecha_cobro: i > 1 ? '2026-09-01' : null,
  fecha_devolucion: null, intentos_reintento: i === 2 ? 2 : 0,
  metodo_cobro: 'MERCADOPAGO', sepa_estado: null, disputa_estado: null,
  proximo_reintento: i === 2 ? '2026-09-19' : null,
}));

function fecha(offset) {
  const d = new Date(`${LUNES}T12:00:00${TZ}`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const sesiones = SEMANA.map(([off, hi, hf, tc, sa], n) => ({
  id: `ses-${n}`, studio_id: STUDIO_ID, tipo_clase_id: tc, sala_id: sa,
  instructor_id: SEMANA[n][5],
  inicio: `${fecha(off)}T${hi}:00${TZ}`, fin: `${fecha(off)}T${hf}:00${TZ}`,
  aforo_maximo: sa === 's1' ? 8 : 14, cancelada: false, notas: null,
}));

// Las clases de lunes y martes ya pasaron respecto a HOY (miércoles), así que
// sus reservas van ASISTIDA: sin eso la columna "última asistencia" de Clientas
// sale vacía en todas las filas y la captura enseña una pantalla a medias.
const reservas = SEMANA.flatMap(([off, , , , , , ocup], n) =>
  Array.from({ length: ocup }, (_, k) => ({
    id: `r-${n}-${k}`, studio_id: STUDIO_ID, sesion_id: `ses-${n}`,
    socio_id: `soc-${k}`, estado: off < 2 ? 'ASISTIDA' : 'CONFIRMADA',
    spot_id: null, posicion_espera: null, oferta_expira_en: null,
    check_in_en: off < 2 ? `${fecha(off)}T07:05:00${TZ}` : null,
    creado_en: '2026-09-10T10:00:00Z',
  })));

const sesionApi = (r) => ({
  id: r.id, studioId: r.studio_id, tipoClaseId: r.tipo_clase_id, salaId: r.sala_id,
  instructorId: r.instructor_id, inicio: r.inicio, fin: r.fin, aforoMaximo: r.aforo_maximo,
  cancelada: false, notas: null, precioPuntual: null, serieId: null,
  incidenciaTexto: null, sustitucionAbierta: false, motivoBaja: null, sustitucionId: null,
});
const salaApi = (s) => ({ id: s.id, studioId: s.studio_id, nombre: s.nombre, capacidad: s.capacidad, color: s.color });
const insApi = (i) => ({
  id: i.id, studioId: i.studio_id, nombre: i.nombre, email: null, telefono: null,
  color: i.color, activo: true, avatar: null, fotoUrl: null, rol: i.rol, authUserId: null,
});

const json = (route, body) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

// Cosas que no deben salir en una captura de marketing: el botón flotante de
// WhatsApp (tapa la esquina), el widget de ayuda y cualquier tooltip abierto.
const OCULTAR = `
  [class*="whatsapp"], [aria-label*="WhatsApp"], [aria-label*="Ayuda"],
  [data-testid="help-widget"] { display: none !important; }
`;

async function montarPanel(page) {
  await page.clock.setFixedTime(new Date(`${HOY}T09:30:00${TZ}`));
  await page.addInitScript(([key, uid]) => {
    localStorage.setItem(key, JSON.stringify({
      access_token: 'captura', refresh_token: 'captura', expires_at: 4102444800,
      expires_in: 999999999, token_type: 'bearer',
      user: {
        id: uid, email: 'hola@example.com', aud: 'authenticated', role: 'authenticated',
        app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z',
      },
    }));
    // La tira «¿Primera vez aquí?»: cerrada en dos secciones, deja de salir en todas.
    localStorage.setItem('guia-ayuda-cerrada', JSON.stringify(['clientas', 'equipo', 'calendario']));
  }, [STORAGE_KEY, AUTH_UID]);

  await page.route('**/api/**', (r) => json(r, {}));
  await page.route('**/api/layout**', (r) =>
    json(r, { orden: [], ocultos: [], menuPosition: 'lateral', home: { orden: [], ocultos: [] } }));
  await page.route('**/api/billing/estado**', (r) => json(r, { bloqueado: false }));
  await page.route('**/api/theme**', (r) => json(r, { primary: '#343825', secondary: '#5A6142', logoUrl: null, radius: 12 }));
  await page.route('**/rest/v1/**', (r) => json(r, []));
  await page.route('**/rest/v1/studios**', (r) => json(r, STUDIO));
  await page.route('**/rest/v1/rpc/current_studio_id', (r) => json(r, STUDIO_ID));
  await page.route('**/rest/v1/instructores**', (r) => json(r, INSTRUCTORAS));
  await page.route('**/rest/v1/tipos_clase**', (r) => json(r, TIPOS));
  await page.route('**/rest/v1/salas**', (r) => json(r, SALAS));
  await page.route('**/rest/v1/sesiones**', (r) => json(r, sesiones));
  await page.route('**/rest/v1/reservas**', (r) => json(r, reservas));
  await page.route('**/rest/v1/socios**', (r) => json(r, socios));
  await page.route('**/rest/v1/suscripciones**', (r) => json(r, suscripciones));
  await page.route('**/rest/v1/planes_tarifa**', (r) => json(r, PLANES));
  await page.route('**/rest/v1/recibos**', (r) => json(r, recibos));
  await page.route('**/rest/v1/rpc/stats_clientas', (r) => json(r, [{ total: 128, activas: 96, con_bono: 74, inactivas_30d: 12 }]));
  await page.route('**/rest/v1/rpc/informe_ingresos', (r) => json(r, [{ total_ingresos: 5984000, n_cobrados: 63, n_socias_unicas: 51 }]));
  await page.route('**/rest/v1/rpc/ingresos_por_dia', (r) => json(r,
    Array.from({ length: 30 }, (_, i) => ({ dia: `2026-09-${String(i + 1).padStart(2, '0')}`, total: [96000, 176000, 63000, 272000, 0, 18000, 128000][i % 7] * (1 + (i % 3) * 0.4) }))));
  await page.route('**/rest/v1/rpc/ocupacion_por_tipo', (r) => json(r, [
    { tipo_clase_id: 't1', n_sesiones: 19, aforo: 152, ocupadas: 138 },
    { tipo_clase_id: 't2', n_sesiones: 7, aforo: 98, ocupadas: 61 },
    { tipo_clase_id: 't3', n_sesiones: 3, aforo: 24, ocupadas: 11 },
  ]));
  await page.route('**/rest/v1/rpc/ventas_por_tipo', (r) => json(r, [
    { tipo: 'BONO', n_ventas: 34, total: 3264000 },
    { tipo: 'MENSUAL', n_ventas: 21, total: 1323000 },
    { tipo: 'PUNTUAL', n_ventas: 8, total: 144000 },
  ]));
  await page.route('**/api/equipo**', (r) => json(r, { instructores: INSTRUCTORAS.map(insApi), tarifas: [
    { instructorId: 'i1', tarifaHora: 30000 }, { instructorId: 'i2', tarifaHora: 27000 }, { instructorId: 'i3', tarifaHora: 25000 },
  ] }));
  // Las tarjetas de Equipo vienen de su propio endpoint, con la ficha ya recortada al rol.
  const TARJETA = { avatar: null, fotoUrl: null, activo: true, conAcceso: true, esYo: false, telefono: null,
    enClaseAhora: false, claseHoyLabel: null, proximaClaseIso: null, ultimaClaseIso: null, clasesUltimos90Dias: 120,
    coincideContigo: null, disponibilidadActualizadaEn: '2026-09-10T10:00:00Z' };
  await page.route('**/api/equipo/tarjetas**', (r) => json(r, { items: [
    { ...TARJETA, id: 'yo', nombre: 'Natalia Ruiz', rol: 'PROPIETARIO', color: '#343825', esYo: true, email: 'hola@example.com',
      semana: [0, 0, 0, 0, 0, 0, 0], horasDia: [null, null, null, null, null, null, null], ocupacionPct: null, valoracion: null, horasMes: null, costeMes: null },
    { ...TARJETA, id: 'i1', nombre: 'Valeria Gómez', rol: 'INSTRUCTOR', color: '#5A6142', email: 'valeria@example.com',
      enClaseAhora: true, claseHoyLabel: 'En clase · Reformer hasta las 09:50', proximaClaseIso: '2026-09-16T17:00:00-03:00', ultimaClaseIso: '2026-09-15T18:50:00-03:00',
      semana: [3, 2, 4, 2, 2, 0, 0], horasDia: ['07:00 · 17:00', '09:00 · 18:00', '07:00 · 20:00', '09:00 · 18:00', '07:00 · 18:00', null, null],
      ocupacionPct: 94, valoracion: { media: 4.9, total: 41 }, horasMes: 46, costeMes: 1380000 },
    { ...TARJETA, id: 'i2', nombre: 'Florencia Díaz', rol: 'INSTRUCTOR', color: '#3E7C86', email: 'florencia@example.com',
      claseHoyLabel: 'Hoy · 19:00 Mat', proximaClaseIso: '2026-09-16T19:00:00-03:00', ultimaClaseIso: '2026-09-15T19:55:00-03:00',
      semana: [2, 2, 2, 2, 1, 1, 0], horasDia: ['09:00 · 19:00', '07:00 · 19:00', '09:00 · 19:00', '07:00 · 19:00', '09:00', '10:00', null],
      ocupacionPct: 88, valoracion: { media: 4.8, total: 33 }, horasMes: 38, costeMes: 1026000 },
    { ...TARJETA, id: 'i3', nombre: 'Camila Herrera', rol: 'MANAGER', color: '#C79A2E', email: 'camila@example.com',
      claseHoyLabel: 'Hoy · 10:30 Mat', proximaClaseIso: '2026-09-16T10:30:00-03:00', ultimaClaseIso: '2026-09-15T11:50:00-03:00',
      semana: [1, 1, 1, 1, 1, 1, 0], horasDia: ['10:30', '11:00', '10:30', '11:00', '17:00', '11:00', null],
      ocupacionPct: 61, valoracion: { media: 4.7, total: 18 }, horasMes: 22, costeMes: 550000 },
    { ...TARJETA, id: 'r1', nombre: 'Lucía Fernández', rol: 'RECEPCION', color: '#8C6A5D', email: 'lucia@example.com',
      semana: [0, 0, 0, 0, 0, 0, 0], horasDia: [null, null, null, null, null, null, null], ocupacionPct: null, valoracion: null, horasMes: null, costeMes: null, clasesUltimos90Dias: null },
  ] }));
  // La página pública NO usa las tablas: pide todo a /api/public/studio-data,
  // que el catch-all de arriba dejaba en {} — de ahí el "sin clases este día".
  await page.route('**/api/public/studio-data**', (r) => json(r, {
    studio: {
      id: STUDIO_ID, nombre: 'Estudio Aura', slug: 'aura', ciudad: 'Palermo, Buenos Aires',
      direccion: 'Gorriti 4800', telefono: '+54 11 4000-0000', moneda: 'ARS',
      colorPrimario: '#343825', logoUrl: null, horaApertura: '07:00:00', horaCierre: '21:00:00',
    },
    sesiones: sesiones.map(sesionApi),
    tiposClase: TIPOS.map((t) => ({ id: t.id, studioId: t.studio_id, nombre: t.nombre, duracionMin: t.duracion_min, color: t.color, descripcion: null, nivel: null })),
    salas: SALAS.map(salaApi),
    instructores: INSTRUCTORAS.map(insApi),
    spots: [], planesTarifa: PLANES.map((x) => ({ id: x.id, studioId: x.studio_id, nombre: x.nombre, tipo: x.tipo, precio: x.precio, sesiones: x.sesiones, activo: true, tiposClaseIds: null })),
    ocupacion: reservas.reduce((acc, r) => { acc[r.sesion_id] = (acc[r.sesion_id] ?? 0) + 1; return acc; }, {}),
    citasServicios: [], citasDisponibilidad: [], sustituciones: [],
  }));
  await page.route('**/api/calendario**', (r) => json(r, {
    sesiones: sesiones.map(sesionApi),
    reservas: reservas.map((x) => ({ id: x.id, studioId: x.studio_id, sesionId: x.sesion_id, socioId: x.socio_id, estado: x.estado })),
    sustituciones: [],
    salas: SALAS.map(salaApi),
    instructores: INSTRUCTORAS.map(insApi),
    horaApertura: '07:00:00', horaCierre: '21:00:00', rol: 'PROPIETARIO',
  }));
}

const esperar = (page, ms = 1800) => page.waitForTimeout(ms);
const irA = async (page, ruta) => { await page.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle' }); await esperar(page); };

/** Cada captura: archivo (dentro de public/help/ar/), si monta el panel y cómo llega a la pantalla. */
const CAPTURAS = [
  { archivo: 'clientes/ficha-de-clienta', panel: true, async abrir(page) { await irA(page, '/clientas/soc-0'); } },
  { archivo: 'clientes/importar-clientes', panel: true, async abrir(page) { await irA(page, '/clientas/importar'); } },
  { archivo: 'configuracion/equipo-lista-roles', panel: true, async abrir(page) { await irA(page, '/equipo'); } },
  {
    archivo: 'instructores/equipo-nuevo-miembro', panel: true,
    async abrir(page) {
      await irA(page, '/equipo');
      await page.getByRole('button', { name: 'Nuevo miembro' }).first().click();
      await esperar(page, 1000);
    },
  },
  {
    archivo: 'reservas/calendario-nueva-clase', panel: true,
    async abrir(page) {
      await irA(page, '/calendario');
      await page.getByRole('button', { name: /Crear clase|Nueva clase/ }).first().click();
      await esperar(page, 800);
      // «Crear clase» pregunta primero qué: una clase de un día.
      await page.getByRole('button', { name: /^Clase\b/ }).first().click().catch(() => {});
      await esperar(page, 1000);
    },
  },
  {
    archivo: 'reservas/editar-clase-form', panel: true,
    async abrir(page) {
      await irA(page, '/calendario');
      // La clase de las 17:00 de hoy (todavía no empezó): se abre su ficha y, desde ahí, «Editar».
      await page.locator('[data-sesion-id="ses-16"]').first().click();
      await esperar(page, 1000);
      await page.getByRole('button', { name: 'Más acciones de la clase' }).click();
      await esperar(page, 500);
      await page.getByRole('menuitem', { name: /Editar/ }).first().click();
      await esperar(page, 1000);
    },
  },
  {
    archivo: 'portal/portal-calendario-publico', panel: true,
    async abrir(page) {
      await irA(page, '/reservar/aura');
      await page.getByRole('button', { name: /No, gracias/i }).click().catch(() => {});
      await esperar(page, 900);
    },
  },
  {
    // El alta que ve un estudio nuevo (la piel nueva; con E2E_TEST=1 hay que pedirla). El dominio
    // que enseña es el de quien la sirve: en la captura va uno genérico, no el de esta máquina.
    archivo: 'empezar/crear-estudio-paso-1',
    async abrir(page) {
      await irA(page, '/crear-estudio?login=nuevo');
      await page.getByLabel(/Nombre de tu estudio/i).first().fill('Estudio Aura');
      await page.getByLabel(/email/i).first().fill('hola@example.com');
      await esperar(page, 800);
      await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeValue = n.nodeValue.replace(/localhost:\d+/g, 'tudominio.com');
      });
    },
  },
];

async function main() {
  const solo = process.argv.slice(2);
  const navegador = await chromium.launch({ args: ['--lang=es-AR'], env: { ...process.env, LANG: 'es_AR.UTF-8', LANGUAGE: 'es_AR:es' }, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const hechas = [];
  for (const cap of CAPTURAS) {
    if (solo.length && !solo.some((s) => cap.archivo.includes(s))) continue;
    const ctx = await navegador.newContext({
      viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
      locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires', reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    if (process.env.CAPTURA_DEBUG) page.on('pageerror', (e) => console.log('  ⚠️', cap.archivo, String(e).split('\n')[0].slice(0, 160)));
    if (cap.panel) await montarPanel(page);
    try { await cap.abrir(page); } catch (e) { console.log('  ✗', cap.archivo, String(e).split('\n')[0]); }
    await page.addStyleTag({ content: OCULTAR });
    await page.waitForTimeout(250);
    const destino = path.join(DESTINO, `${cap.archivo}.png`);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    await page.screenshot({ path: destino });
    hechas.push(cap.archivo);
    await ctx.close();
  }
  await navegador.close();
  console.log(`${hechas.length} capturas en public/help/ar/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
