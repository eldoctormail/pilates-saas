# Marca Centra

Logo propio del fork para Argentina, que reemplaza al de Tentare (24-nov-2026): una figura en postura de Pilates hecha de franjas de colores, elegida por Javier.

- **Isotipo:** la figura en postura de Pilates que eligió Javier (`figura-original.jpg`, de un banco de imágenes gratis): cinco franjas con huecos blancos entre ellas. Naranja `#E67C36`, oliva `#58481C`, verde agua `#80B29E`, bordó `#883426` y oliva claro `#88863E`. En modo oscuro van más claras (`#F2A46B`, `#CDB57E`, `#A6D4C9`, `#E0887A`, `#C9C77E`). La vectoriza `scripts/marca/vectorizar-figura.py` en `figura.json`.
- **Palabra:** «centra» en minúscula, en Quicksand 600, pasada a curvas, en `#3B3020` (blanco en oscuro).
- **Iconos y favicon:** la figura sobre una placa crema `#FBF6EE`.
- En el componente, cada franja lee su color de `--marca-c1` a `--marca-c5` (`components/marca/logo-tentare.tsx` y `.marca-auto` en `app/globals.css`).

## Qué hay acá

| Archivo | Para qué |
| --- | --- |
| `horizontal/tentare-horizontal-degradado.svg` | Logo de los correos de acceso (`public/logo-horizontal.png`) |
| `icono-app/tentare-icono-oscuro.svg` | Iconos de la app (`public/icon-192.png`, `icon-512.png`, `app/apple-icon.png`) |
| `favicon/tentare-favicon-placa.svg` | Favicons (`app/icon*.png`, `app/icon.svg`, `public/favicon.ico`) |
| `og-image.svg` | Imagen al compartir un enlace (`public/og-image.png`) |
| `trazados.json` | Las curvas que usa `components/marca/trazados.ts` |
| `figura-original.jpg` / `figura.json` | La imagen de la figura y sus cinco trazados vectoriales |

Los archivos conservan el nombre `tentare-…` porque `scripts/regenerar-marca.mjs` los busca así.

## Cambiar el logo

1. Si cambia la figura: reemplazar `figura-original.jpg` y correr `scripts/marca/vectorizar-figura.py` (instrucciones en su cabecera).
2. Generar el kit y los trazados: `scripts/marca/generar-logo-centra.mjs` (instrucciones en su cabecera).
3. Pegar `trazados.json` en `components/marca/trazados.ts`: `FRANJAS[0..4]` van en `HOJA_I`, `HOJA_D`, `DISCO`, `TALLO` y `FRANJA_5`; `H` en `ENTARE_80` y `V` en `ENTARE_54`.
4. Regenerar los PNG: `node scripts/regenerar-marca.mjs docs/marca-centra`.
5. Sacar `public/og-image.png` de `og-image.svg` a 1200×630.

Si llega un logo de diseñador, alcanza con reemplazar los SVG de esta carpeta y los trazados, y repetir los pasos 3 a 5.
