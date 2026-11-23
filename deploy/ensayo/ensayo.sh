#!/bin/sh
# Ensayo general con Mercado Pago de prueba, sin dominio propio.
#
# Mercado Pago tiene que poder llamar al webhook por HTTPS, y la app y Supabase
# tienen que estar los dos en HTTPS (si no, el navegador bloquea las llamadas
# por contenido mixto). El script abre dos túneles gratuitos de Cloudflare
# (trycloudflare.com, sin cuenta), uno a la app y otro a Supabase, y pone sus
# direcciones en las dos configuraciones.
#
# Uso:
#   deploy/ensayo/ensayo.sh empezar  ~/supabase-project
#   deploy/ensayo/ensayo.sh terminar ~/supabase-project
#
# Antes: los pasos 1 a 4 de deploy/README.md hechos una vez (Supabase andando,
# deploy/.env con los secretos, la base migrada), y en deploy/.env el token de
# PRUEBA de Mercado Pago (MERCADOPAGO_ACCESS_TOKEN=TEST-…) y la clave del webhook.
#
# «empezar» guarda una copia de los dos .env (*.antes-del-ensayo) y «terminar»
# los devuelve, cierra los túneles y vuelve a compilar la app como estaba.
# Las direcciones de los túneles cambian cada vez que se abren.
set -eu
ACCION="${1:?Uso: ensayo.sh empezar|terminar /ruta/a/supabase-project}"
SB="$(cd "${2:?Falta la carpeta de Supabase}" && pwd)"
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
ENV_SB="$SB/.env"
ENV_APP="$DEPLOY/.env"
. "$DEPLOY/scripts/comun.sh"

# Abre un túnel a un puerto local y devuelve su dirección https://….trycloudflare.com
tunel() {
  nombre="$1"; puerto="$2"
  docker rm -f "$nombre" >/dev/null 2>&1 || true
  docker run -d --name "$nombre" --network host --restart unless-stopped \
    cloudflare/cloudflared:latest tunnel --no-autoupdate --url "http://127.0.0.1:$puerto" >/dev/null
  i=0
  while [ $i -lt 60 ]; do
    url="$(docker logs "$nombre" 2>&1 | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1 || true)"
    [ -n "$url" ] && { echo "$url"; return 0; }
    i=$((i + 1)); sleep 1
  done
  echo "No se pudo abrir el túnel $nombre. Mirá: docker logs $nombre" >&2
  exit 1
}

