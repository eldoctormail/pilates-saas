# syntax=docker/dockerfile:1
# Imagen de la app (Next.js) para servidor propio.
# Se construye desde la raíz del repo: ver deploy/docker-compose.yml.
#
# Las variables NEXT_PUBLIC_* se graban en el código al compilar: si cambia el
# dominio o la URL de Supabase, hay que volver a construir la imagen
# (`docker compose build app`).

FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# Después de instalar se comprueba que Next carga bien. Si el disco se llenó o la
# instalación quedó a medias, los archivos de node_modules quedan vacíos o rotos
# (sale «SyntaxError: Invalid or unexpected token» al compilar) y Docker guardaría
# esa capa rota en caché para siempre. Fallando aquí, la capa no se guarda y la
# siguiente compilación vuelve a instalar desde cero.
RUN npm ci --no-audit --no-fund \
 && node -e "require('next/dist/cli/next-build'); require('next/dist/server/lib/cpu-profile')" \
 || { echo '✘ npm ci falló o node_modules quedó roto. Revisá el espacio en disco (df -h) y volvé a compilar.' >&2; exit 1; }

COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_ZONA_HORARIA=
ARG NEXT_PUBLIC_LOCALE=
ARG NEXT_PUBLIC_MONEDA=
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=
# 1 = no repetir la revisión de tipos al compilar (la hacen `npm run typecheck` y
# el CI de cada PR): ahorra varios minutos. 0 para revisarlos también aquí.
ARG TENTARE_SALTAR_TYPECHECK=1
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_ZONA_HORARIA=$NEXT_PUBLIC_ZONA_HORARIA \
    NEXT_PUBLIC_LOCALE=$NEXT_PUBLIC_LOCALE \
    NEXT_PUBLIC_MONEDA=$NEXT_PUBLIC_MONEDA \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    TENTARE_SALTAR_TYPECHECK=$TENTARE_SALTAR_TYPECHECK \
    NODE_OPTIONS=--max-old-space-size=6144

# La caché de Next (.next/cache) se guarda entre compilaciones: la primera tarda
# lo de siempre; las siguientes solo recompilan lo que cambió. No entra en la imagen.
RUN --mount=type=cache,target=/app/.next/cache,id=tentare-next-cache npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
