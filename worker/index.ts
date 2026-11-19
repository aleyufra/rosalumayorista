/**
 * Corre solo para /api/* (ver run_worker_first en wrangler.jsonc); el resto del sitio es
 * estatico. Crea preferencias de Mercado Pago Checkout Pro y verifica pagos, con el
 * Access Token guardado como secreto del Worker.
 *
 * Notas:
 * - Solo atiende /api/*; el resto lo sirve Cloudflare como archivos estaticos (ASSETS).
 * - POST /api/checkout: arma el pedido desde /products.json y /checkout.json del build, nunca
 *   con precios que mande el navegador, y crea la preferencia de Mercado Pago.
 * - GET /api/payment: confirma con Mercado Pago que el pago es real, para /pago/aprobado.
 * - MP_ACCESS_TOKEN es un secreto: .dev.vars en local, variable secreta en Cloudflare.
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

// Lee un JSON del propio sitio (generado en el build) a traves del binding ASSETS,
// sin hacer una peticion de red externa.
async function readAsset<T>(env: Env, origin: string, path: string): Promise<T> {
  const res = await env.ASSETS.fetch(new Request(new URL(path, origin)));
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return (await res.json()) as T;
}

async function createCheckout(request: Request, env: Env): Promise<Response> {
  const origin = new URL(request.url).origin;
  // Proteccion basica contra CSRF: solo aceptamos pedidos que salgan de nuestro propio sitio.
  if (request.headers.get('Origin') !== origin) return fail('Origen no permitido.', 403);
  if (!env.MP_ACCESS_TOKEN) return fail('El pago con Mercado Pago no está configurado.', 503);

  // Se lee como texto y se mide el largo antes de parsear, para no procesar cuerpos enormes.
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
  // Recalcula lineas, precios y minimos con el catalogo del servidor; lo que mande el cliente
  // solo aporta ids y cantidades.
  const checked = validateCheckout(input, catalog, config);
  if (!checked.ok) return fail(checked.error, 422);

  // El codigo de pedido es aleatorio y tambien sirve de clave de idempotencia: si Mercado Pago
  // recibe dos veces la misma, no duplica la preferencia.
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
  // Con credenciales de prueba (TEST-...) hay que redirigir al checkout sandbox, no al real.
  const initPoint = env.MP_ACCESS_TOKEN.startsWith('TEST-')
    ? created.sandbox_init_point
    : created.init_point;
  if (!initPoint) return fail('Mercado Pago no respondió. Probá de nuevo en unos minutos.', 502);
  return json({ initPoint, orderCode });
}

/** La pagina de resultado manda el id de pago y el codigo de pedido de la URL de retorno; los dos deben coincidir. */
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
  // Si el id existe pero la referencia no coincide, es un pago de otro pedido: no se expone.
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
      // Cualquier otra ruta /api/* no existe; el resto se delega a los archivos estaticos.
      if (pathname.startsWith('/api/')) return fail('No existe.', 404);
      return await env.ASSETS.fetch(request);
    } catch (error) {
      // El detalle va al log del Worker; al cliente solo un mensaje generico.
      console.error(error);
      return fail('Algo falló de nuestro lado. Probá de nuevo en unos minutos.', 500);
    }
  },
};
