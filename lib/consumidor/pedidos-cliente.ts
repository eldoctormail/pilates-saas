'use client';

// Pedidos de arrepentimiento y de baja, lado PANEL (Clientes › Pedidos). Directo contra Supabase con
// la sesión de quien opera: la RLS de `pedidos_consumidor` es la cerradura (quien gestiona clientas,
// de su sede), no esto. Un UPDATE que la RLS no deja pasar afecta a 0 filas sin dar error: por eso
// la escritura pide `.select('id')` y solo dice «hecho» si vuelve la fila.

import { supabase } from '@/lib/db/supabase';
import type { TipoPedido } from '@/lib/consumidor/pedidos';

export interface PedidoConsumidor {
  id: string;
  codigo: string;
  tipo: TipoPedido;
  nombre: string;
  email: string;
  telefono: string | null;
  documento: string | null;
  detalle: string | null;
  socioId: string | null;
  estado: 'PENDIENTE' | 'ATENDIDO';
  creadoEn: string;
  atendidoEn: string | null;
}

const COLUMNAS = 'id, codigo, tipo, nombre, email, telefono, documento, detalle, socio_id, estado, creado_en, atendido_en';

function aPedido(f: Record<string, unknown>): PedidoConsumidor | null {
  if (typeof f.id !== 'string' || typeof f.codigo !== 'string' || (f.tipo !== 'ARREPENTIMIENTO' && f.tipo !== 'BAJA')) return null;
  const t = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : null);
  return {
    id: f.id, codigo: f.codigo, tipo: f.tipo, nombre: t('nombre') ?? '', email: t('email') ?? '',
    telefono: t('telefono'), documento: t('documento'), detalle: t('detalle'), socioId: t('socio_id'),
    estado: f.estado === 'ATENDIDO' ? 'ATENDIDO' : 'PENDIENTE', creadoEn: t('creado_en') ?? '', atendidoEn: t('atendido_en'),
  };
}

/** `null` = no se pudo cargar (la pantalla lo dice; no pinta «ninguno»). */
export async function listarPedidos(studioId: string, estado: 'PENDIENTE' | 'ATENDIDO'): Promise<PedidoConsumidor[] | null> {
  try {
    let q = supabase.from('pedidos_consumidor').select(COLUMNAS).eq('studio_id', studioId).eq('estado', estado);
    q = estado === 'PENDIENTE' ? q.order('creado_en', { ascending: true }) : q.order('atendido_en', { ascending: false }).limit(100);
    const { data, error } = await q;
    if (error || !Array.isArray(data)) return null;
    return data.map(f => aPedido(f as Record<string, unknown>)).filter((p): p is PedidoConsumidor => p !== null);
  } catch {
    return null;
  }
}

export async function marcarAtendido(id: string, authUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { data, error } = await supabase.from('pedidos_consumidor')
      .update({ estado: 'ATENDIDO', atendido_en: new Date().toISOString(), atendido_por: authUserId })
      .eq('id', id).eq('estado', 'PENDIENTE').select('id');
    if (error) return { ok: false, error: 'No se pudo marcar como atendido.' };
    if (data && data.length === 1) return { ok: true };
    return { ok: false, error: 'No se pudo marcar: puede que ya estuviera atendido o que no tengas permiso.' };
  } catch {
    return { ok: false, error: 'No se pudo marcar como atendido. Revisá la conexión.' };
  }
}
