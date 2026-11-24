'use client';

import { SuscripcionVista } from '@/components/billing/suscripcion-vista';

// Plan de Centra, dentro de Configuración (como «Plan» en la Configuración de Shopify). La vista es
// la misma de /suscripcion, pero embebida: sin marco propio ni título, que ya los pone el shell.
export function SeccionPlan() {
  return (
    <section id="plan-de-tentare" aria-label="Plan de Centra" data-seccion-plan>
      <SuscripcionVista embebida />
    </section>
  );
}
