#!/bin/sh
# Aplica las migraciones de supabase/migrations/ a la base de Supabase
# autoalojada y carga en Vault los dos secretos que usan los trabajos de
# pg_cron: 'app_url' y 'supabase_cron_secret'.
#
# Uso:  deploy/scripts/migrar.sh /ruta/a/supabase-project
#
# Se puede volver a correr: solo aplica las migraciones nuevas, vuelve a adaptar
# la base (deploy/sql/adaptar-autoalojado.sql) y actualiza los secretos. NO
# carga supabase/seed.sql (son datos de demostración y empieza con un TRUNCATE
# de todo).
set -eu
DEPLOY="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$DEPLOY/.." && pwd)"
SB="${1:?Uso: migrar.sh /ruta/a/supabase-project}"
SB="$(cd "$SB" && pwd)"

leer() { grep -E "^$2=" "$1" | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

APP_URL=$(leer "$DEPLOY/.env" NEXT_PUBLIC_APP_URL | sed 's:/*$::')
CRON_SECRETO=$(leer "$DEPLOY/.env" SUPABASE_CRON_SECRET)

[ -n "$APP_URL" ] || { echo "Falta NEXT_PUBLIC_APP_URL en $DEPLOY/.env"; exit 1; }
[ -n "$CRON_SECRETO" ] || { echo "Falta SUPABASE_CRON_SECRET en $DEPLOY/.env (generar-secretos.sh)"; exit 1; }

# Las plantillas de correo (el código de 6 cifras) y los ajustes de Tentare
# sobre el compose de Supabase, siempre al día con este repo.
mkdir -p "$SB/plantillas"
CAMBIO_SB=no
for f in "$REPO"/supabase/templates/*.html; do
  cmp -s "$f" "$SB/plantillas/$(basename "$f")" || { cp "$f" "$SB/plantillas/"; CAMBIO_SB=si; }
done
cmp -s "$DEPLOY/supabase/docker-compose.tentare.yml" "$SB/docker-compose.tentare.yml" \
  || { cp "$DEPLOY/supabase/docker-compose.tentare.yml" "$SB/"; CAMBIO_SB=si; }

# Una copia de las migraciones con los cinco arreglos que hacen falta para
# recorrerlas desde una base vacía (los mismos que el job de CI). La de
# supabase/migrations/ no se toca.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
"$DEPLOY/scripts/preparar-migraciones.sh" "$TMP"
M="$TMP/supabase/migrations"

# Cada migración se aplica con psql DENTRO del contenedor de la base, en su
# propia transacción, y se anota en supabase_migrations.schema_migrations (la
# misma tabla y el mismo número de versión que usa la CLI de Supabase: lo que
# ella ya aplicó se saltea). No se usa la CLI porque corre las sentencias de a
# una, fuera de una transacción, y las migraciones con LOCK TABLE fallan
# («LOCK TABLE can only be used in transaction blocks»).
PSQL="docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q"
echo "→ Migraciones"
$PSQL <<'SQL'
set client_min_messages = warning;
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);
SQL
$PSQL -At -c "select version from supabase_migrations.schema_migrations" > "$TMP/aplicadas"

LOTE="$TMP/lote.sql"
: > "$LOTE"
PENDIENTES=0
for f in $(ls "$M" | LC_ALL=C sort); do
  version="${f%%_*}"
  grep -qx "$version" "$TMP/aplicadas" && continue
  nombre="${f#*_}"; nombre="${nombre%.sql}"
  {
    printf '\\echo   %s\n' "$f"
    printf 'begin;\n'
    cat "$M/$f"
    # El «;» suelto cierra una última sentencia sin punto y coma.
    printf '\n;\ninsert into supabase_migrations.schema_migrations (version, name) values (%s, %s);\ncommit;\n' "'$version'" "'$nombre'"
  } >> "$LOTE"
  PENDIENTES=$((PENDIENTES + 1))
done

if [ "$PENDIENTES" -eq 0 ]; then
  echo "  Ninguna pendiente."
else
  echo "  $PENDIENTES pendientes (la que falle, si falla, es la última que aparece):"
  # Un solo psql para todas: con ON_ERROR_STOP, la que falla se deshace entera
  # y las siguientes no se aplican.
  $PSQL < "$LOTE" > "$TMP/salida" 2>&1 || {
    tail -n 25 "$TMP/salida"
    echo "✗ Falló la última migración de la lista. Las anteriores quedaron aplicadas: corregí y volvé a correr."
    exit 1
  }
  tail -n 1 "$TMP/salida"
  echo "  $PENDIENTES aplicadas."
fi

# Lo que las migraciones nuevas del repo original vuelvan a traer de Tentare
# (su dominio, la zona de Madrid, horarios de Madrid, la prueba de 7 días), se
# adapta otra vez. Falla si algo sigue llamando a tentare.app.
echo "→ Adaptación del servidor propio"
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$DEPLOY/sql/adaptar-autoalojado.sql"

echo "→ Secretos de Vault"
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -v app_url="$APP_URL" -v cron_secret="$CRON_SECRETO" <<'SQL'
\o /dev/null
select set_config('tentare.app_url', :'app_url', false);
select set_config('tentare.cron_secret', :'cron_secret', false);
\o
do $$
declare
  v record;
begin
  for v in select * from (values
    ('app_url', current_setting('tentare.app_url')),
    ('supabase_cron_secret', current_setting('tentare.cron_secret'))
  ) as t(nombre, valor)
  loop
    if exists (select 1 from vault.secrets where name = v.nombre) then
      perform vault.update_secret((select id from vault.secrets where name = v.nombre), v.valor);
    else
      perform vault.create_secret(v.valor, v.nombre);
    end if;
  end loop;
end $$;
select name, case when name = 'app_url' then decrypted_secret else '(oculto)' end as valor
from vault.decrypted_secrets where name in ('app_url', 'supabase_cron_secret') order by name;
select count(*) as trabajos_que_apuntan_a_tentare_app from cron.job where command like '%tentare.app%';
SQL

echo "✔ Base lista."
if [ "$CAMBIO_SB" = si ]; then
  echo "→ Cambiaron las plantillas de correo o los ajustes de Supabase. Para aplicarlos:"
  echo "    cd $SB && docker compose up -d"
fi
