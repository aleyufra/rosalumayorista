// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL se puede pisar con una variable de entorno (por ejemplo al tener dominio propio);
// se usa para el sitemap y las URLs absolutas (og:image, JSON-LD).
const SITE_URL = process.env.SITE_URL ?? 'https://rosalumayorista.aleyufra.workers.dev';

export default defineConfig({
  site: SITE_URL,
  // Sitio 100% estatico, sin adapter: el unico codigo de servidor es worker/index.ts.
  output: 'static',
  // trailingSlash 'never' + format 'file' generan /catalogo.html servido como /catalogo,
  // sin barra final (los links del sitio no deben terminar en /).
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    // Fuera del sitemap: el panel, el carrito y las paginas de resultado de pago.
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.endsWith('/carrito') && !page.includes('/pago/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
