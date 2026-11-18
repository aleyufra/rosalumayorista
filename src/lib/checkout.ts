import { lineKey, MAX_QUANTITY, type CatalogProduct } from './cart';
import { formatPrice } from './price';

/** Published at build time in /checkout.json; read by the cart page and the Worker. */
export interface CheckoutConfig {
  enabled: boolean;
  surcharge: number;
  minUnits: number;
  /** Minimum of products (without the surcharge) to reserve with Mercado Pago. */
  minAmount: number;
}

/** ARS still needed in online products to reach the Mercado Pago minimum (0 when reached). */
export function mpMinimumMissing(subtotal: number, minAmount: number): number {
  return Math.max(0, minAmount - subtotal);
}

export interface CheckoutRequestLine {
  slug: string;
  size?: string | undefined;
  color?: string | undefined;
  quantity: number;
}

export interface CheckoutRequest {
  lines: CheckoutRequestLine[];
  name: string;
  phone: string;
}

/** A line rebuilt from the catalogue: prices never come from the browser. */
export interface CheckoutLine {
  slug: string;
  name: string;
  size?: string | undefined;
  color?: string | undefined;
  quantity: number;
  unitPrice: number;
  photo: string;
}

export type CheckoutValidation =
  { ok: true; lines: CheckoutLine[]; name: string; phone: string } | { ok: false; error: string };

export const SURCHARGE_ITEM_ID = 'recargo';
export const SURCHARGE_TITLE = 'Recargo por pago con Mercado Pago';
const MAX_NAME_LENGTH = 60;
const MAX_LINES = 100;

const isOptionalString = (v: unknown) => v === undefined || typeof v === 'string';

/** Shape check of the JSON body the cart page posts to /api/checkout. */
export function parseCheckoutRequest(body: unknown): CheckoutRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== 'string' || typeof b.phone !== 'string' || !Array.isArray(b.lines)) {
    return null;
  }
  if (b.lines.length > MAX_LINES) return null;
  const lines: CheckoutRequestLine[] = [];
  for (const raw of b.lines as unknown[]) {
    if (typeof raw !== 'object' || raw === null) return null;
    const l = raw as Record<string, unknown>;
    if (
      typeof l.slug !== 'string' ||
      typeof l.quantity !== 'number' ||
      !Number.isInteger(l.quantity) ||
      !isOptionalString(l.size) ||
      !isOptionalString(l.color)
    ) {
      return null;
    }
    lines.push({
      slug: l.slug,
      size: l.size as string | undefined,
      color: l.color as string | undefined,
      quantity: l.quantity,
    });
  }
  return { lines, name: b.name, phone: b.phone };
}

/** Argentine phone as digits only, 8 to 15 of them; null when it can't be a phone. */
export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/**
 * Rebuilds the order from the catalogue of the last build. Lines that are sold out, gone,
 * with a variant that no longer exists or marked as store-only are left out silently:
 * the cart page already shows why.
 */
export function validateCheckout(
  request: CheckoutRequest,
  catalog: CatalogProduct[],
  config: CheckoutConfig,
): CheckoutValidation {
  if (!config.enabled) return { ok: false, error: 'El pago con Mercado Pago no está activo.' };
  const name = request.name.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: 'Escribí tu nombre para que sepamos de quién es el pedido.' };
  }
  const phone = normalizePhone(request.phone);
  if (!phone) {
    return {
      ok: false,
      error: 'Revisá el teléfono: escribilo con característica, sin el 0 ni el 15.',
    };
  }

  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const merged = new Map<string, CheckoutLine>();
  for (const line of request.lines) {
    const product = bySlug.get(line.slug);
    if (!product || !product.available || !product.onlinePayment) continue;
    if (line.size !== undefined && !product.sizes.includes(line.size)) continue;
    if (line.color !== undefined && !product.colors.includes(line.color)) continue;
    if (line.size === undefined && product.sizes.length) continue;
    if (line.color === undefined && product.colors.length) continue;
    if (line.quantity < 1 || line.quantity > MAX_QUANTITY) continue;
    const key = lineKey(line);
    const existing = merged.get(key);
    merged.set(key, {
      slug: product.slug,
      name: product.name,
      size: line.size,
      color: line.color,
      quantity: Math.min(MAX_QUANTITY, (existing?.quantity ?? 0) + line.quantity),
      unitPrice: product.cashPrice,
      photo: product.photo,
    });
  }
  const lines = [...merged.values()];
  if (!lines.length) {
    return { ok: false, error: 'No hay productos para pagar online en tu pedido.' };
  }
  const units = lines.reduce((sum, l) => sum + l.quantity, 0);
  if (units < config.minUnits) {
    return {
      ok: false,
      error: `El mínimo de compra es de ${config.minUnits} productos que se puedan pagar online.`,
    };
  }
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  if (mpMinimumMissing(subtotal, config.minAmount) > 0) {
    return {
      ok: false,
      error: `Para reservar con Mercado Pago necesitás ${formatPrice(config.minAmount)} en productos que se pagan desde la página, sin contar el recargo.`,
    };
  }
  return { ok: true, lines, name, phone };
}

