import { describe, expect, it } from 'vitest';
import {
  addLine,
  decodeCart,
  getTotals,
  lineKey,
  payableLines,
  removeLine,
  revalidate,
  setQuantity,
  unitsMissing,
  type CartLine,
  type CatalogProduct,
} from './cart';

const remera: CartLine = {
  slug: 'remera',
  name: 'Remera básica',
  cashPrice: 9000,
  size: 'M',
  color: 'Negro',
  quantity: 1,
  photo: '/r.webp',
};
const te: CartLine = {
  slug: 'te',
  name: 'Juego de té infantil',
  cashPrice: 7500,
  quantity: 1,
  photo: '/t.webp',
};

const catalog: CatalogProduct[] = [
  {
    slug: 'remera',
    name: 'Remera básica',
    cashPrice: 9000,
    available: true,
    sizes: ['S', 'M'],
    colors: ['Negro'],
    photo: '/r.webp',
    onlinePayment: true,
  },
  {
    slug: 'te',
    name: 'Juego de té infantil',
    cashPrice: 7500,
    available: true,
    sizes: [],
    colors: [],
    photo: '/t.webp',
    onlinePayment: true,
  },
];

describe('addLine', () => {
  it('adds a new line', () => {
    expect(addLine([], remera)).toHaveLength(1);
  });

  it('merges the same product, size and colour into one line', () => {
    const lines = addLine(addLine([], remera), { ...remera, quantity: 2 });
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(3);
  });

  it('keeps different variants on separate lines', () => {
    expect(addLine(addLine([], remera), { ...remera, size: 'S' })).toHaveLength(2);
  });
});

describe('quantity, remove and totals', () => {
  it('never goes below 1', () => {
    expect(setQuantity([remera], lineKey(remera), 0)[0]?.quantity).toBe(1);
  });

  it('removes a line', () => {
    expect(removeLine([remera, te], lineKey(remera))).toEqual([te]);
  });

  it('counts units of the same product toward the total', () => {
    expect(getTotals([{ ...remera, quantity: 2 }, te])).toEqual({ units: 3, total: 25500 });
  });

  it('ignores excluded lines', () => {
    expect(getTotals([remera, { ...te, excluded: 'sold-out' }])).toEqual({ units: 1, total: 9000 });
  });

  it('reports how many units are missing for the minimum', () => {
    expect(unitsMissing(1, 3)).toBe(2);
    expect(unitsMissing(5, 3)).toBe(0);
  });
});

describe('revalidate', () => {
  it('updates changed prices and reports them', () => {
    const { lines, notices } = revalidate([{ ...te, cashPrice: 7000 }], catalog);
    expect(lines[0]?.cashPrice).toBe(7500);
    expect(notices).toEqual([
      { kind: 'price', name: 'Juego de té infantil', before: 7000, after: 7500 },
    ]);
  });

  it('excludes sold-out products', () => {
    const soldOut = catalog.map((p) => (p.slug === 'te' ? { ...p, available: false } : p));
    const { lines, notices } = revalidate([te], soldOut);
    expect(lines[0]?.excluded).toBe('sold-out');
    expect(notices[0]?.kind).toBe('sold-out');
  });

  it('excludes products that no longer exist', () => {
    expect(revalidate([{ ...te, slug: 'borrado' }], catalog).lines[0]?.excluded).toBe('removed');
  });

  it('excludes variants that are no longer offered', () => {
    expect(revalidate([{ ...remera, size: 'XXL' }], catalog).lines[0]?.excluded).toBe('variant');
  });

  it('brings a line back when the product is available again', () => {
    const { lines, notices } = revalidate([{ ...te, excluded: 'sold-out' }], catalog);
    expect(lines[0]?.excluded).toBeUndefined();
    expect(notices).toEqual([]);
  });
});

describe('decodeCart', () => {
  it('reads a valid cart', () => {
    expect(decodeCart(JSON.stringify([remera]))).toEqual([remera]);
  });

  it.each([['{not json'], ['{"a":1}'], ['[{"slug":1}]'], [''], [null]])(
    'returns an empty cart for %s',
    (raw) => {
      expect(decodeCart(raw)).toEqual([]);
    },
  );
});

describe('payableLines', () => {
  it('keeps active lines that can be paid online', () => {
    const storeOnly: CartLine = { ...te, slug: 'mueble', onlinePayment: false };
    const soldOut: CartLine = { ...te, slug: 'x', excluded: 'sold-out' };
    expect(payableLines([remera, storeOnly, soldOut]).map((l) => l.slug)).toEqual(['remera']);
  });
});

describe('revalidate onlinePayment', () => {
  it('copies the online payment flag from the catalogue', () => {
    const storeOnly = catalog.map((p) => (p.slug === 'te' ? { ...p, onlinePayment: false } : p));
    const { lines } = revalidate([te], storeOnly);
    expect(lines[0]?.onlinePayment).toBe(false);
  });
});
