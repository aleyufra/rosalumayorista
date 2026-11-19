// Puente entre el carrito y /pago/aprobado: antes de salir a Mercado Pago se guarda que lineas
// se mandaron, para quitarlas del carrito recien cuando el pago se confirma.
/** Entrada de sessionStorage que se guarda antes de salir a Checkout Pro y lee /pago/aprobado. */
export const PENDING_PAYMENT_KEY = 'rosalu-pending-payment';

export interface PendingPayment {
  orderCode: string;
  /** lineKey() de cada linea del carrito enviada a Mercado Pago. */
  keys: string[];
}

export function decodePendingPayment(raw: string | null): PendingPayment | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<PendingPayment>;
    return typeof v.orderCode === 'string' && Array.isArray(v.keys)
      ? { orderCode: v.orderCode, keys: v.keys.filter((k) => typeof k === 'string') }
      : null;
  } catch {
    return null;
  }
}
