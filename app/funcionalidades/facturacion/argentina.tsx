import Link from 'next/link';
import { FeatureShell } from '@/components/funcionalidades/FeatureShell';
import { CierreCta, Entradilla, FeatureFaq, Limite, Seccion, Tabla } from '@/components/funcionalidades/bloques';

// La página de facturación con el formato de Argentina (es-AR): factura
// electrónica de ARCA, sin Veri*Factu, AEAT ni gestoría. La versión de España
// sigue en page.tsx sin tocar. Cada frase sale de lo que hace el producto:
// lib/arca (WSFEv1, letras A/B/C, CAE, QR de la RG 4892, entorno de prueba) y
// app/api/arca/emitir (se emite a mano desde un recibo cobrado). Las notas de
// crédito no están construidas: no se prometen.

const FAQ = [
  {
    q: '¿Las facturas salen solas?',
    a: 'No: se emiten desde el recibo cobrado, con un botón. Eliges la condición frente al IVA de la alumna y Tentare le pide el CAE a ARCA. La pantalla solo dice «emitida» cuando ARCA devolvió el CAE.',
  },
  {
    q: '¿Qué necesito para empezar?',
    a: 'Tu CUIT, tu punto de venta de factura electrónica y tu certificado de ARCA. Tentare te prepara el pedido de certificado (el CSR) desde el panel; lo subes en ARCA y pegas el certificado que te da.',
  },
  {
    q: '¿Qué factura emite, A, B o C?',
    a: 'La que corresponde según tu condición y la de la alumna: si eres monotributista, factura C; si eres responsable inscripto, A o B según la alumna.',
  },
  {
    q: '¿Puedo probar sin que valga?',
    a: 'Sí. Con el entorno de prueba de ARCA, la factura se emite igual pero no tiene validez fiscal, y la pantalla lo avisa.',
  },
  {
    q: '¿Lleva la contabilidad o presenta impuestos?',
    a: 'No. Emite tus facturas electrónicas y te deja los cobros listos para tu contador; presentar impuestos sigue siendo suyo.',
  },
];

export function FacturacionArgentina({ path }: { path: string }) {
  return (
    <FeatureShell
      path={path}
      busqueda="Factura electrónica de ARCA para estudios de Pilates y yoga"
      h1={<>Cada cobro, su factura de ARCA.</>}
      intro={<>Desde el recibo cobrado emites la factura electrónica con su CAE, sin entrar a la web de ARCA. Con tu propio certificado y tu punto de venta.</>}
      chips={['Factura A, B o C', 'CAE y QR de ARCA', 'Entorno de prueba']}
    >
      <Seccion id="contexto" titulo="La factura, sin salir del panel">
        <Entradilla>
          Cobrar en un sitio y facturar en otro es donde se pierden las horas: a fin de mes hay que cuadrar los dos. Aquí la
          factura sale del mismo recibo que registra el{' '}
          <Link href="/funcionalidades/cobros-recurrentes">cobro</Link>.
        </Entradilla>
        <p>
          Tentare habla con ARCA por el servicio de factura electrónica (WSFEv1): pide el último número autorizado de tu
          punto de venta, toma el siguiente y solicita el CAE. Si ARCA no contesta, el comprobante queda pendiente y el
          siguiente intento lo resuelve con el mismo número, sin saltarse ninguno ni emitirlo dos veces.
        </p>
      </Seccion>

      <Seccion id="que-lleva" titulo="Qué lleva la factura">
        <p>
          El PDF lleva los datos del comprobante, el CAE con su vencimiento y el QR que pide ARCA, para que quien la recibe
          pueda comprobarla.
        </p>
        <Tabla
          cabeceras={['Paso', 'Estado hoy']}
          filas={[
            ['Factura A, B o C según tu condición y la de la alumna', 'Sí'],
            ['CAE pedido a ARCA y guardado en el recibo', 'Sí'],
            ['PDF con el QR de ARCA', 'Sí'],
            ['Entorno de prueba, sin validez fiscal', 'Sí'],
            ['Emitirla sola al cobrar', 'No: se emite desde el recibo, con un botón'],
            ['Notas de crédito', 'Todavía no'],
          ]}
        />
        <Limite titulo="Dónde está el límite, dicho claro">
          Hoy la factura se emite a mano desde cada recibo cobrado, y las notas de crédito todavía no están: si devuelves un
          pago, la nota de crédito la haces desde ARCA. Nada de esto es asesoramiento fiscal; el encaje con tu situación lo
          confirma tu contador.
        </Limite>
      </Seccion>

      <Seccion id="faq" titulo="Preguntas frecuentes">
        <FeatureFaq items={FAQ} />
      </Seccion>

      <CierreCta
        titulo="Factura sin cambiar de pantalla"
        body="Conecta tu certificado de ARCA y emite la factura electrónica desde el mismo recibo que registra el cobro."
      />
    </FeatureShell>
  );
}
