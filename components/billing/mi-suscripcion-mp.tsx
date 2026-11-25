'use client';

// «Mi suscripción» cuando el estudio paga a Centra con Mercado Pago: lo que
// paga, cuándo se cobra y la baja, LEÍDO de Mercado Pago (/api/billing/
// mercadopago/suscripcion). La tarjeta se cambia en la cuenta de Mercado Pago
// de la propietaria: Centra no la ve ni la guarda.
//
// Es dinero: la baja no se anuncia hasta que el servidor confirma que Mercado
// Pago la canceló.

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { darDeBajaMp, miSuscripcionMp, type MiSuscripcionMpApi } from '@/lib/api-client';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { precio } from '@/lib/billing/intervalo-ui';
import { ZONA_HORARIA } from '../../lib/zona-horaria.ts';
import { cn } from '@/lib/utils';

const URL_SUSCRIPCIONES_MP = 'https://www.mercadopago.com.ar/subscriptions';

const dia = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA_HORARIA }) : null;

const TEXTO: Record<MiSuscripcionMpApi['estado'], string> = {
  al_dia: 'Al día',
  impago: 'El último cobro no salió',
  baja_programada: 'Dada de baja',
  pendiente: 'Esperando el primer pago',
  cancelada: 'Cancelada',
};

export function MiSuscripcionMp({ onCambio, className }: { onCambio?: () => void; className?: string }) {
  const [d, setD] = useState<MiSuscripcionMpApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(() => {
    void miSuscripcionMp().then((r) => {
      if ('error' in r) { setError(r.error); return; }
      setD(r); setError(null);
    });
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function baja() {
    setTrabajando(true);
    const r = await darDeBajaMp();
    setTrabajando(false);
    setConfirmar(false);
    if ('error' in r || !r.ok) { setError('error' in r ? r.error : 'Mercado Pago no confirmó la baja. Recargá en unos segundos para ver cómo quedó.'); return; }
    cargar();
    onCambio?.();
  }

  return (
    <section aria-label="Tu suscripción en Mercado Pago" className={cn('rounded-2xl border border-border bg-card p-6 sm:p-7', className)}>
      <h2 className="text-[16px] font-semibold text-foreground">Tu suscripción en Mercado Pago</h2>
      {error && <p role="alert" className="mt-3 text-[13.5px] text-destructive">{error}</p>}
      {!d && !error && (
        <p className="mt-3 flex items-center gap-2 text-[13.5px] text-muted-foreground">
          <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Leyendo tu suscripción…
        </p>
      )}
      {d && (
        <dl className="mt-3 grid gap-2 text-[13.5px] sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Estado</dt><dd className="font-semibold text-foreground">{TEXTO[d.estado]}</dd></div>
          {d.importe !== null && <div><dt className="text-muted-foreground">Se cobra</dt><dd className="font-semibold tabular-nums text-foreground">{precio(d.importe, '')} por mes</dd></div>}
          {dia(d.proximoCobro) && <div><dt className="text-muted-foreground">Próximo cobro</dt><dd className="font-semibold text-foreground">{dia(d.proximoCobro)}</dd></div>}
          {dia(d.accesoHasta) && <div><dt className="text-muted-foreground">Tenés el plan hasta el</dt><dd className="font-semibold text-foreground">{dia(d.accesoHasta)}</dd></div>}
        </dl>
      )}
      <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
        La tarjeta y los comprobantes de cada cobro están en{' '}
        <a href={URL_SUSCRIPCIONES_MP} target="_blank" rel="noreferrer" className="font-semibold text-foreground underline underline-offset-2">tus suscripciones de Mercado Pago</a>.
        Para cambiar de plan, elegí otro abajo: el nuevo empieza a cobrarse cuando termina lo que ya pagaste.
      </p>
      {d?.puedeCancelar && (
        <button
          type="button"
          onClick={() => setConfirmar(true)}
          className="mt-4 text-[13.5px] font-semibold text-destructive underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Dar de baja la suscripción
        </button>
      )}
      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        titulo="¿Dar de baja la suscripción?"
        descripcion={`Mercado Pago deja de cobrarte desde hoy. Seguís con tu plan hasta el ${dia(d?.proximoCobro ?? null) ?? 'final de lo que ya pagaste'}, y tus datos no se borran.`}
        textoConfirmar={trabajando ? 'Dando de baja…' : 'Dar de baja'}
        destructivo
        onConfirm={() => { if (!trabajando) void baja(); }}
      />
    </section>
  );
}
