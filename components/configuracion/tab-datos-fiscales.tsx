'use client';

import { cn } from '@/lib/utils';
import { NOMBRE_ID_FISCAL, nifValido } from '@/lib/nif';
import type { Studio } from '@/lib/types';
import { FUNCIONES_DE_ESPANA } from '@/lib/locale';
import { inputCls } from '@/components/configuracion/estilos';
import { BarraGuardar } from '@/components/configuracion/shell/barra-guardar';
import type { PropsFormularioCajon } from '@/components/configuracion/shell/cajon-ajuste';
import { Campo, useFormularioEstudio } from '@/components/configuracion/formulario-estudio';

// «Datos fiscales e IVA»: el cajón de su fila en Cobros y facturas. Guarda SOLO
// razón social, NIF e IVA (formulario-estudio.tsx, #2027), y «Guardado» solo con
// la fila confirmada: si no, el cajón se queda abierto con lo escrito.
//
// `#datos-fiscales` es un ancla con enlaces de verdad —«Poner mi NIF ahora» de
// Cobros → Facturas, el aviso del contrato, la guía— y abre este cajón.
//
// Cambiar el IVA es dinero: pregunta antes de guardar, con lo que cambia.

type DatosFiscalesForm = {
  razonSocial: string;
  nif: string;
  /** Como texto porque es el valor del `<select>`; se guarda como número. */
  ivaPorDefecto: string;
};

function aFormulario(s: Studio | null): DatosFiscalesForm {
  return {
    razonSocial: s?.razonSocial ?? '',
    nif: s?.nif ?? '',
    ivaPorDefecto: String(s?.ivaPorDefecto ?? 21),
  };
}

const TIPOS_IVA_ES = [['21', '21 % — General'], ['10', '10 % — Reducido'], ['4', '4 % — Superreducido'], ['0', '0 % — Exento']] as const;
// Argentina: las alícuotas de IVA de allí. 0 % es también el de quien no
// discrimina IVA (monotributo): el comprobante sale con el total, sin desglose.
const TIPOS_IVA_AR = [['21', '21 % — General'], ['10.5', '10,5 % — Reducida'], ['27', '27 % — Diferencial'], ['0', '0 % — Exento o monotributo']] as const;
const TIPOS_IVA: readonly (readonly [string, string])[] = FUNCIONES_DE_ESPANA ? TIPOS_IVA_ES : TIPOS_IVA_AR;

export function FormDatosFiscales({ showToast, onGuardado }: PropsFormularioCajon) {
  const { form, setForm, base, hayCambios, guardar, descartar } = useFormularioEstudio(aFormulario, showToast);

  const nifInvalido = form.nif.trim() !== '' && !nifValido(form.nif);
  const cambiaIva = form.ivaPorDefecto !== base.ivaPorDefecto;

  async function alGuardar(): Promise<string | null> {
    const res = await guardar({
      razonSocial: form.razonSocial,
      nif: form.nif,
      // Lo lee el TPV (app/api/pos/catalogo) y el desglose de cada factura nueva.
      ivaPorDefecto: Number(form.ivaPorDefecto),
    }, null);
    if (!res) return 'Ya se estaba guardando';
    if (!res.ok) return res.error;
    onGuardado('Datos fiscales guardados');
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 pb-6">
        <Campo label="Razón social" ayuda="El nombre legal, si no es el de tu estudio.">
          {id => (
            <input id={id} className={inputCls} value={form.razonSocial}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, razonSocial: v })); }} />
          )}
        </Campo>
        <Campo label={NOMBRE_ID_FISCAL === 'CUIT' ? 'CUIT' : 'NIF / CIF'} error={nifInvalido ? (NOMBRE_ID_FISCAL === 'CUIT' ? 'Revisá el CUIT: son 11 cifras y el dígito verificador no cuadra.' : 'La letra o el dígito de control no cuadran.') : null}>
          {id => (
            <input
              id={id}
              className={cn(inputCls, nifInvalido && 'border-destructive')}
              value={form.nif}
              autoCapitalize="characters"
              aria-invalid={nifInvalido}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, nif: v })); }}
            />
          )}
        </Campo>
        <Campo label="IVA general" ayuda={FUNCIONES_DE_ESPANA ? 'Tus precios llevan el IVA incluido: cambia el desglose, no el total.' : 'Tus precios llevan el IVA incluido: cambia el desglose interno, no el total. Si sos monotributista, elegí 0 %.'}>
          {id => (
            <select
              id={id}
              className={cn(inputCls, 'cursor-pointer @sm/config:max-w-xs')}
              value={form.ivaPorDefecto}
              onChange={e => { const v = e.target.value; setForm(f => ({ ...f, ivaPorDefecto: v })); }}
            >
              {/* Un tipo guardado que no está en la lista se ofrece tal cual, para no cambiarlo sin querer. */}
              {(TIPOS_IVA.some(([v]) => v === base.ivaPorDefecto) ? TIPOS_IVA : [...TIPOS_IVA, [base.ivaPorDefecto, `${base.ivaPorDefecto.replace('.', ',')} %`] as const])
                .map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
            </select>
          )}
        </Campo>
      </div>
      <BarraGuardar
        seccion="cobros"
        cambios={hayCambios ? ['Datos fiscales e IVA'] : []}
        bloqueo={nifInvalido ? `Revisa el ${NOMBRE_ID_FISCAL === 'CUIT' ? 'CUIT' : 'NIF'} antes de guardar.` : null}
        confirmar={cambiaIva ? {
          titulo: `¿Cambiar el IVA al ${form.ivaPorDefecto.replace('.', ',')} %?`,
          descripcion: FUNCIONES_DE_ESPANA
            ? `Tus facturas nuevas llevarán un ${form.ivaPorDefecto} % de IVA. Lo que cobras no cambia, y las facturas ya emitidas tampoco.`
            : `Tus comprobantes nuevos llevarán un ${form.ivaPorDefecto.replace('.', ',')} % de IVA en el desglose interno. Lo que cobrás no cambia, y lo ya emitido tampoco.`,
          textoConfirmar: 'Sí, cambiar el IVA',
        } : null}
        onGuardar={alGuardar}
        onDescartar={descartar}
      />
    </>
  );
}
