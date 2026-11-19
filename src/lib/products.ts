// Acceso a las colecciones de productos y rubros. Solo corre en el build (usa astro:content
// y astro:assets), nunca en el navegador.
import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { CatalogProduct } from './cart';

export type Product = CollectionEntry<'products'>;
export type Category = CollectionEntry<'categories'>;

/** Rubros en el orden del panel ("Orden") y despues por nombre. */
export async function getCategories(): Promise<Category[]> {
  const all = await getCollection('categories');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, 'es'));
}

/** Slug del rubro -> nombre visible. */
export async function getCategoryLabels(): Promise<Record<string, string>> {
  return Object.fromEntries((await getCategories()).map((c) => [c.id, c.data.name]));
}

export const productUrl = (slug: string) => `/catalogo/${slug}`;

/** Mas nuevos primero; los agotados van al final para que la primera pantalla sea comprable. */
export async function getProducts(): Promise<Product[]> {
  const all = await getCollection('products');
  const labels = await getCategoryLabels();
  // Validacion en build: un producto con un rubro inexistente corta el deploy con un mensaje
  // en espanol que quien administra el negocio puede resolver desde el panel.
  for (const p of all) {
    if (!labels[p.data.category]) {
      throw new Error(
        `El producto "${p.data.name}" tiene el rubro "${p.data.category}", que no existe. Pasalo a otro rubro en el panel.`,
      );
    }
  }
  return all.sort((a, b) => {
    if (a.data.available !== b.data.available) return a.data.available ? -1 : 1;
    const dateDiff = (b.data.updatedAt?.getTime() ?? 0) - (a.data.updatedAt?.getTime() ?? 0);
    return dateDiff || a.data.name.localeCompare(b.data.name, 'es');
  });
}

/** URL de la miniatura chica del carrito para la foto de portada de un producto. */
export async function thumbnailUrl(product: Product): Promise<string> {
  const cover = product.data.photos[0];
  if (!cover) return '';
  const img = await getImage({ src: cover, width: 160, height: 160, format: 'webp', quality: 70 });
  return img.src;
}

// Version liviana del producto para /products.json: la usan la revalidacion del carrito
// (lib/cart.ts) y el Worker de pagos (lib/checkout.ts).
export async function toCatalogProduct(product: Product): Promise<CatalogProduct> {
  return {
    slug: product.id,
    name: product.data.name,
    cashPrice: product.data.cashPrice,
    available: product.data.available,
    sizes: product.data.sizes,
    colors: product.data.colors.map((c) => c.name),
    photo: await thumbnailUrl(product),
    onlinePayment: product.data.onlinePayment,
  };
}
