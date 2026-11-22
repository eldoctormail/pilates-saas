# Imagen de la app (Next.js) para servidor propio.
# Se construye desde la raíz del repo: ver deploy/docker-compose.yml.
#
# Las variables NEXT_PUBLIC_* se graban en el código al compilar: si cambia el
# dominio o la URL de Supabase, hay que volver a construir la imagen
# (`docker compose build app`).

FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_ZONA_HORARIA=
ARG NEXT_PUBLIC_LOCALE=
ARG NEXT_PUBLIC_MONEDA=
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_ZONA_HORARIA=$NEXT_PUBLIC_ZONA_HORARIA \
    NEXT_PUBLIC_LOCALE=$NEXT_PUBLIC_LOCALE \
    NEXT_PUBLIC_MONEDA=$NEXT_PUBLIC_MONEDA \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=6144

RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
