import Link from 'next/link';
import { AyudaResultado } from '@/components/ayuda/AyudaPasos';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

export default function Contenido() {
  return (
    <>
      {ES ? (<>
      <p>
        Una cuota (mensual, trimestral, semestral o anual) con tarjeta guardada se cobra sola al vencer —
        no hace falta que tú ni el cliente hagáis nada para que siga activa. Si la cobras por domiciliación (con su
        mandato firmado), el recibo queda pendiente y entra en la próxima remesa que prepares para tu banco. Sin
        ninguna de las dos, el recibo queda pendiente en Cobros para cobrarlo a mano.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Qué comprueba antes de cobrar</h2>
      <p>
        En la renovación se vuelve a comprobar que hay una tarjeta guardada válida. Si el cobro falla, entra en el
        mismo circuito de reintentos que cualquier otro pago —{' '}
        <Link href="/ayuda/pagos/cobros-fallidos" style={{ color: 'inherit', textDecoration: 'underline' }}>ver cobros fallidos</Link> —; si los tres intentos fallan, el recibo queda como no cobrado y la suscripción se cancela.
      </p>

      </>) : (<>
      <p>
        Una cuota (mensual, trimestral, semestral o anual) genera su recibo sola al vencer, y tu cliente lo paga desde
        su app con Mercado Pago. Si te lo paga en el mostrador, lo marcas como cobrado en Cobros. Mientras no lo pague,
        el recibo queda pendiente en «Quién me debe».
      </p>

      </>)}
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 12px' }}>Bonos, no</h2>
      <p>
        Un bono de sesiones no se renueva solo: al agotarse o caducar, el cliente necesita comprar uno nuevo o que se
        lo asignes tú. Solo las cuotas tienen renovación automática.
      </p>

      <AyudaResultado>
        {ES
          ? 'Cada renovación genera su propio cobro y, salvo en efectivo, su propia factura — nunca se junta con la del mes anterior, aunque el importe sea idéntico cada vez.'
          : 'Cada renovación genera su propio recibo — nunca se junta con el del mes anterior, aunque el importe sea idéntico cada vez.'}
      </AyudaResultado>
    </>
  );
}
