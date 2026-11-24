import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGE_FILE = /\.(webp|png|jpe?g|avif|gif|svg)$/i;

/** Quita las referencias a imagenes cuyo archivo ya no existe, para que una foto renombrada no rompa el sitio. */
function dropMissingImages(value: unknown, baseDir: string, where: string): unknown {
  if (Array.isArray(value)) {
    return value
      .map((v) => dropMissingImages(v, baseDir, where))
      .filter((v) => v !== undefined);
  }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([k, v]) => [k, dropMissingImages(v, baseDir, where)] as const)
        .filter(([, v]) => v !== undefined),
    );
  }
  if (typeof value === 'string' && IMAGE_FILE.test(value) && !existsSync(resolve(baseDir, value))) {
    console.warn(`[rosalu] Falta la imagen "${value}" en ${where}; se muestra sin foto.`);
    return undefined;
  }
  return value;
}

/** Envuelve un loader para que las entradas se lean sin las imagenes que faltan. */
function tolerantImages(loader: Loader): Loader {
  return {
    ...loader,
    load: (context) =>
      loader.load({
        ...context,
        parseData: (props) => {
          const filePath = props.filePath ?? '';
          const absolute = resolve(fileURLToPath(context.config.root), filePath);
          return context.parseData({
            ...props,
            data: dropMissingImages(props.data, dirname(absolute), filePath) as typeof props.data,
          });
        },
      }),
  };
}

/**
 * Los rubros se editan en el CMS. El nombre del archivo es el slug, que queda en espanol
 * porque aparece en las URLs que ven los visitantes (?rubro=ropa).
 */
const categories = defineCollection({
  loader: tolerantImages(glob({ base: './src/content/categories', pattern: '*.yml' })),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(2).max(30),
      order: z.number().int().default(99),
      photo: image().optional(),
    }),
});

const products = defineCollection({
  loader: tolerantImages(
    glob({
      base: './src/content/products',
      pattern: '*/index.md',
      generateId: ({ entry }) => entry.split('/')[0] ?? entry,
    }),
  ),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(3).max(80),
      category: z.string().min(1), // slug del rubro, validado en lib/products.ts
      subcategory: z.string().max(40).optional(),
      cashPrice: z.number().int().positive(),
      photos: z.array(image()).max(6), // el panel exige 1 o mas; queda vacio solo si falto un archivo
      sizes: z.array(z.string().min(1)).default([]),
      colors: z
        .array(
          z.object({
            name: z.string().min(1),
            hex: z
              .string()
              .regex(/^#[0-9a-fA-F]{6}$/)
              .optional(),
          }),
        )
        .default([]),
      available: z.boolean().default(true),
      // Se puede pagar online con Mercado Pago; desactivado = solo en el local o por WhatsApp.
      onlinePayment: z.boolean().default(true),
      featured: z.boolean().default(false),
      description: z.string().max(300).optional(),
      isSample: z.boolean().default(false),
      updatedAt: z.coerce.date().optional(),
    }),
});

const weekday = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
/** Datos del negocio que pueden decir todavia "TODO ..."; la interfaz los muestra como placeholders visibles. */
const pendable = z.string().default('');

const settings = defineCollection({
  loader: tolerantImages(glob({ base: './src/content/settings', pattern: 'site.yml' })),
  schema: ({ image }) =>
    z.object({
      businessName: z.string(),
      address: z.object({ street: z.string(), number: pendable, city: z.string() }),
      mapsUrl: pendable,
      mapEmbedUrl: pendable,
      hours: z
        .array(
          z.object({
            day: weekday,
            closed: z.boolean().default(false),
            opens: time.optional(),
            closes: time.optional(),
            // Segundo turno opcional (horario cortado, ej: 10-14 y 18-22).
            reopens: time.optional(),
            closesLate: time.optional(),
          }),
        )
        .length(7),
      whatsapp: z.union([z.string().regex(/^549\d{10}$/), z.string().startsWith('TODO')]),
      social: z.object({ instagram: pendable, facebook: pendable, tiktok: pendable }),
      // 'yes' muestra el boton "Pagar con Mercado Pago" en el carrito.
      acceptsMercadoPago: z.enum(['yes', 'no', 'pending']),
      minUnits: z.number().int().min(1).default(3),
      // Monto fijo en ARS que se suma una vez por compra al pagar con Mercado Pago o transferencia.
      paymentSurcharge: z.number().int().min(0).optional(),
      // Minimo de productos (sin el recargo) para reservar con Mercado Pago.
      mpMinAmount: z.number().int().min(0).default(35000),
      photos: z.object({
        storefront: image().optional(),
      }),
      // Hasta 3 slugs de productos para el hero; vacio = los 3 primeros destacados.
      heroProducts: z.array(z.string()).max(3).default([]),
      season: z.object({
        active: z.boolean(),
        theme: z.enum(['plain', 'christmas']).default('plain'),
        tag: z.string().max(20),
        title: z.string(),
        text: z.string(),
      }),
      faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
      copy: z.object({
        heroSubtitle: z.string(),
        trust: z.array(z.object({ title: z.string(), text: z.string() })).length(4),
        howToBuy: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
        guarantee: z.string(),
        guaranteeConditions: z.array(z.string()).min(1),
        closingTitle: z.string(),
        closingText: z.string(),
      }),
    }),
});

export const collections = { categories, products, settings };
