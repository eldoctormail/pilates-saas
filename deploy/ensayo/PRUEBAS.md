# Ensayo general: lista de pruebas

Lo que hay que ver funcionando, de punta a punta, antes de abrir el estudio. Usa Mercado Pago **de prueba**: no se mueve plata de verdad.

Si algo no da lo que dice «Tiene que pasar», anotá el número de la prueba, sacá una captura y guardá los registros:

```sh
cd deploy && docker compose logs --since 30m app > app.log
```

## 0. Antes de empezar

1. **Raspberry Pi 5.** Usá Raspberry Pi OS de 64 bits, con la base en un SSD (NVMe o USB 3) y no en la tarjeta SD, y 4 GB de swap como mínimo. Detalles en `deploy/README.md` › Raspberry Pi.
2. **Instalación base.** Hacé una vez los pasos 1 a 4 de `deploy/README.md`, con la IP de la Pi.
3. **Cuentas de prueba de Mercado Pago.** En el panel de desarrolladores, creá dos: una **vendedora** (el estudio) y una **compradora** (la alumna). Seguí la guía «Cuentas de prueba» de Mercado Pago.
4. **Aplicación de prueba.** Con la vendedora de prueba, creá una aplicación de Checkout Pro. El Access Token y la clave secreta del webhook se cargan en el panel en el paso 6, no en el `.env`.
5. **Arrancar el ensayo:**

   ```sh
   deploy/ensayo/ensayo.sh empezar ~/supabase-project
   ```

   Al terminar, el script muestra la dirección del webhook.
6. **Conectar Mercado Pago.** Creá el estudio (prueba 1.1) y, como propietaria, abrí Apps e integraciones › Mercado Pago. Copiá la dirección del webhook y cargala en la aplicación de Mercado Pago › Webhooks › modo de prueba, con el evento **Pagos**. Copiá la clave secreta, y pegá en Centra esa clave y el Access Token de la vendedora de prueba. Tocá **Guardar y comprobar**: tiene que mostrar el nombre de la cuenta vendedora.

> ⚠️ Las direcciones `trycloudflare.com` cambian cada vez que corrés `empezar`. Si lo volvés a correr, hay que cargar el webhook de nuevo.

Para pagar, entrá con la **compradora de prueba** en una ventana de incógnito y usá las tarjetas de prueba de Mercado Pago Argentina. Están en su documentación («Tarjetas de prueba»). El nombre del titular decide el resultado: `APRO` aprueba y `OTHE` rechaza.

Para revisar la base:

```sh
docker exec -it supabase-db psql -U postgres
```

## 1. El estudio

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 1.1 | Abrí `https://…/crear-estudio` y creá el estudio con tu correo. | El código llega al buzón (`http://IP:8025`) y entrás al panel. |
| 1.2 | Configuración › Cobros › Datos fiscales: cargá un CUIT válido. | Lo acepta. Un CUIT con el último dígito cambiado lo rechaza. |
| 1.3 | Configuración › Cobros › Facturación. | No aparece Veri*Factu: aparece el aviso de ARCA y «Comprobantes internos». |
| 1.4 | Paquetes: creá una clase suelta, un bono de 8 clases y una cuota mensual, en pesos. | Los precios se ven como `$ 12.000`. |
| 1.5 | Calendario: creá una clase para mañana con 3 plazas. | Aparece a la hora correcta, la de Argentina. |

## 2. La alumna

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 2.1 | En incógnito, abrí `https://…/portal/<slug>` y entrá con otro correo. | El código de 6 cifras llega al buzón. Al ponerlo, pide sus datos y el consentimiento. |
| 2.2 | Teléfono con el formato `+54 9 299 …`. | Lo acepta. |
| 2.3 | Perfil › Tus derechos como consumidor. | Están el Botón de arrepentimiento y el Botón de baja. |

