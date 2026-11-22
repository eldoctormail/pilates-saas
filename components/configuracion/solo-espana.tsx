import Link from 'next/link';

// Lo que se ve en una pantalla que solo sirve en España (Veri*Factu, la AEAT)
// cuando el panel está con el formato de Argentina (lib/locale.ts). La pantalla
// sigue existiendo; solo se oculta su contenido.
export function SoloEspana({ que }: { que: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">{que} no se usa en Argentina</h1>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Es un requisito de la facturación en España. En Argentina, la factura legal es la electrónica de ARCA.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/configuracion" className="font-medium text-foreground underline underline-offset-2">Volver a Configuración</Link>
      </p>
    </div>
  );
}
