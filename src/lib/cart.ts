export type ExclusionReason = 'sold-out' | 'removed' | 'variant';

export interface CartLine {
  slug: string;
  name: string;
  cashPrice: number;
  size?: string | undefined;
  color?: string | undefined;
  quantity: number;
  photo: string;
  excluded?: ExclusionReason | undefined;
}

/** What the build publishes in /products.json for each product. */
export interface CatalogProduct {
  slug: string;
  name: string;
  cashPrice: number;
  available: boolean;
  sizes: string[];
  colors: string[];
  photo: string;
}

export type CartNotice =
  | { kind: 'price'; name: string; before: number; after: number }
  | { kind: ExclusionReason; name: string };

export const MAX_QUANTITY = 999;

/** Same product with the same size and colour shares one line. */
export function lineKey(line: Pick<CartLine, 'slug' | 'size' | 'color'>): string {
  return [line.slug, line.size ?? '', line.color ?? ''].join('|');
}

const clampQuantity = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n) || 1));

export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  const key = lineKey(incoming);
  const existing = lines.find((l) => lineKey(l) === key);
  if (!existing) return [...lines, { ...incoming, quantity: clampQuantity(incoming.quantity) }];
  return lines.map((l) =>
    l === existing
      ? { ...l, ...incoming, quantity: clampQuantity(l.quantity + incoming.quantity) }
      : l,
  );
}

export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  return lines.map((l) => (lineKey(l) === key ? { ...l, quantity: clampQuantity(quantity) } : l));
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((l) => lineKey(l) !== key);
}

/** Only lines that still go in the order count toward units and total. */
export function activeLines(lines: CartLine[]): CartLine[] {
  return lines.filter((l) => !l.excluded);
}

export function getTotals(lines: CartLine[]): { units: number; total: number } {
  return activeLines(lines).reduce(
    (acc, l) => ({ units: acc.units + l.quantity, total: acc.total + l.quantity * l.cashPrice }),
    { units: 0, total: 0 },
  );
}

export function unitsMissing(units: number, minimum: number): number {
  return Math.max(0, minimum - units);
}

/**
 * Compares the stored cart with the catalogue published by the last build.
 * Price changes are applied and reported; sold-out, deleted products and variants that
 * no longer exist stay visible but are excluded from the order.
 */
export function revalidate(
  lines: CartLine[],
  catalog: CatalogProduct[],
): { lines: CartLine[]; notices: CartNotice[] } {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const notices: CartNotice[] = [];
  const next = lines.map((line): CartLine => {
    const product = bySlug.get(line.slug);
    if (!product) {
      notices.push({ kind: 'removed', name: line.name });
      return { ...line, excluded: 'removed' };
    }
    const updated: CartLine = {
      ...line,
      name: product.name,
      photo: product.photo,
      excluded: undefined,
    };
    if (!product.available) {
      notices.push({ kind: 'sold-out', name: product.name });
      return { ...updated, excluded: 'sold-out' };
    }
    const sizeGone = line.size !== undefined && !product.sizes.includes(line.size);
    const colorGone = line.color !== undefined && !product.colors.includes(line.color);
    if (sizeGone || colorGone) {
      notices.push({ kind: 'variant', name: product.name });
      return { ...updated, excluded: 'variant' };
    }
    if (product.cashPrice !== line.cashPrice) {
      notices.push({
        kind: 'price',
        name: product.name,
        before: line.cashPrice,
        after: product.cashPrice,
      });
      return { ...updated, cashPrice: product.cashPrice };
    }
    return updated;
  });
  return { lines: next, notices };
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === 'string' &&
    typeof v.name === 'string' &&
    typeof v.cashPrice === 'number' &&
    Number.isFinite(v.cashPrice) &&
    typeof v.quantity === 'number' &&
    v.quantity >= 1 &&
    typeof v.photo === 'string' &&
    (v.size === undefined || typeof v.size === 'string') &&
    (v.color === undefined || typeof v.color === 'string')
  );
}

/** Parses the stored cart; anything unreadable becomes an empty cart instead of a broken page. */
export function decodeCart(raw: string | undefined | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isCartLine)) return [];
    return parsed.map((l) => ({ ...l, quantity: clampQuantity(l.quantity) }));
  } catch {
    return [];
  }
}
