// Factura electrónica de ARCA: lo que hace el servidor con la base y con ARCA.
//
// Una factura se emite así, y en este orden (no se cambia sin pensarlo: es lo
// que impide emitir dos veces o saltar un número):
//   1. Se resuelven los PENDIENTES de ese punto de venta y tipo: si ARCA ya
//      tiene el número, se guarda su CAE; si no, se reenvía la MISMA solicitud.
//   2. Se pide a ARCA el último número autorizado y se toma el siguiente.
//   3. Se guarda el comprobante PENDIENTE con su número y la solicitud entera
//      (la base no deja dos vivos con el mismo número ni dos por recibo).
//   4. Se pide el CAE. Aprobado → EMITIDO. Rechazado → RECHAZADO (el número no
//      se usó). Sin respuesta → queda PENDIENTE y el próximo intento lo
//      resuelve en el paso 1.
//
// Sin `server-only`: lo importan solo rutas de servidor, y así se prueba con
// `node --test` (lib/arca/servidor.test.ts).

import type { SupabaseClient } from '@supabase/supabase-js';
import { clavesDelEntorno, cifrarCredencial, descifrarCredencial } from '../integraciones/cifrado-credenciales.ts';
import { hoyEnEstudio } from '../utils.ts';
import {
  armarSolicitud, documentoDelReceptor, importes, letraDeFactura, letraDeTipo, numeroCompleto, cuitValido,
  type CondicionEmisor, type EntornoArca, type Letra, type Solicitud,
} from './reglas.ts';
import { ArcaSinRespuesta, type Fetch } from './soap.ts';
import { pedirTicket, ticketVigente } from './wsaa.ts';
import { consultar, ErrorArca, solicitarCae, ultimoAutorizado, type Credenciales, type MensajeArca } from './wsfe.ts';
import { aliasDelCertificado, generarClave, generarCsr, leerCertificado } from './certificado.ts';

export interface ConfigArca {
  studioId: string;
  cuit: string;
  condicion: CondicionEmisor;
  puntoVenta: number;
  entorno: EntornoArca;
  razonSocial: string | null;
  domicilio: string | null;
  ingresosBrutos: string | null;
  inicioActividades: string | null;
  clavePem: string | null;
  csr: string | null;
  certificadoPem: string | null;
  certificadoVence: string | null;
  ticket: { token: string; sign: string; vence: string } | null;
}

const COLUMNAS = 'studio_id, cuit, condicion, punto_venta, entorno, razon_social, domicilio, ingresos_brutos, inicio_actividades, clave_privada, csr, certificado, certificado_vence, ticket_token, ticket_sign, ticket_vence';

const contexto = (studioId: string, campo: string) => `arca:${studioId}:${campo}`;

export class ArcaNoDisponible extends Error {}

function claves() {
  const c = clavesDelEntorno();
  if (!c.actual) throw new ArcaNoDisponible('Falta INTEGRACIONES_CLAVE_CIFRADO en el servidor: sin ella no se guarda la clave de ARCA.');
  return c;
}

function descifrar(studioId: string, campo: string, valor: string | null): string | null {
  if (!valor) return null;
  const r = descifrarCredencial(valor, contexto(studioId, campo), clavesDelEntorno());
  if (!r.ok) throw new ArcaNoDisponible('No se pudo descifrar la configuración de ARCA (¿cambió INTEGRACIONES_CLAVE_CIFRADO?).');
  return r.valor;
}

const cifrar = (studioId: string, campo: string, valor: string) => cifrarCredencial(valor, contexto(studioId, campo), claves().actual!);

interface FilaConfig {
  studio_id: string; cuit: string; condicion: CondicionEmisor; punto_venta: number; entorno: EntornoArca;
  razon_social: string | null; domicilio: string | null; ingresos_brutos: string | null; inicio_actividades: string | null;
  clave_privada: string | null; csr: string | null; certificado: string | null; certificado_vence: string | null;
  ticket_token: string | null; ticket_sign: string | null; ticket_vence: string | null;
}

