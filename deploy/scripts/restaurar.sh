#!/bin/sh
# Restaura una copia de deploy/scripts/copia.sh (deploy/PRODUCCION.md › Restaurar).
#
#   sudo deploy/scripts/restaurar.sh /var/backups/tentare/tentare-20261123-0430.tar.enc ~/supabase-project
#
# Para Tentare y Supabase, aparta la carpeta de datos actual (no la borra: queda
# como data.antes-de-restaurar-…), pone la de la copia y los archivos subidos,
# y vuelve a levantar todo. Los .env NO se pisan: si los secretos de la copia
# son otros, avisa y deja los de la copia al lado para revisarlos.
#
# Sirve para la misma versión de Postgres (la copia exacta). Para otra versión,
# el volcado db.dump va dentro de la copia (pg_restore).
set -eu
COPIA="${1:?Uso: restaurar.sh /ruta/a/tentare-….tar[.enc] /ruta/a/supabase-project}"
SB="$(cd "${2:?Falta la carpeta de Supabase}" && pwd)"
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
ENV_APP="$DEPLOY/.env"
ENV_SB="$SB/.env"
. "$DEPLOY/scripts/comun.sh"
[ -f "$COPIA" ] || { echo "No existe $COPIA"; exit 1; }
[ "$(id -u)" = 0 ] || { echo "Corré la restauración con sudo (la carpeta de datos es de Postgres)."; exit 1; }

umask 077
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT INT TERM

case "$COPIA" in
  *.enc)
    CLAVE="${COPIA_CLAVE:-$(leer "$ENV_APP" COPIA_CLAVE 2>/dev/null || true)}"
    if [ -z "$CLAVE" ]; then
      printf "Frase de la copia (COPIA_CLAVE): "; stty -echo; read -r CLAVE; stty echo; echo
    fi
    COPIA_CLAVE="$CLAVE" openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:COPIA_CLAVE -in "$COPIA" -out "$TMP/copia.tar" \
      || { echo "No se pudo descifrar: ¿es la frase correcta?"; exit 1; }
    tar -C "$TMP" -xf "$TMP/copia.tar"; rm -f "$TMP/copia.tar" ;;
  *) tar -C "$TMP" -xf "$COPIA" ;;
esac
[ -f "$TMP/db-datos.tar.gz" ] || { echo "La copia no tiene db-datos.tar.gz."; exit 1; }

echo "Copia hecha el $(cat "$TMP/HECHA" 2>/dev/null || echo '?')."
for clave in JWT_SECRET POSTGRES_PASSWORD ANON_KEY SERVICE_ROLE_KEY; do
  if [ "$(leer "$TMP/supabase.env" "$clave")" != "$(leer "$ENV_SB" "$clave")" ]; then
    echo "⚠ $clave de la copia no es el de ahora."; SECRETOS_DISTINTOS=si
  fi
done
for clave in INTEGRACIONES_CLAVE_CIFRADO NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  if [ "$(leer "$TMP/tentare.env" "$clave")" != "$(leer "$ENV_APP" "$clave")" ]; then
    echo "⚠ $clave de la copia no es el de ahora."; SECRETOS_DISTINTOS=si
  fi
done
if [ "${SECRETOS_DISTINTOS:-no}" = si ]; then
  cp "$TMP/supabase.env" "$ENV_SB.de-la-copia"; cp "$TMP/tentare.env" "$ENV_APP.de-la-copia"
  echo "  Dejé los .env de la copia al lado (*.de-la-copia). En una instalación nueva, usá esos."
fi

printf "Esto reemplaza la base y los archivos subidos de ahora. Escribí RESTAURAR para seguir: "
read -r ok
[ "$ok" = RESTAURAR ] || { echo "No se tocó nada."; exit 1; }

MARCA="$(date +%Y%m%d-%H%M%S)"
echo "→ Parando Tentare y Supabase"
(cd "$DEPLOY" && docker compose down)
(cd "$SB" && docker compose down)

echo "→ Base de la copia (la de ahora queda en data.antes-de-restaurar-$MARCA)"
mv "$SB/volumes/db/data" "$SB/volumes/db/data.antes-de-restaurar-$MARCA"
mkdir -p "$SB/volumes/db/data"
tar -C "$SB/volumes/db/data" -xzpf "$TMP/db-datos.tar.gz"
if [ -f "$TMP/storage.tar.gz" ]; then
  echo "→ Archivos subidos"
  [ -d "$SB/volumes/storage" ] && mv "$SB/volumes/storage" "$SB/volumes/storage.antes-de-restaurar-$MARCA"
  mkdir -p "$SB/volumes/storage"
  tar -C "$SB/volumes/storage" -xzpf "$TMP/storage.tar.gz"
fi

echo "→ Levantando"
(cd "$SB" && docker compose up -d)
esperar_supabase
(cd "$DEPLOY" && docker compose up -d)
echo "✔ Restaurada. Cuando compruebes que está todo, podés borrar las carpetas *.antes-de-restaurar-$MARCA."
