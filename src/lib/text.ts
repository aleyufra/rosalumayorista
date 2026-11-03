/** Lowercase, accent-free form used for search: "Muñeca" and "muneca" both become "muneca". */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** A business fact the owner has not filled in yet: empty, or still marked "TODO". */
export function isPending(value: string | undefined | null): boolean {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === '' || /^todo\b/i.test(trimmed);
}

/** Replaces {token} placeholders in CMS text, e.g. "{minimo} productos". */
export function fillTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => tokens[key] ?? match);
}
