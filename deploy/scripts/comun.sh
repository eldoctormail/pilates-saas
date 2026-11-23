#!/bin/sh
# Funciones compartidas por los scripts de instalación (ensayo, producción,
# copias). Se cargan con:  . "$DEPLOY/scripts/comun.sh"
# Usan $SB (carpeta de Supabase), $DEPLOY (carpeta deploy/) y POCA_MEMORIA.

# Pone CLAVE=valor en un .env: reemplaza la línea si está y la agrega si no.
poner() {
  archivo="$1"; clave="$2"; valor="$3"
  if grep -qE "^$clave=" "$archivo"; then
    tmp="$(mktemp)"
    awk -v c="$clave" -v v="$valor" 'BEGIN{FS=OFS="="} $1==c {print c "=" v; next} {print}' "$archivo" > "$tmp"
    cat "$tmp" > "$archivo"; rm -f "$tmp"
  else
    printf '%s=%s\n' "$clave" "$valor" >> "$archivo"
  fi
}

leer() { grep -E "^$2=" "$1" | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

# ¿Menos de 12 GB entre RAM y swap? (Raspberry Pi y máquinas chicas)
calcular_memoria() {
  MEM_KB=$(awk '/^(MemTotal|SwapTotal):/ {s += $2} END {print s}' /proc/meminfo)
  POCA_MEMORIA=$([ "$MEM_KB" -lt 12000000 ] && echo si || echo no)
}

# Compila la imagen de la app. Con poca memoria, con Supabase parado.
compilar() {
  if [ "${POCA_MEMORIA:-no}" = si ]; then
    echo "→ Poca memoria: Supabase se para mientras compila la app"
    (cd "$DEPLOY" && docker compose stop app) >/dev/null 2>&1 || true
    (cd "$SB" && docker compose stop)
  fi
  echo "→ Compilando la app"
  (cd "$DEPLOY" && docker compose build app)
}

# Espera a que la base de Supabase conteste.
esperar_supabase() {
  i=0
  until docker exec supabase-db pg_isready -U postgres -q 2>/dev/null; do
    i=$((i + 1)); [ $i -gt 120 ] && { echo "Supabase no levantó. Mirá: cd $SB && docker compose ps"; exit 1; }
    sleep 2
  done
}
