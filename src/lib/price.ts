const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** "$ 12.500" — keeps the non-breaking space so the sign never wraps away from the number. */
export function formatPrice(amount: number): string {
  return formatter.format(amount);
}

/** Same format with a plain space, for text that leaves the page (the WhatsApp message). */
export function formatPricePlain(amount: number): string {
  return formatPrice(amount).replace(/ /g, ' ');
}
