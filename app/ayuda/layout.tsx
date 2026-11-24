import type { Metadata } from 'next';
import { urlDe } from '@/lib/seo/paginas';

// app/ayuda/page.tsx es 'use client' (buscador interactivo), así que la
// metadata de la home del Centro de Ayuda vive aquí — mismo motivo que
// app/recursos/layout.tsx.
export const metadata: Metadata = {
  title: 'Centro de Ayuda — Documentación de Centra',
  description:
    'La documentación oficial de Centra: cómo configurar tu estudio, reservas, pagos, bonos, el portal de reservas, el widget y qué hacer cuando algo falla.',
  alternates: { canonical: urlDe('/ayuda') },
  openGraph: {
    siteName: 'Centra',
    type: 'website',
    title: 'Centro de Ayuda — Centra',
    description: 'La documentación oficial de Centra, paso a paso.',
    url: urlDe('/ayuda'),
    images: [{ url: '/ayuda/opengraph-image' }],
  },
};

export default function AyudaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
