// Los dos enlaces que exige la Disposición 954/2025 (Argentina), con su nombre exacto, visibles
// en la página pública del estudio. Solo con `botonesConsumidorActivos()`: en España no salen.
import Link from 'next/link';
import { botonesConsumidorActivos, NOMBRE_BOTON, rutaPedido } from '@/lib/consumidor/pedidos';

export function BotonesConsumidor({ slug, style }: { slug: string; style?: React.CSSProperties }) {
  if (!botonesConsumidorActivos()) return null;
  const enlace: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '0 14px', borderRadius: 999,
    border: '1.5px solid var(--portal-line)', color: 'var(--portal-ink)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
  };
  return (
    <nav aria-label="Derechos del consumidor"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: '16px 20px 28px', ...style }}>
      <Link href={rutaPedido(slug, 'ARREPENTIMIENTO')} style={enlace}>{NOMBRE_BOTON.ARREPENTIMIENTO}</Link>
      <Link href={rutaPedido(slug, 'BAJA')} style={enlace}>{NOMBRE_BOTON.BAJA}</Link>
    </nav>
  );
}
