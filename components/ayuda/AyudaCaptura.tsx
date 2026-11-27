import { ImageOff } from 'lucide-react';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

// Envoltorio de captura de pantalla para un artículo de /ayuda. Si `src` no
// existe todavía en /public/help/, se pinta un estado "captura pendiente"
// EXPLÍCITO en vez de un placeholder genérico o una imagen inventada — la
// instrucción del brief es tajante: nada de capturas falsas ni placeholders
// permanentes. Este estado es temporal por definición: en cuanto se toma la
// captura real y se guarda en la ruta indicada, la misma prop `src` la sirve.
// Las capturas de /public/help/ son del panel del software original: llevan su logo, importes en euros y
// Stripe. En Argentina se enseña la de /public/help/ar/ con la MISMA ruta (sale del panel actual con datos
// argentinos: `node scripts/capturar-ayuda-argentina.mjs`); si no hay versión argentina, no se enseña
// ninguna (el texto del artículo ya explica cada paso).
const CAPTURAS_ARGENTINA = new Set([
  '/help/clientes/ficha-de-clienta.png',
  '/help/clientes/importar-clientes.png',
  '/help/configuracion/equipo-lista-roles.png',
  '/help/empezar/crear-estudio-paso-1.png',
  '/help/instructores/equipo-nuevo-miembro.png',
  '/help/portal/portal-calendario-publico.png',
  '/help/reservas/calendario-nueva-clase.png',
  '/help/reservas/editar-clase-form.png',
]);

export function AyudaCaptura({ src: srcEspana, alt: altEspana, caption: captionEspana, pendiente, argentina }: {
  src?: string; alt: string; caption?: string; pendiente?: string;
  /** Texto de la captura argentina cuando enseña otra cosa que la española. */
  argentina?: { alt: string; caption?: string };
}) {
  if (!ES && (!srcEspana || !CAPTURAS_ARGENTINA.has(srcEspana))) return null;
  const src = ES ? srcEspana : srcEspana?.replace(/^\/help\//, '/help/ar/');
  const alt = !ES && argentina ? argentina.alt : altEspana;
  const caption = !ES && argentina ? argentina.caption : captionEspana;
  return (
    <figure style={{ margin: '20px 0', borderRadius: 16, overflow: 'hidden', border: '1px solid #E7E7E0', background: '#fff' }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- artículos de contenido con muchas capturas distintas; no aporta usar next/image aquí.
        <img src={src} alt={alt} style={{ width: '100%', display: 'block' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 220, background: '#F6F4EF', color: '#8E8E86', padding: 24, textAlign: 'center' }}>
          <ImageOff size={22} aria-hidden />
          <span className="lp-mono" style={{ fontSize: 11.5, letterSpacing: '.04em' }}>Captura pendiente{pendiente ? ` — ${pendiente}` : ''}</span>
        </div>
      )}
      {caption && <figcaption style={{ padding: '10px 16px', fontSize: 12.5, color: '#8E8E86', borderTop: '1px solid #F0F0EA' }}>{caption}</figcaption>}
    </figure>
  );
}
