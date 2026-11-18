import type { APIRoute } from 'astro';
import type { CheckoutConfig } from '../lib/checkout';
import { getSettings, mercadoPagoEnabled, surchargeAmount } from '../lib/settings';

/** Published at build time; the Worker reads it before creating a Mercado Pago preference. */
export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const config: CheckoutConfig = {
    enabled: mercadoPagoEnabled(settings),
    surcharge: surchargeAmount(settings) ?? 0,
    minUnits: settings.minUnits,
    minAmount: settings.mpMinAmount,
  };
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