export async function leerConfig(admin: SupabaseClient, studioId: string): Promise<ConfigArca | null> {
  const { data, error } = await admin.from('arca_config').select(COLUMNAS).eq('studio_id', studioId).maybeSingle();
  if (error) throw error;
  const f = data as FilaConfig | null;
  if (!f) return null;
  const token = descifrar(studioId, 'ticket_token', f.ticket_token);
  const sign = descifrar(studioId, 'ticket_sign', f.ticket_sign);
  return {
    studioId, cuit: f.cuit, condicion: f.condicion, puntoVenta: f.punto_venta, entorno: f.entorno,
    razonSocial: f.razon_social, domicilio: f.domicilio, ingresosBrutos: f.ingresos_brutos, inicioActividades: f.inicio_actividades,
    clavePem: descifrar(studioId, 'clave_privada', f.clave_privada),
    csr: f.csr, certificadoPem: f.certificado, certificadoVence: f.certificado_vence,
    ticket: token && sign && f.ticket_vence ? { token, sign, vence: f.ticket_vence } : null,
  };
}

/** Lo que se le enseña a la propietaria (nunca la clave ni el ticket). */
export function configPublica(c: ConfigArca | null) {
  if (!c) return { configurada: false as const };
  return {
    configurada: true as const,
    cuit: c.cuit, condicion: c.condicion, puntoVenta: c.puntoVenta, entorno: c.entorno,
    razonSocial: c.razonSocial, domicilio: c.domicilio, ingresosBrutos: c.ingresosBrutos, inicioActividades: c.inicioActividades,
    tieneClave: !!c.clavePem, csr: c.csr,
    certificado: c.certificadoPem ? { vence: c.certificadoVence } : null,
    lista: !!(c.clavePem && c.certificadoPem),
  };
}

export interface DatosConfig {
  cuit: string; condicion: CondicionEmisor; puntoVenta: number; entorno: EntornoArca;
  razonSocial: string | null; domicilio: string | null; ingresosBrutos: string | null; inicioActividades: string | null;
}

export function validarDatos(b: Record<string, unknown>): { ok: true; datos: DatosConfig } | { ok: false; error: string } {
  const cuit = String(b.cuit ?? '').replace(/\D/g, '');
  if (!cuitValido(cuit)) return { ok: false, error: 'Revisá el CUIT: son 11 cifras y el dígito verificador no cuadra.' };
  const condicion = b.condicion;
  if (condicion !== 'MONOTRIBUTO' && condicion !== 'RESPONSABLE_INSCRIPTO') return { ok: false, error: 'Elegí la condición frente al IVA.' };
  const pv = Number(b.puntoVenta);
  if (!Number.isInteger(pv) || pv < 1 || pv > 99998) return { ok: false, error: 'El punto de venta es un número entre 1 y 99998.' };
  const entorno = b.entorno;
  if (entorno !== 'homologacion' && entorno !== 'produccion') return { ok: false, error: 'Elegí el entorno.' };
  const txt = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
  const inicio = typeof b.inicioActividades === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.inicioActividades) ? b.inicioActividades : null;
  return {
    ok: true,
    datos: {
      cuit, condicion, puntoVenta: pv, entorno,
      razonSocial: txt(b.razonSocial, 200), domicilio: txt(b.domicilio, 300), ingresosBrutos: txt(b.ingresosBrutos, 40), inicioActividades: inicio,
    },
  };
}

/** Guarda los datos. Cambiar de entorno o de CUIT pide un certificado nuevo (son otros). */
export async function guardarDatos(admin: SupabaseClient, studioId: string, d: DatosConfig): Promise<void> {
  const antes = await leerConfig(admin, studioId);
  const otroCert = !!antes && (antes.entorno !== d.entorno || antes.cuit !== d.cuit);
  const fila: Record<string, unknown> = {
    studio_id: studioId, cuit: d.cuit, condicion: d.condicion, punto_venta: d.puntoVenta, entorno: d.entorno,
    razon_social: d.razonSocial, domicilio: d.domicilio, ingresos_brutos: d.ingresosBrutos, inicio_actividades: d.inicioActividades,
    actualizado_en: new Date().toISOString(),
  };
  if (otroCert) Object.assign(fila, { csr: null, certificado: null, certificado_vence: null, ticket_token: null, ticket_sign: null, ticket_vence: null });
  if (antes && antes.puntoVenta !== d.puntoVenta) Object.assign(fila, { ticket_token: null, ticket_sign: null, ticket_vence: null });
  const { error } = await admin.from('arca_config').upsert(fila, { onConflict: 'studio_id' });
  if (error) throw error;
}

