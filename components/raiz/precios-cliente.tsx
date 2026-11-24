'use client';

// Deja en el navegador los precios de los planes que leyó el servidor
// (lib/billing/precios-servidor.ts), ANTES de que se pinte nada que los use:
// el layout raíz lo pinta antes que el resto, y React pinta de arriba abajo.
// Va en el cuerpo del componente, no en un efecto, justo por eso.
import { fijarPrecios, type Precios } from '@/lib/billing/precios-plataforma';

export function PreciosCliente({ precios }: { precios: Precios }) {
  fijarPrecios(precios);
  return null;
}
