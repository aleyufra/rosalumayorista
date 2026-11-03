import type { APIRoute } from 'astro';
import { getProducts, toCatalogProduct } from '../lib/products';

/** Published at build time; the cart page compares stored lines against it. */
export const GET: APIRoute = async () => {
  const products = await Promise.all((await getProducts()).map(toCatalogProduct));
  return new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
