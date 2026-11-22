import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import forge from 'node-forge';
import type { SupabaseClient } from '@supabase/supabase-js';

process.env.INTEGRACIONES_CLAVE_CIFRADO = randomBytes(32).toString('base64');

const { emitirFactura, generarPedido, guardarCertificado, guardarDatos, leerConfig, listarComprobantes } = await import('./servidor.ts');

// ─── Una base en memoria con lo justo de supabase-js ─────────────────────────
type Fila = Record<string, unknown>;
let tablas: Record<string, Fila[]>;

function falsoAdmin(): SupabaseClient {
  const from = (tabla: string) => {
    const filtros: ((f: Fila) => boolean)[] = [];
    let op: 'select' | 'update' | 'insert' | 'upsert' = 'select';
    let datos: Fila | null = null;
    let orden: { col: string; asc: boolean } | null = null;
    const filas = () => (tablas[tabla] ??= []);
    const resolver = () => {
      if (op === 'insert' || op === 'upsert') {
        const fila = { id: `id-${Math.random().toString(36).slice(2)}`, creado_en: new Date().toISOString(), mensajes: [], ...datos } as Fila;
        if (op === 'upsert') {
          const i = filas().findIndex(f => f.studio_id === fila.studio_id);
          if (i >= 0) { filas()[i] = { ...filas()[i], ...datos }; return { data: [filas()[i]], error: null }; }
        }
        if (tabla === 'comprobantes_arca') {
          const vivos = filas().filter(f => f.estado !== 'RECHAZADO');
          const dupNum = vivos.some(f => f.studio_id === fila.studio_id && f.entorno === fila.entorno && f.punto_venta === fila.punto_venta && f.tipo_cbte === fila.tipo_cbte && f.numero === fila.numero);
          const dupRec = vivos.some(f => f.recibo_id === fila.recibo_id && f.entorno === fila.entorno && [1, 6, 11].includes(f.tipo_cbte as number));
          if (dupNum || dupRec) return { data: null, error: { code: '23505', message: 'duplicate' } };
        }
        filas().push(fila);
        return { data: [fila], error: null };
      }
      let r = filas().filter(f => filtros.every(fn => fn(f)));
      if (op === 'update') {
        r.forEach(f => Object.assign(f, datos));
        return { data: r, error: null };
      }
      if (orden) r = [...r].sort((a, b) => (String(a[orden!.col]) < String(b[orden!.col]) ? -1 : 1) * (orden!.asc ? 1 : -1));
      return { data: r.map(f => ({ ...f })), error: null };
    };
    const q: Record<string, unknown> = {
      select: () => q,
      eq: (c: string, v: unknown) => { filtros.push(f => f[c] === v); return q; },
      neq: (c: string, v: unknown) => { filtros.push(f => f[c] !== v); return q; },
      in: (c: string, v: unknown[]) => { filtros.push(f => v.includes(f[c])); return q; },
      order: (col: string, o: { ascending: boolean }) => { orden = { col, asc: o.ascending }; return q; },
      limit: () => q,
      update: (d: Fila) => { op = 'update'; datos = d; return q; },
      insert: (d: Fila) => { op = 'insert'; datos = d; return q; },
      upsert: (d: Fila) => { op = 'upsert'; datos = d; return q; },
      maybeSingle: async () => { const r = resolver(); return { data: (r.data as Fila[] | null)?.[0] ?? null, error: r.error }; },
      single: async () => { const r = resolver(); return { data: (r.data as Fila[] | null)?.[0] ?? null, error: r.error }; },
      then: (ok: (v: unknown) => unknown, ko: (e: unknown) => unknown) => Promise.resolve(resolver()).then(ok, ko),
    };
    return q;
  };
  return { from } as unknown as SupabaseClient;
}

// ─── Un ARCA de mentira ──────────────────────────────────────────────────────
interface Arca {
  logins: number; caes: number; emitidos: Map<string, { cae: string; total: string }>;
  /** El próximo FECAESolicitar: 'perder-respuesta' emite y no contesta; 'caerse' no llega; 'rechazar' rechaza. */
  proximo: null | 'perder-respuesta' | 'caerse' | 'rechazar';
  numerosPedidos: number[];
}
let arca: Arca;

const env = (cuerpo: string) => `<soap:Envelope><soap:Body>${cuerpo}</soap:Body></soap:Envelope>`;
const valor = (xml: string, t: string) => new RegExp(`<ar:${t}>([^<]*)</ar:${t}>`).exec(xml)?.[1] ?? '';