/** Genera (si no hay) la clave del servidor y el pedido de certificado. */
export async function generarPedido(admin: SupabaseClient, studioId: string, slug: string): Promise<string> {
  const c = await leerConfig(admin, studioId);
  if (!c) throw new ArcaNoDisponible('Primero guardá el CUIT y el punto de venta.');
  const clavePem = c.clavePem ?? generarClave();
  const csr = generarCsr({ clavePem, cuit: c.cuit, razonSocial: c.razonSocial ?? '', alias: aliasDelCertificado(slug) });
  const cambios: Record<string, unknown> = { csr, actualizado_en: new Date().toISOString() };
  if (!c.clavePem) cambios.clave_privada = cifrar(studioId, 'clave_privada', clavePem);
  const { error } = await admin.from('arca_config').update(cambios).eq('studio_id', studioId);
  if (error) throw error;
  return csr;
}

export async function guardarCertificado(admin: SupabaseClient, studioId: string, texto: string): Promise<{ ok: true; vence: string } | { ok: false; error: string }> {
  const c = await leerConfig(admin, studioId);
  if (!c?.clavePem) return { ok: false, error: 'Primero generá el pedido de certificado.' };
  const leido = leerCertificado(texto, c.clavePem, c.cuit);
  if (!leido.ok) return leido;
  const { error } = await admin.from('arca_config').update({
    certificado: leido.pem, certificado_vence: leido.vence,
    ticket_token: null, ticket_sign: null, ticket_vence: null, actualizado_en: new Date().toISOString(),
  }).eq('studio_id', studioId);
  if (error) throw error;
  return { ok: true, vence: leido.vence };
}

/** El ticket de WSAA: el guardado si sigue vigente; si no, uno nuevo (y se guarda antes de usarlo). */
export async function credenciales(admin: SupabaseClient, c: ConfigArca, f: Fetch, ahora: Date = new Date()): Promise<Credenciales> {
  if (!c.clavePem || !c.certificadoPem) throw new ArcaNoDisponible('Falta el certificado de ARCA: terminá la configuración.');
  if (c.ticket && ticketVigente(c.ticket.vence, ahora)) return { token: c.ticket.token, sign: c.ticket.sign, cuit: c.cuit };
  const r = await pedirTicket({ fetch: f, entorno: c.entorno, certificadoPem: c.certificadoPem, clavePem: c.clavePem, ahora });
  if (!r.ok) {
    throw new ArcaNoDisponible(r.yaTieneTicket
      ? 'ARCA dice que ya hay un acceso vigente que acá se perdió. Se libera solo en unas horas (hasta 12): probá más tarde.'
      : `ARCA no dio acceso: ${r.error}. Revisá que el certificado esté asociado al servicio «wsfe» en ARCA.`);
  }
  const { error } = await admin.from('arca_config').update({
    ticket_token: cifrar(c.studioId, 'ticket_token', r.ticket.token),
    ticket_sign: cifrar(c.studioId, 'ticket_sign', r.ticket.sign),
    ticket_vence: r.ticket.vence,
  }).eq('studio_id', c.studioId);
  if (error) throw error;
  c.ticket = r.ticket;
  return { token: r.ticket.token, sign: r.ticket.sign, cuit: c.cuit };
}

/** Para «Probar la conexión»: el último número de cada letra que puede emitir. */
export async function probarConexion(admin: SupabaseClient, studioId: string, f: Fetch) {
  const c = await leerConfig(admin, studioId);
  if (!c) throw new ArcaNoDisponible('Falta configurar ARCA.');
  const cred = await credenciales(admin, c, f);
  const letras: Letra[] = c.condicion === 'MONOTRIBUTO' ? ['C'] : ['B', 'A'];
  const ultimos: Record<string, number> = {};
  for (const l of letras) ultimos[l] = await ultimoAutorizado(f, c.entorno, cred, c.puntoVenta, l === 'A' ? 1 : l === 'B' ? 6 : 11);
  return { entorno: c.entorno, puntoVenta: c.puntoVenta, ultimos };
}

