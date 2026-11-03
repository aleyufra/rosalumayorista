import {
  lineKey,
  removeLine,
  revalidate,
  setQuantity,
  getTotals,
  unitsMissing,
  type CartLine,
  type CartNotice,
  type CatalogProduct,
} from '../lib/cart';
import { formatPrice } from '../lib/price';
import { buildOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import { $cart } from '../stores/cart';

const root = document.querySelector<HTMLElement>('[data-cart-page]');

if (root) {
  const minUnits = Number(root.dataset.minUnits ?? '3');
  const phone = root.dataset.whatsapp ?? '';
  const emptyEl = root.querySelector<HTMLElement>('[data-empty]');
  const filledEl = root.querySelector<HTMLElement>('[data-filled]');
  const linesEl = root.querySelector<HTMLUListElement>('[data-lines]');
  const noticesEl = root.querySelector<HTMLElement>('[data-notices]');
  const minimumEl = root.querySelector<HTMLElement>('[data-minimum]');
  const unitsEl = root.querySelector<HTMLElement>('[data-units]');
  const totalEl = root.querySelector<HTMLElement>('[data-total]');
  const template = document.querySelector<HTMLTemplateElement>('#line-template');
  const confirm = document.querySelector<HTMLDialogElement>('[data-confirm]');
  const sendForm = root.querySelector<HTMLFormElement>('[data-send-form]');

  const EXCLUDED_TEXT: Record<NonNullable<CartLine['excluded']>, string> = {
    'sold-out': 'Agotado: queda fuera del pedido.',
    removed: 'Ya no está en el catálogo: queda fuera del pedido.',
    variant: 'Ese talle o color ya no está: queda fuera del pedido.',
  };

  const NOTICE_TEXT: Record<NonNullable<CartLine['excluded']>, string> = {
    'sold-out': ' se agotó y queda fuera del pedido.',
    removed: ' ya no está en el catálogo y queda fuera del pedido.',
    variant: ' ya no tiene ese talle o color y queda fuera del pedido.',
  };

  function noticeHtml(n: CartNotice): HTMLParagraphElement {
    const p = document.createElement('p');
    p.className = 'notice';
    const strong = document.createElement('strong');
    strong.textContent = n.name;
    if (n.kind === 'price') {
      p.append(
        'Cambió el precio de ',
        strong,
        `: antes ${formatPrice(n.before)}, ahora ${formatPrice(n.after)}.`,
      );
    } else {
      p.append(strong, NOTICE_TEXT[n.kind]);
    }
    return p;
  }

  function renderLine(line: CartLine): HTMLLIElement | null {
    const node = template?.content.firstElementChild?.cloneNode(true);
    if (!(node instanceof HTMLLIElement)) return null;
    const key = lineKey(line);
    node.dataset.key = key;
    node.classList.toggle('is-excluded', Boolean(line.excluded));

    const photoSlot = node.querySelector<HTMLElement>('[data-photo]');
    if (photoSlot && line.photo) {
      const img = document.createElement('img');
      img.src = line.photo;
      img.alt = '';
      img.width = 80;
      img.height = 80;
      img.loading = 'lazy';
      photoSlot.append(img);
    }
    const name = node.querySelector<HTMLAnchorElement>('[data-name]');
    if (name) {
      name.textContent = line.name;
      name.href = `/catalogo/${line.slug}`;
    }
    const variant = [line.size && `Talle ${line.size}`, line.color && `Color ${line.color}`]
      .filter(Boolean)
      .join(', ');
    const variantEl = node.querySelector<HTMLElement>('[data-variant]');
    if (variantEl) {
      variantEl.textContent = variant;
      variantEl.hidden = !variant;
    }
    const priceEl = node.querySelector<HTMLElement>('[data-price]');
    if (priceEl) priceEl.textContent = `${formatPrice(line.cashPrice)} c/u`;
    const excludedEl = node.querySelector<HTMLElement>('[data-excluded]');
    if (excludedEl) excludedEl.textContent = line.excluded ? EXCLUDED_TEXT[line.excluded] : '';

    const qty = node.querySelector<HTMLInputElement>('[data-qty]');
    if (qty) {
      qty.value = String(line.quantity);
      qty.setAttribute('aria-label', `Cantidad de ${line.name}`);
      qty.addEventListener('change', () =>
        update(setQuantity($cart.get(), key, Number(qty.value))),
      );
    }
    for (const b of node.querySelectorAll<HTMLButtonElement>('[data-step]')) {
      const step = Number(b.dataset.step);
      b.setAttribute('aria-label', `${step > 0 ? 'Sumar' : 'Restar'} uno de ${line.name}`);
      b.addEventListener('click', () =>
        update(setQuantity($cart.get(), key, line.quantity + step), key),
      );
    }
    const remove = node.querySelector<HTMLButtonElement>('[data-remove]');
    if (remove) {
      remove.setAttribute('aria-label', `Quitar ${line.name}`);
      remove.addEventListener('click', () => {
        update(removeLine($cart.get(), key));
        root?.querySelector<HTMLElement>('h1')?.focus();
      });
    }
    return node;
  }

  function render(lines: CartLine[], focusKey?: string) {
    const isEmpty = lines.length === 0;
    if (emptyEl) emptyEl.hidden = !isEmpty;
    if (filledEl) filledEl.hidden = isEmpty;
    if (isEmpty) return;

    linesEl?.replaceChildren(
      ...lines.map(renderLine).filter((n): n is HTMLLIElement => n !== null),
    );
    const { units, total } = getTotals(lines);
    if (unitsEl) unitsEl.textContent = String(units);
    if (totalEl) totalEl.textContent = formatPrice(total);

    const missing = unitsMissing(units, minUnits);
    if (minimumEl) {
      minimumEl.hidden = missing === 0;
      minimumEl.textContent = `El mínimo de compra es de ${minUnits} productos. Te ${
        missing === 1 ? 'falta 1' : `faltan ${missing}`
      } para llegar.`;
    }
    if (focusKey) {
      linesEl
        ?.querySelector<HTMLElement>(`[data-key="${CSS.escape(focusKey)}"] [data-qty]`)
        ?.focus();
    }
  }

  function update(lines: CartLine[], focusKey?: string) {
    $cart.set(lines);
    render(lines, focusKey);
  }

  root.querySelector('h1')?.setAttribute('tabindex', '-1');
  render($cart.get());

  // Revalidate against the catalogue of the latest build.
  if ($cart.get().length) {
    fetch('/products.json', { cache: 'no-cache' })
      .then((r) =>
        r.ok
          ? (r.json() as Promise<CatalogProduct[]>)
          : Promise.reject(new Error(String(r.status))),
      )
      .then((catalog) => {
        const { lines, notices } = revalidate($cart.get(), catalog);
        update(lines);
        noticesEl?.replaceChildren(...notices.map(noticeHtml));
      })
      .catch(() => {
        const p = document.createElement('p');
        p.className = 'notice';
        p.textContent =
          'No pudimos revisar los precios actualizados. Te los confirmamos por WhatsApp.';
        noticesEl?.replaceChildren(p);
      });
  }

  // Another tab changed the cart.
  $cart.listen((lines) => render([...lines]));

  root.querySelector('[data-clear]')?.addEventListener('click', () => confirm?.showModal());
  confirm?.addEventListener('close', () => {
    if (confirm.returnValue === 'clear') {
      update([]);
      noticesEl?.replaceChildren();
    }
  });

  sendForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!phone) return;
    const name = sendForm.querySelector<HTMLInputElement>('input[name="name"]')?.value ?? '';
    const url = buildWhatsAppUrl(phone, buildOrderMessage($cart.get(), name));
    window.open(url, '_blank', 'noopener');
  });
}
