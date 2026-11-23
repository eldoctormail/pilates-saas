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

PGPASS=$(leer "$SB/.env" POSTGRES_PASSWORD)
TENANT=$(leer "$SB/.env" POOLER_TENANT_ID)
PGPORT=$(leer "$SB/.env" POSTGRES_PORT); PGPORT=${PGPORT:-5432}
APP_URL=$(leer "$DEPLOY/.env" NEXT_PUBLIC_APP_URL | sed 's:/*$::')
CRON_SECRETO=$(leer "$DEPLOY/.env" SUPABASE_CRON_SECRET)

[ -n "$PGPASS" ] || { echo "Falta POSTGRES_PASSWORD en $SB/.env"; exit 1; }
[ -n "$APP_URL" ] || { echo "Falta NEXT_PUBLIC_APP_URL en $DEPLOY/.env"; exit 1; }
[ -n "$CRON_SECRETO" ] || { echo "Falta SUPABASE_CRON_SECRET en $DEPLOY/.env (generar-secretos.sh)"; exit 1; }

# Conexión por el pooler (supavisor, modo sesión), que es lo que publica el
# compose oficial de Supabase.
# Sin TLS: el pooler local no lo ofrece, y la CLI actual de Supabase lo intenta
# por defecto («The server does not support SSL connections»). La conexión no
# sale de la máquina.
DB_URL="postgresql://postgres.${TENANT}:${PGPASS}@127.0.0.1:${PGPORT}/postgres?sslmode=disable"

# Una copia de las migraciones con los cinco arreglos que hacen falta para
# recorrerlas desde una base vacía (los mismos que el job de CI). La de
# supabase/migrations/ no se toca.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
"$DEPLOY/scripts/preparar-migraciones.sh" "$TMP"

echo "→ Migraciones"
cd "$TMP"
# Sin Node en el servidor (lo normal en una Raspberry o un servidor limpio), la
# CLI corre en un contenedor de Node con la red del servidor.
if command -v npx >/dev/null 2>&1; then
  npx --yes supabase@2 db push --db-url "$DB_URL" --include-all
else
  docker run --rm --network host -v "$TMP":/w -w /w node:24-bookworm-slim \
    npx --yes supabase@2 db push --db-url "$DB_URL" --include-all
fi

# Lo que las migraciones nuevas del repo original vuelvan a traer de Tentare
# (su dominio, la zona de Madrid, horarios de Madrid, la prueba de 7 días), se
# adapta otra vez. Falla si algo sigue llamando a tentare.app.
echo "→ Adaptación del servidor propio"
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$DEPLOY/sql/adaptar-autoalojado.sql"

echo "→ Secretos de Vault"
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -v app_url="$APP_URL" -v cron_secret="$CRON_SECRETO" <<'SQL'
select set_config('tentare.app_url', :'app_url', false);
select set_config('tentare.cron_secret', :'cron_secret', false);
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
