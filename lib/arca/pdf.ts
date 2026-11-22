// La factura de ARCA para imprimir o guardar como PDF (HTML + window.print, como
// lib/factura-pdf.ts). Lleva lo que pide la RG 1415 y su QR (RG 4892):
//   · La letra en el recuadro con su código, el número (punto de venta-número)
//     y la fecha.
//   · Emisor: razón social, domicilio, CUIT, condición frente al IVA,
//     ingresos brutos e inicio de actividades.
//   · Receptor: nombre, documento y condición frente al IVA.
//   · A: neto, IVA y total. B: total con el «IVA contenido» (Ley 27.743,
//     transparencia fiscal al consumidor). C: total.
//   · CAE, su vencimiento y el QR.
// En homologación sale tachada «SIN VALIDEZ FISCAL».

import { qrSvgMarkup } from '../qr-svg.ts';
import { letraDeTipo, nombreCondicionEmisor, nombreCondicionIva, numeroCompleto, urlQr, type CondicionEmisor, type EntornoArca } from './reglas.ts';

export interface EmisorArca {
  cuit: string;
  razonSocial: string | null;
  domicilio: string | null;
  ingresosBrutos: string | null;
  inicioActividades: string | null;
  condicion: CondicionEmisor;
}

export interface FacturaArcaImprimible {
  entorno: EntornoArca;
  puntoVenta: number;
  tipoCbte: number;
  numero: number;
  fecha: string;
  docTipo: number;
  docNro: string;
  condicionIvaReceptor: number;
  receptorNombre: string | null;
  concepto: string | null;
  total: number;
  neto: number;
  iva: number;
  exento: number;
  alicuota: number | null;
  cae: string;
  caeVto: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Una factura de ARCA va siempre en pesos (MonId PES), sea cual sea la moneda del panel.
const dinero = (n: number) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (iso: string | null) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—');
const NOMBRE_DOC: Record<number, string> = { 80: 'CUIT', 86: 'CUIL', 96: 'DNI', 99: 'Sin identificar' };

export function generarFacturaArcaHTML(f: FacturaArcaImprimible, e: EmisorArca): string {
  const letra = letraDeTipo(f.tipoCbte) ?? '?';
  const prueba = f.entorno === 'homologacion';
  const doc = f.docTipo === 99 ? 'A consumidor final' : `${NOMBRE_DOC[f.docTipo] ?? 'Doc.'} ${f.docNro}`;
  const qr = urlQr({ fecha: f.fecha, cuit: e.cuit, puntoVenta: f.puntoVenta, tipoCbte: f.tipoCbte, numero: f.numero, importe: f.total, docTipo: f.docTipo, docNro: f.docNro, cae: f.cae });
  const filas = letra === 'A'
    ? `<tr><td>Importe neto gravado</td><td>${dinero(f.neto)}</td></tr>`
      + (f.exento ? `<tr><td>Importe exento</td><td>${dinero(f.exento)}</td></tr>` : '')
      + (f.alicuota !== null ? `<tr><td>IVA ${String(f.alicuota).replace('.', ',')} %</td><td>${dinero(f.iva)}</td></tr>` : '')
    : '';
  const transparencia = letra === 'B'
    ? `<div class="nota">Régimen de Transparencia Fiscal al Consumidor (Ley 27.743): IVA contenido ${dinero(f.iva)}.</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<title>Factura ${letra} ${numeroCompleto(f.puntoVenta, f.numero)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; font-size: 12px; color: #1A1A1A; padding: 32px; max-width: 760px; margin: 0 auto; position: relative; }
  .cab { display: grid; grid-template-columns: 1fr 90px 1fr; border: 1px solid #1A1A1A; }
  .cab > div { padding: 12px 14px; }
  .letra { border-left: 1px solid #1A1A1A; border-right: 1px solid #1A1A1A; text-align: center; }
  .letra b { display: block; font-size: 40px; line-height: 1; }
  .letra span { font-size: 10px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .dato { margin-top: 3px; }
  .bloque { border: 1px solid #1A1A1A; border-top: none; padding: 10px 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 14px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #1A1A1A; padding: 6px 4px; }
  td { padding: 6px 4px; }
  td:last-child, th:last-child { text-align: right; }
  .totales { margin-top: 10px; margin-left: auto; width: 320px; }
  .totales td { border-top: 1px solid #E0E0E0; }
  .total td { font-weight: 900; font-size: 14px; border-top: 2px solid #1A1A1A; }
  .pie { display: flex; gap: 16px; align-items: center; margin-top: 24px; border-top: 1px solid #1A1A1A; padding-top: 14px; }
  .pie .qr { width: 110px; height: 110px; flex: 0 0 110px; }
  .nota { margin-top: 10px; font-size: 11px; }
  .prueba { position: fixed; top: 40%; left: 0; right: 0; text-align: center; font-size: 46px; font-weight: 900; color: rgba(200,0,0,.25); transform: rotate(-18deg); pointer-events: none; }
  @media print { body { padding: 12px; } @page { size: A4; margin: 14mm; } }
</style></head><body>
${prueba ? '<div class="prueba">SIN VALIDEZ FISCAL · PRUEBA</div>' : ''}
<div class="cab">
  <div>
    <h1>${esc(e.razonSocial ?? '')}</h1>
    ${e.domicilio ? `<div class="dato">${esc(e.domicilio)}</div>` : ''}
    <div class="dato">${esc(nombreCondicionEmisor(e.condicion))}</div>
  </div>
  <div class="letra"><b>${letra}</b><span>Cód. ${String(f.tipoCbte).padStart(3, '0')}</span></div>
  <div>
    <h1>FACTURA</h1>
    <div class="dato">N.º <b>${numeroCompleto(f.puntoVenta, f.numero)}</b></div>
    <div class="dato">Fecha: <b>${fecha(f.fecha)}</b></div>
    <div class="dato">CUIT: ${esc(e.cuit)}</div>
    ${e.ingresosBrutos ? `<div class="dato">Ingresos brutos: ${esc(e.ingresosBrutos)}</div>` : ''}
    ${e.inicioActividades ? `<div class="dato">Inicio de actividades: ${fecha(e.inicioActividades)}</div>` : ''}
  </div>
</div>
<div class="bloque">
  <div><b>${esc(f.receptorNombre ?? (f.docTipo === 99 ? 'Consumidor final' : ''))}</b></div>
  <div class="dato">${esc(doc)} · ${esc(nombreCondicionIva(f.condicionIvaReceptor))}</div>
  <div class="dato">Condición de venta: contado</div>
</div>
<table>
  <thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
  <tbody><tr><td>${esc(f.concepto ?? 'Servicios')}</td><td>${dinero(letra === 'A' ? f.neto + f.exento : f.total)}</td></tr></tbody>
</table>
<table class="totales">
  ${filas}
  <tr class="total"><td>TOTAL</td><td>${dinero(f.total)}</td></tr>
</table>
${transparencia}
<div class="pie">
  <div class="qr">${qrSvgMarkup(qr)}</div>
  <div>
    <div><b>Comprobante autorizado por ARCA</b></div>
    <div class="dato">CAE: <b>${esc(f.cae)}</b></div>
    <div class="dato">Vencimiento del CAE: ${fecha(f.caeVto)}</div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

export function abrirFacturaArca(f: FacturaArcaImprimible, e: EmisorArca) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(generarFacturaArcaHTML(f, e));
  w.document.close();
}
