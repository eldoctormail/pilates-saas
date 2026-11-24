import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';
import { PageShell } from '@/components/recursos/PageShell';
import { IslaWeb } from '@/components/web/IslaWeb';
import { PieWeb } from '@/components/web/PieWeb';
import { CtaBlock } from '@/components/recursos/ArticlePrimitives';
import { PageBreadcrumb } from '@/components/recursos/ArticleStructuredData';
import { OrganizationStructuredData } from '@/components/OrganizationStructuredData';

// La comparativa con el formato de Argentina (es-AR): los programas que se usan
// allí, no los de España. Cada celda es lo que CONSTA en una fuente pública con
// su fecha (24-nov-2026), y la fuente se dice debajo de la tabla:
//  · Reservalo: su propia página de precios para fitness.
//  · Turnito: su ranking de febrero de 2026. MiduApp, CrossHero y Fitco salen
//    de ese mismo ranking, que es de un competidor: se avisa. Las páginas de
//    Fitco no publican precio.
// «No consta» = la fuente no lo dice; nunca se rellena con «sí» ni con «no».
// Lo de Tentare sale de lo que hace el producto en Argentina (lib/mercadopago,
// lib/arca, sin WhatsApp desde que se retiró Twilio).

type Verdict = 'yes' | 'no' | 'partial';

function Mark({ v, label }: { v: Verdict; label: string }) {
  const color = v === 'yes' ? 'var(--w-exito)' : v === 'no' ? 'var(--w-error)' : 'var(--w-aviso)';
  const symbol = v === 'yes' ? '✓' : v === 'no' ? '✗' : '≈';
  return <><span style={{ color, fontWeight: 600 }}>{symbol}</span> {label}</>;
}

const COLUMNAS = ['Reservalo', 'Turnito', 'MiduApp', 'CrossHero', 'Fitco'] as const;

const FILAS: { feature: string; tentare: [Verdict, string]; otros: [Verdict, string][] }[] = [
  {
    feature: 'Precio público',
    tentare: ['yes', 'Gratis hasta 150 reservas al mes; el plan de pago, en Precios'],
    otros: [
      ['yes', 'Starter sin mensualidad o Pro a ARS 9.990/mes'],
      ['yes', 'Gratis (100 reservas/mes) o unos ARS 21.400/mes'],
      ['yes', 'Unos ARS 38.000/mes hasta 100 socios'],
      ['yes', '35 USD/mes'],
      ['partial', 'No lo publica en su web'],
    ],
  },
  {
    feature: 'Comisión sobre lo que cobras',
    tentare: ['yes', 'Sin comisión de Tentare; solo la de Mercado Pago'],
    otros: [
      ['partial', '10 % en Starter, 2 % en Pro'],
      ['partial', '5 % si no pagas el plan fijo'],
      ['partial', 'No consta'],
      ['partial', 'No consta'],
      ['yes', 'Sin cobro por uso, según su web'],
    ],
  },
  {
    feature: 'Cobros con Mercado Pago',
    tentare: ['yes', 'Desde la app de la alumna'],
    otros: [
      ['yes', 'Seña con Mercado Pago'],
      ['yes', 'Mercado Pago y señas'],
      ['partial', 'No consta'],
      ['partial', 'Integrado, según el ranking'],
      ['yes', 'Integración con Mercado Pago'],
    ],
  },
  {
    feature: 'Factura electrónica de ARCA',
    tentare: ['yes', 'Desde el recibo cobrado, con su CAE'],
    otros: [
      ['partial', 'No consta'],
      ['partial', 'No consta'],
      ['yes', 'Incluida en todos los planes'],
      ['partial', 'No consta'],
      ['partial', 'No consta'],
    ],
  },
  {
    feature: 'Recordatorios por WhatsApp',
    tentare: ['no', 'No: avisos por la app y por email'],
    otros: [
      ['yes', 'En Pro, hasta 100 mensajes al mes'],
      ['yes', 'Automáticos'],
      ['no', 'Solo email, según el ranking'],
      ['no', 'Push y email, según el ranking'],
      ['partial', 'Emails y notificaciones'],
    ],
  },
  {
    feature: 'Lista de espera',
    tentare: ['yes', 'Con plazo para aceptar la plaza, si lo activas'],
    otros: [
      ['partial', 'No consta'],
      ['partial', 'No consta'],
      ['partial', 'No consta'],
      ['partial', 'No consta'],
      ['partial', 'No consta'],
    ],
  },
];

const td = (ultima: boolean) => ({ padding: '15px 16px', fontSize: 12.5, color: 'var(--w-texto-2)', borderBottom: ultima ? undefined : '1px solid var(--w-linea)' });

