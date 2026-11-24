'use client';

// La cuenta de Mercado Pago del estudio, cargada desde el panel (autoalojado).
// Apps e integraciones › Mercado Pago. Solo la propietaria: lo vuelve a exigir
// /api/mercadopago/configuracion, que comprueba el token con Mercado Pago antes
// de guardarlo cifrado. El token y la clave nunca vuelven al navegador: se ven
// la cuenta, sus últimos 4 caracteres y la dirección del webhook.

import { useEffect, useState } from 'react';
import { authHeader } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Campo } from '@/components/configuracion/formulario-estudio';
import { inputCls } from '@/components/configuracion/estilos';
import type { CuentaPublica } from '@/lib/mercadopago/cuenta';

type Respuesta = CuentaPublica & { prueba?: { cuenta: string } };

const boton = 'rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background disabled:opacity-50';
const botonSec = 'rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50';

async function llamar(cuerpo?: Record<string, unknown>): Promise<{ ok: true; cuenta: Respuesta } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/mercadopago/configuracion', cuerpo
      ? { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await authHeader()) }, body: JSON.stringify(cuerpo) }
      : { headers: await authHeader(), cache: 'no-store' });
    const d = await res.json().catch(() => null);
    if (!res.ok || !d) return { ok: false, error: d?.error ?? 'No se pudo hablar con el servidor.' };
    return { ok: true, cuenta: d as Respuesta };
  } catch {
    return { ok: false, error: 'Revisá la conexión y volvé a intentar.' };
  }
}

