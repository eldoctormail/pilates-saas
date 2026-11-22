import { test } from 'node:test';
import assert from 'node:assert/strict';
import forge from 'node-forge';
import {
  armarSolicitud, documentoDelReceptor, importes, letraDeFactura, numeroCompleto, urlQr, cuitValido, fechaDeArca,
} from './reglas.ts';
import { aXml, etiqueta, texto } from './soap.ts';
import { armarTra, firmarTra, isoArgentina, leerRespuestaLogin, ticketVigente } from './wsaa.ts';
import { leerRespuestaCae, solicitarCae, consultar, ultimoAutorizado } from './wsfe.ts';
import { generarClave, generarCsr, leerCertificado } from './certificado.ts';

const CUIT = '20123456786';

test('letra: monotributo siempre C; responsable inscripto A a RI y monotributistas, B al resto', () => {
  assert.equal(letraDeFactura('MONOTRIBUTO', 1), 'C');
  assert.equal(letraDeFactura('MONOTRIBUTO', 5), 'C');
  assert.equal(letraDeFactura('RESPONSABLE_INSCRIPTO', 1), 'A');
  assert.equal(letraDeFactura('RESPONSABLE_INSCRIPTO', 6), 'A');
  assert.equal(letraDeFactura('RESPONSABLE_INSCRIPTO', 5), 'B');
  assert.equal(letraDeFactura('RESPONSABLE_INSCRIPTO', 4), 'B');
});

test('importes: C todo neto; B y A con el IVA incluido que suma exacto; 0 % exento', () => {
  const c = importes(12000, 'C', 21);
  assert.ok(c.ok && c.valor.neto === 12000 && c.valor.iva === 0 && c.valor.alicuotaId === null);
  const b = importes(12100, 'B', 21);
  assert.ok(b.ok);
  if (b.ok) {
    assert.equal(b.valor.neto, 10000);
    assert.equal(b.valor.iva, 2100);
    assert.equal(b.valor.alicuotaId, 5);
  }
  const raro = importes(1000, 'B', 10.5);
  assert.ok(raro.ok);
  if (raro.ok) {
    assert.equal(Math.round((raro.valor.neto + raro.valor.iva) * 100) / 100, 1000);
    assert.equal(raro.valor.alicuotaId, 4);
  }
  const ex = importes(5000, 'B', 0);
  assert.ok(ex.ok && ex.valor.exento === 5000 && ex.valor.neto === 0);
  assert.equal(importes(0, 'C', 21).ok, false);
  assert.equal(importes(100, 'B', 4).ok, false);
});

test('documento: vacío = sin identificar solo a consumidor final y por debajo de $ 10.000.000', () => {
  assert.deepEqual(documentoDelReceptor('', 'C', 5, 50000), { ok: true, valor: { docTipo: 99, docNro: '0' } });
  assert.equal(documentoDelReceptor('', 'C', 5, 10_000_000).ok, false);
  assert.equal(documentoDelReceptor('', 'A', 1, 100).ok, false);
  assert.equal(documentoDelReceptor(null, 'B', 6, 100).ok, false);
  assert.deepEqual(documentoDelReceptor('30.123.456', 'B', 5, 100), { ok: true, valor: { docTipo: 96, docNro: '30123456' } });
  assert.deepEqual(documentoDelReceptor('20-12345678-6', 'A', 1, 100), { ok: true, valor: { docTipo: 80, docNro: CUIT } });
  assert.equal(documentoDelReceptor('20-12345678-7', 'A', 1, 100).ok, false);
  assert.equal(documentoDelReceptor('30123456', 'A', 1, 100).ok, false);
});

test('solicitud: servicios, fechas en formato ARCA, el servicio no después de la factura y la condición del receptor', () => {
  const imp = importes(12100, 'B', 21);
  assert.ok(imp.ok);
  if (!imp.ok) return;
  const s = armarSolicitud({
    puntoVenta: 3, letra: 'B', numero: 42, fecha: '2026-11-22', fechaServicio: '2026-11-20',
    documento: { docTipo: 99, docNro: '0' }, condicionIvaReceptor: 5, importes: imp.valor,
  });
  assert.equal(s.tipoCbte, 6);
  assert.equal(s.detalle.Concepto, 2);
  assert.equal(s.detalle.CbteFch, '20261122');
  assert.equal(s.detalle.FchServDesde, '20261120');
  assert.equal(s.detalle.FchVtoPago, '20261122');
  assert.equal(s.detalle.CondicionIVAReceptorId, 5);
  assert.deepEqual(s.detalle.Iva, [{ Id: 5, BaseImp: 10000, Importe: 2100 }]);
  const futuro = armarSolicitud({ puntoVenta: 3, letra: 'B', numero: 1, fecha: '2026-11-22', fechaServicio: '2026-12-01', documento: { docTipo: 99, docNro: '0' }, condicionIvaReceptor: 5, importes: imp.valor });
  assert.equal(futuro.detalle.FchServHasta, '20261122');
});

