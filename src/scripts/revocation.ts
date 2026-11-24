// Boton de arrepentimiento: genera el codigo de solicitud, lo muestra como constancia y abre
// WhatsApp con la solicitud armada. No se guarda nada: la solicitud viaja solo por WhatsApp.
import { makeOrderCode } from '../lib/checkout';
import { buildRevocationMessage, buildWhatsAppUrl } from '../lib/whatsapp';

const form = document.querySelector<HTMLFormElement>('[data-revocation]');
const done = document.querySelector<HTMLElement>('[data-revocation-done]');
const codeEl = document.querySelector<HTMLElement>('[data-revocation-code]');
const link = document.querySelector<HTMLAnchorElement>('[data-revocation-link]');

const orderInput = form?.querySelector<HTMLInputElement>('[name=orderCode]');
const lastOrder = localStorage.getItem('rosalu-last-order');
if (orderInput && lastOrder && !orderInput.value) orderInput.value = lastOrder;

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const field = (name: string) => String(data.get(name) ?? '');
  const code = makeOrderCode(crypto.getRandomValues(new Uint8Array(6)), 'ARR');
  const url = buildWhatsAppUrl(
    form.dataset.whatsapp ?? '',
    buildRevocationMessage({
      code,
      name: field('name'),
      products: field('products'),
      orderCode: field('orderCode'),
      date: field('date'),
    }),
  );

  if (codeEl) codeEl.textContent = code;
  if (link) link.href = url;
  form.hidden = true;
  if (done) {
    done.hidden = false;
    done.focus();
  }
  window.open(url, '_blank', 'noopener');
});
