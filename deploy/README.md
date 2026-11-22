# Tentare en servidor propio

La instalación tiene dos partes que corren en el mismo servidor:

| Parte | Qué es | Dónde |
| --- | --- | --- |
| Supabase | Postgres, Auth, API, Storage y Realtime. Se usa el `docker-compose` oficial | `~/supabase-project` (fuera del repo) |
| Tentare | La app Next.js, Inngest (trabajos de fondo) y los crons | `deploy/` de este repo |

Sin dominio todavía, todo funciona con la IP del servidor:

- App: `http://IP:3000`
- Supabase (API y panel Studio): `http://IP:8000`

Cuando haya dominio, ver [Pasar a dominio](#pasar-a-dominio).

> Con `http://IP`, sin TLS, algunas cookies marcadas `secure` (por ejemplo, el estado de la suscripción) no se guardan. Sirve para probar, pero para usarlo de verdad conviene tener HTTPS.

**Requisitos:** Linux con Docker y el plugin Compose, al menos 4 GB de RAM (8 GB para compilar la app con holgura), `git` y `openssl`.

---

## 1. Supabase

```sh
cd ~
curl -fsSL https://raw.githubusercontent.com/supabase/supabase/master/docker/setup.sh -o setup.sh
sh setup.sh -p supabase-project
```

El script instala lo que falte, copia el `docker-compose` oficial y genera las claves. Pide tres URL:

| Pregunta | Valor |
| --- | --- |
| `SUPABASE_PUBLIC_URL` | `http://IP:8000` |
| `API_EXTERNAL_URL` | `http://IP:8000/auth/v1` (el que propone) |
| `SITE_URL` | `http://IP:3000` |

Después, en `~/supabase-project/.env`:

```sh
# Redirecciones permitidas después del login
ADDITIONAL_REDIRECT_URLS=http://IP:3000/**

# Correo de Auth (confirmaciones, recuperar contraseña). Cualquier SMTP sirve.
SMTP_ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_SENDER_NAME=Pilates

# Sumar los ajustes de Tentare
COMPOSE_FILE=docker-compose.yml:docker-compose.tentare.yml
```

Para probar sin SMTP, se puede poner `ENABLE_EMAIL_AUTOCONFIRM=true` (las cuentas quedan confirmadas sin correo). Hay que volver a `false` antes de usarlo en serio.

```sh
cp /ruta/al/repo/deploy/supabase/docker-compose.tentare.yml ~/supabase-project/
cd ~/supabase-project && docker compose up -d
docker compose ps        # todos "healthy" antes de seguir
```

El panel Studio queda en `http://IP:8000`, con el usuario y la contraseña de `DASHBOARD_USERNAME` y `DASHBOARD_PASSWORD` del `.env`.

## 2. Configuración de la app

```sh
cd /ruta/al/repo
deploy/scripts/generar-secretos.sh
```

Crea `deploy/.env` con los secretos internos, las claves de Inngest y las de push. Después hay que completar a mano:

- `NEXT_PUBLIC_APP_URL=http://IP:3000`
- `NEXT_PUBLIC_SUPABASE_URL=http://IP:8000`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: el `ANON_KEY` de `~/supabase-project/.env`
- `SUPABASE_SERVICE_ROLE_KEY`: el `SERVICE_ROLE_KEY` de ese mismo archivo
- `RESEND_API_KEY` y `RESEND_FROM`, para los correos de la app (reservas, avisos). Se puede dejar para después.

## 3. Base de datos

```sh
deploy/scripts/migrar.sh ~/supabase-project
```

El script hace tres cosas:

1. Aplica las migraciones con la CLI de Supabase (`npx supabase db push`).
2. Carga en Vault `app_url` y `supabase_cron_secret`, que usan los trabajos de `pg_cron`.
3. Al final verifica que ningún trabajo siga apuntando a `tentare.app`; el resultado tiene que ser 0.

Se puede volver a correr: solo aplica las migraciones nuevas. **No** carga `supabase/seed.sql`, que son datos de demostración y empiezan con un `TRUNCATE`.

## 4. La app

```sh
cd deploy
docker compose up -d --build
```

La primera compilación tarda varios minutos. Después:

- Abrir `http://IP:3000/crear-estudio` y crear el estudio.
- Inngest: el panel queda en `http://127.0.0.1:8288`, solo desde el servidor. Ahí se ve si la app quedó registrada y si corren los trabajos.
- Crons: `docker compose logs -f cron`.

## Mercado Pago (cobro online)

Las alumnas pueden, desde la app y con Checkout Pro: **pagar sus recibos pendientes** (cuotas, renovaciones, lo que les cargues) y **comprar un bono o plan** de tu tienda (con código de descuento, matrícula y cobro proporcional, igual que con Stripe). **Hace falta un dominio con HTTPS**, porque Mercado Pago tiene que poder llamar al webhook.

1. En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app), creá una aplicación de **Checkout Pro**.
2. En **Credenciales de producción**, copiá el Access Token a `MERCADOPAGO_ACCESS_TOKEN`. Para probar, usá primero el de prueba (`TEST-…`) con usuarios de prueba.
3. En **Webhooks**, cargá `https://TU-DOMINIO/api/mercadopago/webhook` con el evento **Pagos**, y copiá la clave secreta a `MERCADOPAGO_WEBHOOK_SECRET`.
4. Poné `NEXT_PUBLIC_PASARELA=mercadopago` y reconstruí la app: `cd deploy && docker compose up -d --build`.

