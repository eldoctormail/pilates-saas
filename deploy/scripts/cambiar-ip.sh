#!/bin/sh
# Cambia la IP del servidor en las dos configuraciones y reinicia, sin volver a
# compilar la app (la imagen toma las direcciones al arrancar:
# deploy/scripts/aplicar-urls.mjs).
#
#   deploy/scripts/cambiar-ip.sh ~/supabase-project 192.168.1.60
#
# Sin la IP, usa la primera que tenga el servidor (`hostname -I`).
set -eu
SB="$(cd "${1:?Uso: cambiar-ip.sh /ruta/a/supabase-project [IP]}" && pwd)"
IP="${2:-$(hostname -I 2>/dev/null | awk '{print $1}')}"
[ -n "$IP" ] || { echo "No pude averiguar la IP. Pasala a mano: cambiar-ip.sh $SB 192.168.1.60"; exit 1; }
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
ENV_SB="$SB/.env"
ENV_APP="$DEPLOY/.env"
. "$DEPLOY/scripts/comun.sh"

PUERTO_APP="$(leer "$ENV_APP" APP_PORT)"; PUERTO_APP="${PUERTO_APP:-3000}"
URL_APP="http://$IP:$PUERTO_APP"
URL_SB="http://$IP:8000"

echo "→ Supabase con $URL_SB"
poner "$ENV_SB" SUPABASE_PUBLIC_URL "$URL_SB"
poner "$ENV_SB" API_EXTERNAL_URL "$URL_SB/auth/v1"
poner "$ENV_SB" SITE_URL "$URL_APP"
poner "$ENV_SB" ADDITIONAL_REDIRECT_URLS "$URL_APP/**"
(cd "$SB" && docker compose up -d)
esperar_supabase

echo "→ App con $URL_APP"
poner "$ENV_APP" NEXT_PUBLIC_APP_URL "$URL_APP"
poner "$ENV_APP" NEXT_PUBLIC_SUPABASE_URL "$URL_SB"
"$DEPLOY/scripts/migrar.sh" "$SB"
(cd "$DEPLOY" && docker compose up -d)

echo
echo "✔ Listo. Entrá a $URL_APP"
