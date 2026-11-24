# Marca Centra (provisional)

Logo propio del fork para Argentina, que reemplaza al de Tentare. Es **provisional**: sirve para salir a vender con marca propia hasta que haya un logo hecho por un diseñador.

- **Isotipo:** un anillo abierto a la derecha (la «C») con un punto en el centro. Lleva el degradado turquesa a magenta de siempre.
- **Palabra:** «centra» en minúscula, en Quicksand 600, pasada a curvas.

## Qué hay acá

| Archivo | Para qué |
| --- | --- |
| `horizontal/tentare-horizontal-degradado.svg` | Logo de los correos de acceso (`public/logo-horizontal.png`) |
| `icono-app/tentare-icono-oscuro.svg` | Iconos de la app (`public/icon-192.png`, `icon-512.png`, `app/apple-icon.png`) |
| `favicon/tentare-favicon-placa.svg` | Favicons (`app/icon*.png`, `app/icon.svg`, `public/favicon.ico`) |
| `og-image.svg` | Imagen al compartir un enlace (`public/og-image.png`) |
| `trazados.json` | Las curvas que usa `components/marca/trazados.ts` |

Los archivos conservan el nombre `tentare-…` porque `scripts/regenerar-marca.mjs` los busca así.

## Cambiar el logo

1. Generar el kit y los trazados: `scripts/marca/generar-logo-centra.mjs` (instrucciones en su cabecera).
2. Pegar `trazados.json` en `components/marca/trazados.ts`.
3. Regenerar los PNG: `node scripts/regenerar-marca.mjs docs/marca-centra`.
4. Sacar `public/og-image.png` de `og-image.svg` a 1200×630.

Si llega un logo de diseñador, alcanza con reemplazar los SVG de esta carpeta y los trazados, y repetir los pasos 2 a 4.
