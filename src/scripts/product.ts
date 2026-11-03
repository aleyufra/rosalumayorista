import { addLine, MAX_QUANTITY } from '../lib/cart';
import { $cart } from '../stores/cart';

const form = document.querySelector<HTMLFormElement>('[data-add-form]');

if (form) {
  const buttons = [...form.querySelectorAll<HTMLButtonElement>('[data-add-button]')];
  const setLabel = (text: string) => buttons.forEach((b) => (b.textContent = text));
  const missing = form.querySelector<HTMLElement>('[data-missing]');
  const quantity = form.querySelector<HTMLInputElement>('input[name="quantity"]');
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  const required = [...form.querySelectorAll<HTMLFieldSetElement>('[data-required]')];
  let resetTimer: number | undefined;
  let toastTimer: number | undefined;

  const value = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;

  function missingFields() {
    return required.filter((f) => !value(f.dataset.required ?? ''));
  }

  function labelFor(fields: HTMLFieldSetElement[]) {
    const keys = fields.map((f) => f.dataset.required);
    if (keys.includes('size') && keys.includes('color')) return 'Elegí talle y color';
    if (keys.includes('size')) return 'Elegí un talle';
    if (keys.includes('color')) return 'Elegí un color';
    return 'Agregar al carrito';
  }

  function refresh() {
    const fields = missingFields();
    setLabel(labelFor(fields));
    for (const f of required) f.classList.toggle('is-missing', false);
    if (!fields.length && missing) missing.textContent = '';
  }

  function clampQuantity() {
    if (!quantity) return 1;
    const n = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity.value)) || 1));
    quantity.value = String(n);
    return n;
  }

  form.addEventListener('change', refresh);
  quantity?.addEventListener('blur', clampQuantity);

  for (const stepButton of form.querySelectorAll<HTMLButtonElement>('[data-step]')) {
    stepButton.addEventListener('click', () => {
      if (!quantity) return;
      quantity.value = String(clampQuantity() + Number(stepButton.dataset.step));
      clampQuantity();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = missingFields();
    if (fields.length) {
      for (const f of fields) f.classList.add('is-missing');
      if (missing) missing.textContent = `${labelFor(fields)} para agregarlo al carrito.`;
      fields[0]?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }

    const { slug = '', name = '', price = '0', photo = '' } = form.dataset;
    $cart.set(
      addLine($cart.get(), {
        slug,
        name,
        cashPrice: Number(price),
        size: value('size'),
        color: value('color'),
        quantity: clampQuantity(),
        photo,
      }),
    );

    setLabel('Agregado al carrito');
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(refresh, 2000);
    if (toast) {
      toast.hidden = false;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => (toast.hidden = true), 5000);
    }
  });

  refresh();

  // Mobile bar: only while neither the price tag nor the in-page button is on screen.
  const bar = document.querySelector<HTMLElement>('[data-buy-bar]');
  const watched = [
    document.querySelector<HTMLElement>('.info .price'),
    form.querySelector<HTMLElement>('[data-inline-action]'),
  ].filter((el): el is HTMLElement => el !== null);
  if (bar && watched.length && 'IntersectionObserver' in window) {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      bar.hidden = visible.size > 0;
    });
    watched.forEach((el) => observer.observe(el));
  }
}
