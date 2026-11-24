# Marca Centra (provisional)

Logo propio del fork para Argentina, que reemplaza al de Tentare (24-nov-2026). Sale de una imagen de referencia que dio Javier: una figura en postura de Pilates hecha de franjas de colores.

- **Isotipo:** una figura con una pierna arriba, el cuerpo enrollado y la otra pierna estirada, hecha de cuatro franjas paralelas: naranja `#E8843C`, oliva `#5B4A22`, verde agua `#7DB5A8` y bordó `#8C3B2E`. En modo oscuro van más claras (`#F2A46B`, `#CDB57E`, `#A6D4C9`, `#E0887A`). El dibujo es procedural: `scripts/marca/figura-centra.mjs`.
- **Palabra:** «centra» en minúscula, en Quicksand 600, pasada a curvas, en `#3B3020` (blanco en oscuro).
- **Iconos y favicon:** la figura sobre una placa crema `#FBF6EE`.
- En el componente, cada franja lee su color de `--marca-c1` a `--marca-c4` (`components/marca/logo-tentare.tsx` y `.marca-auto` en `app/globals.css`).

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

1. Generar el kit y los trazados: `scripts/marca/generar-logo-centra.mjs` (instrucciones en su cabecera). La forma de la figura se cambia en `scripts/marca/figura-centra.mjs`.
2. Pegar `trazados.json` en `components/marca/trazados.ts`: `FRANJAS[0..3]` van en `HOJA_I`, `HOJA_D`, `DISCO` y `TALLO`; `H` en `ENTARE_80` y `V` en `ENTARE_54`.
3. Regenerar los PNG: `node scripts/regenerar-marca.mjs docs/marca-centra`.
4. Sacar `public/og-image.png` de `og-image.svg` a 1200×630.

Si llega un logo de diseñador, alcanza con reemplazar los SVG de esta carpeta y los trazados, y repetir los pasos 2 a 4.