/** "Remera básica (Talle M, Color Negro)", the title shown in Checkout Pro. */
export function itemTitle(line: Pick<CheckoutLine, 'name' | 'size' | 'color'>): string {
  const parts = [line.size && `Talle ${line.size}`, line.color && `Color ${line.color}`].filter(
    Boolean,
  );
  return parts.length ? `${line.name} (${parts.join(', ')})` : line.name;
}

export interface PreferenceContext {
  origin: string;
  orderCode: string;
  name: string;
  phone: string;
  now: Date;
}

const PREFERENCE_LIFETIME_MS = 2 * 60 * 60 * 1000;

/** Body for POST https://api.mercadopago.com/checkout/preferences. */
export function buildPreference(
  lines: CheckoutLine[],
  surcharge: number,
  ctx: PreferenceContext,
): Record<string, unknown> {
  const items: Record<string, unknown>[] = lines.map((l) => ({
    id: l.slug,
    title: itemTitle(l),
    quantity: l.quantity,
    unit_price: l.unitPrice,
    currency_id: 'ARS',
    ...(l.photo ? { picture_url: new URL(l.photo, ctx.origin).href } : {}),
  }));
  if (surcharge > 0) {
    items.push({
      id: SURCHARGE_ITEM_ID,
      title: SURCHARGE_TITLE,
      quantity: 1,
      unit_price: surcharge,
      currency_id: 'ARS',
    });
  }
  return {
    items,
    payer: { name: ctx.name, phone: { area_code: '', number: ctx.phone } },
    metadata: { name: ctx.name, phone: ctx.phone, order_code: ctx.orderCode },
    external_reference: ctx.orderCode,
    statement_descriptor: 'ROSALU',
    payment_methods: {
      excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
      installments: 1,
    },
    binary_mode: true,
    back_urls: {
      success: `${ctx.origin}/pago/aprobado`,
      failure: `${ctx.origin}/pago/rechazado`,
      pending: `${ctx.origin}/pago/pendiente`,
    },
    // Mercado Pago drops non-public return URLs (localhost) and then rejects auto_return.
    ...(ctx.origin.startsWith('https://') ? { auto_return: 'approved' } : {}),
    expires: true,
    expiration_date_from: ctx.now.toISOString(),
    expiration_date_to: new Date(ctx.now.getTime() + PREFERENCE_LIFETIME_MS).toISOString(),
  };
}

const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** "RSL-7K2Q9X" from random bytes; no 0/O or 1/I so it reads well over WhatsApp. */
export function makeOrderCode(random: Uint8Array): string {
  const chars = [...random.slice(0, 6)].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `RSL-${chars.join('')}`;
}

export interface PaymentItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

/** What /api/payment tells the result page about a verified payment. */
export interface PaymentSummary {
  id: string;
  status: string;
  orderCode: string;
  total: number;
  name: string;
  items: PaymentItem[];
}

/** Picks the few fields the result page needs from a Mercado Pago payment. */
export function toPaymentSummary(payment: unknown): PaymentSummary | null {
  if (typeof payment !== 'object' || payment === null) return null;
  const p = payment as Record<string, unknown>;
  if (typeof p.id !== 'number' && typeof p.id !== 'string') return null;
  const info = (p.additional_info ?? {}) as { items?: unknown };
  const metadata = (p.metadata ?? {}) as { name?: unknown };
  const items = Array.isArray(info.items)
    ? info.items.map((raw: unknown) => {
        const i = (raw ?? {}) as Record<string, unknown>;
        return {
          title: String(i.title ?? ''),
          quantity: Number(i.quantity) || 0,
          unitPrice: Number(i.unit_price) || 0,
        };
      })
    : [];
  return {
    id: String(p.id),
    status: String(p.status ?? ''),
    orderCode: String(p.external_reference ?? ''),
    total: Number(p.transaction_amount) || 0,
    name: typeof metadata.name === 'string' ? metadata.name : '',
    items,
  };
}
