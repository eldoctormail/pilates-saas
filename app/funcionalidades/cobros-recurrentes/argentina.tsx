import Link from 'next/link';
import { FeatureShell } from '@/components/funcionalidades/FeatureShell';
import { CasoDeUso, CierreCta, Entradilla, FeatureFaq, Limite, Seccion } from '@/components/funcionalidades/bloques';
import { PanelCobros } from '@/components/web/home/piezas';

// La página de cobros con el formato de Argentina (es-AR): Mercado Pago y el
// mostrador, sin tarjeta guardada, reintentos ni remesas SEPA, que aquí no
// existen. La versión de España sigue en page.tsx sin tocar. Cada frase sale de
// lo que hace el producto: lib/mercadopago (Checkout Pro, conciliador cada 30 min
// en deploy/crontab, reembolso-servidor.ts) y lib/cobros/metodo-movil.ts.

const FAQ = [
  {
    q: '¿Tentare se lleva una comisión de lo que cobro?',
    a: 'No. El dinero va de tu alumna a tu cuenta de Mercado Pago directamente; Tentare no se interpone ni añade comisión propia. Lo único que pagas aparte es la comisión de Mercado Pago, que es suya y la ves en su panel.',
  },
  {
    q: '¿Necesito una cuenta de Mercado Pago?',
    a: 'Para cobrar online, sí: la propietaria la conecta desde Apps e integraciones con el Access Token de su cuenta. Sin ella puedes seguir apuntando cobros a mano (efectivo, posnet, transferencia), y el registro funciona igual.',
  },
  {
    q: '¿Puedo devolver un pago desde el panel?',
    a: 'Sí. La devolución se le pide a Mercado Pago desde el panel y el recibo cambia de estado cuando Mercado Pago la confirma, no cuando se pulsa el botón. Si la haces desde el panel de Mercado Pago, Tentare también se entera.',
  },
  {
    q: '¿Y si un pago se aprueba pero no aparece?',
    a: 'Tentare se entera de cada pago por el aviso de Mercado Pago y, por si alguno no llega, repasa los pagos de los últimos tres días cada 30 minutos. El bono o la cuota aparecen solos, sin que la alumna vuelva a pagar.',
  },
  {
    q: '¿Y si alguien paga en efectivo o por transferencia?',
    a: 'Se registra como cobro de mostrador (efectivo, posnet, transferencia o QR de Mercado Pago), para que el histórico refleje todo lo que entra y no solo lo que pasa por la app.',
  },
];

export function CobrosArgentina({ path }: { path: string }) {
  return (
    <FeatureShell
      path={path}
      busqueda="Cobros con Mercado Pago para estudios de Pilates"
      h1={<>Cobra sin perseguir a nadie.</>}
      intro={<>Tus alumnas compran el bono o pagan la cuota desde su app, con Mercado Pago. Lo que se paga en el mostrador se apunta en el momento, y lo que falta cobrar queda a la vista.</>}
      chips={['Mercado Pago desde la app', 'Efectivo, posnet y transferencia', 'Devoluciones desde el panel']}
      pieza={{ descripcion: 'Ejemplo del resumen de cobros de Tentare: quién ha pagado y las próximas cuotas.', contenido: <PanelCobros completo /> }}
    >
      <Seccion id="problema" titulo="El dinero no se pierde de golpe, se pierde a goteo">
        <Entradilla>
          Casi ningún estudio tiene un problema de morosidad. Tiene un problema de fricción: dos cuotas que nadie reclamó y
          un bono que se pagó en efectivo y no se apuntó.
        </Entradilla>
        <p>
          No se arregla con disciplina: se arregla haciendo que pagar sea un toque en el teléfono de la alumna y que lo que
          falta esté en una lista, no en tu memoria.
        </p>
      </Seccion>

      <Seccion id="mercadopago" titulo="Mercado Pago, desde la app de la alumna">
        <p>
          Conectas tu cuenta de Mercado Pago y la alumna paga desde su app o desde la página de reservas de tu web, con lo
          que tenga en Mercado Pago. El dinero va a tu cuenta. Cuando el pago se aprueba, el bono o la cuota quedan activos
          y, si estaba reservando, la plaza se confirma.
        </p>
        <p>
          Cuando toca renovar una cuota, a la alumna le llega el aviso para pagarla desde la app. Lo que sigue sin pagar
          aparece en Cobros, alumna por alumna.
        </p>
        <Limite titulo="No hay cobro automático con tarjeta guardada">
          Con Mercado Pago, cada pago lo hace la alumna: Tentare no guarda tarjetas ni cobra solo el día 1. Por eso el aviso
          de renovación y la lista de lo que falta cobrar son la pieza central.
        </Limite>
      </Seccion>

      <Seccion id="mostrador" titulo="Lo que se paga en el mostrador">
        <p>
          Efectivo, posnet, transferencia o un QR de Mercado Pago: se apunta en el momento, desde la caja o desde la ficha
          de la alumna, y queda en el mismo histórico que lo que se pagó online. Desde cada cobro puedes emitir la{' '}
          <Link href="/funcionalidades/facturacion">factura electrónica de ARCA</Link>.
        </p>
      </Seccion>

      <Seccion id="casos" titulo="Tres situaciones de todos los meses">
        <div style={{ margin: '24px 0 0' }}>
          <CasoDeUso hora="Día 1" titulo="Toca renovar">
            A cada alumna le llega el aviso y paga desde su app. Nadie manda un recordatorio a mano.
          </CasoDeUso>
          <CasoDeUso hora="Día 2" titulo="Una paga en efectivo">
            Recepción lo apunta en la caja y la cuota queda pagada, igual que si hubiera pagado online.
          </CasoDeUso>
          <CasoDeUso hora="Día 5" titulo="Repasas lo que falta">
            En Cobros ves quién no pagó todavía y le escribes. Es una conversación, no una lista en un cuaderno.
          </CasoDeUso>
        </div>
      </Seccion>

      <Seccion id="faq" titulo="Preguntas frecuentes">
        <FeatureFaq items={FAQ} />
        <p style={{ marginTop: 26 }}>
          Qué vendes exactamente —bonos, cuotas, plazas fijas— se configura en{' '}
          <Link href="/funcionalidades/bonos-y-membresias">bonos y membresías</Link>.
        </p>
      </Seccion>

      <CierreCta
        titulo="Que cobrar deje de ser una tarea"
        body="Conecta tu cuenta de Mercado Pago, define tus planes y deja que tus alumnas paguen desde su app."
      />
    </FeatureShell>
  );
}
