import { describe, it, expect } from 'vitest';
import { generateReference, REFERENCE_ALPHABET } from '../reference';

describe('generateReference', () => {
  it('returns a string starting with FLT-', () => {
    const ref = generateReference();
    expect(ref.startsWith('FLT-')).toBe(true);
  });

  it('has exactly 10 chars total (FLT- plus 6)', () => {
    expect(generateReference()).toHaveLength(10);
  });

  it('uses only the safe alphabet after the prefix', () => {
    const ref = generateReference();
    const body = ref.slice(4);
    for (const ch of body) {
      expect(REFERENCE_ALPHABET).toContain(ch);
    }
  });

  it('does not include visually-confusing characters', () => {
    expect(REFERENCE_ALPHABET).not.toMatch(/[01OIL]/);
  });

  it('produces different refs over many calls (collision sanity)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(generateReference());
    }
    expect(seen.size).toBeGreaterThan(990);
  });
});
