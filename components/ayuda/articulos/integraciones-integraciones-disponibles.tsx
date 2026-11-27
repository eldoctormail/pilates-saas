import Link from 'next/link';
import { AyudaResultado } from '@/components/ayuda/AyudaPasos';
import { FUNCIONES_DE_ESPANA as ES } from '@/lib/locale';

// Reescrito el 28-ago-2026 tras verificar en vivo la lista de integraciones
// con la cuenta de demostración: la versión anterior de este artículo decía
// que solo existían Stripe y el widget, y afirmaba explícitamente que NO
// había integración con Zapier, Google ni Meta — falso. Las tarjetas reales
// están todas conectables, cada una con conexión "sin pegar ninguna clave"
// salvo Mailchimp y Kisi, que piden una API key pegada a mano.
//
// 15-sep-2026: Configuración se reorganizó por preguntas y cada integración
// está en la sección de lo que hace: Stripe en «Cobros y facturas», el
// remitente y WhatsApp en «Cómo me comunico», y el resto en
// «Conexiones». (16-oct-2026: todas, salvo el remitente, en «Integraciones».)
// Llevarte tus datos no es una integración: está en «Datos y
// seguridad» («Exportar mis datos»). Los nombres y frases de abajo son los de la pantalla
// (lib/configuracion/secciones.ts): desde el 15-sep (v2) cada integración es una fila
// con su estado, agrupadas por lo que hacen en Integraciones.

const GRUPOS: { seccion: string; tarjetas: (readonly [string, string])[] }[] = [
  {
    seccion: 'Cómo me comunico',
    tarjetas: [
      ['Nombre y respuesta de tus correos', 'El nombre que ven tus clientes como remitente y la dirección donde llegan sus respuestas.'],
    ],
  },
  {
    seccion: 'Integraciones',
    tarjetas: [
      ES
        ? ['Cobro con tarjeta (Stripe)', 'Cobra bonos y cuotas con tarjeta en tu propia cuenta de Stripe: el dinero entra directo en ella.']
        : ['Mercado Pago', 'Tus clientes pagan online y el dinero entra en tu cuenta. Se conecta en Apps e integraciones.'],
      ['WhatsApp', ES ? 'Recordatorios y avisos desde tu número de WhatsApp Business.' : 'Escribile a tus alumnas desde tu propio WhatsApp: el botón de su ficha lo abre con el mensaje ya escrito.'],
      ['Google Calendar', 'Copia las clases de las próximas 4 semanas a tu calendario al pulsar «Sincronizar ahora»; no se actualiza solo.'],
      ['Zoom', 'Crea una reunión de Zoom para cada clase de los tipos marcados como online.'],
      ['Kisi', 'Abre la puerta de tu estudio sola con cada check-in de tus clientes.'],
      ['Klaviyo', 'Lleva a Klaviyo los clientes que aceptaron recibir marketing, cada vez que pulsas «Sincronizar ahora».'],
      ['Mailchimp', 'Lleva a tu audiencia de Mailchimp los clientes que aceptaron recibir marketing, al pulsar «Sincronizar ahora».'],
      ['Zapier', 'Conecta Centra con miles de apps. La conexión se autoriza desde Zapier, no desde aquí.'],
    ],
  },
];

export default function Contenido() {
  return (
    <>
      <p>
        Puedes conectar Centra con las herramientas que ya usas — cada una con un botón, sin tocar código. Cada
        integración está en Configuración &gt; Integraciones ({ES ? 'el cobro con tarjeta' : 'Mercado Pago'}, WhatsApp, calendario, marketing, plataformas y tu API);
        solo el nombre y la respuesta de tus correos están en Cómo me comunico.
      </p>

      {GRUPOS.map(({ seccion, tarjetas }) => (
        <div key={seccion}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 12px' }}>Configuración &gt; {seccion}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tarjetas.map(([nombre, texto]) => (
              <div key={nombre} style={{ border: '1px solid #E7E7E0', borderRadius: 14, padding: '14px 18px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>{nombre}</p>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: '#5A5A52', margin: 0 }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 12px' }}>Cómo se conectan</h2>
      <p>
        La mayoría se conecta entrando con tu cuenta ({ES ? 'Google Calendar, Klaviyo, Stripe, Zoom' : 'Google Calendar, Klaviyo, Zoom'}): das permiso en
        la ventana del propio servicio, sin copiar ninguna clave. Mailchimp y Kisi piden tu clave API, WhatsApp los
        datos de tu cuenta de Meta{ES ? '' : ', y Mercado Pago el Access Token y la clave secreta de tu aplicación'}. Zapier funciona al revés: la conexión se autoriza desde Zapier, no desde Centra.
      </p>
      <p>
        Para llevarte tus datos a una hoja de cálculo no hace falta conectar nada: en Configuración &gt; Datos y
        seguridad, «Exportar mis datos» te da un archivo por tabla que abre Excel.
      </p>

      <AyudaResultado>
        Ninguna integración es obligatoria — Centra funciona completo sin conectar ninguna. Relacionado:{' '}
        {ES
          ? <Link href="/ayuda/pagos/conectar-stripe" style={{ color: 'inherit', textDecoration: 'underline' }}>conectar Stripe</Link>
          : <Link href="/ayuda/pagos/conectar-mercadopago" style={{ color: 'inherit', textDecoration: 'underline' }}>conectar Mercado Pago</Link>}.
      </AyudaResultado>
    </>
  );
}
