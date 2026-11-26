// Lee una variable NEXT_PUBLIC_* sin depender de que exista `process`.
//
// Next y el bundle del widget (scripts/build-widget-bundle.mjs, `define` de
// esbuild) sustituyen `process.env.NEXT_PUBLIC_X` por su valor al compilar. El
// guardia de antes, `typeof process !== 'undefined' ? process.env.X : …`, lo
// rompía en el widget: en la web del estudio `process` no existe, así que se
// tiraba el valor ya inlineado y se usaba el de por defecto (la zona, el
// formato y el origen salían siempre los de Argentina y Centra, se configurara
// lo que se configurara). Leído dentro de una función, el valor inlineado se
// usa y, donde no se inlinea y `process` no existe, no revienta.
export function envPublica(leer: () => string | undefined): string | undefined {
  try {
    return leer();
  } catch {
    return undefined;
  }
}
