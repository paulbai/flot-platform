import { customAlphabet } from 'nanoid';

/**
 * 30 chars: A–Z + 2–9, minus 0/O/1/I/L (visually confusing).
 * Yields ~30^6 = ~729M combinations — collision risk is negligible
 * at the volumes Flot will see in v1, but POST /api/orders retries
 * up to 3 times on the unique constraint just in case.
 */
export const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const nanoid = customAlphabet(REFERENCE_ALPHABET, 6);

export function generateReference(): string {
  return `FLT-${nanoid()}`;
}
