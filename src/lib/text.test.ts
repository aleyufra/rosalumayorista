import { describe, expect, it } from 'vitest';
import { fillTokens, isPending, normalizeSearch } from './text';
import { formatPrice } from './price';

describe('normalizeSearch', () => {
  it('ignores case and accents', () => {
    expect(normalizeSearch('Muñeca')).toBe(normalizeSearch('muneca'));
    expect(normalizeSearch('  JUGUETERÍA ')).toBe('jugueteria');
  });
});

describe('isPending', () => {
  it.each([[''], ['  '], ['TODO: altura'], ['todo'], [undefined]])('treats %s as pending', (v) => {
    expect(isPending(v)).toBe(true);
  });

  it('accepts real values', () => {
    expect(isPending('1234')).toBe(false);
    expect(isPending('Todos los días')).toBe(false);
  });
});

describe('fillTokens', () => {
  it('replaces known tokens and keeps unknown ones', () => {
    expect(fillTokens('{minimo} productos {x}', { minimo: '3' })).toBe('3 productos {x}');
  });
});

describe('formatPrice', () => {
  it('formats pesos without decimals', () => {
    expect(formatPrice(12500)).toBe('$ 12.500');
  });
});
