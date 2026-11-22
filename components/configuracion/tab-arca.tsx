'use client';

// «Factura electrónica de ARCA» (Argentina): el cajón de su fila en Cobros y
// facturas. Solo la propietaria. Tres pasos, cada uno se guarda por el servidor
// (/api/arca/configuracion) y la pantalla cambia solo con lo que contesta:
//   1. Los datos ante ARCA (CUIT, condición, punto de venta, entorno…).
//   2. El certificado: el servidor genera la clave (no sale de él) y el pedido
//      (CSR); se sube a ARCA y se pega acá el certificado que devuelve.
//   3. Probar la conexión: pide el acceso y el último número autorizado.

import { useEffect, useState } from 'react';
import { authHeader } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useStudio } from '@/lib/studio-context';
import { Campo } from '@/components/configuracion/formulario-estudio';
import { inputCls } from '@/components/configuracion/estilos';
import type { PropsFormularioCajon } from '@/components/configuracion/shell/cajon-ajuste';
import { recargarArca } from '@/components/arca/use-arca';
import { numeroCompleto } from '@/lib/arca/reglas';

interface Config {
  configurada: boolean;
  cuit?: string; condicion?: 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO'; puntoVenta?: number; entorno?: 'homologacion' | 'produccion';
  razonSocial?: string | null; domicilio?: string | null; ingresosBrutos?: string | null; inicioActividades?: string | null;
  tieneClave?: boolean; csr?: string | null; certificado?: { vence: string | null } | null; lista?: boolean;
  prueba?: { entorno: string; puntoVenta: number; ultimos: Record<string, number> };
}

const boton = 'rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background disabled:opacity-50';
const botonSec = 'rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50';

async function llamar(cuerpo?: Record<string, unknown>): Promise<{ ok: true; config: Config } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/arca/configuracion', cuerpo
      ? { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await authHeader()) }, body: JSON.stringify(cuerpo) }
      : { headers: await authHeader(), cache: 'no-store' });
    const d = await res.json().catch(() => null);
    if (!res.ok || !d) return { ok: false, error: d?.error ?? 'No se pudo hablar con el servidor.' };
    return { ok: true, config: d as Config };
  } catch {
    return { ok: false, error: 'Revisá la conexión y volvé a intentar.' };
  }
}

