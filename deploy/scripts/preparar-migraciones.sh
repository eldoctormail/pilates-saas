#!/bin/sh
# Copia supabase/migrations/ a una carpeta aparte y le aplica los arreglos que
# hacen falta para recorrer TODAS las migraciones desde una base vacía.
#
# Uso:  deploy/scripts/preparar-migraciones.sh /carpeta/destino
#       (deja en /carpeta/destino/supabase/migrations/ la copia arreglada)
#
# Por qué: en producción (la de Tentare) cada migración se aplicó en su momento,
# y unas pocas dependen de un estado intermedio que no se puede reproducir desde
# cero. El job de base de datos de CI (.github/workflows/ci.yml, «Aplicar
# migraciones desde cero») los arregla en su copia efímera; un servidor propio
# nuevo está en la misma situación. Estos son EXACTAMENTE los mismos cinco
# arreglos, en el mismo orden (lo comprueba lib/deploy-migraciones.test.ts), y
# nunca se tocan los ficheros de supabase/migrations/.
#
# Es determinista: correrlo otra vez da los mismos nombres, así que un
# `supabase db push` posterior ve aplicado lo mismo que la vez anterior.
set -eu
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="${1:?Uso: preparar-migraciones.sh /carpeta/destino}"
M="$DEST/supabase/migrations"

rm -rf "$DEST/supabase"
mkdir -p "$M"
cp "$REPO"/supabase/migrations/*.sql "$M/"
cp "$REPO/supabase/config.toml" "$DEST/supabase/" 2>/dev/null || true

# 1. panel_interno antes de 0135 (0135 lee la tabla que crea).
mv "$M/20260725170000_panel_interno.sql" "$M/01340_panel_interno.sql"

# 2. El revoke de tiene_consentimiento_salud, justo después de crear la función.
mv "$M/20260729161000_tiene_consentimiento_salud_revoca_anon.sql" "$M/20260804201831_tiene_consentimiento_salud_revoca_anon.sql"

# 3. RLS sobre una tabla huérfana que ninguna migración crea.
rm "$M/20260819211544_respaldo_sereno_studio1_rls.sql"

# 4. PAY-4 original, roto de origen (su sustituto crea la tabla de verdad).
rm "$M/20260918000200_pay4_cobros_intentos.sql"

# 5. Un revoke/grant prematuro (y redundante) sobre reservar_plaza(9).
sed -i \
  -e '/^revoke execute on function public\.reservar_plaza(text, text, text, text, boolean, boolean, text, boolean, boolean) from public, anon, authenticated;$/d' \
  -e '/^grant execute on function public\.reservar_plaza(text, text, text, text, boolean, boolean, text, boolean, boolean) to service_role, postgres;$/d' \
  "$M/20260919074101_reservar_plaza_una_sola_firma_y_entitlement_sin_js.sql"

echo "$(ls "$M" | wc -l) migraciones preparadas en $M"
