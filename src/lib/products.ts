import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { CatalogProduct } from './cart';

export type Product = CollectionEntry<'products'>;
export type Category = Product['data']['category'];

export const CATEGORY_LABELS: Record<Category, string> = {
  ropa: 'Ropa',
  jugueteria: 'Juguetería',
  bazar: 'Bazar',
};

export const productUrl = (slug: string) => `/catalogo/${slug}`;

/** Newest first; sold-out products sink to the end so the first screen is buyable. */
export async function getProducts(): Promise<Product[]> {
  const all = await getCollection('products');
  return all.sort((a, b) => {
    if (a.data.available !== b.data.available) return a.data.available ? -1 : 1;
    const dateDiff = (b.data.updatedAt?.getTime() ?? 0) - (a.data.updatedAt?.getTime() ?? 0);
    return dateDiff || a.data.name.localeCompare(b.data.name, 'es');
  });
}

/** Small cart thumbnail URL for a product's cover photo. */
export async function thumbnailUrl(product: Product): Promise<string> {
  const cover = product.data.photos[0];
  if (!cover) return '';
  const img = await getImage({ src: cover, width: 160, height: 160, format: 'webp', quality: 70 });
  return img.src;
}

export async function toCatalogProduct(product: Product): Promise<CatalogProduct> {
  return {
    slug: product.id,
    name: product.data.name,
    cashPrice: product.data.cashPrice,
    available: product.data.available,
    sizes: product.data.sizes,
    colors: product.data.colors.map((c) => c.name),
    photo: await thumbnailUrl(product),
  };
}
