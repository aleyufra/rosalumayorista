# Cómo usar el panel de Rosalu

Esta guía es para cargar y cambiar cosas del sitio sin tocar nada técnico.

## Entrar

1. Abrí **https://rosalumayorista.alejandromaryufra.workers.dev/admin/** (en la compu o en el celular).
2. Tocá **Iniciar sesión con GitHub** y entrá con tu usuario.
3. La primera vez, si el panel aparece en inglés: tocá tu foto o el ícono de arriba a la derecha > **Settings** > **Language** y elegí **Español**.

## Cuánto tarda en verse un cambio

Cuando tocás **Guardar**, el cambio se publica solo. Tarda **entre 1 y 3 minutos** en verse en el sitio. Si no lo ves, esperá un poco y recargá la página.

## Cargar un producto nuevo

1. Entrá a **Productos** y tocá **Nuevo producto**.
2. Completá:
   - **Nombre del producto:** como lo diría una clienta. Ej: "Remera básica de algodón".
   - **Rubro:** elegilo de la lista (Ropa, Juguetería, Bazar, Otros o los que crees en **Rubros**).
   - **Precio en efectivo:** solo el número, sin puntos ni signo $. Ej: `12500`.
   - **Fotos:** de 1 a 6. La primera es la que se ve en el catálogo. Mejor cuadradas.
   - **Talles** y **Colores:** solo si tiene. Si los cargás, la clienta tiene que elegir uno antes de agregar al carrito.
   - **Mostrar en la página principal:** tildalo para que aparezca entre los destacados (se muestran hasta 8).
3. Tocá **Guardar**.

### No renombres fotos desde la biblioteca de medios

Si cambiás el nombre de una foto en la biblioteca de medios del panel, los productos y rubros que la usan siguen buscando el nombre viejo y se quedan **sin foto**. Para cambiar una foto: abrí el producto, sacá la foto vieja con la X, subí o elegí la nueva y tocá **Guardar**. Si un producto se quedó sin foto, hacé eso mismo.

## Marcar un producto como agotado

1. En **Productos**, buscalo (podés usar el buscador o el filtro por rubro).
2. Destildá **¿Hay stock?** y tocá **Guardar**.

El producto sigue en el catálogo con el cartel "Agotado" y sin botón para agregar. Si alguien lo tenía en el carrito, el sitio le avisa y lo saca del pedido. Cuando vuelva a entrar, tildalo de nuevo.

## Cambiar un precio

1. Abrí el producto en **Productos**.
2. Cambiá **Precio en efectivo** (solo el número) y tocá **Guardar**.

Si una clienta tenía ese producto en el carrito, al abrirlo ve el precio nuevo y un aviso de que cambió.

## Borrar los productos de ejemplo

En **Productos**, usá el filtro **Productos de ejemplo**. Abrí cada uno y tocá **Borrar** (en el menú de arriba). Hay 9.

## Cambiar el recargo por Mercado Pago o transferencia

1. Entrá a **Datos del negocio y textos**.
2. En **Recargo por Mercado Pago o transferencia ($)** poné el monto en pesos, sin puntos. Ej: `1500`.
3. Tocá **Guardar**.

El recargo se suma **una sola vez por compra**, sin importar cuántos productos lleve. Cada producto muestra, debajo del precio en efectivo, el precio con Mercado Pago o transferencia si se compra solo (precio + recargo). En el carrito se suma una vez al total. Las preguntas frecuentes también usan este monto.

## Pago con Mercado Pago

- **Activarlo:** en **Datos del negocio y textos**, poné **¿Aceptan Mercado Pago?** en **Sí**. Aparece el botón **Reservar con Mercado Pago** en el carrito, siempre que el recargo esté cargado. Es solo para reservar: la clienta paga todo online y retira en el local.
- **Mínimo para reservar:** en **Datos del negocio y textos**, **Mínimo para reservar con Mercado Pago ($)**. Es la suma mínima de productos que se pagan online, sin el recargo. Ej: `35000` con un recargo de `2500` = la clienta paga `37500` como mínimo.
- **Un producto que no se paga online:** abrilo en **Productos** y destildá **¿Se puede pagar online con Mercado Pago?**. En el carrito aparece un aviso en rojo y ese producto no se cobra (se compra en el local).
- **Cuando llega un pago:** te avisa Mercado Pago y la clienta te manda el comprobante por WhatsApp con el código de pedido. Revisá en la app que la operación esté aprobada antes de entregar.

## Activar o cambiar la temporada

La temporada es el bloque de color de la página principal (Navidad y Reyes, Día del Niño, inicio de clases).

1. Entrá a **Datos del negocio y textos** > **Temporada**.
2. Tildá **Mostrar la temporada** para que aparezca, o destildalo para sacarla.
3. Cambiá el **Título** y el **Texto**.
4. Tocá **Guardar**.

## Otros datos del negocio

En **Datos del negocio y textos** también se cambian: la dirección, los horarios, el WhatsApp, las redes, quién atiende y su foto, la foto del local, los 3 productos que se ven junto al cartel principal, el ejemplo de ganancia, las preguntas frecuentes y los textos de la página principal.

En las respuestas de las preguntas frecuentes podés escribir `{minimo}`, `{recargo}` y `{reserva}`: el sitio los reemplaza por el mínimo de compra, el recargo que tengas cargado y el mínimo para reservar con Mercado Pago.

Mientras un dato diga "TODO", el sitio muestra un recuadro "Falta cargar". Reemplazalo por el dato real y guardá.

## Rubros

En **Rubros** podés crear, renombrar o borrar rubros, y cargarles una foto.

- **Orden:** el número 1 aparece primero (y grande en la página principal).
- **Para borrar un rubro:** primero pasá todos sus productos a otro rubro. Si queda algún producto con un rubro borrado, la página no se publica hasta que lo corrijas.
- Cambiar el nombre no cambia el link del rubro, así que los links compartidos siguen funcionando.

## Productos junto al cartel principal

En **Datos del negocio y textos > Productos destacados del inicio** elegís hasta 3 productos. Se ven al lado del cartel "Precio mayorista desde 3", solo en computadora. Si lo dejás vacío, se muestran los 3 primeros marcados con **Mostrar en la página principal**.
