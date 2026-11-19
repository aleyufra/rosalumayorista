import type { APIRoute } from 'astro';
import type { CheckoutConfig } from '../lib/checkout';
import { getSettings, mercadoPagoEnabled, surchargeAmount } from '../lib/settings';

/**
 * Se publica en el build; el Worker lo lee antes de crear una preferencia de Mercado Pago.
 * Es publico (solo trae monto de recargo y minimos, nunca secretos). Cambiar un valor en el
 * panel exige un nuevo build para que se refleje aca.
 */
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