Para comprobar que funciona: cargá un recibo pendiente a una alumna de prueba y pagalo desde su app; al volver, «Pagos» lo tiene que mostrar como pagado en unos segundos. Después comprá un bono desde «Comprar»: al volver, tiene que aparecer en «Mis bonos». Cada pago que llega queda anotado en la tabla `pagos_mercadopago`, con lo que se hizo con él.

Cada compra de plan queda en `compras_mercadopago` con lo que se decidió cobrar; el webhook entrega exactamente eso. Una compra que no se paga caduca a las 24 h (y si se llevó una plaza de matrícula gratis, la devuelve).

Lo que todavía no hace (próximas etapas): pagar y reservar una clase suelta en un paso, comprar sin cuenta, el widget de tu web, las tarjetas regalo y las devoluciones desde el panel. Si un pago llega a un recibo que ya estaba cobrado, no se aplica dos veces; queda anotado como `no_aplicable` y hay que devolverlo desde Mercado Pago.

## Actualizar

```sh
git pull
deploy/scripts/migrar.sh ~/supabase-project
cd deploy && docker compose up -d --build
```

## Pasar a dominio

Con dos nombres, por ejemplo `pilates.ejemplo.com.ar` (app) y `api.pilates.ejemplo.com.ar` (Supabase), detrás del proxy inverso con TLS:

1. `~/supabase-project/.env`: cambiar `SUPABASE_PUBLIC_URL`, `API_EXTERNAL_URL`, `SITE_URL` y `ADDITIONAL_REDIRECT_URLS`. Luego `docker compose up -d`.
2. `deploy/.env`: cambiar `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_SUPABASE_URL`.
3. `deploy/scripts/migrar.sh ~/supabase-project`, que actualiza `app_url` en Vault.
4. `cd deploy && docker compose up -d --build`. Las URL públicas se graban al compilar, así que hay que reconstruir.

## Backup rápido

```sh
docker exec supabase-db pg_dump -U postgres -Fc postgres > tentare-$(date +%F).dump
```

Los archivos subidos (fotos, adjuntos) están en `~/supabase-project/volumes/storage`. Hay que copiar esa carpeta también.

## Qué queda apagado

Stripe (cobros online), VeriFactu, WhatsApp, Zoom, Google, Klaviyo, Cloudflare (Turnstile, R2, Stream), Sentry, PostHog e IA. Las variables quedan vacías y las pantallas que dependen de esos servicios no funcionan hasta configurarlos.
