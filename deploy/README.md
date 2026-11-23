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
No hace falta Node en el servidor: si no está, `migrar.sh` corre la CLI de Supabase en un contenedor.

**Antes de abrir:** hay un ensayo general con Mercado Pago de prueba y sin dominio, en [`deploy/ensayo/`](ensayo/PRUEBAS.md).

**Para abrir:** dominio propio con túnel de Cloudflare, copias de seguridad y cortes de luz, en [`deploy/PRODUCCION.md`](PRODUCCION.md).

### Raspberry Pi

Pensado para una Raspberry Pi 5 de 8 GB, todavía sin probar en una. Las imágenes que se usan publican versión ARM de 64 bits; si alguna no la tuviera, `docker compose pull` lo dice en el acto. Lo que importa:

- **Raspberry Pi OS de 64 bits** (`uname -m` tiene que decir `aarch64`).
- **La base en un SSD**, no en la tarjeta SD. Postgres escribe todo el tiempo y una SD se gasta y va lenta. Sirve un NVMe con su placa, o un SSD por USB 3. Lo más simple es arrancar el sistema entero desde el SSD.
- **Swap de 4 GB o más**, porque compilar la app pide hasta 6 GB de memoria. En Raspberry Pi OS, en `/etc/dphys-swapfile`:

  ```sh
  CONF_SWAPSIZE=4096
  CONF_MAXSWAP=4096
  ```

  Después, `sudo systemctl restart dphys-swapfile`.
- **Compilar con Supabase parado.** La compilación y Supabase no entran juntos en 8 GB. El ensayo ya lo hace solo. A mano:

  ```sh
  cd ~/supabase-project && docker compose stop
  cd /ruta/al/repo/deploy && docker compose build app
  cd ~/supabase-project && docker compose up -d
  ```

  La primera compilación tarda bastante: media hora o más.
- **Refrigeración activa** (el ventilador oficial): con la compilación al 100 % de CPU, sin ventilador se frena.

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

El script hace cuatro cosas:

1. Prepara una copia de las migraciones con los cinco arreglos que hacen falta para recorrerlas desde una base vacía (`deploy/scripts/preparar-migraciones.sh`; son los mismos que usa el CI del repo original) y la aplica con la CLI de Supabase (`npx supabase db push`). Las de `supabase/migrations/` no se tocan.
2. Vuelve a adaptar la base al servidor propio (`deploy/sql/adaptar-autoalojado.sql`): zona de Argentina, la URL de tu servidor en lugar de `tentare.app`, los horarios fijos de `pg_cron` corridos a la hora de Argentina y el estudio sin prueba de 7 días. Hace falta en **cada** actualización: las migraciones nuevas del repo original vuelven a traer lo de Tentare. Si algo sigue llamando a `tentare.app`, el script falla y lo dice. Si avisa de un horario que no puede correr solo (`WARNING: horario: …`), ajustalo a mano: `pg_cron` va en UTC y Argentina es UTC−3.
3. Carga en Vault `app_url` y `supabase_cron_secret`, que usan los trabajos de `pg_cron`.
4. Al final verifica que ningún trabajo siga apuntando a `tentare.app`; el resultado tiene que ser 0.

Se puede volver a correr: solo aplica las migraciones nuevas. **No** carga `supabase/seed.sql`, que son datos de demostración y empiezan con un `TRUNCATE`.

La instalación desde cero está probada: las 905 migraciones, la adaptación (dos veces, para comprobar que no cambia nada la segunda) y Vault, sobre una base vacía.

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

**Conciliador:** cada 30 minutos el contenedor `cron` repasa los pagos de tu cuenta de las últimas 72 h y aplica los que el webhook no haya aplicado (servidor caído, clave mal puesta, dominio sin resolver). Si eso pasa, queda un aviso en Sentry para revisar el webhook. Para forzarlo a mano: `docker compose exec cron llamar mercadopago-conciliar`.

**Devoluciones:** en la ficha de la alumna, el botón «Devolver» de un recibo pagado con Mercado Pago le pide la devolución a Mercado Pago (con la política de devoluciones que tengas configurada: plazo y «solo sin usar»). Cuando Mercado Pago la confirma, Tentare marca el recibo como devuelto, anota la devolución, avisa a la alumna y te ofrece quitarle el bono, igual que con Stripe. Una devolución o un contracargo hechos desde tu cuenta de Mercado Pago siguen el mismo camino. Si la compra incluía matrícula, se devuelve el pago entero desde el recibo del plan.

**Pagar y reservar una clase en un paso:** en la ficha de una clase, si la alumna no tiene bono que la cubra, «Ver opciones» le ofrece la clase suelta (y los bonos que la incluyen). Antes de mandarla a Mercado Pago se comprueba que haya plaza para ella, y el pago caduca cuando se cierra la reserva de la clase (si quedan menos de 15 minutos, no se abre). Al volver, la ficha espera lo que diga el servidor: «Reservada» solo cuando la plaza está confirmada. Si la clase se llenó mientras pagaba, el bono queda entregado, entra en la lista de espera o lo tiene a su favor, y te llega el aviso de «pagó y no hubo plaza».

