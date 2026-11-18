/**
 * Runs only for /api/* (see run_worker_first in wrangler.jsonc); the rest of the site is
 * static. Creates Mercado Pago Checkout Pro preferences and verifies payments, with the
 * Access Token kept as a Worker secret.
 */
import type { CatalogProduct } from '../src/lib/cart';
import {
  buildPreference,
  makeOrderCode,
  parseCheckoutRequest,
  toPaymentSummary,
  validateCheckout,
  type CheckoutConfig,
} from '../src/lib/checkout';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  MP_ACCESS_TOKEN?: string;
}

const MP_API = 'https://api.mercadopago.com';
const MAX_BODY_BYTES = 32 * 1024;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const fail = (error: string, status: number) => json({ error }, status);

async function readAsset<T>(env: Env, origin: string, path: string): Promise<T> {
  const res = await env.ASSETS.fetch(new Request(new URL(path, origin)));
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return (await res.json()) as T;
}

async function createCheckout(request: Request, env: Env): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (request.headers.get('Origin') !== origin) return fail('Origen no permitido.', 403);
  if (!env.MP_ACCESS_TOKEN) return fail('El pago con Mercado Pago no está configurado.', 503);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return fail('El pedido es demasiado grande.', 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail('No pudimos leer el pedido.', 400);
  }
  const input = parseCheckoutRequest(body);
  if (!input) return fail('No pudimos leer el pedido.', 400);

  const [catalog, config] = await Promise.all([
    readAsset<CatalogProduct[]>(env, origin, '/products.json'),
    readAsset<CheckoutConfig>(env, origin, '/checkout.json'),
  ]);
  if (!config.enabled) return fail('El pago con Mercado Pago no está activo.', 503);
  const checked = validateCheckout(input, catalog, config);
  if (!checked.ok) return fail(checked.error, 422);

  const orderCode = makeOrderCode(crypto.getRandomValues(new Uint8Array(6)));
  const preference = buildPreference(checked.lines, config.surcharge, {
    origin,
    orderCode,
    name: checked.name,
    phone: checked.phone,
    now: new Date(),
  });
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': orderCode,
    },
    body: JSON.stringify(preference),
  });
  if (!res.ok) {
    console.error('Mercado Pago preference error', res.status, await res.text());
    return fail('Mercado Pago no respondió. Probá de nuevo en unos minutos.', 502);
  }
  const created = (await res.json()) as { init_point?: string; sandbox_init_point?: string };
  const initPoint = env.MP_ACCESS_TOKEN.startsWith('TEST-')
    ? created.sandbox_init_point
    : created.init_point;
  if (!initPoint) return fail('Mercado Pago no respondió. Probá de nuevo en unos minutos.', 502);
  return json({ initPoint, orderCode });
}

/** The result page sends the payment id and order code from the return URL; both must match. */
async function getPayment(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';
  const ref = url.searchParams.get('ref') ?? '';
  if (!/^\d{1,20}$/.test(id) || !ref) return fail('Pago no encontrado.', 404);
  if (!env.MP_ACCESS_TOKEN) return fail('El pago con Mercado Pago no está configurado.', 503);

  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) return fail('Pago no encontrado.', 404);
  const summary = toPaymentSummary(await res.json());
  if (!summary || summary.orderCode !== ref) return fail('Pago no encontrado.', 404);
  return json(summary);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/checkout' && request.method === 'POST') {
        return await createCheckout(request, env);
      }
      if (pathname === '/api/payment' && request.method === 'GET') {
        return await getPayment(request, env);
      }
      if (pathname.startsWith('/api/')) return fail('No existe.', 404);
      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return fail('Algo falló de nuestro lado. Probá de nuevo en unos minutos.', 500);
    }
  },
};
