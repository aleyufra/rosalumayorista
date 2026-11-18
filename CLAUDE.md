# CLAUDE.md

Este archivo guía a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

Rosalu: sitio estático para un comercio mayorista (ropa, juguetes, bazar) en San Salvador de Jujuy. Catálogo con precios, carrito, pedido enviado por WhatsApp, retiro en el local (no hay envíos). Astro 7 (`output: 'static'`, sin adapter), TypeScript strict, Tailwind CSS 4, nanostores, Sveltia CMS en `/admin`, desplegado en Cloudflare Workers static assets; un Worker (`worker/index.ts`) atiende solo `/api/*` para Mercado Pago. La shell es Git Bash en Windows.

## Comandos

```bash
pnpm dev                 # http://localhost:4321 (CMS: /admin/index.html, en modo local pide un token de GitHub)
pnpm build               # -> dist/
pnpm check               # astro check (tipos + templates)
pnpm lint                # eslint
pnpm format              # prettier (astro + orden de clases de tailwind)
pnpm test                # vitest run, src/**/*.test.ts
pnpm exec vitest run src/lib/cart.test.ts      # un solo archivo
pnpm exec vitest run -t "treats"               # por nombre de test
pnpm exec wrangler dev   # sirve dist/ como Cloudflare (manejo de 404, public/_headers)
pnpm logo                # regenera el SVG del wordmark, favicons y og.png desde el logo original
pnpm placeholders        # genera fotos placeholder y los productos de ejemplo faltantes
```

Deploy: cada push a `main` (incluidos los guardados del CMS) compila y despliega vía Workers Builds. `pnpm deploy` es la vía manual. Ver `docs/DEPLOY.md`.

## Convenciones

- Código (archivos, componentes, variables, campos de schema) en inglés; todo el texto visible en español (voseo argentino). Las rutas URL y los query params quedan en español porque los ven los visitantes (`/catalogo`, `/carrito`, `?rubro=ropa&q=...&disponibles=1`). Los slugs de categorías y productos van en español por la misma razón.
- `trailingSlash: 'never'` y `build.format: 'file'`: los links no deben terminar en `/`.

## Arquitectura

**El contenido es el CMS.** `src/content.config.ts` define tres colecciones cuyos schemas Zod deben mantenerse sincronizados con `public/admin/config.yml` (definiciones de campos de Sveltia). Cambiar un campo implica editar ambos.
- `products`: una carpeta por producto, `src/content/products/<slug>/index.md`, con las fotos al lado; id = nombre de la carpeta. `category` es un slug de categoría validado en build en `lib/products.ts` (lanza un error en español que quien administra el negocio puede resolver). `isSample` marca los productos de ejemplo generados (se muestran con un badge "Ejemplo").
- `categories`: `src/content/categories/<slug>.yml`.
- `settings`: singleton `src/content/settings/site.yml`, datos del negocio más todo el texto de la home. Se lee con `getSettings()` en `lib/settings.ts`.
- Los archivos subidos desde el CMS van a `src/assets/cms` (dentro de `src/` para que Astro los optimice).

**Valores pendientes.** Los datos del negocio que quien administra el negocio todavía no completó están vacíos o empiezan con `TODO` (`isPending()` en `lib/text.ts`). Los componentes deben mostrarlos como placeholders visibles (`PendingValue.astro`) u ocultar la función que depende de ellos (ej. `hasWhatsApp()`), nunca romper. `docs/PENDING.md` registra lo que falta. El texto del CMS admite los tokens `{minimo}` y `{recargo}`, que completa `fillCopy()`.

**Lógica pura en `src/lib/`, DOM en `src/scripts/`.** `lib/` (carrito, mensaje de WhatsApp, horarios, formato de precios, texto) no depende de frameworks y tiene tests unitarios; `scripts/*.ts` es TS vanilla del lado del cliente, empaquetado en las páginas, que conecta elementos del DOM encontrados por atributos `data-*`. Sin framework de UI.

**Flujo del carrito.** `stores/cart.ts` es un `persistentAtom` en la clave de localStorage `rosalu-cart-v1` (decodificado de forma defensiva por `decodeCart`). Como el sitio es estático, la página del carrito pide `/products.json` (generado desde `pages/products.json.ts`) para revalidar las líneas guardadas contra el precio y la disponibilidad actuales (`revalidate` en `lib/cart.ts`). El formato del mensaje de pedido en `lib/whatsapp.ts` está fijado por el brief; cambiarlo requiere actualizar los tests a conciencia. El pedido mínimo es `settings.minUnits` (por defecto 3). Los precios son de contado en ARS; `formatPrice` mantiene un espacio de no separación, `formatPricePlain` es para texto que sale de la página.

**El filtrado del catálogo** es del lado del cliente: la página del catálogo embebe un índice JSON (`#catalog-index`) y `scripts/catalog.ts` filtra y pagina las tarjetas renderizadas en el servidor, sincronizando el estado con la URL. La búsqueda usa `normalizeSearch`, sin acentos.

**Mercado Pago (Checkout Pro).** `POST /api/checkout` rearma el pedido desde `/products.json` y `/checkout.json` del build (nunca confía en precios del navegador) y crea la preferencia; `GET /api/payment` verifica el pago para `/pago/aprobado`. La lógica pura está en `lib/checkout.ts`. Mercado Pago es solo para reservar: el switch global es `settings.acceptsMercadoPago === 'yes'` y además exige `paymentSurcharge` cargado (`mercadoPagoEnabled()`); se habilita desde `settings.mpMinAmount` (default 35000) en productos online, sin contar el recargo, validado en `validateCheckout` (`/checkout.json` publica `minAmount`); cada producto tiene `onlinePayment` y `paymentSurcharge` se suma una vez por compra. El secreto `MP_ACCESS_TOKEN` va en `.dev.vars` (local) o en Cloudflare. Ver `docs/MERCADOPAGO.md`.

## Diseño

`DESIGN.md` (sistema de diseño: tokens, escala tipográfica, el concepto de "cartel de precio de mercado" que encarna `MarketTag.astro`) y `PRODUCT.md` (usuarios, propósito, voz de marca) son la fuente de verdad para el trabajo de UI; leelos antes de cambiar visuales o textos. `.impeccable/` contiene la configuración de la herramienta de diseño Impeccable.
