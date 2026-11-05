import { getEntry, type CollectionEntry } from 'astro:content';
import { formatPrice } from './price';
import { fillTokens, isPending } from './text';

export type Settings = CollectionEntry<'settings'>['data'];

export async function getSettings(): Promise<Settings> {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.yml');
  return entry.data;
}

/** Fixed amount added per unit when paying by Mercado Pago or transfer; null while unset. */
export function surchargeAmount(settings: Settings): number | null {
  return settings.paymentSurcharge ?? null;
}

/** "$ 1.500" or null while the owner has not set the surcharge. */
export function surchargeLabel(settings: Settings): string | null {
  const amount = surchargeAmount(settings);
  return amount === null ? null : formatPrice(amount);
}

export function hasWhatsApp(settings: Settings): boolean {
  return !isPending(settings.whatsapp);
}

export function addressLine(settings: Settings): string {
  const { street, number, city } = settings.address;
  return isPending(number) ? `${street}, ${city}` : `${street} ${number}, ${city}`;
}

/** Tokens the owner can write in CMS texts: {minimo} and {recargo}. */
export function copyTokens(settings: Settings): Record<string, string> {
  return {
    minimo: String(settings.minUnits),
    recargo: surchargeLabel(settings) ?? 'un monto que todavía falta cargar',
  };
}

export function fillCopy(settings: Settings, text: string): string {
  return fillTokens(text, copyTokens(settings));
}

export { formatPrice };
