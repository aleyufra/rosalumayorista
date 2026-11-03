# Datos pendientes

Todo esto se carga desde el panel (`/admin` > **Datos del negocio y textos**), salvo donde se indica otra cosa. Mientras falte un dato, el sitio muestra un recuadro punteado que dice "Falta cargar: ..." en lugar de inventar un valor.

| Dato                                       | Dónde se carga                                                          | Qué pasa mientras falta                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Altura de la calle Gorriti                 | Panel > Dirección > Altura                                              | Se muestra la calle sin número y "Falta cargar: altura"                      |
| Link de Google Maps (Cómo llegar)          | Panel > Link de Google Maps                                             | No aparece el botón "Cómo llegar"                                            |
| Link para insertar el mapa                 | Panel > Link para insertar el mapa                                      | Se ve el mapa provisorio, sin botón "Ver mapa"                               |
| Número de WhatsApp (549388XXXXXXX)         | Panel > Número de WhatsApp                                              | Los botones de WhatsApp aparecen desactivados y no se puede enviar el pedido |
| Recargo por transferencia (%)              | Panel > Recargo por transferencia                                       | "Falta cargar: recargo por transferencia" en producto y carrito              |
| ¿Aceptan Mercado Pago?                     | Panel > ¿Aceptan Mercado Pago? y la respuesta de esa pregunta frecuente | La respuesta muestra "Falta cargar"                                          |
| Instagram, Facebook y TikTok               | Panel > Redes                                                           | El footer muestra "Falta cargar: redes sociales"                             |
| Nombre y rol de quien atiende              | Panel > Quien atiende                                                   | "Falta cargar: nombre" y "Falta cargar: rol"                                 |
| Foto de quien atiende                      | Panel > Quien atiende > Foto                                            | Foto provisoria                                                              |
| Fotos del local y de los rubros            | Panel > Fotos de la página principal                                    | Fotos provisorias (ver `PHOTOS-TODO.md`)                                     |
| Ejemplo de ganancia con 3 productos reales | Panel > Ejemplo de ganancia                                             | Se usan precios de ejemplo redondos, rotulados como ejemplo                  |
| Subcategorías por rubro                    | Cada producto > Subcategoría (texto libre)                              | Campo opcional, no se muestra                                                |
| Productos reales                           | Panel > Productos                                                       | Hay 9 productos de ejemplo (filtro "Productos de ejemplo") para borrar       |
| Dominio propio                             | Ver `DEPLOY.md`                                                         | El sitio está en `rosalumayorista.almarweb.workers.dev`                      |

## Al pasar a un dominio propio

Cambiar la URL en estos tres lugares y volver a publicar:

1. `astro.config.mjs` (`SITE_URL`, o la variable de entorno `SITE_URL` en Cloudflare).
2. `public/robots.txt` (línea `Sitemap:`).
3. `public/admin/config.yml` (`site_url` y `display_url`).

Y sumar el dominio nuevo a `ALLOWED_DOMAINS` en el Worker `sveltia-cms-auth`.
