#!/bin/sh
# Programa la copia diaria con systemd (deploy/PRODUCCION.md › Copias).
#
#   sudo deploy/scripts/programar-copia.sh ~/supabase-project [HH:MM]
#
# Crea tentare-copia.service y tentare-copia.timer: todos los días a las 04:30
# (o la hora que digas). Si la Pi estaba apagada a esa hora, la hace al
# arrancar (Persistent). Ver la última:  systemctl status tentare-copia
set -eu
[ "$(id -u)" = 0 ] || { echo "Corré con sudo."; exit 1; }
SB="$(cd "${1:?Uso: programar-copia.sh /ruta/a/supabase-project [HH:MM]}" && pwd)"
HORA="${2:-04:30}"
case "$HORA" in [0-2][0-9]:[0-5][0-9]) ;; *) echo "La hora va como HH:MM"; exit 1 ;; esac
SCRIPT="$(cd "$(dirname "$0")" && pwd)/copia.sh"

cat > /etc/systemd/system/tentare-copia.service <<EOF
[Unit]
Description=Copia de seguridad de Centra
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=$SCRIPT $SB
EOF

cat > /etc/systemd/system/tentare-copia.timer <<EOF
[Unit]
Description=Copia diaria de Centra

[Timer]
OnCalendar=*-*-* $HORA:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now tentare-copia.timer
echo "✔ Copia diaria a las $HORA. Para hacer una ya:  sudo systemctl start tentare-copia"
systemctl list-timers tentare-copia.timer --no-pager || true
