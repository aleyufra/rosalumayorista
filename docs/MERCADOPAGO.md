# Pago con Mercado Pago (Checkout Pro)

El carrito tiene un botón **Reservar con Mercado Pago** además del pedido por WhatsApp. Es solo para **reservar**: la clienta paga todo online y retira en el local (no hay envíos). Se habilita desde un mínimo de productos que se pagan online (campo **Mínimo para reservar con Mercado Pago**, por defecto $35.000, sin contar el recargo: con recargo $2.500 cobra como mínimo $37.500). Cobra los productos que se pueden pagar online, cada uno con su precio y cantidad, más **un recargo por compra** (el campo "Recargo por Mercado Pago o transferencia" del panel). Después del pago, la página le pide a la clienta que mande el comprobante por WhatsApp. A la dueña le llega además el aviso de Mercado Pago en la app y por mail.

## Cómo funciona

- El sitio sigue siendo estático. Solo las rutas `/api/*` pasan por el Worker (`worker/index.ts`, `run_worker_first` en `wrangler.jsonc`).
- `POST /api/checkout`: el Worker lee `/products.json` y `/checkout.json` del último build (los precios nunca salen del navegador), arma la preferencia con `src/lib/checkout.ts` y devuelve el link de Checkout Pro.
- `GET /api/payment?id=&ref=`: la página `/pago/aprobado` confirma el pago con la API de Mercado Pago. Solo responde si el número de operación y el código de pedido coinciden, así nadie puede fabricar una página de "pago aprobado" cambiando la URL.
- Medios de pago: tarjeta de crédito, débito o prepaga y dinero en cuenta, en 1 pago. Sin Rapipago ni Pago Fácil. `binary_mode`: el pago queda aprobado o rechazado, nunca pendiente.
- La preferencia vence a las 2 horas para que no se paguen precios viejos.

## Lo que se maneja desde el panel

- **Datos del negocio > ¿Aceptan Mercado Pago?**: con **Sí** aparece el botón en el carrito. Con otra opción el botón desaparece y el Worker rechaza los cobros.
- **Datos del negocio > Recargo por Mercado Pago o transferencia**: se suma una vez por compra. Si está vacío, Mercado Pago no se muestra en el carrito.
- **Datos del negocio > Mínimo para reservar con Mercado Pago**: suma mínima de productos online (sin recargo). Debajo de ese monto el botón queda deshabilitado y el Worker rechaza el cobro.
- **Productos > ¿Se puede pagar online con Mercado Pago?**: si se destilda, el carrito muestra un aviso en rojo en ese producto y Mercado Pago no lo cobra. Si el carrito mezcla productos, se cobran solo los que se pueden pagar online, y el mínimo de compra se cuenta sobre esos.

## Credenciales

El Worker necesita un solo secreto: `MP_ACCESS_TOKEN`. La Public Key no se usa.

### Para probar en tu compu

1. En https://www.mercadopago.com.ar/developers/panel/app, abrí la aplicación y andá a **Cuentas de prueba**.
2. Entrá al panel de developers **con la cuenta de prueba vendedora**, creá una aplicación (Checkout Pro) y copiá su **Access Token de producción**. Es de una cuenta de prueba, así que no mueve plata real.
3. Creá el archivo `.dev.vars` en la raíz del proyecto (ya está en `.gitignore`):

   ```
   MP_ACCESS_TOKEN=APP_USR-...
   ```

4. `pnpm build && pnpm exec wrangler dev` y abrí http://localhost:8787.
5. Pagá entrando a Mercado Pago **con la cuenta de prueba compradora**, con una tarjeta de prueba (https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards). El nombre del titular define el resultado: `APRO` aprobado, `OTHE` rechazado.

Si el token empieza con `TEST-`, el Worker usa el link de sandbox (`sandbox_init_point`); si empieza con `APP_USR-`, el link normal.

### En producción

1. Completá los datos del negocio en el panel de developers para activar las credenciales de producción.
2. Copiá el **Access Token de producción** de la cuenta real del negocio (`APP_USR-...`). No lo pegues en el repositorio ni en un chat.
3. En Cloudflare: **Workers & Pages > rosalumayorista > Settings > Variables and Secrets > Add**. Type: **Secret**, Name: `MP_ACCESS_TOKEN`, Value: el token. Guardá con **Deploy**.
4. En el panel del sitio, poné **¿Aceptan Mercado Pago?** en **Sí**.
5. Hacé una compra real chica y devolvela desde la actividad de Mercado Pago.

Los secretos quedan guardados en Cloudflare aunque se vuelva a publicar el sitio. Si cambiás el token, repetí el paso 3.

## Qué hacer cuando llega un pago

1. Llega el aviso de Mercado Pago y el WhatsApp de la clienta con el comprobante, el código de pedido (`RSL-XXXXXX`) y el número de operación.
2. En la app de Mercado Pago, abrí la operación y confirmá que esté **aprobada** y que el monto coincida. Ahí también se ven los productos.
3. Dejá el pedido reservado: la clienta lo retira en el local.
4. Si algo no está, devolvé el importe de ese producto desde la operación (**Devolver dinero**, total o parcial).
