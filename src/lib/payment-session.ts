/** sessionStorage entry saved before leaving for Checkout Pro, read by /pago/aprobado. */
export const PENDING_PAYMENT_KEY = 'rosalu-pending-payment';

export interface PendingPayment {
  orderCode: string;
  /** lineKey() of every cart line sent to Mercado Pago. */
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
