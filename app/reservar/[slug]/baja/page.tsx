import { notFound } from 'next/navigation';
import { PedidoConsumidor } from '@/components/consumidor/pedido-consumidor';
import { botonesConsumidorActivos, NOMBRE_BOTON } from '@/lib/consumidor/pedidos';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { resolverStudioPorSlug } from '@/lib/db/supabase-data-admin';

export const metadata = { title: NOMBRE_BOTON.BAJA, robots: { index: false, follow: false } };

// Disposición 954/2025 (Argentina): sin cuenta ni ningún trámite previo.
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!botonesConsumidorActivos()) notFound();
  const { slug } = await params;
  const admin = getSupabaseAdmin();
  const estudio = admin ? await resolverStudioPorSlug(admin, slug) : null;
  if (!estudio) notFound();
  return <PedidoConsumidor slug={slug} tipo="BAJA" nombreEstudio={(estudio.row.nombre as string | null) || 'el estudio'} />;
}