// ─── Emitir ──────────────────────────────────────────────────────────────────

export interface Receptor { documento: string | null; condicionIva: number; nombre: string | null }

export interface ComprobanteArca {
  id: string; reciboId: string; entorno: EntornoArca; cuitEmisor: string; puntoVenta: number; tipoCbte: number; numero: number;
  fecha: string; docTipo: number; docNro: string; condicionIvaReceptor: number; receptorNombre: string | null; concepto: string | null;
  total: number; neto: number; iva: number; exento: number; alicuota: number | null;
  estado: 'PENDIENTE' | 'EMITIDO' | 'RECHAZADO'; cae: string | null; caeVto: string | null; mensajes: MensajeArca[];
}

const COLUMNAS_CBTE = 'id, recibo_id, entorno, cuit_emisor, punto_venta, tipo_cbte, numero, fecha, doc_tipo, doc_nro, condicion_iva_receptor, receptor_nombre, concepto, imp_total, imp_neto, imp_iva, imp_op_ex, alicuota, estado, cae, cae_vto, mensajes, solicitud';

interface FilaCbte {
  id: string; recibo_id: string; entorno: EntornoArca; cuit_emisor: string; punto_venta: number; tipo_cbte: number; numero: number | string;
  fecha: string; doc_tipo: number; doc_nro: string; condicion_iva_receptor: number; receptor_nombre: string | null; concepto: string | null;
  imp_total: number | string; imp_neto: number | string; imp_iva: number | string; imp_op_ex: number | string; alicuota: number | string | null;
  estado: ComprobanteArca['estado']; cae: string | null; cae_vto: string | null; mensajes: MensajeArca[] | null; solicitud: Solicitud;
}

export function aComprobante(f: FilaCbte): ComprobanteArca {
  return {
    id: f.id, reciboId: f.recibo_id, entorno: f.entorno, cuitEmisor: f.cuit_emisor, puntoVenta: f.punto_venta, tipoCbte: f.tipo_cbte,
    numero: Number(f.numero), fecha: f.fecha, docTipo: f.doc_tipo, docNro: f.doc_nro, condicionIvaReceptor: f.condicion_iva_receptor,
    receptorNombre: f.receptor_nombre, concepto: f.concepto, total: Number(f.imp_total), neto: Number(f.imp_neto), iva: Number(f.imp_iva),
    exento: Number(f.imp_op_ex), alicuota: f.alicuota === null ? null : Number(f.alicuota),
    estado: f.estado, cae: f.cae, caeVto: f.cae_vto, mensajes: f.mensajes ?? [],
  };
}

export async function listarComprobantes(admin: SupabaseClient, studioId: string, entorno: EntornoArca, reciboIds?: string[]): Promise<ComprobanteArca[]> {
  let q = admin.from('comprobantes_arca').select(COLUMNAS_CBTE).eq('studio_id', studioId).eq('entorno', entorno).neq('estado', 'RECHAZADO');
  if (reciboIds) q = q.in('recibo_id', reciboIds);
  const { data, error } = await q.order('creado_en', { ascending: false }).limit(2000);
  if (error) throw error;
  return ((data ?? []) as FilaCbte[]).map(aComprobante);
}

async function marcar(admin: SupabaseClient, id: string, cambios: Record<string, unknown>): Promise<void> {
  // Compare-and-set: solo un PENDIENTE cambia (y el trigger lo exige también).
  const { error } = await admin.from('comprobantes_arca').update(cambios).eq('id', id).eq('estado', 'PENDIENTE');
  if (error) throw error;
}

