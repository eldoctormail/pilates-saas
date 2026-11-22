#!/bin/sh
# Uso: llamar <ruta>   →  GET http://app:3000/api/cron/<ruta>
set -eu
[ -f /etc/cron.env ] && . /etc/cron.env
ruta="$1"
echo "$(date -Iseconds) cron $ruta"
curl -fsS --max-time 300 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_INTERNAL_URL:-http://app:3000}/api/cron/${ruta}" \
  && echo " → ok" || echo " → FALLÓ ($ruta)"
