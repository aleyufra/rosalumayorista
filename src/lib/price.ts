const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** "$ 12.500" — conserva el espacio de no separacion para que el signo nunca quede lejos del numero. */
export function formatPrice(amount: number): string {
  return formatter.format(amount);
}

/** Mismo formato con espacio comun, para texto que sale de la pagina (el mensaje de WhatsApp). */
export function formatPricePlain(amount: number): string {
  return formatPrice(amount).replace(/ /g, ' ');
}
