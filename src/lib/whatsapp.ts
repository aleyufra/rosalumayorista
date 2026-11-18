import type { CartLine } from './cart';
import { activeLines, getTotals } from './cart';
import type { PaymentSummary } from './checkout';
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

/**
 * Sent by the customer after reserving with Mercado Pago, together with the receipt.
 */
export function buildPaidOrderMessage(summary: PaymentSummary): string {
  const name = summary.name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
  const greeting = name
    ? `¡Hola Rosalu! Soy ${name}. Reservé con Mercado Pago este pedido:`
    : '¡Hola Rosalu! Reservé con Mercado Pago este pedido:';
  const items = summary.items.map((i) => {
    const each = i.quantity > 1 ? ' c/u' : '';
    return `- ${i.quantity} x ${i.title}: ${formatPricePlain(i.unitPrice)}${each}`;
  });
  return [
    greeting,
    '',
    ...items,
    '',
    `Pedido: ${summary.orderCode}`,
    `Operación de Mercado Pago: ${summary.id}`,
    `Total pagado: ${formatPricePlain(summary.total)}`,
    '',
    'Te mando el comprobante. Lo retiro en el local.',
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
