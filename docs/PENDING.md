# Datos pendientes

Todo esto se carga desde el panel (`/admin` > **Datos del negocio y textos**), salvo donde se indica otra cosa. Mientras falte un dato, el sitio muestra un recuadro punteado que dice "Falta cargar: ..." en lugar de inventar un valor.

| Dato                                                     | Dónde se carga                                                                                     | Qué pasa mientras falta                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Altura de la calle Gorriti                               | Panel > Dirección > Altura                                                                         | Se muestra la calle sin número y "Falta cargar: altura"                        |
| Link de Google Maps (Cómo llegar)                        | Panel > Link de Google Maps                                                                        | No aparece el botón "Cómo llegar"                                              |
| Link para insertar el mapa                               | Panel > Link para insertar el mapa                                                                 | Se ve el mapa provisorio, sin botón "Ver mapa"                                 |
| Número de WhatsApp (549388XXXXXXX)                       | Panel > Número de WhatsApp                                                                         | Los botones de WhatsApp aparecen desactivados y no se puede enviar el pedido   |
| Recargo por Mercado Pago o transferencia ($, por compra) | Panel > Recargo por Mercado Pago o transferencia                                                   | "Falta cargar: recargo por Mercado Pago o transferencia" en producto y carrito |
| ¿Aceptan Mercado Pago?                                   | Panel > ¿Aceptan Mercado Pago? (poné Sí recién después de cargar el secreto, ver `MERCADOPAGO.md`) | No aparece el botón Pagar con Mercado Pago en el carrito                       |
| Instagram, Facebook y TikTok                             | Panel > Redes                                                                                      | El footer muestra "Falta cargar: redes sociales"                               |
| Fotos del local y de los rubros                          | Panel > Fotos de la página principal                                                               | Fotos provisorias (ver `PHOTOS-TODO.md`)                                       |
| Subcategorías por rubro                                  | Cada producto > Subcategoría (texto libre)                                                         | Campo opcional, no se muestra                                                  |
| Titular o razón social y CUIT                            | Panel > Titular o razón social / CUIT                                                              | La política de privacidad muestra "Falta cargar: titular" y "Falta cargar: CUIT" |
| Productos reales                                         | Panel > Productos                                                                                  | Hay 9 productos de ejemplo (filtro "Productos de ejemplo") para borrar         |
| Dominio propio                                           | Ver `DEPLOY.md`                                                                                    | El sitio está en `rosalumayorista.aleyufra.workers.dev`                        |

## Al pasar a un dominio propio

Cambiar la URL en estos tres lugares y volver a publicar:

1. `astro.config.mjs` (`SITE_URL`, o la variable de entorno `SITE_URL` en Cloudflare).
2. `public/robots.txt` (línea `Sitemap:`).
3. `public/admin/config.yml` (`site_url` y `display_url`).

Y sumar el dominio nuevo a `ALLOWED_DOMAINS` en el Worker `sveltia-cms-auth`.