export function ComparativaArgentina() {
  return (
    <PageShell>
      <OrganizationStructuredData />
      <PageBreadcrumb path="/comparativa" name="Comparativa" />
      <IslaWeb />

      <header style={{ position: 'relative', padding: 'clamp(48px,7vw,88px) clamp(20px,4vw,44px) clamp(32px,4vw,44px)' }}>
        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          <h1 style={{ fontWeight: 600, fontSize: 'clamp(34px,5.2vw,58px)', lineHeight: 1.02, letterSpacing: 'var(--w-track-h1)', margin: '0 0 20px' }}>
            <span style={{ fontWeight: 600, display: 'block', fontSize: 14, color: 'var(--w-texto-2)', margin: '0 0 14px', lineHeight: 1.5 }}>Comparativa de software para estudios de Pilates en Argentina</span>{' '}
            Tentare frente a los programas que se usan en Argentina.
          </h1>
          <p style={{ fontSize: 'clamp(17px,1.5vw,20px)', lineHeight: 1.55, color: 'var(--w-texto-2)', maxWidth: 620, margin: 0 }}>Precio, comisión, Mercado Pago, factura de ARCA y avisos: lo que cada uno publica, con la fuente y la fecha. Donde otro hace algo que Tentare no, también lo decimos.</p>
        </div>
      </header>

      <section style={{ padding: 'clamp(8px,2vw,20px) clamp(20px,4vw,44px) clamp(48px,6vw,72px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Reveal style={{ background: '#fff', border: '1px solid var(--w-linea)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 60px -44px rgba(26,26,26,.3)' }}>
            <div className="cmp-hint" style={{ display: 'none', alignItems: 'center', gap: 7, padding: '12px 16px 0', fontSize: 11, color: 'var(--w-texto-3)' }}>
              Desliza la tabla para ver todo
              <ArrowRight size={14} />
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: 980, borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '18px 20px', fontSize: 13, fontWeight: 600, color: 'var(--w-texto-3)', background: 'var(--w-cream)', borderBottom: '1px solid var(--w-linea)', minWidth: 190 }}>Para tu estudio</th>
                    <th style={{ textAlign: 'left', padding: '18px 16px', fontSize: 13, fontWeight: 600, color: 'var(--w-sobre-noche)', background: 'var(--w-olive)', borderBottom: '1px solid var(--w-olive)' }}>Tentare</th>
                    {COLUMNAS.map((c) => (
                      <th key={c} style={{ textAlign: 'left', padding: '18px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--w-texto-2)', background: 'var(--w-cream)', borderBottom: '1px solid var(--w-linea)' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FILAS.map((r, i) => {
                    const ultima = i === FILAS.length - 1;
                    return (
                      <tr key={r.feature}>
                        <td style={{ padding: '15px 20px', fontSize: 14, fontWeight: 600, borderBottom: ultima ? undefined : '1px solid var(--w-linea)' }}>{r.feature}</td>
                        <td style={{ ...td(ultima), color: 'var(--w-texto)', background: 'var(--w-sand-claro)' }}><Mark v={r.tentare[0]} label={r.tentare[1]} /></td>
                        {r.otros.map((o, j) => (
                          <td key={COLUMNAS[j]} style={td(ultima)}><Mark v={o[0]} label={o[1]} /></td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p style={{ fontSize: 13, color: 'var(--w-texto-3)', margin: '16px 4px 0', lineHeight: 1.6 }}>
            Información pública consultada el 24 de noviembre de 2026. Reservalo: su página de precios para fitness. Turnito: su ranking de apps de reservas para gimnasios en Argentina (23-feb-2026); los datos de MiduApp, CrossHero y Fitco salen de ese mismo ranking, escrito por un competidor, y Fitco no publica precios en su web. «No consta» significa que la fuente no lo indica, no que no exista. Los precios en pesos cambian a menudo: verifica siempre con la fuente actual. Reservalo, Turnito, MiduApp, CrossHero y Fitco son marcas de sus respectivos propietarios; esta comparación es orientativa y sin ánimo de menoscabo.
          </p>
        </div>
      </section>

      <section style={{ background: 'var(--w-noche)', color: 'var(--w-sobre-noche)', padding: 'clamp(56px,7vw,88px) clamp(20px,4vw,44px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal style={{ fontWeight: 600, fontSize: 14, color: 'var(--w-sand)', marginBottom: 16 }}>Para que lo sepas antes</Reveal>
          <Reveal delay={80}><h2 style={{ fontWeight: 600, fontSize: 'clamp(26px,3.8vw,42px)', lineHeight: 1.05, letterSpacing: 'var(--w-track-h2)', margin: '0 0 28px', color: 'var(--w-sobre-noche)' }}>Lo que Tentare todavía no tiene.</h2></Reveal>
          <div className="cmp-two">
            <Reveal style={{ background: 'var(--w-noche)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--w-sobre-noche)', margin: '0 0 8px' }}>Recordatorios por WhatsApp</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--w-sobre-noche-2)', margin: 0 }}>Reservalo y Turnito mandan recordatorios por WhatsApp. Tentare avisa a tus alumnas por la app y por email, no por WhatsApp.</p>
            </Reveal>
            <Reveal delay={90} style={{ background: 'var(--w-noche)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--w-sobre-noche)', margin: '0 0 8px' }}>Notas de crédito y factura automática</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--w-sobre-noche-2)', margin: 0 }}>La factura de ARCA se emite desde cada recibo cobrado, con un botón, y las notas de crédito todavía no están: si devuelves un pago, la nota la haces desde ARCA.</p>
            </Reveal>
          </div>
          <Reveal><p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--w-sobre-noche-2)', margin: '24px 0 0' }}>
            Preferimos decírtelo antes de que lo descubras. Para ver cómo se cobra y se factura, mira{' '}
            <Link href="/funcionalidades/cobros-recurrentes" style={{ color: 'var(--w-sand)', fontWeight: 600 }}>los cobros</Link> y{' '}
            <Link href="/funcionalidades/facturacion" style={{ color: 'var(--w-sand)', fontWeight: 600 }}>la factura de ARCA</Link>.
          </p></Reveal>
        </div>
      </section>

      <section style={{ padding: 'clamp(64px,8vw,110px) clamp(20px,4vw,44px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <CtaBlock title="Compruébalo con tu propio estudio." body="Sin permanencia. Sin sorpresas." />
        </div>
      </section>

      <PieWeb />

      <style>{`
        .cmp-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) {
          .cmp-two { grid-template-columns: 1fr; }
          .cmp-hint { display: flex !important; }
        }
      `}</style>
    </PageShell>
  );
}
