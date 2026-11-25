import { describe, expect, it } from 'vitest';
import { decodeConsent } from './consent';

describe('decodeConsent', () => {
  it('reads a saved choice', () => {
    expect(decodeConsent('granted')).toBe('granted');
    expect(decodeConsent('denied')).toBe('denied');
  });

  it('treats missing or unknown values as no choice yet', () => {
    expect(decodeConsent(null)).toBeUndefined();
    expect(decodeConsent('yes')).toBeUndefined();
  });
});