/** Paso 1: lo que quedó a medias en ese punto de venta y tipo. */
export async function resolverPendientes(admin: SupabaseClient, c: ConfigArca, cred: Credenciales, f: Fetch, tipoCbte: number): Promise<void> {
  const { data, error } = await admin.from('comprobantes_arca').select(COLUMNAS_CBTE)
    .eq('studio_id', c.studioId).eq('entorno', c.entorno).eq('punto_venta', c.puntoVenta).eq('tipo_cbte', tipoCbte)
    .eq('estado', 'PENDIENTE').order('numero', { ascending: true });
  if (error) throw error;
  for (const p of (data ?? []) as FilaCbte[]) {
    const numero = Number(p.numero);
    const ya = await consultar(f, c.entorno, cred, c.puntoVenta, tipoCbte, numero);
    if (ya.existe) {
      await marcar(admin, p.id, { estado: 'EMITIDO', cae: ya.cae, cae_vto: ya.caeVto, emitido_en: new Date().toISOString() });
      continue;
    }
    const r = await solicitarCae(f, c.entorno, cred, p.solicitud);
    if (r.resultado === 'A') {
      await marcar(admin, p.id, { estado: 'EMITIDO', cae: r.cae, cae_vto: r.caeVto, mensajes: r.mensajes, emitido_en: new Date().toISOString() });
    } else {
      // Antes de darlo por rechazado, otra petición pudo haberlo emitido entretanto.
      const otra = await consultar(f, c.entorno, cred, c.puntoVenta, tipoCbte, numero);
      if (otra.existe) await marcar(admin, p.id, { estado: 'EMITIDO', cae: otra.cae, cae_vto: otra.caeVto, emitido_en: new Date().toISOString() });
      else await marcar(admin, p.id, { estado: 'RECHAZADO', mensajes: r.mensajes });
    }
  }
}

export type ResultadoEmitir =
  | { ok: true; comprobante: ComprobanteArca }
  | { ok: false; status: number; error: string; mensajes?: MensajeArca[] };

const mensajeArca = (ms: MensajeArca[]) => ms.filter(m => m.tipo !== 'evento').map(m => `${m.mensaje} (${m.codigo})`).join(' · ');

