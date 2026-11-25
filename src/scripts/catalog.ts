// Filtro del catalogo del lado del cliente. La pagina trae renderizadas solo las primeras
// tarjetas y un indice JSON (#catalog-index) con todos los productos; aca se filtra segun
// busqueda, rubro, rango de precio, disponibilidad y orden, se arman las tarjetas que faltan
// clonando el molde (#catalog-card) y se sincroniza el estado con la URL para compartir el link.
import { normalizeSearch } from '../lib/text';
import { formatPrice } from '../lib/price';

// key = texto de busqueda ya normalizado (sin acentos, en minusculas), calculado en el servidor.
interface IndexEntry {
  slug: string;
  category: string;
  available: boolean;
  price: number;
  key: string;
  name: string;
  url: string;
  label: string;
  sample: boolean;
  img?: { src: string; srcset: string };
}

type Sort = '' | 'menor-precio' | 'mayor-precio';

const PAGE_SIZE = 24;
const SORTS = new Set<Sort>(['', 'menor-precio', 'mayor-precio']);

// Campo vacio o invalido = sin limite.
function readPrice(input: HTMLInputElement | null): number | undefined {
  const raw = input?.value.trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const form = document.querySelector<HTMLFormElement>('[data-filters]');
const indexEl = document.getElementById('catalog-index');

if (form && indexEl) {
  const index = JSON.parse(indexEl.textContent ?? '[]') as IndexEntry[];
  const items = new Map(
    [...document.querySelectorAll<HTMLElement>('[data-item]')].map((el) => [el.dataset.item, el]),
  );
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  const cardTemplate = document.querySelector<HTMLTemplateElement>('#catalog-card');

  // Arma la tarjeta de un producto que no vino en el HTML a partir del molde, que trae todas las
  // variantes: se completan los datos y se sacan las partes que no corresponden.
  function buildCard(p: IndexEntry): HTMLElement | undefined {
    const li = cardTemplate?.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
    if (!li) return undefined;
    li.dataset.item = p.slug;
    const card = li.querySelector<HTMLElement>('article');
    if (card) {
      card.dataset.slug = p.slug;
      card.classList.toggle('sold-out', !p.available);
    }
    li.querySelector('a')?.setAttribute('href', p.url);
    const picture = li.querySelector('picture');
    const img = li.querySelector('img');
    const photo = p.img;
    if (photo && img) {
      picture?.querySelectorAll('source').forEach((s) => s.setAttribute('srcset', photo.srcset));
      img.src = photo.src;
      img.srcset = photo.srcset;
      img.alt = p.name;
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
      img.dataset.vtPhoto = p.slug;
    } else {
      (picture ?? img)?.remove();
    }
    const set = (selector: string, text: string) => {
      const el = li.querySelector(selector);
      if (el) el.textContent = text;
    };
    set('[data-card-name]', p.name);
    set('[data-card-category]', p.label);
    set('[data-card-price]', formatPrice(p.price));
    set('[data-card-was]', formatPrice(p.price));
    const drop = (selector: string) => li.querySelector(selector)?.remove();
    if (!p.sample) drop('[data-card-sample]');
    // El precio y "Agotado" estan dentro del cartel (MarketTag): se saca el cartel entero.
    const dropTag = (selector: string) =>
      li.querySelector(selector)?.closest('.market-tag')?.remove();
    if (p.available) {
      dropTag('[data-card-sold-out]');
      drop('[data-card-was]');
    } else {
      dropTag('[data-card-price]');
    }
    return li;
  }
  const q = form.querySelector<HTMLInputElement>('[data-q]');
  const sort = form.querySelector<HTMLSelectElement>('[data-sort]');
  const categories = [...form.querySelectorAll<HTMLInputElement>('[data-category]')];
  const onlyAvailable = form.querySelector<HTMLInputElement>('[data-available]');
  const priceMin = form.querySelector<HTMLInputElement>('[data-price-min]');
  const priceMax = form.querySelector<HTMLInputElement>('[data-price-max]');
  const count = document.querySelector<HTMLElement>('[data-count]');
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  const moreWrap = document.querySelector<HTMLElement>('[data-more-wrap]');
  const more = document.querySelector<HTMLButtonElement>('[data-more]');
  const clears = [...document.querySelectorAll<HTMLButtonElement>('[data-clear]')];
  const sideClear = document.querySelector<HTMLButtonElement>('[data-clear-side]');
  const panel = document.querySelector<HTMLElement>('[data-filters-panel]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-filters-toggle]');
  const activeCount = document.querySelector<HTMLElement>('[data-active-count]');
  const apply = document.querySelector<HTMLButtonElement>('[data-apply]');
  const applyLabel = document.querySelector<HTMLElement>('[data-apply-label]');
  const validCategories = new Set(categories.map((c) => c.value));

  let visibleLimit = PAGE_SIZE;

  // Lee el link compartido: ?rubro=ropa&q=remera&disponibles=1&desde=5000&hasta=20000&orden=menor-precio
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('rubro') ?? '';
  const initialSort = (params.get('orden') ?? '') as Sort;
  if (q) q.value = params.get('q') ?? '';
  if (sort) sort.value = SORTS.has(initialSort) ? initialSort : '';
  if (priceMin) priceMin.value = params.get('desde') ?? '';
  if (priceMax) priceMax.value = params.get('hasta') ?? '';
  for (const c of categories)
    c.checked = c.value === (validCategories.has(initialCategory) ? initialCategory : '');
  if (onlyAvailable) onlyAvailable.checked = params.get('disponibles') === '1';

  function state() {
    return {
      query: normalizeSearch(q?.value ?? ''),
      category: categories.find((c) => c.checked)?.value ?? '',
      available: onlyAvailable?.checked ?? false,
      min: readPrice(priceMin),
      max: readPrice(priceMax),
      sort: (sort?.value ?? '') as Sort,
    };
  }

  // replaceState (no pushState): filtrar no llena el historial con una entrada por tecla.
  function syncUrl({ category, available, min, max, sort }: ReturnType<typeof state>) {
    const next = new URLSearchParams();
    if (category) next.set('rubro', category);
    const raw = q?.value.trim();
    if (raw) next.set('q', raw);
    if (min !== undefined) next.set('desde', String(min));
    if (max !== undefined) next.set('hasta', String(max));
    if (available) next.set('disponibles', '1');
    if (sort) next.set('orden', sort);
    const search = next.toString();
    history.replaceState(history.state, '', search ? `?${search}` : location.pathname);
  }

  function render() {
    const s = state();
    // Cada palabra de la busqueda tiene que aparecer en el texto del producto (en cualquier orden).
    const words = s.query.split(/\s+/).filter(Boolean);
    const matches = index.filter(
      (p) =>
        (!s.category || p.category === s.category) &&
        (!s.available || p.available) &&
        (s.min === undefined || p.price >= s.min) &&
        (s.max === undefined || p.price <= s.max) &&
        words.every((w) => p.key.includes(w)),
    );
    // sort es estable: a igual precio se mantiene el orden original (mas nuevos primero).
    if (s.sort === 'menor-precio') matches.sort((a, b) => a.price - b.price);
    if (s.sort === 'mayor-precio') matches.sort((a, b) => b.price - a.price);

    // Muestra las que entran en la pagina, en el orden elegido (armando las que falten) y oculta el resto.
    const visible = matches.slice(0, visibleLimit);
    const shown = new Set(visible.map((p) => p.slug));
    for (const [slug, el] of items) el.hidden = !shown.has(slug ?? '');
    for (const p of visible) {
      let el = items.get(p.slug);
      if (!el) {
        el = buildCard(p);
        if (el) items.set(p.slug, el);
      }
      if (grid && el) grid.append(el);
    }

    const label = matches.length === 1 ? '1 producto' : `${matches.length} productos`;
    if (count) count.textContent = label;
    if (applyLabel)
      applyLabel.textContent = matches.length === 0 ? 'Sin resultados' : `Ver ${label}`;
    if (empty) empty.hidden = matches.length > 0;
    if (moreWrap) moreWrap.hidden = matches.length <= visibleLimit;

    // Filtros del panel activos (la busqueda y el orden quedan afuera: estan siempre a la vista).
    const active =
      Number(Boolean(s.category)) +
      Number(s.min !== undefined || s.max !== undefined) +
      Number(s.available);
    if (activeCount) {
      activeCount.textContent = String(active);
      activeCount.hidden = active === 0;
    }
    if (sideClear) sideClear.hidden = active === 0;
    syncUrl(s);
  }

  function reset() {
    visibleLimit = PAGE_SIZE;
    render();
  }

  // Panel plegable en celular: el boton "Filtros" lo abre y "Ver N productos" lo cierra.
  if (panel && toggle) {
    panel.dataset.collapsible = '';
    toggle.hidden = false;
    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      if (open) panel.dataset.open = '';
      else delete panel.dataset.open;
    };
    toggle.addEventListener('click', () => setOpen(!('open' in panel.dataset)));
    apply?.addEventListener('click', () => {
      setOpen(false);
      document.getElementById('resultados')?.scrollIntoView({ block: 'start' });
      toggle.focus({ preventScroll: true });
    });
  }

  // Debounce de 150 ms al escribir (busqueda y precios); el resto filtra al instante.
  let timer: number | undefined;
  for (const input of [q, priceMin, priceMax]) {
    input?.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(reset, 150);
    });
  }
  form.addEventListener('change', reset);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });
  more?.addEventListener('click', () => {
    const firstNew = visibleLimit;
    visibleLimit += PAGE_SIZE;
    render();
    // Mueve el foco al primer producto recien mostrado, para quienes usan teclado.
    const revealed = [...(grid?.children ?? [])].filter((el) => !(el as HTMLElement).hidden)[
      firstNew
    ];
    revealed?.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  for (const clear of clears) {
    clear.addEventListener('click', () => {
      if (q) q.value = '';
      for (const c of categories) c.checked = c.value === '';
      if (onlyAvailable) onlyAvailable.checked = false;
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      reset();
      (clear === sideClear ? categories[0] : q)?.focus();
    });
  }

  render();
}
