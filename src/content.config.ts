import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Categories are editable in the CMS. The file name is the slug, which stays in Spanish
 * because it appears in visitor-facing URLs (?rubro=ropa).
 */
const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '*.yml' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(2).max(30),
      order: z.number().int().default(99),
      photo: image().optional(),
    }),
});

const products = defineCollection({
  loader: glob({
    base: './src/content/products',
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(3).max(80),
      category: z.string().min(1), // category slug, checked in lib/products.ts
      subcategory: z.string().max(40).optional(),
      cashPrice: z.number().int().positive(),
      photos: z.array(image()).min(1).max(6),
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
/** Business facts that may still read "TODO ..."; the UI renders them as visible placeholders. */
const pendable = z.string().default('');

const settings = defineCollection({
  loader: glob({ base: './src/content/settings', pattern: 'site.yml' }),
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
            // Optional second shift (split hours, e.g. 10-14 and 18-22).
            reopens: time.optional(),
            closesLate: time.optional(),
          }),
        )
        .length(7),
      whatsapp: z.union([z.string().regex(/^549\d{10}$/), z.string().startsWith('TODO')]),
      social: z.object({ instagram: pendable, facebook: pendable, tiktok: pendable }),
      acceptsMercadoPago: z.enum(['yes', 'no', 'pending']),
      minUnits: z.number().int().min(1).default(3),
      transferSurchargePercent: z.number().min(0).max(100).optional(),
      contactPerson: z.object({ name: pendable, role: pendable, photo: image().optional() }),
      photos: z.object({
        storefront: image().optional(),
      }),
      // Up to 3 product slugs for the hero; empty = first 3 featured.
      heroProducts: z.array(z.string()).max(3).default([]),
      season: z.object({
        active: z.boolean(),
        theme: z.enum(['plain', 'christmas']).default('plain'),
        tag: z.string().max(20),
        title: z.string(),
        text: z.string(),
      }),
      profitExample: z
        .array(
          z.object({
            product: z.string(),
            wholesalePrice: z.number().int().positive(),
            resalePrice: z.number().int().positive(),
          }),
        )
        .length(3),
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
