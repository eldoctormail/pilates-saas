'use client';

// «Emitir factura de ARCA» de un recibo cobrado. Se elige la condición frente al
// IVA de quien la recibe (obligatoria desde la RG 5616) y su documento; la letra
// y los importes se ven ANTES de emitir. Nada optimista: «emitida» solo con el
// CAE que devuelve el servidor.

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  CONDICIONES_IVA_RECEPTOR, CONSUMIDOR_FINAL, documentoDelReceptor, importes, letraDeFactura, numeroCompleto,
} from '@/lib/arca/reglas';
import { abrirFacturaArca } from '@/lib/arca/pdf';
import { emitirFacturaArca, useArca } from '@/components/arca/use-arca';
import type { ComprobanteArca } from '@/lib/arca/servidor';

// Una factura de ARCA va siempre en pesos (MonId PES), sea cual sea la moneda del panel.
const dinero = (n: number) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function DialogoEmitirArca({ recibo, alumna, ivaEstudio, onCerrar, onEmitida }: {
  recibo: { id: string; concepto: string; importe: number } | null;
  alumna: { nombre: string; documento: string | null } | null;
  ivaEstudio: number;
  onCerrar: () => void;
  onEmitida: (texto: string) => void;
}) {
  const arca = useArca();
  const [condicion, setCondicion] = useState(CONSUMIDOR_FINAL);
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecha, setHecha] = useState<ComprobanteArca | null>(null);
  const [abiertoPara, setAbiertoPara] = useState<string | null>(null);

  if (recibo && abiertoPara !== recibo.id) {
    setAbiertoPara(recibo.id);
    setCondicion(CONSUMIDOR_FINAL);
    setDocumento(alumna?.documento ?? '');
    setNombre(alumna?.nombre ?? '');
    setError(null);
    setHecha(null);
  }

  if (!recibo || !arca.condicion) return null;
  const letra = letraDeFactura(arca.condicion, condicion);
  const imp = importes(recibo.importe, letra, arca.condicion === 'MONOTRIBUTO' ? 0 : ivaEstudio);
  const doc = documentoDelReceptor(documento, letra, condicion, recibo.importe);
  const problema = !imp.ok ? imp.error : !doc.ok ? doc.error : null;

  async function emitir() {
    if (!recibo || enviando || problema) return;
    setEnviando(true);
    setError(null);
    const r = await emitirFacturaArca(recibo.id, { documento: documento.trim() || null, condicionIva: condicion, nombre: nombre.trim() || null });
    setEnviando(false);
    if (!r.ok) { setError(r.error); return; }
    setHecha(r.comprobante);
    onEmitida(`Factura ${letra} ${numeroCompleto(r.comprobante.puntoVenta, r.comprobante.numero)} emitida.`);
  }

  function imprimir(c: ComprobanteArca) {
    if (!arca.emisor || !c.cae || !c.caeVto) return;
    abrirFacturaArca({ ...c, cae: c.cae, caeVto: c.caeVto }, arca.emisor);
  }

  return (
    <Dialog open onOpenChange={o => { if (!o && !enviando) onCerrar(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {hecha ? 'Factura emitida' : `Emitir factura ${letra} de ARCA`}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">{recibo.concepto} · {dinero(recibo.importe)}</div>
        </DialogHeader>

        {arca.entorno === 'homologacion' && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
            Estás en el entorno de prueba de ARCA: la factura no tiene validez fiscal.
          </p>
        )}

        {hecha ? (
          <div className="space-y-3 text-sm">
            <p className="text-foreground">
              Factura {letra} <b>{numeroCompleto(hecha.puntoVenta, hecha.numero)}</b>, CAE <b>{hecha.cae}</b>.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => imprimir(hecha)} className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background">
                Ver o imprimir
              </button>
              <button type="button" onClick={onCerrar} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">
                Listo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">Condición frente al IVA de quien la recibe</span>
              <select
                value={condicion}
                onChange={e => setCondicion(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              >
                {CONDICIONES_IVA_RECEPTOR.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                {letra === 'A' ? 'CUIT' : 'DNI o CUIT'}{letra !== 'A' && condicion === CONSUMIDOR_FINAL ? ' (opcional)' : ''}
              </span>
              <input
                value={documento}
                inputMode="numeric"
                onChange={e => setDocumento(e.target.value)}
                className={cn('w-full rounded-lg border bg-background px-3 py-2 text-foreground', doc.ok ? 'border-border' : 'border-destructive')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">Nombre o razón social</span>
              <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
            </label>

            {imp.ok && (
              <dl className="rounded-lg bg-muted/50 px-3 py-2 text-xs">
                {letra !== 'C' && imp.valor.alicuota !== null && (
                  <>
                    <div className="flex justify-between"><dt>Neto</dt><dd>{dinero(imp.valor.neto)}</dd></div>
                    <div className="flex justify-between"><dt>IVA {String(imp.valor.alicuota).replace('.', ',')} %</dt><dd>{dinero(imp.valor.iva)}</dd></div>
                  </>
                )}
                {letra !== 'C' && imp.valor.exento > 0 && <div className="flex justify-between"><dt>Exento</dt><dd>{dinero(imp.valor.exento)}</dd></div>}
                <div className="flex justify-between font-semibold text-foreground"><dt>Total</dt><dd>{dinero(imp.valor.total)}</dd></div>
              </dl>
            )}

            {(problema || error) && <p role="alert" className="text-sm text-destructive">{error ?? problema}</p>}

            <button
              type="button"
              onClick={() => void emitir()}
              disabled={!!problema || enviando}
              aria-busy={enviando}
              className="w-full rounded-lg bg-foreground px-3 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              {enviando ? 'Pidiendo el CAE a ARCA…' : `Emitir factura ${letra}`}
            </button>
            <p className="text-xs text-muted-foreground">Una factura emitida no se borra. Si hay que anularla, se hace con una nota de crédito (por ahora, desde ARCA).</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function imprimirFacturaArca(c: ComprobanteArca, emisor: Parameters<typeof abrirFacturaArca>[1]) {
  if (!c.cae || !c.caeVto) return;
  abrirFacturaArca({ ...c, cae: c.cae, caeVto: c.caeVto }, emisor);
}
