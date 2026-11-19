import type { APIRoute } from 'astro';
import { getProducts, toCatalogProduct } from '../lib/products';

/**
 * Se publica en el build; la pagina del carrito compara las lineas guardadas contra esto.
 * Tambien lo lee el Worker (worker/index.ts) para recalcular precios en el servidor.
 */
export const GET: APIRoute = async () => {
  const products = await Promise.all((await getProducts()).map(toCatalogProduct));
  return new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