export function FormFacturaElectronica({ showToast }: PropsFormularioCajon) {
  const { studio } = useStudio();
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [datos, setDatos] = useState({
    cuit: '', condicion: 'MONOTRIBUTO', puntoVenta: '', entorno: 'homologacion',
    razonSocial: '', domicilio: '', ingresosBrutos: '', inicioActividades: '',
  });
  const [certificado, setCertificado] = useState('');

  function aplicar(c: Config) {
    setConfig(c);
    setDatos({
      cuit: c.cuit ?? (studio?.nif ?? '').replace(/\D/g, ''),
      condicion: c.condicion ?? 'MONOTRIBUTO',
      puntoVenta: c.puntoVenta ? String(c.puntoVenta) : '',
      entorno: c.entorno ?? 'homologacion',
      razonSocial: c.razonSocial ?? studio?.razonSocial ?? studio?.nombre ?? '',
      domicilio: c.domicilio ?? '',
      ingresosBrutos: c.ingresosBrutos ?? '',
      inicioActividades: c.inicioActividades ?? '',
    });
  }

  useEffect(() => {
    let vivo = true;
    void llamar().then(r => {
      if (!vivo) return;
      if (r.ok) aplicar(r.config); else setError(r.error);
    });
    return () => { vivo = false; };
    // Se lee una vez al abrir el cajón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function hacer(paso: string, cuerpo: Record<string, unknown>, ok: string) {
    if (enCurso) return;
    setEnCurso(paso);
    setError(null);
    const r = await llamar(cuerpo);
    setEnCurso(null);
    if (!r.ok) { setError(r.error); return; }
    aplicar(r.config);
    void recargarArca();
    showToast(ok);
  }

  if (!config) {
    return <p className="pb-6 text-sm text-muted-foreground">{error ?? 'Cargando…'}</p>;
  }

  const set = (k: keyof typeof datos) => (e: { target: { value: string } }) => { const v = e.target.value; setDatos(d => ({ ...d, [k]: v })); };
  const homologacion = (config.entorno ?? datos.entorno) === 'homologacion';

  return (
    <div className="space-y-8 pb-6 text-sm">
      <p className="text-muted-foreground text-pretty">
        Con esto, cada recibo cobrado tiene «Emitir factura de ARCA»: la factura sale con su CAE y su QR, y queda en ARCA. Empezá en el
        entorno de prueba y pasá a producción cuando la hayas probado.
      </p>

      <section className="space-y-4">
        <h3 className="font-semibold text-foreground">1. Tus datos ante ARCA</h3>
        <div className="grid grid-cols-1 gap-4 @sm/config:grid-cols-2">
          <Campo label="CUIT">{id => <input id={id} className={inputCls} value={datos.cuit} inputMode="numeric" onChange={set('cuit')} />}</Campo>
          <Campo label="Condición frente al IVA">
            {id => (
              <select id={id} className={cn(inputCls, 'cursor-pointer')} value={datos.condicion} onChange={set('condicion')}>
                <option value="MONOTRIBUTO">Monotributo (factura C)</option>
                <option value="RESPONSABLE_INSCRIPTO">Responsable inscripto (factura A y B)</option>
              </select>
            )}
          </Campo>
          <Campo label="Punto de venta" ayuda="Uno de tipo «RECE para aplicativo y web services». Se crea en ARCA › Administración de puntos de venta y domicilios.">
            {id => <input id={id} className={inputCls} value={datos.puntoVenta} inputMode="numeric" onChange={set('puntoVenta')} />}
          </Campo>
          <Campo label="Entorno" ayuda="Cambiar de entorno pide otro certificado.">
            {id => (
              <select id={id} className={cn(inputCls, 'cursor-pointer')} value={datos.entorno} onChange={set('entorno')}>
                <option value="homologacion">Prueba (homologación): sin validez fiscal</option>
                <option value="produccion">Producción: facturas reales</option>
              </select>
            )}
          </Campo>
          <Campo label="Razón social">{id => <input id={id} className={inputCls} value={datos.razonSocial} onChange={set('razonSocial')} />}</Campo>
          <Campo label="Domicilio comercial">{id => <input id={id} className={inputCls} value={datos.domicilio} onChange={set('domicilio')} />}</Campo>
          <Campo label="Ingresos brutos">{id => <input id={id} className={inputCls} value={datos.ingresosBrutos} onChange={set('ingresosBrutos')} />}</Campo>
          <Campo label="Inicio de actividades">{id => <input id={id} type="date" className={inputCls} value={datos.inicioActividades} onChange={set('inicioActividades')} />}</Campo>
        </div>
        <button
          type="button" className={boton} disabled={!!enCurso}
          onClick={() => void hacer('datos', { accion: 'datos', ...datos, puntoVenta: Number(datos.puntoVenta) }, 'Datos de ARCA guardados')}
        >
          {enCurso === 'datos' ? 'Guardando…' : 'Guardar datos'}
        </button>
      </section>

      {config.configurada && (
        <section className="space-y-3">
          <h3 className="font-semibold text-foreground">2. El certificado</h3>
          {!config.csr ? (
            <>
              <p className="text-muted-foreground text-pretty">Se genera una clave que queda guardada, cifrada, en tu servidor, y un pedido de certificado para subir a ARCA.</p>
              <button type="button" className={boton} disabled={!!enCurso} onClick={() => void hacer('pedido', { accion: 'pedido' }, 'Pedido de certificado listo')}>
                {enCurso === 'pedido' ? 'Generando…' : 'Generar el pedido de certificado'}
              </button>
            </>
          ) : (
            <>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground text-pretty">
                {homologacion ? (
                  <>
                    <li>Entrá a ARCA con tu clave fiscal y abrí «WSASS - Autogestión Certificados Homologación» (si no lo tenés, adheríte desde el Administrador de Relaciones).</li>
                    <li>En «Nuevo certificado», poné un nombre y pegá el pedido de abajo. Te devuelve el certificado.</li>
                    <li>En «Crear autorización a servicio», autorizá ese certificado al servicio «wsfe» con tu CUIT.</li>
                  </>
                ) : (
                  <>
                    <li>Entrá a ARCA con tu clave fiscal y abrí «Administración de Certificados Digitales». Agregá un alias y subí el pedido de abajo (como archivo .csr).</li>
                    <li>Descargá el certificado (.crt) que te da.</li>
                    <li>En «Administrador de Relaciones de Clave Fiscal», creá una relación con el servicio «Facturación Electrónica» para ese alias.</li>
                  </>
                )}
                <li>Pegá acá el contenido del certificado y guardalo.</li>
              </ol>
              <textarea readOnly value={config.csr} rows={5} className={cn(inputCls, 'font-mono text-xs')} aria-label="Pedido de certificado" />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={botonSec} onClick={() => { void navigator.clipboard?.writeText(config.csr ?? '').then(() => showToast('Pedido copiado'), () => showToast('No se pudo copiar: seleccionalo a mano')); }}>
                  Copiar el pedido
                </button>
                <a className={botonSec} download="tentare-arca.csr" href={`data:application/pkcs10;charset=utf-8,${encodeURIComponent(config.csr)}`}>Descargar .csr</a>
              </div>
              <Campo label="Certificado que te dio ARCA">
                {id => <textarea id={id} rows={5} className={cn(inputCls, 'font-mono text-xs')} value={certificado} onChange={e => setCertificado(e.target.value)} placeholder="-----BEGIN CERTIFICATE-----" />}
              </Campo>
              {config.certificado && (
                <p className="text-muted-foreground">Certificado cargado{config.certificado.vence ? `, vence el ${config.certificado.vence.slice(0, 10).split('-').reverse().join('/')}` : ''}.</p>
              )}
              <button type="button" className={boton} disabled={!!enCurso || !certificado.trim()} onClick={() => void hacer('certificado', { accion: 'certificado', certificado }, 'Certificado guardado')}>
                {enCurso === 'certificado' ? 'Comprobando…' : 'Guardar el certificado'}
              </button>
            </>
          )}
        </section>
      )}

      {config.lista && (
        <section className="space-y-3">
          <h3 className="font-semibold text-foreground">3. Probar la conexión</h3>
          <button type="button" className={boton} disabled={!!enCurso} onClick={() => void hacer('probar', { accion: 'probar' }, 'Conectado con ARCA')}>
            {enCurso === 'probar' ? 'Hablando con ARCA…' : 'Probar la conexión'}
          </button>
          {config.prueba && (
            <p className="text-foreground">
              Conectado ({config.prueba.entorno === 'homologacion' ? 'prueba' : 'producción'}). Último comprobante autorizado:{' '}
              {Object.entries(config.prueba.ultimos).map(([l, n]) => `${l} ${n ? numeroCompleto(config.prueba!.puntoVenta, n) : 'ninguno'}`).join(' · ')}.
            </p>
          )}
        </section>
      )}

      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
  );
}
