import { describe, expect, it } from 'vitest';
import type { CatalogProduct } from './cart';
import {
  buildPreference,
  itemTitle,
  makeOrderCode,
  normalizePhone,
  parseCheckoutRequest,
  toPaymentSummary,
  mpMinimumMissing,
  validateCheckout,
  type CheckoutConfig,
  type CheckoutRequest,
} from './checkout';

const catalog: CatalogProduct[] = [
  {
    slug: 'remera',
    name: 'Remera básica',
    cashPrice: 9000,
    available: true,
    sizes: ['S', 'M'],
    colors: ['Negro'],
    photo: '/_astro/r.webp',
    onlinePayment: true,
  },
  {
    slug: 'te',
    name: 'Juego de té infantil',
    cashPrice: 7500,
    available: true,
    sizes: [],
    colors: [],
    photo: '',
    onlinePayment: true,
  },
  {
    slug: 'mueble',
    name: 'Mueble',
    cashPrice: 50000,
    available: true,
    sizes: [],
    colors: [],
    photo: '',
    onlinePayment: false,
  },
  {
    slug: 'agotado',
    name: 'Agotado',
    cashPrice: 1000,
    available: false,
    sizes: [],
    colors: [],
    photo: '',
    onlinePayment: true,
  },
];

const config: CheckoutConfig = { enabled: true, surcharge: 1500, minUnits: 3, minAmount: 0 };

const request = (lines: CheckoutRequest['lines']): CheckoutRequest => ({
  lines,
  name: '  Vero   Pérez ',
  phone: '388 584-6033',
});

describe('parseCheckoutRequest', () => {
  it('accepts the cart page body', () => {
    const body = { name: 'Vero', phone: '3885846033', lines: [{ slug: 'te', quantity: 2 }] };
    expect(parseCheckoutRequest(body)?.lines).toEqual([
      { slug: 'te', size: undefined, color: undefined, quantity: 2 },
    ]);
  });

  it('rejects malformed bodies', () => {
    expect(parseCheckoutRequest(null)).toBeNull();
    expect(parseCheckoutRequest({ name: 'a', phone: '1', lines: 'x' })).toBeNull();
    expect(
      parseCheckoutRequest({ name: 'a', phone: '1', lines: [{ slug: 'te', quantity: 1.5 }] }),
    ).toBeNull();
  });
});

describe('normalizePhone', () => {
  it('keeps digits only', () => {
    expect(normalizePhone('+54 9 388 584-6033')).toBe('5493885846033');
    expect(normalizePhone('123')).toBeNull();
  });
});

describe('validateCheckout', () => {
  it('takes prices and names from the catalogue, not from the browser', () => {
    const result = validateCheckout(
      request([
        { slug: 'remera', size: 'M', color: 'Negro', quantity: 2 },
        { slug: 'te', quantity: 1 },
      ]),
      catalog,
      config,
    );
    expect(result).toMatchObject({ ok: true, name: 'Vero Pérez', phone: '3885846033' });
    if (!result.ok) return;
    expect(result.lines.map((l) => [l.slug, l.unitPrice, l.quantity])).toEqual([
      ['remera', 9000, 2],
      ['te', 7500, 1],
    ]);
  });

  it('leaves out store-only, sold-out, unknown and stale-variant lines', () => {
    const result = validateCheckout(
      request([
        { slug: 'te', quantity: 3 },
        { slug: 'mueble', quantity: 1 },
        { slug: 'agotado', quantity: 1 },
        { slug: 'nada', quantity: 1 },
        { slug: 'remera', size: 'XL', color: 'Negro', quantity: 1 },
        { slug: 'remera', quantity: 1 },
      ]),
      catalog,
      config,
    );
    expect(result.ok && result.lines.map((l) => l.slug)).toEqual(['te']);
  });

  it('counts the minimum on payable units only', () => {
    const result = validateCheckout(
      request([
        { slug: 'te', quantity: 2 },
        { slug: 'mueble', quantity: 5 },
      ]),
      catalog,
      config,
    );
    expect(result.ok).toBe(false);
  });

  it('needs the minimum amount in online products, inclusive, without the surcharge', () => {
    const withMin = { ...config, minAmount: 30000 };
    const buy = (quantity: number) =>
      validateCheckout(request([{ slug: 'te', quantity }]), catalog, withMin);
    expect(buy(3).ok).toBe(false); // 22.500
    expect(buy(4).ok).toBe(true); // 30.000 exactly
    // 30.000 + 1.500 of surcharge would pass a 31.000 minimum if the surcharge counted.
    expect(
      validateCheckout(request([{ slug: 'te', quantity: 4 }]), catalog, {
        ...withMin,
        minAmount: 31000,
      }).ok,
    ).toBe(false);
  });

  it('counts the minimum amount on payable lines only', () => {
    const withMin = { ...config, minAmount: 30000 };
    const result = validateCheckout(
      request([
        { slug: 'te', quantity: 3 },
        { slug: 'mueble', quantity: 5 },
      ]),
      catalog,
      withMin,
    );
    expect(result.ok).toBe(false);
  });

  it('merges repeated lines', () => {
    const result = validateCheckout(
      request([
        { slug: 'te', quantity: 2 },
        { slug: 'te', quantity: 2 },
      ]),
      catalog,
      config,
    );
    expect(result.ok && result.lines).toHaveLength(1);
    expect(result.ok && result.lines[0]?.quantity).toBe(4);
  });

  it('requires a name and a phone, and the switch on', () => {
    const lines = [{ slug: 'te', quantity: 3 }];
    expect(validateCheckout({ lines, name: ' ', phone: '3885846033' }, catalog, config).ok).toBe(
      false,
    );
    expect(validateCheckout({ lines, name: 'Vero', phone: '12' }, catalog, config).ok).toBe(false);
    expect(validateCheckout(request(lines), catalog, { ...config, enabled: false }).ok).toBe(false);
  });
});