async function fetchArca(url: string, init: { headers: Record<string, string>; body: string }) {
  const accion = init.headers.SOAPAction.replace(/"/g, '');
  const responder = (xml: string) => ({ ok: true, status: 200, text: async () => env(xml) });
  if (url.includes('LoginCms')) {
    arca.logins++;
    const vence = new Date(Date.now() + 12 * 3600_000).toISOString();
    const interno = `<loginTicketResponse><header><expirationTime>${vence}</expirationTime></header><credentials><token>TOK${arca.logins}</token><sign>SIG</sign></credentials></loginTicketResponse>`;
    return responder(`<loginCmsResponse><loginCmsReturn>${interno.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</loginCmsReturn></loginCmsResponse>`);
  }
  const clave = (pv: string, tipo: string, nro: string) => `${pv}-${tipo}-${nro}`;
  if (accion.endsWith('FECompUltimoAutorizado')) {
    const pv = valor(init.body, 'PtoVta'); const tipo = valor(init.body, 'CbteTipo');
    const nums = [...arca.emitidos.keys()].filter(k => k.startsWith(`${pv}-${tipo}-`)).map(k => Number(k.split('-')[2]));
    return responder(`<FECompUltimoAutorizadoResult><CbteNro>${Math.max(0, ...nums)}</CbteNro></FECompUltimoAutorizadoResult>`);
  }
  if (accion.endsWith('FECompConsultar')) {
    const e = arca.emitidos.get(clave(valor(init.body, 'PtoVta'), valor(init.body, 'CbteTipo'), valor(init.body, 'CbteNro')));
    return responder(e
      ? `<FECompConsultarResult><ResultGet><CbteFch>20261122</CbteFch><ImpTotal>${e.total}</ImpTotal><CodAutorizacion>${e.cae}</CodAutorizacion><FchVto>20261202</FchVto></ResultGet></FECompConsultarResult>`
      : '<FECompConsultarResult><Errors><Err><Code>602</Code><Msg>No existen datos</Msg></Err></Errors></FECompConsultarResult>');
  }
  if (accion.endsWith('FECAESolicitar')) {
    const pv = valor(init.body, 'PtoVta'); const tipo = valor(init.body, 'CbteTipo'); const nro = valor(init.body, 'CbteDesde');
    arca.numerosPedidos.push(Number(nro));
    const modo = arca.proximo; arca.proximo = null;
    if (modo === 'caerse') throw new Error('ECONNRESET');
    if (modo === 'rechazar') return responder('<FECAESolicitarResult><FeDetResp><FECAEDetResponse><Resultado>R</Resultado><Observaciones><Obs><Code>10063</Code><Msg>Documento inválido</Msg></Obs></Observaciones></FECAEDetResponse></FeDetResp></FECAESolicitarResult>');
    const ult = Math.max(0, ...[...arca.emitidos.keys()].filter(k => k.startsWith(`${pv}-${tipo}-`)).map(k => Number(k.split('-')[2])));
    if (Number(nro) !== ult + 1) return responder('<FECAESolicitarResult><Errors><Err><Code>10016</Code><Msg>No correlativo</Msg></Err></Errors><FeDetResp><FECAEDetResponse><Resultado>R</Resultado></FECAEDetResponse></FeDetResp></FECAESolicitarResult>');
    arca.caes++;
    const cae = String(76000000000000 + arca.caes);
    arca.emitidos.set(clave(pv, tipo, nro), { cae, total: valor(init.body, 'ImpTotal') });
    if (modo === 'perder-respuesta') throw new Error('timeout');
    return responder(`<FECAESolicitarResult><FeDetResp><FECAEDetResponse><Resultado>A</Resultado><CAE>${cae}</CAE><CAEFchVto>20261202</CAEFchVto></FECAEDetResponse></FeDetResp></FECAESolicitarResult>`);
  }
  throw new Error(`acción desconocida ${accion}`);
}

const admin = falsoAdmin();
const S = 'estudio-1';
const CF = { documento: null, condicionIva: 5, nombre: 'Ana' };

async function configurar(condicion: 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO' = 'MONOTRIBUTO') {
  await guardarDatos(admin, S, { cuit: '20123456786', condicion, puntoVenta: 3, entorno: 'homologacion', razonSocial: 'Estudio', domicilio: null, ingresosBrutos: null, inicioActividades: null });
  await generarPedido(admin, S, 'estudio');
  const c = await leerConfig(admin, S);
  const clave = forge.pki.privateKeyFromPem(c!.clavePem!);
  const cert = forge.pki.createCertificate();
  cert.publicKey = forge.pki.setRsaPublicKey(clave.n, clave.e);
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 864e5);
  cert.validity.notAfter = new Date(Date.now() + 365 * 864e5);
  const sujeto = [{ shortName: 'CN', value: 'tentare-estudio' }, { name: 'serialNumber', value: 'CUIT 20123456786' }];
  cert.setSubject(sujeto); cert.setIssuer(sujeto);
  cert.sign(clave, forge.md.sha256.create());
  const g = await guardarCertificado(admin, S, forge.pki.certificateToPem(cert));
  assert.equal(g.ok, true);
}

beforeEach(async () => {
  tablas = {
    studios: [{ id: S, iva_por_defecto: 21 }],
    recibos: ['r1', 'r2', 'r3'].map(id => ({ id, studio_id: S, estado: 'COBRADO', importe: 12100, importe_devuelto: 0, fecha_cobro: '2026-11-21T14:00:00Z', concepto: 'Bono 8 clases' })),
  };
  arca = { logins: 0, caes: 0, emitidos: new Map(), proximo: null, numerosPedidos: [] };
});