**Sin cuenta (invitada):** en `/reservar/<tu-slug>` (y desde el widget de tu web, que manda ahí a quien no ha entrado) se puede pagar y reservar una clase solo con nombre, email y teléfono. Al confirmarse el pago, Tentare crea su ficha con esos datos, le entrega la clase o el bono y le reserva la plaza. Comprar un bono suelto sin cuenta sigue el ajuste «Compra pública» del estudio, igual que con Stripe. A la vuelta, la página avisa de que el pago se está confirmando.

**Widget de tu web:** con sesión iniciada, «Planes» lleva a la alumna a Mercado Pago para pagar y, a la vuelta, llega a `/reservar/<tu-slug>`. Para que el widget pueda llamar al cobro desde tu dominio, ese dominio tiene que estar en los dominios autorizados del widget (Configuración › Mi web). Si cambiaste las condiciones del estudio, el widget no tiene la casilla para aceptarlas: la alumna las acepta comprando desde la app o desde `/reservar`.

**Tarjetas regalo:** se activan en Configuración, como siempre, y se compran en `/reservar/<tu-slug>/regalo`. Los importes van en pesos y sin centavos (por defecto 25.000, 50.000 y 100.000, o uno libre entre 10.000 y 300.000; se cambian en los ajustes). La tarjeta se crea y los correos salen solo cuando Mercado Pago confirma el pago. Si el pago se devuelve entero o hay un contracargo, la tarjeta se anula y se retira el saldo que le quedara (lo ya gastado no vuelve). Una devolución parcial no anula la tarjeta: queda anotada para que la revises.

**Botón de arrepentimiento y Botón de baja de servicio (Disposición 954/2025):** con `NEXT_PUBLIC_LOCALE=es-AR` aparecen siempre al pie de `/reservar/<tu-slug>`, aunque ocultes la sección de contacto, y en la app de la alumna (Perfil › Tus derechos como consumidor). Llevan a `/reservar/<tu-slug>/arrepentimiento` y `/reservar/<tu-slug>/baja`, donde cualquiera puede hacer el pedido sin cuenta y recibe en el acto un código de constancia. A vos te llega un aviso (push y email) y el pedido queda en la bandeja «por decidir» del panel (Clientes › Pedidos de arrepentimiento y baja). La devolución o la baja las hacés vos, como siempre, desde la ficha o desde Cobros. **Si tu estudio tiene web propia, poné ahí esos dos enlaces, visibles y con esos nombres:** el widget incrustado no los muestra, porque la norma pide que estén en el sitio donde se vende.

Sin Turnstile configurado (lo normal en un servidor propio), la compra de regalos queda protegida por el límite de peticiones y el campo trampa contra bots, sin captcha. Si un pago llega a un recibo que ya estaba cobrado, no se aplica dos veces; queda anotado como `no_aplicable` y hay que devolverlo desde Mercado Pago.

## Factura electrónica de ARCA

Con `NEXT_PUBLIC_LOCALE=es-AR`, Configuración › Cobros y facturas tiene la fila **Factura electrónica de ARCA**. Con ella configurada, cada recibo cobrado ofrece **Emitir factura de ARCA**: la factura sale con su CAE y su QR, y queda registrada en ARCA. Por ahora se emite a mano, recibo por recibo.

- **Qué comprobante sale:** monotributo emite **C**. Responsable inscripto emite **A** a otro responsable inscripto o a un monotributista, y **B** al resto. Siempre se informa la condición frente al IVA de quien la recibe (RG 5616, obligatoria). Al consumidor final se lo puede dejar sin identificar por debajo de $ 10.000.000 (RG 5700).
- **Antes de empezar:**
  - `INTEGRACIONES_CLAVE_CIFRADO` en `deploy/.env`. `generar-secretos.sh` la crea. Cifra la clave del certificado: si se pierde, hay que generar el certificado de nuevo.
  - En ARCA, un **punto de venta** «RECE para aplicativo y web services» (Administración de puntos de venta y domicilios).
- **Los pasos**, todos en el cajón:
  1. Cargá tus datos.
  2. Generá el pedido de certificado.
  3. Subilo a ARCA:
     - **Prueba:** WSASS. Después, «Crear autorización a servicio» para `wsfe`.
     - **Producción:** Administración de Certificados Digitales. Después, la relación con «Facturación Electrónica» en el Administrador de Relaciones.
  4. Pegá el certificado que te devuelve.
  5. Probá la conexión.
- **Empezá en prueba (homologación).** Esas facturas salen marcadas «SIN VALIDEZ FISCAL». Para pasar a producción hace falta otro certificado.
- **Nunca se duplica una factura.** El comprobante se anota con su número **antes** de pedir el CAE. Si ARCA no contesta, queda pendiente, y el siguiente intento consulta ese número o reenvía la misma solicitud. Las facturas quedan en la tabla `comprobantes_arca`: las emitidas no cambian ni se borran.
- **Todavía no hace:**
  - **Notas de crédito.** Por ahora, una factura se anula desde ARCA.
  - **Factura en el momento del cobro.**
  - **Listado de facturas de ARCA.** Cada una se ve desde su recibo.

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
