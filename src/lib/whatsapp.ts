// Arma los mensajes de WhatsApp. El formato del pedido esta fijado por el brief y por los tests
// (whatsapp.test.ts): cambiarlo exige actualizar los tests a conciencia. Se usa formatPricePlain
// (espacio comun) porque el texto sale de la pagina.
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

/** El mensaje de pedido exacto del brief; las lineas excluidas nunca llegan. */
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
 * Lo manda la clienta despues de reservar con Mercado Pago, junto con el comprobante.
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

export interface RevocationRequest {
  code: string;
  name: string;
  products: string;
  orderCode?: string;
  /** Fecha del input type="date" (AAAA-MM-DD). */
  date?: string;
}

const oneLine = (s = '') => s.trim().replace(/\s+/g, ' ');

/** Solicitud del boton de arrepentimiento (Res. 424/2020): el codigo es la constancia. */
export function buildRevocationMessage(r: RevocationRequest): string {
  const date = oneLine(r.date).split('-').reverse().join('/');
  return [
    '¡Hola Rosalu! Quiero arrepentirme de una compra (botón de arrepentimiento).',
    '',
    `Código de la solicitud: ${r.code}`,
    `Nombre: ${oneLine(r.name).slice(0, MAX_NAME_LENGTH)}`,
    `Productos: ${oneLine(r.products)}`,
    ...(oneLine(r.orderCode) ? [`Pedido: ${oneLine(r.orderCode)}`] : []),
    ...(date ? [`Fecha de compra o retiro: ${date}`] : []),
    '',
    '¿Me confirman que recibieron la solicitud?',
  ].join('\n');
}

// wa.me exige el numero solo con digitos y el texto codificado para URL.
export function buildWhatsAppUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
