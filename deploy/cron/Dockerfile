# Reemplazo de los crons de Vercel: crond de busybox que llama a
# /api/cron/<ruta> de la app con el CRON_SECRET.
FROM alpine:3.22
RUN apk add --no-cache curl tzdata
COPY deploy/cron/llamar.sh /usr/local/bin/llamar
COPY deploy/crontab /etc/crontabs/root
RUN chmod +x /usr/local/bin/llamar
# crond no pasa el entorno del contenedor a los trabajos: se guarda al arrancar.
CMD ["sh", "-c", "printenv | grep -E '^(CRON_SECRET|APP_INTERNAL_URL)=' | sed 's/^/export /' > /etc/cron.env && exec crond -f -l 6"]
