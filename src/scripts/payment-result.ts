// Pagina /pago/aprobado. Mercado Pago vuelve con payment_id y external_reference en la URL, pero
// la URL se puede falsificar: se confirma el pago con /api/payment (que consulta a Mercado Pago)
// y solo con status "approved" se muestra el comprobante y se vacian las lineas pagadas.
// Si algo falla, se ofrece un mensaje de WhatsApp generico (fallback) sin dar nada por pagado.
import { lineKey } from '../lib/cart';
import type { PaymentSummary } from '../lib/checkout';
import { decodePendingPayment, PENDING_PAYMENT_KEY } from '../lib/payment-session';
import { formatPrice } from '../lib/price';
import { buildPaidOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import { $cart } from '../stores/cart';

const root = document.querySelector<HTMLElement>('[data-payment-result]');

if (root) {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment_id') ?? params.get('collection_id') ?? '';
  const orderCode = params.get('external_reference') ?? '';
  const phone = root.dataset.whatsapp ?? '';
  const receipt = root.querySelector<HTMLAnchorElement>('[data-receipt]');

  const show = (state: 'ok' | 'unverified') => {
    for (const el of root.querySelectorAll<HTMLElement>('[data-state]')) {
      el.hidden = el.dataset.state !== state;
    }
    const actions = root.querySelector<HTMLElement>('[data-actions]');
    if (actions) actions.hidden = false;
  };

  const setReceipt = (text: string) => {
    if (receipt && phone) receipt.href = buildWhatsAppUrl(phone, text);
  };

  /** Quita del carrito las lineas que fueron a Mercado Pago, una sola vez. */
  const clearPaidLines = (code: string) => {
    try {
      const pending = decodePendingPayment(sessionStorage.getItem(PENDING_PAYMENT_KEY));
      if (!pending || pending.orderCode !== code) return;
      const paid = new Set(pending.keys);
      $cart.set($cart.get().filter((l) => !paid.has(lineKey(l))));
      sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
      // Storage bloqueado: la clienta puede vaciar el carrito a mano.
    }
  };

  const fallback = () => {
    setReceipt(
      [
        '¡Hola Rosalu! Reservé un pedido con Mercado Pago.',
        orderCode && `Pedido: ${orderCode}`,
        paymentId && `Operación de Mercado Pago: ${paymentId}`,
        'Te mando el comprobante.',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    show('unverified');
  };

  const render = (summary: PaymentSummary) => {
    const set = (selector: string, text: string) => {
      const el = root.querySelector<HTMLElement>(selector);
      if (el) el.textContent = text;
    };
    set('[data-order-code]', summary.orderCode);
    set('[data-payment-id]', summary.id);
    set('[data-total]', formatPrice(summary.total));
    root.querySelector('[data-items]')?.replaceChildren(
      ...summary.items.map((item) => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = `${item.quantity} x ${item.title}`;
        const price = document.createElement('span');
        price.textContent = formatPrice(item.quantity * item.unitPrice);
        li.append(label, price);
        return li;
      }),
    );
    setReceipt(buildPaidOrderMessage(summary));
    clearPaidLines(summary.orderCode);
    localStorage.setItem('rosalu-last-order', summary.orderCode);
    show('ok');
  };

  // El id de pago son solo digitos; si no, ni se consulta al Worker.
  if (!/^\d+$/.test(paymentId) || !orderCode) {
    fallback();
  } else {
    fetch(`/api/payment?id=${paymentId}&ref=${encodeURIComponent(orderCode)}`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? (r.json() as Promise<PaymentSummary>) : Promise.reject(new Error())))
      .then((summary) => (summary.status === 'approved' ? render(summary) : fallback()))
      .catch(fallback);
  }
}
