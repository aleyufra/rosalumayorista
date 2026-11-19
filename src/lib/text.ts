/** Forma en minusculas y sin acentos para buscar: "Muñeca" y "muneca" pasan a "muneca". */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Un dato del negocio que todavia no se cargo: vacio, o marcado con "TODO". */
export function isPending(value: string | undefined | null): boolean {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === '' || /^todo\b/i.test(trimmed);
}

/** Reemplaza los {token} de los textos del CMS, ej: "{minimo} productos". */
export function fillTokens(text: string, tokens: Record<string, string>): string {
  // Un token desconocido se deja tal cual ({otro}) en lugar de borrarlo, para que se note el error.
  return text.replace(/\{(\w+)\}/g, (match, key: string) => tokens[key] ?? match);
}
