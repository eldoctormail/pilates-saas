'use client';

// Las facturas de ARCA del estudio, compartidas por todas las pantallas de
// Cobros (el menú de cada recibo y el diálogo de emitir). Se piden una vez por
// sesión de panel y se vuelven a pedir tras emitir. Solo con el formato de
// Argentina: en España no existe y no se pide nada.

import { useEffect, useSyncExternalStore } from 'react';
import { authHeader } from '@/lib/api-client';
import { FUNCIONES_DE_ESPANA } from '@/lib/locale';
import type { CondicionEmisor, EntornoArca } from '@/lib/arca/reglas';
import type { EmisorArca } from '@/lib/arca/pdf';
import type { ComprobanteArca, Receptor } from '@/lib/arca/servidor';

export interface EstadoArca {
  cargado: boolean;
  activa: boolean;
  entorno: EntornoArca | null;
  condicion: CondicionEmisor | null;
  emisor: EmisorArca | null;
  porRecibo: Map<string, ComprobanteArca>;
}

const VACIO: EstadoArca = { cargado: false, activa: false, entorno: null, condicion: null, emisor: null, porRecibo: new Map() };
let estado: EstadoArca = VACIO;
let pedido: Promise<void> | null = null;
const oyentes = new Set<() => void>();

function publicar(e: EstadoArca) {
  estado = e;
  oyentes.forEach(o => o());
}

export function recargarArca(): Promise<void> {
  if (FUNCIONES_DE_ESPANA) return Promise.resolve();
  pedido = (async () => {
    try {
      const res = await fetch('/api/arca/comprobantes', { headers: await authHeader(), cache: 'no-store' });
      const d = res.ok ? await res.json().catch(() => null) : null;
      if (!d) { publicar({ ...VACIO, cargado: true }); return; }
      const porRecibo = new Map<string, ComprobanteArca>();
      for (const c of (d.comprobantes ?? []) as ComprobanteArca[]) {
        // Una factura por recibo (las notas de crédito, cuando existan, irán aparte).
        if ([1, 6, 11].includes(c.tipoCbte) && !porRecibo.has(c.reciboId)) porRecibo.set(c.reciboId, c);
      }
      publicar({ cargado: true, activa: !!d.activa, entorno: d.entorno ?? null, condicion: d.condicion ?? null, emisor: d.emisor ?? null, porRecibo });
    } catch {
      publicar({ ...VACIO, cargado: true });
    }
  })();
  return pedido;
}

export function useArca(): EstadoArca {
  const e = useSyncExternalStore(
    cb => { oyentes.add(cb); return () => { oyentes.delete(cb); }; },
    () => estado,
    () => VACIO,
  );
  useEffect(() => {
    if (!FUNCIONES_DE_ESPANA && !pedido) void recargarArca();
  }, []);
  return e;
}

export type RespuestaEmitir =
  | { ok: true; comprobante: ComprobanteArca }
  | { ok: false; error: string };

export async function emitirFacturaArca(reciboId: string, receptor: Receptor): Promise<RespuestaEmitir> {
  try {
    const res = await fetch('/api/arca/emitir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ reciboId, receptor }),
    });
    const d = await res.json().catch(() => null);
    // Pase lo que pase, se vuelve a leer: un pendiente pudo quedar resuelto.
    void recargarArca();
    if (!res.ok || !d?.comprobante) return { ok: false, error: d?.error ?? 'No se pudo emitir la factura.' };
    return { ok: true, comprobante: d.comprobante as ComprobanteArca };
  } catch {
    return { ok: false, error: 'No se pudo emitir: revisá la conexión. Si volvés a intentar, no se duplica.' };
  }
}