## 3. Cobros con Mercado Pago

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 3.1 | La alumna va a Comprar › el bono y paga con `APRO`. | Vuelve a la app y en unos segundos el bono está en «Mis bonos». En la base, `compras_mercadopago` lo muestra entregado y `pagos_mercadopago` lo muestra aplicado. |
| 3.2 | Mirá la ficha de la alumna en el panel. | Recibo cobrado con método Mercado Pago. Su comprobante (PDF) dice «Documento no válido como factura». |
| 3.3 | Repetí la compra pagando con `OTHE`. | Mercado Pago lo rechaza y no se entrega nada. |
| 3.4 | Panel › Cobros › Nuevo cobro: cargale un recibo pendiente. La alumna lo paga desde Pagos. | El recibo pasa a cobrado. |
| 3.5 | Desde la ficha de la clase de mañana, sin bono que la cubra: «Ver opciones» › clase suelta › pagar. | Al volver dice «Reservada» y la alumna aparece en la clase. |
| 3.6 | Llená la clase y probá pagar otra plaza desde otra alumna. | No deja pagar porque no hay plaza. |
| 3.7 | Panel › ficha de la alumna › recibo del 3.1 › Devolver. | Mercado Pago confirma y el recibo queda devuelto. El panel ofrece quitarle el bono. |

## 4. Sin cuenta, regalos y derechos del consumidor

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 4.1 | En otra ventana de incógnito, en `https://…/reservar/<slug>`, reservá una clase como invitada (nombre, correo y teléfono) y pagá. | Al confirmarse el pago, la invitada aparece como alumna nueva, con la plaza reservada. |
| 4.2 | Activá las tarjetas regalo (Configuración) y comprá una en `https://…/reservar/<slug>/regalo`. | La tarjeta se crea solo después del pago. Está en `regalos_mercadopago` y en el panel de regalos. |
| 4.3 | Al pie de `/reservar/<slug>`: Botón de arrepentimiento y mandá un pedido con el correo de la alumna. | Da un código `ARR-XXXXXX` en el acto. El panel lo muestra en la bandeja «por decidir» y en Clientes › Pedidos. |
| 4.4 | Lo mismo con el Botón de baja. | Código `BAJ-XXXXXX`. Marcalo como atendido desde el panel. |

## 4b. Factura electrónica de ARCA (homologación)

Hace falta tu clave fiscal y un punto de venta «RECE para aplicativo y web services». Paso a paso en `deploy/README.md`, sección Factura electrónica de ARCA.

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 4b.1 | Configuración › Cobros y facturas › Factura electrónica de ARCA, en el entorno **Prueba**: datos, pedido, certificado de WSASS y «Probar la conexión». | Dice «Conectado» y el último número autorizado (puede ser «ninguno»). |
| 4b.2 | En un recibo cobrado: «Emitir factura de ARCA», a consumidor final y sin documento. | Sale con CAE. «Ver o imprimir» muestra el PDF con QR y «SIN VALIDEZ FISCAL». |
| 4b.3 | Otra, poniendo un CUIT con el último dígito cambiado. | No deja emitir: el dígito verificador no cuadra. |
| 4b.4 | Cortá internet de la Pi justo después de tocar «Emitir» y volvé a intentar con internet. | La primera dice que quedó pendiente; la segunda la completa con el **mismo** número. |

## 5. Lo que corre solo

| # | Hacé | Tiene que pasar |
| --- | --- | --- |
| 5.1 | `cd deploy && docker compose exec cron llamar mercadopago-conciliar` | Termina sin error. No vuelve a aplicar pagos que ya estaban aplicados. |
| 5.2 | Dejá todo andando una hora y revisá `docker compose logs cron`. | Las llamadas contestan 200. |
| 5.3 | Con `free -h`, mirá la memoria con todo andando. | Hay margen. Si la swap se usa mucho todo el tiempo, avisame. |

## Al terminar

```sh
deploy/ensayo/ensayo.sh terminar ~/supabase-project
```

Cierra los túneles y el buzón, y devuelve las dos configuraciones como estaban.

Los datos de prueba quedan en la base. Para empezar limpio, borrá el estudio de prueba desde Studio (`http://IP:8000`).

Los correos que manda la propia app (invitaciones, avisos y constancias) no van por el SMTP de Supabase. Sin configurar, no salen. Para verlos en el buzón del ensayo, poné en `deploy/.env` la vía SMTP de `deploy/.env.example` con `SMTP_HOST=mailpit`, `SMTP_PORT=1025` y sin usuario ni contraseña, y recreá la app.
