# Instructivo: levantar Centra con la imagen de GitHub

Paso a paso para poner en marcha (o actualizar) Centra en tu computadora o servidor, usando la imagen que ya compila GitHub (`ghcr.io/eldoctormail/pilates-saas:latest`). No hace falta compilar nada.

Supone que Supabase ya está instalado en `~/supabase-project` y que `deploy/.env` ya existe (si no, primero `deploy/README.md`, pasos 1 y 2).

---

## 1. Encontrar la carpeta del proyecto

La carpeta buena es la **copia hecha con git**, normalmente `~/pilates-saas`.

```sh
cd ~/pilates-saas
git status
```

- Si dice `On branch main` (o `En la rama main`), es la correcta.
- Si dice `fatal: not a git repository`, estás en otra carpeta. Las que se bajan como ZIP desde GitHub (suelen llamarse `pilates-saas-main`) **no sirven**: no se pueden actualizar con `git pull`. Podés borrarlas para no confundirte.

¿No la encontrás? Buscala así (tarda un poco):

```sh
find ~ -maxdepth 3 -type d -name .git -path '*pilates*' 2>/dev/null
```

Cada línea que salga es una copia git; la carpeta es lo que está antes de `/.git`.

¿No hay ninguna? Bajala de nuevo:

```sh
cd ~ && git clone https://github.com/eldoctormail/pilates-saas.git
```

(Ojo: en ese caso tenés que recuperar tu `deploy/.env` de la carpeta vieja, porque no está en GitHub.)

> **Todos los comandos de abajo se corren desde `~/pilates-saas`**, salvo los que dicen `cd deploy` antes.

---

## 2. Sacar la IP de la máquina

| Sistema | Comando |
| --- | --- |
| Mac (Wi-Fi) | `ipconfig getifaddr en0` |
| Mac (cable) | `ipconfig getifaddr en1` (si `en0` no devuelve nada) |
| Linux | `hostname -I` (la primera) |

Sale algo como `192.168.1.50`. Anotala.

**Recomendado:** reservale esa IP en el router («Reserva DHCP» o «IP fija», según la marca) para que no cambie cada vez que se reinicia. Si cambia, hay que repetir el paso 3.

---

## 3. Poner la IP en la configuración

La IP vive en **dos** archivos: `deploy/.env` (la app) y `~/supabase-project/.env` (Supabase). Hay que cambiar los dos.

### Opción fácil (recomendada): el script

```sh
cd ~/pilates-saas
deploy/scripts/cambiar-ip.sh ~/supabase-project 192.168.1.50
```

Cambiá `192.168.1.50` por tu IP. El script cambia los dos archivos, reinicia Supabase, aplica la base y arranca la app. En Mac **hay que pasarle la IP siempre** (`hostname -I` no existe en macOS).

Si lo usás, podés saltar al paso 4 (pero hacé igual el paso 4: la imagen y el `APP_IMAGE`).

### Opción a mano

En `deploy/.env`:

```
NEXT_PUBLIC_APP_URL=http://192.168.1.50:3000
NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.50:8000
```

En `~/supabase-project/.env`:

```
SUPABASE_PUBLIC_URL=http://192.168.1.50:8000
API_EXTERNAL_URL=http://192.168.1.50:8000/auth/v1
SITE_URL=http://192.168.1.50:3000
ADDITIONAL_REDIRECT_URLS=http://192.168.1.50:3000/**
```

Para reemplazar una IP vieja por la nueva de un saque (ejemplo: de `192.168.1.40` a `192.168.1.50`):

```sh
# Mac (el '' después de -i es obligatorio en macOS)
sed -i '' 's/192\.168\.1\.40/192.168.1.50/g' deploy/.env ~/supabase-project/.env

# Linux
sed -i 's/192\.168\.1\.40/192.168.1.50/g' deploy/.env ~/supabase-project/.env
```

Después reiniciá Supabase: `cd ~/supabase-project && docker compose up -d && cd ~/pilates-saas`.

> **¿Alcanza con cambiar el `.env`, o hay que recompilar?** Alcanza. La imagen trae direcciones de relleno y las cambia por las de `deploy/.env` cada vez que arranca (`deploy/scripts/aplicar-urls.mjs`). Basta con `docker compose up -d` (paso 5).

---

## 4. Decirle que use la imagen de GitHub

Abrí `deploy/.env` y dejá esta línea así (sin `#` adelante):

```
APP_IMAGE=ghcr.io/eldoctormail/pilates-saas:latest
```

Sin esto, Docker busca una imagen local llamada `tentare-app:local` que no existe y da:

```
pull access denied for tentare-app, repository does not exist
```

Para comprobarlo: `grep APP_IMAGE deploy/.env`.

### Si da `unauthorized` o `denied` al bajar la imagen

La imagen está privada en GitHub. Dos salidas:

- **Hacerla pública (lo más simple, no tiene secretos):** en GitHub, tu perfil › **Packages** › `pilates-saas` › **Package settings** › **Change visibility** › **Public**.
- **Dejarla privada e iniciar sesión:** creá un token en GitHub (Settings › Developer settings › Personal access tokens › Tokens (classic)) con el permiso `read:packages`, y en la máquina:

  ```sh
  docker login ghcr.io -u eldoctormail
  ```

  Como contraseña pegá el token (no la contraseña de GitHub).

