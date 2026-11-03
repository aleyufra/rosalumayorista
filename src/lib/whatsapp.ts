import type { CartLine } from './cart';
import { activeLines, getTotals } from './cart';
import { formatPricePlain } from './price';

const MAX_NAME_LENGTH = 60;

function variantText(line: CartLine): string {
  const parts = [line.size && `Talle ${line.size}`, line.color && `Color ${line.color}`].filter(
    Boolean,
  );
  return parts.length ? ` (${parts.join(', ')})` : '';
}

/** The exact order message from the brief; excluded lines never reach it. */
export function buildOrderMessage(lines: CartLine[], customerName = ''): string {
  const name = customerName.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
  const greeting = name
    ? `¡Hola Rosalu! Soy ${name}. Quiero consultar por este pedido:`
    : '¡Hola Rosalu! Quiero consultar por este pedido:';
  const items = activeLines(lines).map((l) => {
    const each = l.quantity > 1 ? ' c/u' : '';
    return `- ${l.quantity} x ${l.name}${variantText(l)}: ${formatPricePlain(l.cashPrice)}${each}`;
  });
  const { units, total } = getTotals(lines);
  return [
    greeting,
    '',
    ...items,
    '',
    `Unidades: ${units}`,
    `Total estimado en efectivo: ${formatPricePlain(total)}`,
    '',
    'Lo retiro en el local. ¿Me confirman disponibilidad?',
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
