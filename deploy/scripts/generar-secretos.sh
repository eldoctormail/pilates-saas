#!/bin/sh
# Crea deploy/.env desde .env.example (si no existe) y rellena los secretos
# internos, las claves de Inngest y las de push que estén vacíos. No pisa
# valores ya cargados.
set -eu
cd "$(dirname "$0")/.."

[ -f .env ] || cp .env.example .env

poner() {
  clave="$1"; valor="$2"
  if grep -qE "^${clave}=$" .env; then
    # Sin `sed -i` (distinto en Linux y en el Mac): se reescribe por un temporal.
    tmp="$(mktemp)"
    awk -v c="$clave" -v v="$valor" 'BEGIN{FS=OFS="="} $1==c && $2=="" && NF==2 {print c "=" v; next} {print}' .env > "$tmp"
    cat "$tmp" > .env; rm -f "$tmp"
    echo "  ${clave}: generado"
  elif ! grep -qE "^${clave}=" .env; then
    # Una variable nueva de una versión posterior: se agrega al final.
    printf '%s=%s\n' "$clave" "$valor" >> .env
    echo "  ${clave}: agregado"
  fi
}

hex() { openssl rand -hex "${1:-32}"; }

echo "Secretos internos:"
poner CRON_SECRET "$(hex)"
poner SUPABASE_CRON_SECRET "$(hex)"
poner OAUTH_STATE_SECRET "$(hex)"
poner HOME_PREVIEW_TOKEN_SECRET "$(hex)"
poner SUSTITUCION_TOKEN_SECRET "$(hex)"
poner INNGEST_EVENT_KEY "$(hex 16)"
poner INNGEST_SIGNING_KEY "$(hex)"
poner INTEGRACIONES_CLAVE_CIFRADO "$(openssl rand -base64 32)"

if grep -qE "^NEXT_PUBLIC_VAPID_PUBLIC_KEY=$" .env; then
  echo "Claves VAPID (push):"
  claves=$(docker run --rm node:24-alpine npx --yes web-push generate-vapid-keys --json)
  pub=$(echo "$claves" | sed -E 's/.*"publicKey":"([^"]+)".*/\1/')
  priv=$(echo "$claves" | sed -E 's/.*"privateKey":"([^"]+)".*/\1/')
  poner NEXT_PUBLIC_VAPID_PUBLIC_KEY "$pub"
  poner VAPID_PRIVATE_KEY "$priv"
fi

echo
echo "Listo. Falta completar a mano en deploy/.env:"
grep -nE "^(NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|RESEND_FROM)=(.*IP-DEL-SERVIDOR.*)?$" .env || echo "  (nada)"
