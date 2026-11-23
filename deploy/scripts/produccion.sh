#!/bin/sh
# Pasa la instalación a producción con tu dominio (deploy/PRODUCCION.md).
#
#   deploy/scripts/produccion.sh ~/supabase-project https://app.tudominio.com.ar https://supabase.tudominio.com.ar
#
# Pone las dos direcciones en las dos configuraciones, enciende el túnel de
# Cloudflare (COMPOSE_PROFILES=tunel), aplica las migraciones (actualiza la
# dirección en Vault) y vuelve a compilar la app. Antes, comprueba lo que no
# puede faltar en producción y se niega si algo está mal.
set -eu
SB="$(cd "${1:?Uso: produccion.sh /ruta/a/supabase-project https://app.dominio https://supabase.dominio}" && pwd)"
URL_APP="${2:?Falta la dirección de la app (https://…)}"
URL_SB="${3:?Falta la dirección de Supabase (https://…)}"
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
ENV_SB="$SB/.env"
ENV_APP="$DEPLOY/.env"
. "$DEPLOY/scripts/comun.sh"

URL_APP="${URL_APP%/}"; URL_SB="${URL_SB%/}"
problemas=""
falta() { problemas="$problemas\n  ✗ $1"; }
aviso() { echo "  ⚠ $1"; }

case "$URL_APP" in https://*) ;; *) falta "La dirección de la app tiene que empezar con https://" ;; esac
case "$URL_SB" in https://*) ;; *) falta "La dirección de Supabase tiene que empezar con https://" ;; esac
[ "$URL_APP" != "$URL_SB" ] || falta "La app y Supabase van en dos direcciones distintas (por ejemplo app. y supabase.)"
[ -f "$ENV_SB.antes-del-ensayo" ] && falta "Hay un ensayo abierto: primero  deploy/ensayo/ensayo.sh terminar $SB"
[ -n "$(leer "$ENV_APP" CLOUDFLARE_TUNNEL_TOKEN)" ] || falta "Falta CLOUDFLARE_TUNNEL_TOKEN en deploy/.env"
[ -n "$(leer "$ENV_APP" INTEGRACIONES_CLAVE_CIFRADO)" ] || falta "Falta INTEGRACIONES_CLAVE_CIFRADO en deploy/.env (deploy/scripts/generar-secretos.sh)"
[ "$(leer "$ENV_SB" ENABLE_EMAIL_AUTOCONFIRM)" = "true" ] && falta "ENABLE_EMAIL_AUTOCONFIRM=true en Supabase: las cuentas se confirmarían sin correo"
case "$(leer "$ENV_SB" SMTP_HOST)" in
  ''|smtp.example.com|mailpit) falta "Falta un SMTP real en Supabase (SMTP_HOST…): sin él, las alumnas no reciben el código para entrar" ;;
esac
case "$(leer "$ENV_APP" MERCADOPAGO_ACCESS_TOKEN)" in
  APP_USR-*) ;;
  TEST-*) aviso "MERCADOPAGO_ACCESS_TOKEN es de PRUEBA: los cobros no serán reales (salvo en los estudios que conecten su cuenta en el panel)." ;;
  '') aviso "Sin MERCADOPAGO_ACCESS_TOKEN en el servidor: cada estudio cobra con la cuenta que conecte en Apps e integraciones › Mercado Pago. Después de pasar a producción, cambiá ahí la de prueba por la real." ;;
esac
case "$(leer "$ENV_APP" RESEND_API_KEY)" in
  '') aviso "Sin RESEND_API_KEY: la app no manda sus correos (invitaciones, avisos, constancias). Los de acceso sí salen, por el SMTP." ;;
  local_*)
    [ "$(leer "$ENV_APP" RESEND_BASE_URL)" = "http://127.0.0.1:3000/api/correo-local" ] || falta "RESEND_API_KEY=local_… sin RESEND_BASE_URL=http://127.0.0.1:3000/api/correo-local: los correos de la app irían a Resend con una clave que no existe"
    case "$(leer "$ENV_APP" SMTP_HOST)" in
      '') falta "RESEND_API_KEY=local_… sin SMTP_HOST en deploy/.env: los correos de la app no salen" ;;
      mailpit) falta "SMTP_HOST=mailpit en deploy/.env: los correos de la app quedarían en el buzón de pruebas" ;;
    esac ;;
esac

if [ -n "$problemas" ]; then
  printf "No se pasa a producción:%b\n" "$problemas"
  exit 1
fi

echo "→ Supabase con $URL_SB"
poner "$ENV_SB" SUPABASE_PUBLIC_URL "$URL_SB"
poner "$ENV_SB" API_EXTERNAL_URL "$URL_SB/auth/v1"
poner "$ENV_SB" SITE_URL "$URL_APP"
poner "$ENV_SB" ADDITIONAL_REDIRECT_URLS "$URL_APP/**"

echo "→ App con $URL_APP"
poner "$ENV_APP" NEXT_PUBLIC_APP_URL "$URL_APP"
poner "$ENV_APP" NEXT_PUBLIC_SUPABASE_URL "$URL_SB"
poner "$ENV_APP" COMPOSE_PROFILES tunel

calcular_memoria
compilar
echo "→ Supabase"
(cd "$SB" && docker compose up -d)
esperar_supabase
"$DEPLOY/scripts/migrar.sh" "$SB"
(cd "$DEPLOY" && docker compose up -d)

cat <<EOF

✔ En producción.

  App:       $URL_APP
  Supabase:  $URL_SB   (solo /auth, /rest, /storage y /realtime)
  Webhook de Mercado Pago:  $URL_APP/api/mercadopago/webhook

Siguiente: la lista «Primer día» de deploy/PRODUCCION.md.
EOF