---

## 5. Actualizar y arrancar

Desde `~/pilates-saas`:

```sh
git pull
deploy/scripts/migrar.sh ~/supabase-project
cd deploy
docker compose pull app && docker compose up -d
cd ..
```

Qué hace cada uno:

1. `git pull`: baja la última versión del código (migraciones y scripts).
2. `migrar.sh`: pone al día la base de datos. Se puede correr cuantas veces quieras.
3. `docker compose pull app`: baja la última imagen de la app.
4. `docker compose up -d`: arranca (o reinicia) la app, Inngest y los crons. La primera vez arma también el contenedor de los crons, que es chiquito.

### Errores de ruta (el más común)

Los comandos dependen de **dónde estás parado**:

| Comando | Se corre desde |
| --- | --- |
| `git pull`, `deploy/scripts/...` | `~/pilates-saas` |
| `docker compose ...` (de la app) | `~/pilates-saas/deploy` |
| `docker compose ...` (de Supabase) | `~/supabase-project` |

- `no such file or directory: deploy/scripts/migrar.sh` → estás dentro de `deploy/`. Hacé `cd ..`.
- `no configuration file provided: not found` → estás fuera de `deploy/`. Hacé `cd deploy`.
- Si te perdés: `pwd` te dice dónde estás, y `cd ~/pilates-saas` te vuelve al principio.

---

## 6. Comprobar que anda

1. **En el navegador:** `http://TU-IP:3000` (por ejemplo `http://192.168.1.50:3000`). La primera vez, `http://TU-IP:3000/crear-estudio` para crear el estudio. Desde el celular también anda, si está en la misma red Wi-Fi.
2. **Estado de los contenedores** (desde `deploy/`):

   ```sh
   docker compose ps
   ```

   `app` tiene que decir `Up` y, al minuto más o menos, `(healthy)`. También `inngest` y `cron` en `Up`.
3. **Si algo no anda, mirá los mensajes:**

   ```sh
   docker compose logs --tail=100 app     # la app
   docker compose logs -f app             # en vivo (Ctrl+C para salir)
   docker compose logs --tail=50 cron     # los crons
   ```
4. **Supabase** (desde `~/supabase-project`): `docker compose ps`, todos `healthy`. Su panel está en `http://TU-IP:8000`.

Problemas típicos:

- La página no abre desde otro dispositivo, pero sí en la misma máquina con `http://localhost:3000` → la IP de `deploy/.env` está mal o el firewall bloquea el puerto 3000.
- Abre, pero no podés entrar (el login falla o vuelve a una dirección vieja) → la IP de `~/supabase-project/.env` quedó vieja. Repetí el paso 3.

---

## 7. Zona horaria y moneda

En `deploy/.env` están:

```
NEXT_PUBLIC_ZONA_HORARIA=
NEXT_PUBLIC_LOCALE=
NEXT_PUBLIC_MONEDA=
```

**Vacías está bien: vacías quiere decir Argentina.** El código usa por defecto `America/Argentina/Buenos_Aires`, `es-AR` (24 h) y `ARS`. Si preferís dejarlo explícito, estos son los valores:

```
NEXT_PUBLIC_ZONA_HORARIA=America/Argentina/Buenos_Aires
NEXT_PUBLIC_LOCALE=es-AR-u-hc-h23
NEXT_PUBLIC_MONEDA=ARS
```

Ojo: con la imagen de GitHub, estos tres **se graban al compilar en GitHub**, no se leen de tu `deploy/.env`. Cambiarlos ahí solo afecta la hora de los crons. Si algún día hiciera falta otra zona o moneda, se cargan en GitHub: el repo › Settings › Secrets and variables › Actions › **Variables**, y se vuelve a compilar la imagen (Actions › Imagen del servidor › Run workflow).

---

## 8. Mac con Apple Silicon (M1, M2, M3, M4)

La imagen de GitHub es para procesadores Intel/AMD (x86). En un Mac con chip Apple corre **emulada**: anda, pero arranca más lento y usa más CPU y memoria. Para probar está bien; para usarlo todos los días conviene un servidor x86 (por ejemplo una VPS de Hetzner).

Para que la emulación ande mejor, en Docker Desktop: Settings › General › **Use Rosetta for x86_64/amd64 emulation on Apple Silicon** (activado). Y en Settings › Resources, dale a Docker 8 GB de memoria o más.

Si `docker compose pull` avisa algo como `platform (linux/amd64) does not match the detected host platform`, es solo un aviso: sigue andando.

---

## Resumen rápido (para la próxima vez)

```sh
cd ~/pilates-saas
git status                                   # ¿es la carpeta buena?
ipconfig getifaddr en0                        # Mac  (Linux: hostname -I)
deploy/scripts/cambiar-ip.sh ~/supabase-project TU-IP   # solo si cambió la IP
grep APP_IMAGE deploy/.env                    # tiene que tener la de ghcr.io
git pull
deploy/scripts/migrar.sh ~/supabase-project
cd deploy && docker compose pull app && docker compose up -d
docker compose ps
```

Y abrir `http://TU-IP:3000`.
