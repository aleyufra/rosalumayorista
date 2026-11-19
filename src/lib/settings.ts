// Lectura de src/content/settings/site.yml (datos del negocio y textos de la home) y helpers
// derivados. Los valores que faltan cargar empiezan con TODO (ver isPending en text.ts).
import { getEntry, type CollectionEntry } from 'astro:content';
import { formatPrice } from './price';
import { fillTokens, isPending } from './text';

export type Settings = CollectionEntry<'settings'>['data'];

export async function getSettings(): Promise<Settings> {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.yml');
  return entry.data;
}

/** Monto fijo que se suma una vez por compra al pagar con Mercado Pago o transferencia; null mientras no se cargue. */
export function surchargeAmount(settings: Settings): number | null {
  return settings.paymentSurcharge ?? null;
}

/** "$ 1.500" o null mientras quien administra el negocio no cargue el recargo. */
export function surchargeLabel(settings: Settings): string | null {
  const amount = surchargeAmount(settings);
  return amount === null ? null : formatPrice(amount);
}

/** Activado en el panel y con el recargo cargado: sin eso el monto cobrado seria incorrecto. */
export function mercadoPagoEnabled(settings: Settings): boolean {
  return settings.acceptsMercadoPago === 'yes' && surchargeAmount(settings) !== null;
}

export function hasWhatsApp(settings: Settings): boolean {
  return !isPending(settings.whatsapp);
}

export function addressLine(settings: Settings): string {
  const { street, number, city } = settings.address;
  return isPending(number) ? `${street}, ${city}` : `${street} ${number}, ${city}`;
}

/** Tokens que se pueden escribir en los textos del CMS: {minimo}, {recargo} y {reserva}. */
export function copyTokens(settings: Settings): Record<string, string> {
  return {
    minimo: String(settings.minUnits),
    recargo: surchargeLabel(settings) ?? 'un monto que todavía falta cargar',
    reserva: formatPrice(settings.mpMinAmount),
  };
}

export function fillCopy(settings: Settings, text: string): string {
  return fillTokens(text, copyTokens(settings));
}

// Reexportado para que los componentes importen precios y ajustes desde un solo lugar.
export { formatPrice };