describe('buildPreference', () => {
  const lines = [
    {
      slug: 'remera',
      name: 'Remera básica',
      size: 'M',
      color: 'Negro',
      quantity: 2,
      unitPrice: 9000,
      photo: '/_astro/r.webp',
    },
    { slug: 'te', name: 'Juego de té infantil', quantity: 1, unitPrice: 7500, photo: '' },
  ];
  const ctx = {
    origin: 'https://rosalu.test',
    orderCode: 'RSL-ABC234',
    name: 'Vero',
    phone: '3885846033',
    now: new Date('2026-11-17T12:00:00.000Z'),
  };

  it('details every item and adds the surcharge once', () => {
    const pref = buildPreference(lines, 1500, ctx);
    expect(pref.items).toEqual([
      {
        id: 'remera',
        title: 'Remera básica (Talle M, Color Negro)',
        quantity: 2,
        unit_price: 9000,
        currency_id: 'ARS',
        picture_url: 'https://rosalu.test/_astro/r.webp',
      },
      {
        id: 'te',
        title: 'Juego de té infantil',
        quantity: 1,
        unit_price: 7500,
        currency_id: 'ARS',
      },
      {
        id: 'recargo',
        title: 'Recargo por pago con Mercado Pago',
        quantity: 1,
        unit_price: 1500,
        currency_id: 'ARS',
      },
    ]);
  });

  it('asks for auto return only on a public https origin', () => {
    expect(
      buildPreference(lines, 0, { ...ctx, origin: 'http://127.0.0.1:8787' }),
    ).not.toHaveProperty('auto_return');
  });

  it('skips the surcharge item when it is zero', () => {
    expect(buildPreference(lines, 0, ctx).items).toHaveLength(2);
  });

  it('sets order code, back URLs, 1 installment, no cash tickets and a 2 hour expiry', () => {
    const pref = buildPreference(lines, 1500, ctx);
    expect(pref).toMatchObject({
      external_reference: 'RSL-ABC234',
      auto_return: 'approved',
      binary_mode: true,
      back_urls: { success: 'https://rosalu.test/pago/aprobado' },
      payment_methods: {
        installments: 1,
        excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
      },
      expiration_date_to: '2026-11-17T14:00:00.000Z',
    });
  });
});

describe('itemTitle', () => {
  it('omits empty variants', () => {
    expect(itemTitle({ name: 'Taza', color: 'Blanco' })).toBe('Taza (Color Blanco)');
  });
});

describe('makeOrderCode', () => {
  it('uses an unambiguous alphabet', () => {
    expect(makeOrderCode(new Uint8Array([0, 1, 2, 3, 4, 31]))).toBe('RSL-23456Z');
  });
});

describe('toPaymentSummary', () => {
  it('reads the fields the result page needs', () => {
    const summary = toPaymentSummary({
      id: 123,
      status: 'approved',
      external_reference: 'RSL-ABC234',
      transaction_amount: 19500,
      metadata: { name: 'Vero', phone: '3885846033' },
      additional_info: { items: [{ title: 'Juego de té', quantity: '2', unit_price: '9000' }] },
    });
    expect(summary).toEqual({
      id: '123',
      status: 'approved',
      orderCode: 'RSL-ABC234',
      total: 19500,
      name: 'Vero',
      items: [{ title: 'Juego de té', quantity: 2, unitPrice: 9000 }],
    });
  });

  it('rejects non-payments', () => {
    expect(toPaymentSummary('x')).toBeNull();
  });
});

describe('mpMinimumMissing', () => {
  it('reports what is still needed, never negative', () => {
    expect(mpMinimumMissing(22500, 35000)).toBe(12500);
    expect(mpMinimumMissing(35000, 35000)).toBe(0);
    expect(mpMinimumMissing(50000, 35000)).toBe(0);
  });
});