test('número completo y QR (RG 4892)', () => {
  assert.equal(numeroCompleto(3, 42), '00003-00000042');
  const url = urlQr({ fecha: '2026-11-22', cuit: CUIT, puntoVenta: 3, tipoCbte: 11, numero: 42, importe: 12000, docTipo: 99, docNro: '0', cae: '76123456789012' });
  assert.ok(url.startsWith('https://www.afip.gob.ar/fe/qr/?p='));
  const datos = JSON.parse(Buffer.from(url.split('?p=')[1], 'base64').toString('utf8'));
  assert.equal(datos.ver, 1);
  assert.equal(datos.cuit, 20123456786);
  assert.equal(datos.codAut, 76123456789012);
  assert.equal(datos.tipoCodAut, 'E');
  assert.equal(fechaDeArca('20261231'), '2026-12-31');
  assert.equal(cuitValido(CUIT), true);
});

test('XML: arrays repiten la etiqueta, se escapa, y se lee ignorando prefijos', () => {
  assert.equal(aXml({ A: [{ B: 1 }, { B: 2 }], C: 'x<y' }), '<ar:A><ar:B>1</ar:B></ar:A><ar:A><ar:B>2</ar:B></ar:A><ar:C>x&lt;y</ar:C>');
  const xml = '<soap:Body><ns2:Res attr="1"><CAE> 123 </CAE></ns2:Res></soap:Body>';
  assert.equal(texto(xml, 'CAE'), '123');
  assert.ok(etiqueta(xml, 'Res'));
});

// Un certificado propio de prueba, firmado con la misma clave.
function certificadoDePrueba(clavePem: string, cuit = CUIT, dias = 365) {
  const clave = forge.pki.privateKeyFromPem(clavePem);
  const cert = forge.pki.createCertificate();
  cert.publicKey = forge.pki.setRsaPublicKey(clave.n, clave.e);
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 86400_000);
  cert.validity.notAfter = new Date(Date.now() + dias * 86400_000);
  const sujeto = [{ shortName: 'CN', value: 'tentare-prueba' }, { name: 'serialNumber', value: `CUIT ${cuit}` }];
  cert.setSubject(sujeto);
  cert.setIssuer(sujeto);
  cert.sign(clave, forge.md.sha256.create());
  return forge.pki.certificateToPem(cert);
}

const CLAVE = generarClave();

test('CSR con el CUIT del estudio y certificado validado contra la clave', () => {
  const csr = forge.pki.certificationRequestFromPem(generarCsr({ clavePem: CLAVE, cuit: CUIT, razonSocial: 'Estudio SRL', alias: 'tentare-estudio' }));
  assert.equal(csr.verify(), true);
  assert.equal(csr.subject.getField({ name: 'serialNumber' }).value, `CUIT ${CUIT}`);
  assert.equal(csr.subject.getField('C').value, 'AR');

  const bueno = leerCertificado(certificadoDePrueba(CLAVE), CLAVE, CUIT);
  assert.equal(bueno.ok, true);
  const otraClave = generarClave();
  assert.equal(leerCertificado(certificadoDePrueba(otraClave), CLAVE, CUIT).ok, false);
  assert.equal(leerCertificado(certificadoDePrueba(CLAVE, '27123456780'), CLAVE, CUIT).ok, false);
  assert.equal(leerCertificado('no es un certificado', CLAVE, CUIT).ok, false);
  // Sin las líneas BEGIN/END también vale.
  const sinCabecera = certificadoDePrueba(CLAVE).replace(/-----[^-]+-----/g, '');
  assert.equal(leerCertificado(sinCabecera, CLAVE, CUIT).ok, true);
});

test('WSAA: el TRA va firmado en CMS con el contenido dentro y verificable', () => {
  const ahora = new Date('2026-11-22T15:00:00Z');
  const tra = armarTra('wsfe', ahora);
  assert.ok(tra.includes('<service>wsfe</service>'));
  assert.ok(tra.includes('<generationTime>2026-11-22T11:50:00-03:00</generationTime>'));
  assert.equal(isoArgentina(ahora), '2026-11-22T12:00:00-03:00');
  const cms = firmarTra(tra, certificadoDePrueba(CLAVE), CLAVE);
  const der = forge.util.decode64(cms);
  // Se lee como SignedData y el TRA va dentro (no es una firma «separada»).
  assert.doesNotThrow(() => forge.pkcs7.messageFromAsn1(forge.asn1.fromDer(der)));
  assert.ok(der.includes(tra));
});

