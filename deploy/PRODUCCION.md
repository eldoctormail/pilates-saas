# Pasar a producción

Para cuando el ensayo (`deploy/ensayo/PRUEBAS.md`) salió bien. Al terminar, Tentare queda:

- en tu dominio, por HTTPS, con un túnel de Cloudflare (no se abren puertos en el router);
- con copias de seguridad diarias;
- levantándose solo después de un corte de luz.

Usa dos direcciones, por ejemplo `app.tudominio.com.ar` para la app y `supabase.tudominio.com.ar` para Supabase.

## 1. Lo que tiene que estar antes

- [ ] El ensayo pasado y cerrado (`deploy/ensayo/ensayo.sh terminar …`).
- [ ] **El dominio en Cloudflare.** En cloudflare.com, «Add a site» con el plan gratuito. Después, en NIC Argentina (para un `.com.ar`), cambiá la delegación a los dos servidores de nombres que te da Cloudflare. Puede tardar unas horas.
- [ ] **Un SMTP real para Supabase.** Sin él, las alumnas no reciben el código para entrar. Dos opciones:
  - **Resend:** `smtp.resend.com`, puerto 465, usuario `resend` y tu clave de API como contraseña, con tu dominio verificado. La misma cuenta sirve para `RESEND_API_KEY`.
  - **Gmail:** con una contraseña de aplicación. Tiene un límite diario bajo.

  Se carga en el `.env` de Supabase (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME`), con `ENABLE_EMAIL_AUTOCONFIRM=false`.

  Los correos de la propia app (invitaciones, avisos, constancias) van aparte, en `deploy/.env`: con Resend (`RESEND_API_KEY=re_…`) o por el mismo SMTP (`RESEND_API_KEY=local_…`, `RESEND_BASE_URL` y los `SMTP_*`; ver `deploy/.env.example`).
- [ ] **Mercado Pago de producción.** Después de pasar a producción, en el panel: Apps e integraciones › Mercado Pago › **Cambiar los datos**, con el Access Token de **producción** de tu cuenta real (`APP_USR-…`) y la clave secreta de su webhook, cargado con la dirección `https://app.TU-DOMINIO/api/mercadopago/webhook`. El de prueba del ensayo deja de valer.
- [ ] **`INTEGRACIONES_CLAVE_CIFRADO` en `deploy/.env`** (la crea `deploy/scripts/generar-secretos.sh`). Guardá una copia fuera de la Pi: cifra la clave del certificado de ARCA.

## 2. El túnel de Cloudflare

1. **Crear el túnel.** En el panel de Cloudflare: **Zero Trust › Networks › Tunnels › Create a tunnel** (los nombres del menú pueden cambiar un poco).
   1. Elegí **Cloudflared** y ponele un nombre (por ejemplo `tentare`).
   2. En «Install and run a connector», copiá el **token**: el texto largo que va después de `--token`.
   3. No instales nada en la Pi: el conector ya está en el `docker-compose`.
2. **Cargar el token** en `deploy/.env`:

   ```
   CLOUDFLARE_TUNNEL_TOKEN=eyJ…
   ```
3. **Las dos direcciones públicas** del túnel (Public Hostnames):

   | Subdominio | Path | Service |
   | --- | --- | --- |
   | `app` | *(vacío)* | `HTTP` · `localhost:3000` |
   | `supabase` | `^/(auth|rest|storage|realtime)/v1/` | `HTTP` · `localhost:8000` |

   ⚠️ **El path de Supabase es importante.** Publica solo lo que usa la app. Sin él, también quedaría en internet **Supabase Studio**, el panel de administración de la base, protegido apenas por usuario y contraseña. Desde tu red local lo seguís abriendo en `http://IP-de-la-Pi:8000`.

## 3. Pasar a producción

```sh
deploy/scripts/produccion.sh ~/supabase-project https://app.tudominio.com.ar https://supabase.tudominio.com.ar
```

Primero comprueba que no falte nada:
- HTTPS en las dos direcciones;
- el token del túnel;
- la clave de cifrado;
- un SMTP real y `ENABLE_EMAIL_AUTOCONFIRM` apagado.

Si algo falla, no toca nada. También avisa si el token de Mercado Pago es de prueba o falta Resend.

Después pone las direcciones, enciende el túnel, aplica las migraciones y vuelve a compilar la app: en la Pi, con Supabase parado mientras compila.

Al terminar, cargá en Mercado Pago (modo producción › Webhooks › evento **Pagos**) la dirección que muestra:

```
https://app.tudominio.com.ar/api/mercadopago/webhook
```

## 4. Copias de seguridad

Cada copia es **un solo archivo** con todo lo necesario para volver a levantar Tentare:
- **Un volcado de la base** (`pg_dump`), hecho sin parar nada.
- **La carpeta de datos de Postgres**, con la base parada unos segundos. Es lo que restaura todo tal cual.
- **Los archivos subidos:** avatares y fotos.
- **Los dos `.env`**, que son los secretos.

### Dónde

Se elige en `deploy/.env`. Se puede cambiar cuando quieras: afecta solo a las copias siguientes.

```
COPIA_DESTINO=/var/backups/tentare   # mejor un disco USB montado, no el del sistema
COPIA_CONSERVAR=14                   # cuántas se guardan
COPIA_CLAVE=una frase larga          # cifra la copia (AES-256)
COPIA_REMOTO=                        # opcional: copia fuera, con rclone
```

- **`COPIA_CLAVE`.** Con ella, la copia va cifrada, y los secretos dentro, protegidos. **Anotala fuera de la Pi:** sin la frase no se puede restaurar.
- **`COPIA_REMOTO`.** Manda además cada copia a la nube: Backblaze B2, Cloudflare R2, Google Drive o cualquier destino que soporte rclone. Exige `COPIA_CLAVE`. El remoto se configura una vez:

  ```sh
  sudo docker run --rm -it -v /root/.config/rclone:/config/rclone rclone/rclone config
  ```

  Ese comando crea, por ejemplo, un remoto `b2`. Después se pone `COPIA_REMOTO=b2:mi-bucket/tentare`.

### Programarla

```sh
sudo deploy/scripts/programar-copia.sh ~/supabase-project        # todos los días a las 04:30
sudo systemctl start tentare-copia                                 # una ahora, para probar
systemctl status tentare-copia                                     # cómo salió la última
```

Si la Pi estaba apagada a esa hora, la copia se hace al arrancar. Cada copia buena deja la fecha en `COPIA_DESTINO/ULTIMA-COPIA-OK`.

### Restaurar

```sh
sudo deploy/scripts/restaurar.sh /var/backups/tentare/tentare-20261123-0430.tar.enc ~/supabase-project
```

1. Pide la frase de la copia, si no está en `deploy/.env`.
2. Avisa si los secretos de la copia son otros que los de ahora y deja los de la copia al lado (`*.de-la-copia`).
3. Pide escribir `RESTAURAR`.
4. Para todo, pone la base y los archivos de la copia y vuelve a levantar.

La base de ahora no se borra: queda en `volumes/db/data.antes-de-restaurar-…`.

> **Probá una restauración antes de abrir.** Una copia que nunca se restauró es una copia que no sabés si sirve:
> 1. Hacé una copia.
> 2. Cambiá algo (creá una clase de prueba).
> 3. Restaurá.
> 4. Comprobá que la clase ya no está.

## 5. Cortes de luz

- **Docker al arrancar:** `sudo systemctl enable docker`. Los contenedores tienen `restart: unless-stopped` y vuelven solos.
- **La Pi 5 arranca sola** cuando vuelve la luz.
- **Igual conviene una UPS chica.** Un corte en medio de una escritura es lo que más daña una base, y más todavía en una tarjeta SD. Por eso la base va en el SSD.

## 6. Primer día

- [ ] `https://app.tudominio.com.ar` abre, con el candado.
- [ ] `https://supabase.tudominio.com.ar/` da error: Studio **no** se ve desde internet. En cambio, `https://supabase.tudominio.com.ar/auth/v1/health` contesta, aunque sea «No API key found»: eso confirma que el túnel llega.
- [ ] Una alumna de prueba entra con su correo y le llega el código.
- [ ] Una compra real chica, con tu propia tarjeta, se acredita. Después, devolvela desde el panel.
- [ ] Al día siguiente, `ULTIMA-COPIA-OK` tiene la fecha de esa madrugada.
- [ ] ARCA en producción, si vas a facturar:
  - En Configuración › Cobros y facturas › Factura electrónica de ARCA, cambiá el entorno a **Producción**.
  - Hacé el certificado de producción.
  - Probá la conexión.
  - Emití la primera factura de un cobro real.

## Actualizar

```sh
git pull                                       # desde tu fork
deploy/scripts/migrar.sh ~/supabase-project
# En la Pi: parar Supabase para compilar (deploy/README.md › Raspberry Pi)
cd deploy && docker compose build app && docker compose up -d
```

Hacé una copia antes de actualizar: `sudo systemctl start tentare-copia`.