export function CuentaMercadoPago({ showToast }: { showToast: (m: string) => void }) {
  const [cuenta, setCuenta] = useState<Respuesta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<'guardar' | 'probar' | 'quitar' | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  useEffect(() => {
    let vivo = true;
    void llamar().then(r => {
      if (!vivo) return;
      if (r.ok) setCuenta(r.cuenta); else setError(r.error);
    });
    return () => { vivo = false; };
  }, []);

  async function hacer(paso: 'guardar' | 'probar' | 'quitar', cuerpo: Record<string, unknown>, ok: (c: Respuesta) => string) {
    if (enCurso) return;
    setEnCurso(paso);
    setError(null);
    const r = await llamar(cuerpo);
    setEnCurso(null);
    if (!r.ok) { setError(r.error); return; }
    setCuenta(r.cuenta);
    if (paso !== 'probar') { setAccessToken(''); setWebhookSecret(''); setCambiando(false); setConfirmarQuitar(false); }
    showToast(ok(r.cuenta));
  }

  if (!cuenta) return <p className="text-sm text-muted-foreground">{error ?? 'Cargando…'}</p>;

  const delPanel = cuenta.origen === 'panel';
  const verFormulario = !delPanel || cambiando;

  return (
    <div className="space-y-6 rounded-[22px] border border-border bg-card p-5 text-sm sm:p-6" data-testid="cuenta-mercadopago">
      {/* Estado */}
      <section className="space-y-1.5">
        <h3 className="font-semibold text-foreground">Estado</h3>
        {delPanel ? (
          <p className="text-foreground text-pretty">
            Conectada a la cuenta <strong>{cuenta.cuentaNombre ?? cuenta.cuentaId}</strong>
            {cuenta.cuentaId && cuenta.cuentaNombre ? ` (n.º ${cuenta.cuentaId})` : ''}, con el Access Token terminado en <span className="font-mono">{cuenta.tokenFinal}</span>.
            {cuenta.dePrueba && ' Es un token de PRUEBA: no se cobra de verdad.'}
            {cuenta.sitio && cuenta.sitio !== 'MLA' && ` Ojo: es una cuenta de otro país (${cuenta.sitio}), no de Argentina.`}
          </p>
        ) : cuenta.origen === 'servidor' ? (
          <p className="text-foreground text-pretty">
            Cobra con la cuenta configurada en el servidor (el archivo <span className="font-mono">.env</span>), terminada en{' '}
            <span className="font-mono">{cuenta.tokenFinal}</span>. Si cargás tu cuenta acá, pasa a cobrar en la tuya.
          </p>
        ) : (
          <p className="text-muted-foreground text-pretty">Sin conectar: tus alumnas todavía no pueden pagar online.</p>
        )}
        {cuenta.prueba && <p className="text-[color:var(--success)]">Mercado Pago contestó: la cuenta {cuenta.prueba.cuenta} funciona.</p>}
      </section>

      {verFormulario && (
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground">{delPanel ? 'Cambiar los datos' : 'Conectar tu cuenta'}</h3>
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground text-pretty">
            <li>Entrá a <span className="font-mono">mercadopago.com.ar/developers</span> con la cuenta donde querés recibir el dinero y abrí <strong>Tus integraciones</strong>. Si no tenés una aplicación, creá una de tipo <strong>Pagos online · Checkout Pro</strong>.</li>
            <li>En la aplicación, <strong>Credenciales de producción</strong>: copiá el <strong>Access Token</strong> (empieza con <span className="font-mono">APP_USR-</span>). Para probar sin plata real, usá el de una cuenta vendedora de prueba.</li>
            <li>En <strong>Webhooks</strong>, cargá la dirección de abajo con el evento <strong>Pagos</strong>, guardá y copiá la <strong>clave secreta</strong>.</li>
          </ol>
          <div className="grid grid-cols-1 gap-4">
            <Campo label="Access Token">
              {id => <input id={id} className={cn(inputCls, 'font-mono')} type="password" autoComplete="off" spellCheck={false} placeholder="APP_USR-…" value={accessToken} onChange={e => setAccessToken(e.target.value)} />}
            </Campo>
            <Campo label="Clave secreta del webhook">
              {id => <input id={id} className={cn(inputCls, 'font-mono')} type="password" autoComplete="off" spellCheck={false} value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} />}
            </Campo>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button" className={boton} disabled={!!enCurso || !accessToken.trim() || !webhookSecret.trim()}
              onClick={() => void hacer('guardar', { accion: 'guardar', accessToken, webhookSecret }, c => `Mercado Pago conectado${c.cuentaNombre ? `: ${c.cuentaNombre}` : ''}`)}
            >
              {enCurso === 'guardar' ? 'Comprobando con Mercado Pago…' : 'Guardar y comprobar'}
            </button>
            {cambiando && <button type="button" className={botonSec} disabled={!!enCurso} onClick={() => setCambiando(false)}>Cancelar</button>}
          </div>
        </section>
      )}

      {/* La dirección del webhook: la necesita tanto quien conecta como quien revisa. */}
      <section className="space-y-2">
        <h3 className="font-semibold text-foreground">Dirección del webhook</h3>
        {cuenta.webhookUrl ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground">{cuenta.webhookUrl}</code>
              <button
                type="button" className={botonSec}
                onClick={() => { void navigator.clipboard?.writeText(cuenta.webhookUrl ?? '').then(() => showToast('Dirección copiada'), () => showToast('No se pudo copiar: seleccionala a mano')); }}
              >
                Copiar
              </button>
            </div>
            <p className="text-muted-foreground text-pretty">
              Mercado Pago avisa ahí de cada pago. Si un aviso no llega, Centra lo encuentra igual cada 30 minutos, pero tarda más.
              {cuenta.webhookUrl.startsWith('http://') && ' Ojo: empieza con http://. Mercado Pago necesita una dirección pública con https (el túnel de Cloudflare).'}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Falta NEXT_PUBLIC_APP_URL en el servidor: sin ella no se sabe la dirección.</p>
        )}
      </section>

      {delPanel && !cambiando && (
        <section className="flex flex-wrap gap-2">
          <button type="button" className={boton} disabled={!!enCurso} onClick={() => void hacer('probar', { accion: 'probar' }, () => 'La conexión con Mercado Pago funciona')}>
            {enCurso === 'probar' ? 'Hablando con Mercado Pago…' : 'Probar la conexión'}
          </button>
          <button type="button" className={botonSec} disabled={!!enCurso} onClick={() => setCambiando(true)}>Cambiar los datos</button>
          {!confirmarQuitar ? (
            <button type="button" className={botonSec} disabled={!!enCurso} onClick={() => setConfirmarQuitar(true)}>Desconectar</button>
          ) : (
            <div className="w-full space-y-2 rounded-xl border border-border p-3">
              <p className="text-foreground text-pretty">
                Tus alumnas dejan de poder pagar online. Lo ya cobrado no se toca: sigue en tu cuenta de Mercado Pago.
                Si el servidor tiene una cuenta en su <span className="font-mono">.env</span>, se pasa a cobrar con esa.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={boton} disabled={!!enCurso} onClick={() => void hacer('quitar', { accion: 'quitar' }, () => 'Mercado Pago desconectado')}>
                  {enCurso === 'quitar' ? 'Desconectando…' : 'Sí, desconectar'}
                </button>
                <button type="button" className={botonSec} disabled={!!enCurso} onClick={() => setConfirmarQuitar(false)}>No</button>
              </div>
            </div>
          )}
        </section>
      )}

      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
  );
}
