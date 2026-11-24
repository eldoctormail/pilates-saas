import type { Metadata } from 'next';

// Ver el comentario de app/network/reanudar/layout.tsx (la versión de
// instructora) — mismo motivo. Privada y autenticada: nunca indexable.
export const metadata: Metadata = {
  title: 'Continúa | Centra Network',
  description: 'Retoma tu cuenta de alumna en Centra Network.',
  robots: { index: false, follow: false },
};

export default function ReanudarAlumnaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