case "$ACCION" in
empezar)
  [ -f "$ENV_APP" ] || { echo "Falta $ENV_APP (deploy/scripts/generar-secretos.sh)"; exit 1; }
  case "$(leer "$ENV_APP" MERCADOPAGO_ACCESS_TOKEN)" in
    TEST-*|APP_USR-*) ;;
    *) echo "Falta MERCADOPAGO_ACCESS_TOKEN en $ENV_APP (el de prueba, del vendedor de prueba)"; exit 1 ;;
  esac
  [ -n "$(leer "$ENV_APP" MERCADOPAGO_WEBHOOK_SECRET)" ] || { echo "Falta MERCADOPAGO_WEBHOOK_SECRET en $ENV_APP"; exit 1; }

  [ -f "$ENV_SB.antes-del-ensayo" ] || cp "$ENV_SB" "$ENV_SB.antes-del-ensayo"
  [ -f "$ENV_APP.antes-del-ensayo" ] || cp "$ENV_APP" "$ENV_APP.antes-del-ensayo"

  # Raspberry Pi y máquinas chicas: compilar la app pide hasta 6 GB, y con
  # Supabase andando no entra. Con menos de 12 GB (RAM + swap), Supabase se para
  # mientras compila y se vuelve a levantar después.
  calcular_memoria
  [ "$(uname -m)" = aarch64 ] && echo "→ ARM de 64 bits ($(uname -m)): la primera compilación puede tardar 30 minutos o más."
  if [ -r /proc/meminfo ] && [ "$(awk '/^SwapTotal:/ {print $2}' /proc/meminfo)" -lt 2000000 ] && [ "$POCA_MEMORIA" = si ]; then
    echo "⚠ Menos de 2 GB de swap: si la compilación se corta sola, agregá swap (ver deploy/README.md, Raspberry Pi)."
  fi

  echo "→ Túneles"
  APP_PUERTO="$(leer "$ENV_APP" APP_PORT)"; APP_PUERTO="${APP_PUERTO:-3000}"
  URL_APP="$(tunel ensayo-tunel-app "$APP_PUERTO")"
  URL_SB="$(tunel ensayo-tunel-supabase 8000)"

  echo "→ Configuración de Supabase con $URL_SB"
  poner "$ENV_SB" SUPABASE_PUBLIC_URL "$URL_SB"
  poner "$ENV_SB" API_EXTERNAL_URL "$URL_SB/auth/v1"
  poner "$ENV_SB" SITE_URL "$URL_APP"
  poner "$ENV_SB" ADDITIONAL_REDIRECT_URLS "$URL_APP/**"
  # Las cuentas de prueba quedan confirmadas sin correo. «terminar» lo devuelve.
  poner "$ENV_SB" ENABLE_EMAIL_AUTOCONFIRM true
  # Los correos de Auth (el código de la alumna) van al buzón de prueba.
  cp "$DEPLOY/ensayo/docker-compose.ensayo.yml" "$SB/"
  COMPOSE_ACTUAL="$(leer "$ENV_SB.antes-del-ensayo" COMPOSE_FILE)"
  COMPOSE_ACTUAL="${COMPOSE_ACTUAL:-docker-compose.yml}"
  # Si el buzón ya estaba sumado (instalación a mano en un Mac), no se repite.
  case ":$COMPOSE_ACTUAL:" in
    *:docker-compose.ensayo.yml:*) poner "$ENV_SB" COMPOSE_FILE "$COMPOSE_ACTUAL" ;;
    *) poner "$ENV_SB" COMPOSE_FILE "$COMPOSE_ACTUAL:docker-compose.ensayo.yml" ;;
  esac
  poner "$ENV_SB" SMTP_HOST mailpit
  poner "$ENV_SB" SMTP_PORT 1025
  poner "$ENV_SB" SMTP_USER ensayo
  poner "$ENV_SB" SMTP_PASS ensayo
  poner "$ENV_SB" SMTP_ADMIN_EMAIL ensayo@example.com

  echo "→ Configuración de la app con $URL_APP"
  poner "$ENV_APP" NEXT_PUBLIC_APP_URL "$URL_APP"
  poner "$ENV_APP" NEXT_PUBLIC_SUPABASE_URL "$URL_SB"
  poner "$ENV_APP" NEXT_PUBLIC_LOCALE es-AR-u-hc-h23
  poner "$ENV_APP" NEXT_PUBLIC_PASARELA mercadopago
  compilar

  echo "→ Supabase"
  (cd "$SB" && docker compose up -d)
  esperar_supabase
  # Actualiza app_url en Vault (los trabajos de pg_cron llaman a la app).
  "$DEPLOY/scripts/migrar.sh" "$SB"
  (cd "$DEPLOY" && docker compose up -d)

  cat <<EOF

✔ Ensayo listo.

  App:        $URL_APP
  Supabase:   $URL_SB
  Correos:    http://IP-DE-ESTA-MAQUINA:8025
  Webhook:    $URL_APP/api/mercadopago/webhook

Cargá esa dirección de webhook en tu aplicación de Mercado Pago (Webhooks →
modo de prueba, evento «Pagos») y seguí deploy/ensayo/PRUEBAS.md.
Al terminar:  deploy/ensayo/ensayo.sh terminar $SB
EOF
  ;;
terminar)
  docker rm -f ensayo-tunel-app ensayo-tunel-supabase >/dev/null 2>&1 || true
  if [ -f "$ENV_SB.antes-del-ensayo" ]; then
    mv "$ENV_SB.antes-del-ensayo" "$ENV_SB"
    (cd "$SB" && docker compose up -d --remove-orphans)
    # Se saca solo si lo sumó el ensayo (si estaba en la configuración de antes, se queda).
    case ":$(leer "$ENV_SB" COMPOSE_FILE):" in
      *:docker-compose.ensayo.yml:*) ;;
      *) rm -f "$SB/docker-compose.ensayo.yml" ;;
    esac
    esperar_supabase
  fi
  if [ -f "$ENV_APP.antes-del-ensayo" ]; then
    mv "$ENV_APP.antes-del-ensayo" "$ENV_APP"
    calcular_memoria
    compilar
    (cd "$SB" && docker compose up -d)
    esperar_supabase
    "$DEPLOY/scripts/migrar.sh" "$SB"
    (cd "$DEPLOY" && docker compose up -d)
  fi
  echo "✔ Túneles cerrados y configuración devuelta."
  ;;
*)
  echo "Uso: ensayo.sh empezar|terminar /ruta/a/supabase-project"; exit 1 ;;
esac