test('la clave privada y el ticket se guardan cifrados', async () => {
  await configurar();
  const fila = tablas.arca_config[0];
  assert.ok(String(fila.clave_privada).startsWith('enc:v1:'));
  assert.ok(!String(fila.clave_privada).includes('PRIVATE KEY'));
  await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(String(fila.ticket_token).startsWith('enc:v1:'));
});

test('emite una factura C con CAE, y el ticket se reutiliza en la siguiente', async () => {
  await configurar();
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.equal(a.ok, true);
  if (!a.ok) return;
  assert.equal(a.comprobante.tipoCbte, 11);
  assert.equal(a.comprobante.numero, 1);
  assert.equal(a.comprobante.estado, 'EMITIDO');
  assert.equal(a.comprobante.neto, 12100);
  assert.equal(a.comprobante.iva, 0);
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r2', receptor: CF, fetch: fetchArca });
  assert.ok(b.ok && b.comprobante.numero === 2);
  assert.equal(arca.logins, 1);
});

test('volver a pedirla para el mismo recibo devuelve la misma, sin otro CAE', async () => {
  await configurar();
  await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  const otra = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(otra.ok && otra.comprobante.numero === 1);
  assert.equal(arca.caes, 1);
});

test('respuesta perdida: queda pendiente y el siguiente intento recupera el CAE sin emitir otra', async () => {
  await configurar();
  arca.proximo = 'perder-respuesta';
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.equal(a.ok, false);
  assert.equal(!a.ok && a.status, 504);
  assert.equal(tablas.comprobantes_arca[0].estado, 'PENDIENTE');
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(b.ok && b.comprobante.numero === 1 && b.comprobante.estado === 'EMITIDO');
  assert.equal(arca.caes, 1);
});

test('no llegó a ARCA: el siguiente intento reenvía la MISMA solicitud con el mismo número', async () => {
  await configurar();
  arca.proximo = 'caerse';
  assert.equal((await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca })).ok, false);
  // Otro recibo: antes de numerar el suyo, se resuelve el pendiente (número 1) y él lleva el 2.
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r2', receptor: CF, fetch: fetchArca });
  assert.ok(b.ok && b.comprobante.numero === 2);
  const r1 = (await listarComprobantes(admin, S, 'homologacion', ['r1']))[0];
  assert.equal(r1.estado, 'EMITIDO');
  assert.equal(r1.numero, 1);
  assert.deepEqual(arca.numerosPedidos, [1, 1, 2]);
});

test('rechazada: queda RECHAZADO, el número no se usa y el siguiente lo toma', async () => {
  await configurar();
  arca.proximo = 'rechazar';
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.equal(a.ok, false);
  assert.ok(!a.ok && a.error.includes('Documento inválido'));
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(b.ok && b.comprobante.numero === 1);
});

test('responsable inscripto: B a consumidor final con IVA incluido; A exige CUIT', async () => {
  await configurar('RESPONSABLE_INSCRIPTO');
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(b.ok);
  if (b.ok) {
    assert.equal(b.comprobante.tipoCbte, 6);
    assert.equal(b.comprobante.neto, 10000);
    assert.equal(b.comprobante.iva, 2100);
  }
  const sinCuit = await emitirFactura(admin, { studioId: S, reciboId: 'r2', receptor: { documento: '30123456', condicionIva: 1, nombre: 'SRL' }, fetch: fetchArca });
  assert.equal(sinCuit.ok, false);
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r2', receptor: { documento: '20-12345678-6', condicionIva: 1, nombre: 'SRL' }, fetch: fetchArca });
  assert.ok(a.ok && a.comprobante.tipoCbte === 1 && a.comprobante.numero === 1);
});

test('solo recibos cobrados y sin devolución', async () => {
  await configurar();
  tablas.recibos[0].estado = 'PENDIENTE';
  tablas.recibos[1].importe_devuelto = 100;
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  const b = await emitirFactura(admin, { studioId: S, reciboId: 'r2', receptor: CF, fetch: fetchArca });
  const c = await emitirFactura(admin, { studioId: S, reciboId: 'no-existe', receptor: CF, fetch: fetchArca });
  assert.deepEqual([a.ok, b.ok, c.ok], [false, false, false]);
  assert.equal(arca.caes, 0);
});

test('sin configurar no se emite', async () => {
  const a = await emitirFactura(admin, { studioId: S, reciboId: 'r1', receptor: CF, fetch: fetchArca });
  assert.ok(!a.ok && a.status === 409);
});

test('cambiar de entorno pide un certificado nuevo', async () => {
  await configurar();
  await guardarDatos(admin, S, { cuit: '20123456786', condicion: 'MONOTRIBUTO', puntoVenta: 3, entorno: 'produccion', razonSocial: 'Estudio', domicilio: null, ingresosBrutos: null, inicioActividades: null });
  const c = await leerConfig(admin, S);
  assert.equal(c?.certificadoPem, null);
  assert.ok(c?.clavePem);
});