export async function emitirFactura(admin: SupabaseClient, p: {
  studioId: string; reciboId: string; receptor: Receptor; fetch: Fetch; ahora?: Date;
}): Promise<ResultadoEmitir> {
  const ahora = p.ahora ?? new Date();
  const c = await leerConfig(admin, p.studioId);
  if (!c?.clavePem || !c.certificadoPem) return { ok: false, status: 409, error: 'La factura electrónica de ARCA no está configurada.' };

  const { data: rec, error: e1 } = await admin.from('recibos')
    .select('id, studio_id, estado, importe, importe_devuelto, fecha_cobro, concepto')
    .eq('id', p.reciboId).eq('studio_id', p.studioId).maybeSingle();
  if (e1) throw e1;
  if (!rec) return { ok: false, status: 404, error: 'Recibo no encontrado.' };
  if (rec.estado !== 'COBRADO') return { ok: false, status: 409, error: 'Solo se factura un recibo cobrado.' };
  if (Number(rec.importe_devuelto ?? 0) > 0) return { ok: false, status: 409, error: 'Este recibo tiene una devolución: no se factura desde acá.' };

  const existentes = await listarComprobantes(admin, p.studioId, c.entorno, [p.reciboId]);
  const emitida = existentes.find(x => x.estado === 'EMITIDO' && letraDeTipo(x.tipoCbte) && [1, 6, 11].includes(x.tipoCbte));
  if (emitida) return { ok: true, comprobante: emitida };

  const letra = letraDeFactura(c.condicion, p.receptor.condicionIva);
  const total = Number(rec.importe);
  const imp = importes(total, letra, c.condicion === 'MONOTRIBUTO' ? 0 : await alicuotaDelEstudio(admin, p.studioId));
  if (!imp.ok) return { ok: false, status: 400, error: imp.error };
  const doc = documentoDelReceptor(p.receptor.documento, letra, p.receptor.condicionIva, total);
  if (!doc.ok) return { ok: false, status: 400, error: doc.error };

  try {
    const cred = await credenciales(admin, c, p.fetch, ahora);
    const tipoCbte = letra === 'A' ? 1 : letra === 'B' ? 6 : 11;
    // También el tipo de una pendiente de ESTE recibo (si antes se pidió con otra letra).
    const tipos = new Set([tipoCbte, ...existentes.filter(x => x.estado === 'PENDIENTE').map(x => x.tipoCbte)]);
    for (const t of tipos) await resolverPendientes(admin, c, cred, p.fetch, t);

    // ¿El paso 1 acaba de emitir la de este recibo?
    const trasResolver = (await listarComprobantes(admin, p.studioId, c.entorno, [p.reciboId])).find(x => x.estado === 'EMITIDO' && [1, 6, 11].includes(x.tipoCbte));
    if (trasResolver) return { ok: true, comprobante: trasResolver };

    const numero = (await ultimoAutorizado(p.fetch, c.entorno, cred, c.puntoVenta, tipoCbte)) + 1;
    const hoy = hoyEnEstudio(ahora);
    const solicitud = armarSolicitud({
      puntoVenta: c.puntoVenta, letra, numero, fecha: hoy,
      fechaServicio: rec.fecha_cobro ? hoyEnEstudio(new Date(rec.fecha_cobro)) : hoy,
      documento: doc.valor, condicionIvaReceptor: p.receptor.condicionIva, importes: imp.valor,
    });
    const { data: fila, error: e2 } = await admin.from('comprobantes_arca').insert({
      studio_id: p.studioId, recibo_id: p.reciboId, entorno: c.entorno, cuit_emisor: c.cuit,
      punto_venta: c.puntoVenta, tipo_cbte: tipoCbte, numero, fecha: hoy,
      doc_tipo: doc.valor.docTipo, doc_nro: doc.valor.docNro, condicion_iva_receptor: p.receptor.condicionIva,
      receptor_nombre: p.receptor.nombre?.slice(0, 200) ?? null, concepto: rec.concepto?.slice(0, 300) ?? null,
      imp_total: imp.valor.total, imp_neto: imp.valor.neto, imp_iva: imp.valor.iva, imp_op_ex: imp.valor.exento, alicuota: imp.valor.alicuota,
      estado: 'PENDIENTE', solicitud,
    }).select(COLUMNAS_CBTE).single();
    if (e2) {
      if ((e2 as { code?: string }).code === '23505') return { ok: false, status: 409, error: 'Se está emitiendo otra factura en este momento. Volvé a intentar en unos segundos.' };
      throw e2;
    }

    let r;
    try {
      r = await solicitarCae(p.fetch, c.entorno, cred, solicitud);
    } catch (err) {
      if (err instanceof ArcaSinRespuesta) {
        return { ok: false, status: 504, error: `ARCA no contestó. La factura ${numeroCompleto(c.puntoVenta, numero)} quedó pendiente: volvé a intentar y se completa sola.` };
      }
      throw err;
    }
    if (r.resultado === 'A') {
      await marcar(admin, fila.id, { estado: 'EMITIDO', cae: r.cae, cae_vto: r.caeVto, mensajes: r.mensajes, emitido_en: new Date().toISOString() });
      return { ok: true, comprobante: { ...aComprobante(fila as FilaCbte), estado: 'EMITIDO', cae: r.cae, caeVto: r.caeVto, mensajes: r.mensajes } };
    }
    await marcar(admin, fila.id, { estado: 'RECHAZADO', mensajes: r.mensajes });
    return { ok: false, status: 422, error: `ARCA rechazó la factura: ${mensajeArca(r.mensajes) || 'sin motivo'}`, mensajes: r.mensajes };
  } catch (err) {
    if (err instanceof ArcaSinRespuesta) return { ok: false, status: 504, error: 'ARCA no contestó. Probá de nuevo en unos minutos.' };
    if (err instanceof ErrorArca) return { ok: false, status: 502, error: `ARCA devolvió un error: ${mensajeArca(err.mensajes) || err.message}`, mensajes: err.mensajes };
    if (err instanceof ArcaNoDisponible) return { ok: false, status: 409, error: err.message };
    throw err;
  }
}

async function alicuotaDelEstudio(admin: SupabaseClient, studioId: string): Promise<number> {
  const { data } = await admin.from('studios').select('iva_por_defecto').eq('id', studioId).maybeSingle();
  return Number(data?.iva_por_defecto ?? 21);
}
