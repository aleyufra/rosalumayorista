# Pendientes antes de entregar el sitio

Hoy el sitio es una **propuesta**: tiene productos de muestra y una franja abajo que avisa que no pertenece a Rosalu. Lo que se carga desde el panel está en `/admin` > **Datos del negocio y textos**. Mientras falte un dato, el sitio muestra un recuadro punteado que dice "Falta cargar: ..." en lugar de inventar un valor.

## Datos del negocio

| Dato                     | Dónde se carga                       | Estado                                                                                                   |
| ------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| CUIT real                | Panel > CUIT                         | Hay uno provisorio (`27-00000000-0`) que aparece en la política de privacidad. Reemplazarlo por el real. |
| Titular o razón social   | Panel > Titular o razón social       | Cargado: Rosa Maria Rodriguez. Confirmar que coincida con ARCA.                                          |
| ID de Google Analytics   | Panel > ID de Google Analytics       | Vacío: no hay estadísticas ni aviso de cookies. Al cargar el `G-XXXXXXXXXX` se activan los dos solos.    |
| QR de Data Fiscal (ARCA) | Código (footer), ver con el contador | Falta. Es obligatorio para sitios que venden; se pide con clave fiscal en ARCA.                          |
| Subcategorías por rubro  | Cada producto > Subcategoría         | Opcional.                                                                                                |

## Al entregar el sitio a la dueña

1. **Borrar los productos de muestra**: los 30 que tienen fotos de Pexels (archivos `.jpg`, cargados el 24/11/2026, con pago online desactivado) y cualquier otro que no venda. Se borran desde el panel > Productos.
2. **Quitar la franja de "Sitio de muestra"**: borrar `src/components/DemoNotice.astro` y su línea `<DemoNotice />` en `src/layouts/BaseLayout.astro`.
3. **Mercado Pago de la dueña**: reemplazar el secreto `MP_ACCESS_TOKEN` en Cloudflare por el de su cuenta y hacer una compra real de prueba (ver `MERCADOPAGO.md`).
4. **Pasar las cuentas**: el repositorio de GitHub, la cuenta de Cloudflare (sitio y Worker `sveltia-cms-auth`) y la propiedad de Google Analytics hoy están a nombre del desarrollador. Transferirlas o dejar por escrito quién las mantiene.
5. **Dominio propio** (opcional): hoy el sitio está en `rosalumayorista.aleyufra.workers.dev`. Ver abajo.

## Al pasar a un dominio propio

Cambiar la URL en estos lugares y volver a publicar:

1. `astro.config.mjs` (`SITE_URL`, o la variable de entorno `SITE_URL` en Cloudflare).
2. `public/robots.txt` (línea `Sitemap:`).
3. `public/admin/config.yml` (`site_url` y `display_url`).
4. Google Analytics > Administrar > Flujos de datos: actualizar la URL del flujo.

Y sumar el dominio nuevo a `ALLOWED_DOMAINS` en el Worker `sveltia-cms-auth`.