test('WSAA: lee el ticket y reconoce «ya posee un TA válido»', () => {
  const interno = '<?xml version="1.0"?><loginTicketResponse><header><expirationTime>2026-11-23T03:00:00.000-03:00</expirationTime></header><credentials><token>TOK</token><sign>SIG</sign></credentials></loginTicketResponse>';
  const escapado = interno.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ok = leerRespuestaLogin(`<soapenv:Envelope><soapenv:Body><loginCmsResponse><loginCmsReturn>${escapado}</loginCmsReturn></loginCmsResponse></soapenv:Body></soapenv:Envelope>`);
  assert.deepEqual(ok, { ok: true, ticket: { token: 'TOK', sign: 'SIG', vence: '2026-11-23T06:00:00.000Z' } });
  const ya = leerRespuestaLogin('<soapenv:Body><soapenv:Fault><faultcode>ns1:coe.alreadyAuthenticated</faultcode><faultstring>El CEE ya posee un TA valido para el acceso al WSN solicitado</faultstring></soapenv:Fault></soapenv:Body>');
  assert.equal(ya.ok, false);
  assert.equal(!ya.ok && ya.yaTieneTicket, true);
  assert.equal(ticketVigente('2026-11-22T15:10:00Z', new Date('2026-11-22T15:00:00Z')), true);
  assert.equal(ticketVigente('2026-11-22T15:03:00Z', new Date('2026-11-22T15:00:00Z')), false);
});

const RESPUESTA_A = `<soap:Envelope><soap:Body><FECAESolicitarResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECAESolicitarResult>
<FeCabResp><Cuit>20123456786</Cuit><PtoVta>3</PtoVta><CbteTipo>11</CbteTipo><Resultado>A</Resultado></FeCabResp>
<FeDetResp><FECAEDetResponse><Concepto>2</Concepto><CbteDesde>42</CbteDesde><Resultado>A</Resultado>
<Observaciones><Obs><Code>10217</Code><Msg>Aviso</Msg></Obs></Observaciones>
<CAE>76123456789012</CAE><CAEFchVto>20261202</CAEFchVto></FECAEDetResponse></FeDetResp></FECAESolicitarResult></FECAESolicitarResponse></soap:Body></soap:Envelope>`;

test('WSFEv1: lee un CAE aprobado y un rechazo con sus mensajes', () => {
  const a = leerRespuestaCae(RESPUESTA_A);
  assert.equal(a.resultado, 'A');
  if (a.resultado === 'A') {
    assert.equal(a.cae, '76123456789012');
    assert.equal(a.caeVto, '2026-12-02');
    assert.deepEqual(a.mensajes, [{ tipo: 'observacion', codigo: '10217', mensaje: 'Aviso' }]);
  }
  const r = leerRespuestaCae('<FECAESolicitarResult><FeCabResp><Resultado>R</Resultado></FeCabResp><FeDetResp><FECAEDetResponse><Resultado>R</Resultado><Observaciones><Obs><Code>10246</Code><Msg>Falta la condición frente al IVA</Msg></Obs></Observaciones><CAE></CAE></FECAEDetResponse></FeDetResp><Errors><Err><Code>10016</Code><Msg>Número no correlativo</Msg></Err></Errors></FECAESolicitarResult>');
  assert.equal(r.resultado, 'R');
  assert.deepEqual(r.mensajes.map(m => m.codigo), ['10016', '10246']);
});

test('WSFEv1: el sobre lleva Auth, la cabecera y el IVA solo si hay alícuota', async () => {
  let enviado = '';
  let accion = '';
  const f = async (_url: string, init: { headers: Record<string, string>; body: string }) => {
    enviado = init.body; accion = init.headers.SOAPAction;
    return { ok: true, status: 200, text: async () => RESPUESTA_A };
  };
  const imp = importes(12000, 'C', 21);
  if (!imp.ok) throw new Error();
  const s = armarSolicitud({ puntoVenta: 3, letra: 'C', numero: 42, fecha: '2026-11-22', fechaServicio: '2026-11-22', documento: { docTipo: 99, docNro: '0' }, condicionIvaReceptor: 5, importes: imp.valor });
  const r = await solicitarCae(f, 'homologacion', { token: 'T', sign: 'S', cuit: CUIT }, s);
  assert.equal(r.resultado, 'A');
  assert.equal(accion, '"http://ar.gov.afip.dif.FEV1/FECAESolicitar"');
  assert.ok(enviado.includes('<ar:Auth><ar:Token>T</ar:Token><ar:Sign>S</ar:Sign><ar:Cuit>20123456786</ar:Cuit></ar:Auth>'));
  assert.ok(enviado.includes('<ar:FeCabReq><ar:CantReg>1</ar:CantReg><ar:PtoVta>3</ar:PtoVta><ar:CbteTipo>11</ar:CbteTipo></ar:FeCabReq>'));
  assert.ok(enviado.includes('<ar:CondicionIVAReceptorId>5</ar:CondicionIVAReceptorId>'));
  assert.ok(!enviado.includes('<ar:Iva>'));

  const impB = importes(12100, 'B', 21);
  if (!impB.ok) throw new Error();
  await solicitarCae(f, 'homologacion', { token: 'T', sign: 'S', cuit: CUIT }, armarSolicitud({ puntoVenta: 3, letra: 'B', numero: 43, fecha: '2026-11-22', fechaServicio: '2026-11-22', documento: { docTipo: 99, docNro: '0' }, condicionIvaReceptor: 5, importes: impB.valor }));
  assert.ok(enviado.includes('<ar:Iva><ar:AlicIva><ar:Id>5</ar:Id><ar:BaseImp>10000</ar:BaseImp><ar:Importe>2100</ar:Importe></ar:AlicIva></ar:Iva>'));
  // El IVA va al final del detalle, después de la condición del receptor (orden del XSD).
  assert.ok(enviado.indexOf('CondicionIVAReceptorId') < enviado.indexOf('<ar:Iva>'));
});

