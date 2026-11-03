# Rosalu

Sitio de Rosalu, mayorista de ropa, juguetería y bazar en San Salvador de Jujuy. "Mayorista desde 3": catálogo con precios, pedido armado por WhatsApp y retiro en el local.

Sitio 100 % estático: Astro 7, TypeScript estricto, Tailwind CSS 4, Archivo (Fontsource, ejes `wght` y `wdth`), nanostores para el carrito y Sveltia CMS en `/admin`. Se publica en Cloudflare Workers (static assets).

## Requisitos

- Node 22.12 o más nuevo (el proyecto usa 24, ver `.node-version`).
- pnpm 12 (`corepack enable` lo activa con la versión de `packageManager`).
- Windows 11 con Git Bash, o cualquier shell POSIX.

## Instalación

```bash
pnpm install
pnpm dev
```

El sitio queda en http://localhost:4321. El panel en desarrollo se abre en http://localhost:4321/admin/index.html (pide un token de GitHub en modo local; en producción se entra con "Iniciar sesión con GitHub").

## Comandos

| Comando                  | Qué hace                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| `pnpm dev`               | Servidor de desarrollo                                                 |
| `pnpm build`             | Genera el sitio en `dist/`                                             |
| `pnpm preview`           | Sirve `dist/` para revisar el build                                    |
| `pnpm check`             | `astro check` (tipos y plantillas)                                     |
| `pnpm lint`              | ESLint                                                                 |
| `pnpm format`            | Prettier (con orden de clases de Tailwind)                             |
| `pnpm test`              | Tests de Vitest (carrito, mensaje de WhatsApp, horarios, textos)       |
| `pnpm logo`              | Regenera logo, favicons, `apple-touch-icon` y la imagen para compartir |
| `pnpm placeholders`      | Genera las fotos provisorias y los 9 productos de ejemplo que falten   |
| `pnpm exec wrangler dev` | Sirve `dist/` igual que Cloudflare (rutas, 404, `_headers`)            |
| `pnpm deploy`            | Build y deploy manual a Cloudflare                                     |

## Estructura

```
src/
  content/products/<slug>/index.md   productos (una carpeta por producto, fotos al lado)
  content/settings/site.yml          datos del negocio y textos de la página principal
  content.config.ts                  esquemas Zod de las dos colecciones
  lib/                               lógica pura con tests (carrito, WhatsApp, horarios, precios)
  stores/cart.ts                     carrito persistente (localStorage 'rosalu-cart-v1')
  components/                        MarketTag (el cartel), tarjetas, galería, header, footer
  components/home/                   secciones de la página principal
  pages/                             /, /catalogo, /catalogo/[slug], /carrito, /404, /products.json
public/admin/                        Sveltia CMS (index.html y config.yml)
scripts/                             generadores de logo y placeholders (sharp)
docs/                                deploy, guía del panel, pendientes y fotos
```

Convención: todo el código (archivos, componentes, variables, campos) va en inglés; los textos que lee una persona van en español. Las rutas y parámetros de URL quedan en español porque los ve la clienta.

## Logo

El wordmark del logo original es Roboto Black Italic (coincidencia del 98,7 % pixel a pixel), así que `pnpm logo` lo reconstruye como SVG vectorial (`src/assets/brand/wordmark.svg`), recorta la franja negra del original y genera favicons y la imagen Open Graph.

## Documentación

- [docs/DEPLOY.md](docs/DEPLOY.md): repositorio, Cloudflare y autenticación del panel.
- [docs/CMS-GUIDE.md](docs/CMS-GUIDE.md): guía del panel para la dueña o encargada.
- [docs/PENDING.md](docs/PENDING.md): datos del negocio que faltan.
- [docs/PHOTOS-TODO.md](docs/PHOTOS-TODO.md): fotos que hay que sacar.
