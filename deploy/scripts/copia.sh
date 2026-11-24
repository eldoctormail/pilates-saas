#!/bin/sh
# Copia de seguridad de Centra (deploy/PRODUCCION.md › Copias).
#
#   deploy/scripts/copia.sh ~/supabase-project
#
# Cada copia es UN archivo tentare-AAAAMMDD-HHMM.tar (o .tar.enc, cifrado) con:
#   · db.dump         pg_dump de la base entera, hecho en caliente. Sirve aunque
#                     cambie la versión de Postgres.
#   · db-datos.tar.gz la carpeta de datos de Postgres, con la base parada unos
#                     segundos: restaura todo tal cual (misma versión). Es la
#                     que usa deploy/scripts/restaurar.sh.
#   · storage.tar.gz  los archivos subidos (avatares, fotos de la comunidad).
#   · supabase.env y tentare.env: los secretos. Sin ellos la copia no sirve
#                     (las claves JWT y la de cifrado tienen que ser las mismas).
#
# Configuración, en deploy/.env:
#   COPIA_DESTINO    carpeta donde se guardan (por defecto /var/backups/tentare).
#                    Mejor en otro disco que el del sistema.
#   COPIA_CONSERVAR  cuántas se guardan (por defecto 14).
#   COPIA_CLAVE      frase para cifrar la copia (AES-256). Con ella, la copia
#                    lleva los secretos protegidos. Guardala FUERA de la Pi: sin
#                    ella no se puede restaurar.
#   COPIA_REMOTO     opcional: un remoto de rclone («b2:mi-bucket/tentare»)
#                    para mandar también una copia fuera. Exige COPIA_CLAVE.
#                    Se configura una vez con  docker run --rm -it -v ~/.config/rclone:/config/rclone rclone/rclone config
set -eu
SB="$(cd "${1:?Uso: copia.sh /ruta/a/supabase-project}" && pwd)"
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
ENV_APP="$DEPLOY/.env"
ENV_SB="$SB/.env"
. "$DEPLOY/scripts/comun.sh"

DESTINO="$(leer "$ENV_APP" COPIA_DESTINO)"; DESTINO="${DESTINO:-/var/backups/tentare}"
CONSERVAR="$(leer "$ENV_APP" COPIA_CONSERVAR)"; CONSERVAR="${CONSERVAR:-14}"
CLAVE="$(leer "$ENV_APP" COPIA_CLAVE)"
REMOTO="$(leer "$ENV_APP" COPIA_REMOTO)"
PGPASS="$(leer "$ENV_SB" POSTGRES_PASSWORD)"
DATOS="$SB/volumes/db/data"
STORAGE="$SB/volumes/storage"

[ -n "$REMOTO" ] && [ -z "$CLAVE" ] && { echo "COPIA_REMOTO necesita COPIA_CLAVE: una copia fuera va cifrada siempre."; exit 1; }
case "$CONSERVAR" in ''|*[!0-9]*) echo "COPIA_CONSERVAR tiene que ser un número"; exit 1 ;; esac
[ -d "$DATOS" ] || { echo "No está la carpeta de datos de Postgres ($DATOS)"; exit 1; }
[ -r "$DATOS" ] && [ -x "$DATOS" ] || { echo "No se puede leer $DATOS: corré la copia con sudo (es de Postgres)."; exit 1; }

umask 077
mkdir -p "$DESTINO"
NOMBRE="tentare-$(date +%Y%m%d-%H%M)"
TMP="$(mktemp -d "$DESTINO/.$NOMBRE.XXXX")"
DB_PARADA=no
limpiar() {
  # Pase lo que pase, la base vuelve a arrancar.
  if [ "$DB_PARADA" = si ]; then docker start supabase-db >/dev/null 2>&1 || true; fi
  rm -rf "$TMP"
}
trap limpiar EXIT INT TERM

echo "→ Volcado de la base (en caliente)"
docker exec -e PGPASSWORD="$PGPASS" supabase-db \
  pg_dump -h 127.0.0.1 -U supabase_admin -d postgres -Fc > "$TMP/db.dump"
[ -s "$TMP/db.dump" ] || { echo "El volcado salió vacío."; exit 1; }

echo "→ Carpeta de datos (la base se para unos segundos)"
docker stop -t 60 supabase-db >/dev/null
DB_PARADA=si
tar -C "$DATOS" -czf "$TMP/db-datos.tar.gz" .
docker start supabase-db >/dev/null
DB_PARADA=no

if [ -d "$STORAGE" ]; then
  echo "→ Archivos subidos"
  tar -C "$STORAGE" -czf "$TMP/storage.tar.gz" .
fi
cp "$ENV_SB" "$TMP/supabase.env"
cp "$ENV_APP" "$TMP/tentare.env"
ahora_iso > "$TMP/HECHA"

ARCHIVO="$DESTINO/$NOMBRE.tar"
tar -C "$TMP" -cf "$ARCHIVO" .
if [ -n "$CLAVE" ]; then
  echo "→ Cifrando"
  COPIA_CLAVE="$CLAVE" openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:COPIA_CLAVE -in "$ARCHIVO" -out "$ARCHIVO.enc"
  rm -f "$ARCHIVO"
  ARCHIVO="$ARCHIVO.enc"
fi
chmod 600 "$ARCHIVO"

if [ -n "$REMOTO" ]; then
  echo "→ Copia fuera: $REMOTO"
  docker run --rm -v "$HOME/.config/rclone:/config/rclone:ro" -v "$DESTINO:/data:ro" \
    rclone/rclone copy "/data/$(basename "$ARCHIVO")" "$REMOTO"
fi

echo "→ Rotación: se guardan las últimas $CONSERVAR"
ls -1t "$DESTINO"/tentare-*.tar "$DESTINO"/tentare-*.tar.enc 2>/dev/null | tail -n +"$((CONSERVAR + 1))" | while read -r viejo; do
  rm -f "$viejo"
done

ahora_iso > "$DESTINO/ULTIMA-COPIA-OK"
echo "✔ Copia: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"