test('WSFEv1: último autorizado y consultar (existe / 602 no existe)', async () => {
  const resp = (xml: string) => async () => ({ ok: true, status: 200, text: async () => xml });
  const c = { token: 'T', sign: 'S', cuit: CUIT };
  assert.equal(await ultimoAutorizado(resp('<FECompUltimoAutorizadoResult><PtoVta>3</PtoVta><CbteTipo>11</CbteTipo><CbteNro>41</CbteNro></FECompUltimoAutorizadoResult>'), 'homologacion', c, 3, 11), 41);
  const existe = await consultar(resp('<FECompConsultarResult><ResultGet><CbteFch>20261122</CbteFch><ImpTotal>12000</ImpTotal><CodAutorizacion>76123456789012</CodAutorizacion><FchVto>20261202</FchVto></ResultGet></FECompConsultarResult>'), 'homologacion', c, 3, 11, 42);
  assert.deepEqual(existe, { existe: true, cae: '76123456789012', caeVto: '2026-12-02', importe: 12000, fecha: '2026-11-22' });
  const no = await consultar(resp('<FECompConsultarResult><Errors><Err><Code>602</Code><Msg>No existen datos</Msg></Err></Errors></FECompConsultarResult>'), 'homologacion', c, 3, 11, 43);
  assert.deepEqual(no, { existe: false });
  await assert.rejects(consultar(resp('<FECompConsultarResult><Errors><Err><Code>600</Code><Msg>Token vencido</Msg></Err></Errors></FECompConsultarResult>'), 'homologacion', c, 3, 11, 43));
});

test('PDF: letra y código, CAE, QR, «IVA contenido» en la B, desglose en la A y marca de prueba', async () => {
  const { generarFacturaArcaHTML } = await import('./pdf.ts');
  const emisor = { cuit: CUIT, razonSocial: 'Estudio <b>', domicilio: 'Av. Argentina 1', ingresosBrutos: '123', inicioActividades: '2024-03-01', condicion: 'MONOTRIBUTO' as const };
  const base = { entorno: 'produccion' as const, puntoVenta: 3, numero: 42, fecha: '2026-11-22', docTipo: 99, docNro: '0', condicionIvaReceptor: 5, receptorNombre: null, concepto: 'Bono 8 clases', cae: '76123456789012', caeVto: '2026-12-02' };
  const c = generarFacturaArcaHTML({ ...base, tipoCbte: 11, total: 12000, neto: 12000, iva: 0, exento: 0, alicuota: null }, emisor);
  assert.ok(c.includes('<b>C</b><span>Cód. 011</span>'));
  assert.ok(c.includes('00003-00000042'));
  assert.ok(c.includes('76123456789012'));
  assert.ok(c.includes('<svg'));
  assert.ok(c.includes('Estudio &lt;b&gt;'));
  assert.ok(!c.includes('SIN VALIDEZ FISCAL'));
  assert.ok(!c.includes('IVA contenido'));
  const b = generarFacturaArcaHTML({ ...base, entorno: 'homologacion', tipoCbte: 6, total: 12100, neto: 10000, iva: 2100, exento: 0, alicuota: 21 }, { ...emisor, condicion: 'RESPONSABLE_INSCRIPTO' });
  assert.ok(b.includes('IVA contenido'));
  assert.ok(b.includes('SIN VALIDEZ FISCAL'));
  const a = generarFacturaArcaHTML({ ...base, tipoCbte: 1, docTipo: 80, docNro: CUIT, condicionIvaReceptor: 1, total: 12100, neto: 10000, iva: 2100, exento: 0, alicuota: 21 }, { ...emisor, condicion: 'RESPONSABLE_INSCRIPTO' });
  assert.ok(a.includes('IVA 21 %'));
  assert.ok(a.includes('Importe neto gravado'));
});
