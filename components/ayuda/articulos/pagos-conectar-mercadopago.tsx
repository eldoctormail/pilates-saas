import Link from 'next/link';
import { AyudaPaso, AyudaAntesDeEmpezar, AyudaResultado } from '@/components/ayuda/AyudaPasos';

// Solo con el formato de Argentina (lib/ayuda/registro.ts, `soloArgentina`).
// Verificado contra components/configuracion/cuenta-mercadopago.tsx y
// app/api/mercadopago/configuracion: solo la propietaria conecta la cuenta, y
// el token se comprueba con Mercado Pago antes de guardarlo.
export default function Contenido() {
  return (
    <>
      <AyudaAntesDeEmpezar>
        Sin Mercado Pago conectado puedes seguir marcando cobros como pagados a mano (efectivo, posnet,
        transferencia), pero tus clientes no pueden pagar desde su app ni desde tu web. La conecta la propietaria.
      </AyudaAntesDeEmpezar>

      <AyudaPaso numero={1} titulo="Saca los datos de tu cuenta de Mercado Pago">
        <p>
          Entra en mercadopago.com.ar/developers con la cuenta donde quieres recibir el dinero y abre «Tus
          integraciones». Si no tienes una aplicación, crea una de tipo «Pagos online · Checkout Pro». En
          «Credenciales de producción», copia el Access Token (empieza con APP_USR-).
        </p>
      </AyudaPaso>

      <AyudaPaso numero={2} titulo="Carga el webhook">
        <p>
          En Apps e integraciones › Mercado Pago está la dirección del webhook, con un botón para copiarla. En tu
          aplicación de Mercado Pago, en «Webhooks», pégala con el evento «Pagos», guarda y copia la clave secreta.
        </p>
      </AyudaPaso>

      <AyudaPaso numero={3} titulo="Guarda y comprueba">
        <p style={{ margin: 0 }}>
          Pega el Access Token y la clave secreta y pulsa «Guardar y comprobar». Centra pregunta a Mercado Pago si
          el token vale antes de guardarlo, y lo guarda cifrado.
        </p>
      </AyudaPaso>

      <AyudaResultado>
        En cuanto está conectada, tus clientes pagan bonos, cuotas, recibos, clases y tarjetas regalo con Mercado
        Pago, y el dinero entra en tu cuenta. Las devoluciones se piden desde la ficha del cliente: ver{' '}
        <Link href="/ayuda/pagos/reembolsos" style={{ color: 'inherit', textDecoration: 'underline' }}>reembolsos</Link>.
      </AyudaResultado>
    </>
  );
}
