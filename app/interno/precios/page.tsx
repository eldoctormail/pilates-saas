'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Precios de los planes: lo que paga cada estudio por usar Centra, en la moneda
// de la instalación (pesos). Se guardan en `ajustes_plataforma` y se ven al
// momento en la web, /precios, el alta y la suscripción
// (lib/billing/precios-plataforma.ts). Editarlos pide `plans.update`.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { fetchPrecios, guardarPrecios, type RespuestaPrecios } from '@/lib/interno/client';
import { tienePermiso } from '@/lib/interno/permisos';
import { CLAVES_COMPLEMENTO, CLAVES_PLAN, type ClavePrecio, type Precios } from '@/lib/billing/precios-plataforma';
import { ADDONS, MESES_PAGADOS_AL_ANO, PLAN_INFO } from '@/lib/billing/entitlements';
import { formatoMoneda, MONEDA_NOMBRE_PLURAL, MONEDA_SIMBOLO } from '@/lib/moneda';
import { ZONA_HORARIA } from '@/lib/zona-horaria';
import { useSesionInterna } from '../layout';

const NOMBRE: Record<ClavePrecio, string> = {
  BASE: PLAN_INFO.BASE.nombre, ESTUDIO: PLAN_INFO.ESTUDIO.nombre, CADENA: PLAN_INFO.CADENA.nombre,
  decisiones: ADDONS.decisiones.nombre, sustituciones: ADDONS.sustituciones.nombre, ia: ADDONS.ia.nombre,
};
const DETALLE: Partial<Record<ClavePrecio, string>> = {
  BASE: 'Lo que paga un estudio cuando pasa del límite gratis.',
  ESTUDIO: 'Incluye los tres complementos.',
  CADENA: 'Varias sedes en una sola suscripción.',
};

const aTexto = (p: Precios) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) as Record<ClavePrecio, string>;
/** «29.000» o «29.000,50» → número. Vacío o raro → NaN. */
function aNumero(t: string): number {
  const limpio = t.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
}

export default function PreciosInterno() {
  const sesion = useSesionInterna();
  const puedeEditar = tienePermiso(sesion.permisos, 'plans.update');
  const [datos, setDatos] = useState<RespuestaPrecios | null>(null);
  const [valores, setValores] = useState<Record<ClavePrecio, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await fetchPrecios();
      setDatos(r); setValores(aTexto(r.precios)); setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se han podido cargar los precios.'); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void cargar(); }, [cargar]);

  if (!datos && !error) return <p className="text-[13.5px] text-muted-foreground">Cargando…</p>;

  const numeros = valores ? (Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, aNumero(v)])) as Precios) : null;
  const invalido = (k: ClavePrecio) => !numeros || !(numeros[k] > 0);
  const hayInvalidos = [...CLAVES_PLAN, ...CLAVES_COMPLEMENTO].some(invalido);
  const cambiado = !!datos && !!numeros && [...CLAVES_PLAN, ...CLAVES_COMPLEMENTO].some((k) => numeros[k] !== datos.precios[k]);

  async function guardar() {
    if (!numeros || hayInvalidos) return;
    setGuardando(true); setError(null); setAviso(null);
    try {
      const r = await guardarPrecios(numeros);
      setDatos((d) => (d ? { ...d, precios: r.precios, guardadosEn: new Date().toISOString() } : d));
      setValores(aTexto(r.precios));
      setAviso('Precios guardados. Ya se ven en la web, en /precios, en el alta y en la suscripción.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se han podido guardar.'); }
    finally { setGuardando(false); }
  }

  const fila = (k: ClavePrecio) => (
    <div key={k} className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3 first:border-t-0">
      <div className="min-w-0">
        <label htmlFor={`precio-${k}`} className="text-[13.5px] font-semibold text-foreground">{NOMBRE[k]}</label>
        <p className="text-[12px] text-muted-foreground">
          {DETALLE[k] ? `${DETALLE[k]} ` : ''}
          {numeros && numeros[k] > 0 && `Al año: ${formatoMoneda(numeros[k] * MESES_PAGADOS_AL_ANO, 'auto')}.`}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] text-muted-foreground">{MONEDA_SIMBOLO}</span>
        <input
          id={`precio-${k}`} inputMode="decimal" disabled={!puedeEditar || guardando}
          value={valores?.[k] ?? ''} aria-invalid={invalido(k) || undefined}
          onChange={(e) => setValores((v) => (v ? { ...v, [k]: e.target.value } : v))}
          className="h-10 w-36 rounded-xl border border-border bg-background px-3 text-right text-[14px] tabular-nums text-foreground aria-[invalid]:border-destructive disabled:opacity-60"
        />
        <span className="text-[12.5px] text-muted-foreground">/mes</span>
      </div>
    </div>
  );

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <header>
        <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Precios de los planes</h1>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
          Lo que paga cada estudio por usar Centra, en {MONEDA_NOMBRE_PLURAL} y por mes. El pago anual son {MESES_PAGADOS_AL_ANO} meses
          (dos de regalo). Al guardar, los precios nuevos se ven en la web, en /precios, en el alta y en la pantalla de suscripción.
        </p>
        {datos?.guardadosEn && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            Última vez que se guardaron: {new Date(datos.guardadosEn).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA_HORARIA })}.
          </p>
        )}
        {datos && !datos.guardadosEn && (
          <p className="mt-1 text-[12px] text-warning">Todavía no se guardaron precios: se están usando los de partida.</p>
        )}
      </header>

      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">{error}</p>}
      {aviso && <p role="status" className="rounded-xl bg-success/10 px-4 py-2.5 text-[13px] text-success">{aviso}</p>}

      {valores && (
        <>
          <section className="rounded-2xl border border-border bg-card px-4 py-2" aria-labelledby="precios-planes">
            <h2 id="precios-planes" className="pt-2 text-[14px] font-bold text-foreground">Planes</h2>
            {CLAVES_PLAN.map(fila)}
          </section>
          <section className="rounded-2xl border border-border bg-card px-4 py-2" aria-labelledby="precios-complementos">
            <h2 id="precios-complementos" className="pt-2 text-[14px] font-bold text-foreground">Complementos de {PLAN_INFO.BASE.nombre}</h2>
            {CLAVES_COMPLEMENTO.map(fila)}
          </section>
          {puedeEditar ? (
            <div className="flex items-center gap-3">
              <button
                type="button" onClick={() => void guardar()} disabled={guardando || hayInvalidos || !cambiado}
                className="min-h-10 rounded-xl bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground disabled:opacity-50"
              >
                {guardando ? 'Guardando…' : 'Guardar precios'}
              </button>
              {hayInvalidos && <span className="text-[12.5px] text-destructive">Cada precio tiene que ser mayor que cero.</span>}
            </div>
          ) : (
            <p className="text-[12.5px] text-muted-foreground">Para cambiarlos hace falta el permiso «Crear y editar los planes de precio».</p>
          )}
        </>
      )}
    </div>
  );
}
