import { normalizeSearch } from '../lib/text';

interface IndexEntry {
  slug: string;
  category: string;
  available: boolean;
  key: string;
}

const PAGE_SIZE = 24;

const form = document.querySelector<HTMLFormElement>('[data-filters]');
const indexEl = document.getElementById('catalog-index');

if (form && indexEl) {
  const index = JSON.parse(indexEl.textContent ?? '[]') as IndexEntry[];
  const items = new Map(
    [...document.querySelectorAll<HTMLElement>('[data-item]')].map((el) => [el.dataset.item, el]),
  );
  const q = form.querySelector<HTMLInputElement>('[data-q]');
  const categories = [...form.querySelectorAll<HTMLInputElement>('[data-category]')];
  const onlyAvailable = form.querySelector<HTMLInputElement>('[data-available]');
  const count = document.querySelector<HTMLElement>('[data-count]');
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  const moreWrap = document.querySelector<HTMLElement>('[data-more-wrap]');
  const more = document.querySelector<HTMLButtonElement>('[data-more]');
  const clear = document.querySelector<HTMLButtonElement>('[data-clear]');
  const validCategories = new Set(categories.map((c) => c.value));

  let visibleLimit = PAGE_SIZE;

  // Read the shared link: ?rubro=ropa&q=remera&disponibles=1
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('rubro') ?? '';
  if (q) q.value = params.get('q') ?? '';
  for (const c of categories)
    c.checked = c.value === (validCategories.has(initialCategory) ? initialCategory : '');
  if (onlyAvailable) onlyAvailable.checked = params.get('disponibles') === '1';

  function state() {
    return {
      query: normalizeSearch(q?.value ?? ''),
      category: categories.find((c) => c.checked)?.value ?? '',
      available: onlyAvailable?.checked ?? false,
    };
  }

  function syncUrl({ category, available }: ReturnType<typeof state>) {
    const next = new URLSearchParams();
    if (category) next.set('rubro', category);
    const raw = q?.value.trim();
    if (raw) next.set('q', raw);
    if (available) next.set('disponibles', '1');
    const search = next.toString();
    history.replaceState(history.state, '', search ? `?${search}` : location.pathname);
  }

  function render() {
    const s = state();
    const words = s.query.split(/\s+/).filter(Boolean);
    const matches = index.filter(
      (p) =>
        (!s.category || p.category === s.category) &&
        (!s.available || p.available) &&
        words.every((w) => p.key.includes(w)),
    );
    const shown = new Set(matches.slice(0, visibleLimit).map((p) => p.slug));
    for (const [slug, el] of items) el.hidden = !shown.has(slug ?? '');

    if (count) {
      count.textContent = matches.length === 1 ? '1 producto' : `${matches.length} productos`;
    }
    if (empty) empty.hidden = matches.length > 0;
    if (moreWrap) moreWrap.hidden = matches.length <= visibleLimit;
    syncUrl(s);
  }

  let timer: number | undefined;
  q?.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      visibleLimit = PAGE_SIZE;
      render();
    }, 150);
  });
  form.addEventListener('change', () => {
    visibleLimit = PAGE_SIZE;
    render();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });
  more?.addEventListener('click', () => {
    const firstNew = visibleLimit;
    visibleLimit += PAGE_SIZE;
    render();
    // Move focus to the first newly revealed product for keyboard users.
    const revealed = [...items.values()].filter((el) => !el.hidden)[firstNew];
    revealed?.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  clear?.addEventListener('click', () => {
    if (q) q.value = '';
    for (const c of categories) c.checked = c.value === '';
    if (onlyAvailable) onlyAvailable.checked = false;
    visibleLimit = PAGE_SIZE;
    render();
    q?.focus();
  });

  render();
}
