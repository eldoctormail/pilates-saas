'use client';

// Pedidos del Botón de arrepentimiento y del Botón de baja de servicio (Argentina, Disp. 954/2025).
// Vive DENTRO de Clientes (sin entrada nueva en el menú): se llega desde la bandeja «por decidir» y
// desde el aviso. Lo que hay que hacer con cada pedido (devolver el dinero, dar de baja el plan) se
// hace donde siempre, en la ficha o en Cobros; aquí se ve el pedido y se marca atendido.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useStudio } from '@/lib/studio-context';
import { useAuth } from '@/lib/auth-context';
import { useRol, puedeGestionarClientas } from '@/lib/permisos';
import { listarPedidos, marcarAtendido, type PedidoConsumidor } from '@/lib/consumidor/pedidos-cliente';
import { botonesConsumidorActivos, NOMBRE_BOTON } from '@/lib/consumidor/pedidos';

const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function PedidosConsumidorPage() {
  const { studio } = useStudio();
  const { user } = useAuth();
  const rol = useRol();
  const [pendientes, setPendientes] = useState<PedidoConsumidor[] | null | undefined>(undefined);
  const [atendidos, setAtendidos] = useState<PedidoConsumidor[] | null | undefined>(undefined);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const studioId = studio?.id ?? null;

  const cargar = useCallback(async () => {
    if (!studioId) return;
    const [p, a] = await Promise.all([listarPedidos(studioId, 'PENDIENTE'), listarPedidos(studioId, 'ATENDIDO')]);
    setPendientes(p); setAtendidos(a);
  }, [studioId]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function atender(p: PedidoConsumidor) {
    if (ocupado || !user?.id) return;
    setOcupado(p.id); setError(null);
    const r = await marcarAtendido(p.id, user.id);
    setOcupado(null);
    if (!r.ok) { setError(r.error); return; }
    await cargar();
  }

  if (!botonesConsumidorActivos()) return <EmptyState titulo="No disponible" descripcion="Los botones de arrepentimiento y de baja son para estudios en Argentina." />;
  if (!puedeGestionarClientas(rol)) return <EmptyState titulo="Sin acceso" descripcion="Los pedidos los gestiona quien gestiona las clientas." />;

  const tarjeta = (p: PedidoConsumidor) => (
    <li key={p.id} className="rounded-t-card border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{NOMBRE_BOTON[p.tipo]} · <span className="font-mono">{p.codigo}</span></p>
        <p className="text-[13px] text-muted-foreground">{fecha(p.creadoEn)}</p>
      </div>
      <p className="mt-2 text-[14px]">
        {p.socioId ? <Link className="underline" href={`/clientas/${p.socioId}`}>{p.nombre}</Link> : p.nombre}
        {' · '}<a className="underline" href={`mailto:${p.email}?subject=${encodeURIComponent(`Tu pedido ${p.codigo}`)}`}>{p.email}</a>
        {p.telefono ? ` · ${p.telefono}` : ''}{p.documento ? ` · DNI ${p.documento}` : ''}
      </p>
      {!p.socioId && <p className="mt-1 text-[13px] text-muted-foreground">El email no coincide con ninguna ficha: buscala por nombre o DNI.</p>}
      {p.detalle && <p className="mt-2 whitespace-pre-wrap text-[14px]">{p.detalle}</p>}
      {p.estado === 'PENDIENTE' ? (
        <button type="button" onClick={() => atender(p)} disabled={ocupado !== null}
          className="mt-3 min-h-10 rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground disabled:opacity-60">
          {ocupado === p.id ? 'Marcando…' : 'Marcar como atendido'}
        </button>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">Atendido el {fecha(p.atendidoEn)}</p>
      )}
    </li>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PageHeader title="Pedidos de arrepentimiento y baja"
        description="Los que llegaron desde tu web con el Botón de arrepentimiento o el Botón de baja de servicio. Respondé a cada persona y, cuando esté resuelto (devolución o baja hechas en su ficha o en Cobros), marcalo como atendido." />
      {error && <p role="alert" className="mt-4 rounded-xl border border-destructive p-3 text-[14px] font-medium">{error}</p>}
      <h2 className="mt-6 text-[15px] font-semibold">Por atender</h2>
      {pendientes === undefined ? <p className="mt-2 text-[14px] text-muted-foreground">Cargando…</p>
        : pendientes === null ? <p role="alert" className="mt-2 text-[14px]">No se pudieron cargar los pedidos. Probá de nuevo en un momento.</p>
        : pendientes.length === 0 ? <p className="mt-2 text-[14px] text-muted-foreground">No hay pedidos por atender.</p>
        : <ul className="mt-3 grid gap-3">{pendientes.map(tarjeta)}</ul>}
      <h2 className="mt-8 text-[15px] font-semibold">Atendidos</h2>
      {atendidos === undefined ? null
        : atendidos === null ? <p role="alert" className="mt-2 text-[14px]">No se pudieron cargar.</p>
        : atendidos.length === 0 ? <p className="mt-2 text-[14px] text-muted-foreground">Todavía ninguno.</p>
        : <ul className="mt-3 grid gap-3">{atendidos.map(tarjeta)}</ul>}
    </div>
  );
}
