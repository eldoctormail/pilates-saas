'use client';

// Botón de arrepentimiento / Botón de baja de servicio (Argentina, Disposición 954/2025): el
// formulario público. Sin cuenta ni ningún otro trámite: nombre, email y lo que quiere. Al
// enviarlo, el servidor contesta con el código de constancia y se enseña aquí mismo.

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Loader2 } from 'lucide-react';
import { CAMPO_TRAMPA } from '@/lib/auth/trampa-bots';
import { EXPLICACION, NOMBRE_BOTON, textoConstancia, type TipoPedido } from '@/lib/consumidor/pedidos';

const CSS = `
.pc,.pc *{box-sizing:border-box}
.pc{max-width:560px;margin:0 auto;padding:20px 16px 56px;color:var(--portal-ink);font-size:16px;line-height:1.5}
.pc-volver{display:inline-flex;gap:6px;align-items:center;font-size:14px;font-weight:700;color:var(--portal-muted);text-decoration:none}
.pc h1{font-size:26px;line-height:1.2;margin:18px 0 8px;font-weight:800}
.pc-lead{margin:0 0 18px;color:var(--portal-muted)}
.pc-f{display:block;margin-top:14px}
.pc-eti{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;font-weight:700;margin:0 0 6px 2px}
.pc-eti em{font-style:normal;font-weight:600;font-size:12px;color:var(--portal-muted)}
.pc-in{width:100%;min-height:50px;padding:12px 14px;border-radius:14px;border:1.5px solid var(--portal-line);background:var(--portal-surface);color:inherit;font:inherit;font-size:16px}
textarea.pc-in{min-height:96px;resize:vertical}
.pc-in:focus-visible,.pc button:focus-visible,.pc a:focus-visible{outline:3px solid color-mix(in srgb,var(--portal-brand) 60%,transparent);outline-offset:2px}
.pc-enviar{margin-top:22px;width:100%;min-height:54px;border:0;border-radius:16px;background:var(--portal-brand);color:var(--portal-brand-foreground);font:inherit;font-size:17px;font-weight:800;cursor:pointer;display:inline-flex;gap:9px;align-items:center;justify-content:center}
.pc-enviar:disabled{opacity:.7;cursor:progress}
.pc-error{margin-top:14px;padding:12px 14px;border-radius:14px;border:1.5px solid var(--danger);font-weight:600}
.pc-trampa{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.pc-ok{margin-top:18px;padding:18px;border-radius:18px;border:1.5px solid var(--portal-line);background:var(--portal-surface)}
.pc-codigo{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:12px 0 4px;padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--portal-brand) 8%,transparent);font-size:24px;font-weight:800;letter-spacing:.06em;font-variant-numeric:tabular-nums}
.pc-copiar{border:1.5px solid var(--portal-line);background:transparent;border-radius:999px;min-height:40px;padding:0 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;gap:6px;align-items:center;color:inherit}
.pc-nota{font-size:13px;color:var(--portal-muted);margin:10px 2px 0}
.pc-giro{animation:pc-g .9s linear infinite}@keyframes pc-g{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.pc *{animation:none!important}}
`;

export function PedidoConsumidor({ slug, tipo, nombreEstudio }: { slug: string; tipo: TipoPedido; nombreEstudio: string }) {
  const [f, setF] = useState({ nombre: '', email: '', telefono: '', documento: '', detalle: '' });
  const [trampa, setTrampa] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<{ codigo: string; creadoEn: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const titulo = NOMBRE_BOTON[tipo];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);
    try {
      const r = await fetch('/api/public/pedidos-consumidor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, tipo, ...f, [CAMPO_TRAMPA]: trampa }),
      });
      const j = (await r.json().catch(() => ({}))) as { codigo?: string; creadoEn?: string; error?: string };
      if (!r.ok || !j.codigo) { setError(j.error ?? 'No pudimos registrar tu pedido. Probá de nuevo en un rato o pedilo en el estudio.'); return; }
      setHecho({ codigo: j.codigo, creadoEn: j.creadoEn ?? new Date().toISOString() });
    } catch {
      setError('No pudimos registrar tu pedido. Revisá tu conexión y probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  async function copiar() {
    if (!hecho) return;
    try { await navigator.clipboard.writeText(hecho.codigo); setCopiado(true); } catch { setCopiado(false); }
  }

  const campo = (k: keyof typeof f, etiqueta: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, opcional = false) => (
    <label className="pc-f">
      <span className="pc-eti">{etiqueta}{opcional && <em>Opcional</em>}</span>
      <input className="pc-in" value={f[k]} onChange={ev => { const v = ev.target.value; setF(x => ({ ...x, [k]: v })); }} {...extra} />
    </label>
  );

  return (
    <main className="pc">
      <style>{CSS}</style>
      <Link href={`/reservar/${slug}`} className="pc-volver"><ArrowLeft size={16} aria-hidden /> Volver a {nombreEstudio}</Link>
      <h1>{titulo}</h1>
      <p className="pc-lead">{EXPLICACION[tipo]}</p>

      {hecho ? (
        <section className="pc-ok" aria-live="polite">
          <p style={{ margin: 0, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}><Check size={20} aria-hidden /> Pedido registrado</p>
          <p style={{ margin: '8px 0 0' }}>{textoConstancia(tipo, hecho.codigo, nombreEstudio)}</p>
          <div className="pc-codigo">
            <span data-testid="codigo-constancia">{hecho.codigo}</span>
            <button type="button" className="pc-copiar" onClick={copiar}>
              {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="pc-nota">
            Registrado el {new Date(hecho.creadoEn).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}. {nombreEstudio} te va a responder por email.
          </p>
        </section>
      ) : (
        <form onSubmit={enviar} noValidate>
          {campo('nombre', 'Nombre y apellido', { autoComplete: 'name', required: true, maxLength: 120 })}
          {campo('email', 'Email', { type: 'email', autoComplete: 'email', inputMode: 'email', required: true, maxLength: 200 })}
          {campo('telefono', 'Teléfono', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 32 }, true)}
          {campo('documento', 'DNI', { inputMode: 'numeric', maxLength: 20 }, true)}
          <label className="pc-f">
            <span className="pc-eti">{tipo === 'ARREPENTIMIENTO' ? 'Qué compra querés revocar' : 'Qué querés dar de baja'}<em>Opcional</em></span>
            <textarea className="pc-in" maxLength={1000} value={f.detalle} onChange={ev => { const v = ev.target.value; setF(x => ({ ...x, detalle: v })); }}
              placeholder={tipo === 'ARREPENTIMIENTO' ? 'Por ejemplo: el bono de 8 clases que compré el martes' : 'Por ejemplo: mi plan mensual'} />
          </label>
          <div className="pc-trampa" aria-hidden>
            <label>No completar <input tabIndex={-1} autoComplete="off" value={trampa} onChange={ev => setTrampa(ev.target.value)} name={CAMPO_TRAMPA} /></label>
          </div>
          {error && <p role="alert" className="pc-error">{error}</p>}
          <button type="submit" className="pc-enviar" disabled={enviando}>
            {enviando && <Loader2 size={18} className="pc-giro" aria-hidden />}
            {tipo === 'ARREPENTIMIENTO' ? 'Pedir la revocación' : 'Pedir la baja'}
          </button>
          <p className="pc-nota">No hace falta tener cuenta. Al enviarlo te damos un código de constancia.</p>
        </form>
      )}
    </main>
  );
}
