import { describe, it, expect } from 'vitest';
import { isValidTransition, assertTransition } from '../status';

describe('order status state machine', () => {
  it('allows pending → confirmed', () => {
    expect(isValidTransition('pending', 'confirmed')).toBe(true);
  });

  it('allows pending → cancelled', () => {
    expect(isValidTransition('pending', 'cancelled')).toBe(true);
  });

  it('allows confirmed → fulfilled', () => {
    expect(isValidTransition('confirmed', 'fulfilled')).toBe(true);
  });

  it('allows confirmed → cancelled', () => {
    expect(isValidTransition('confirmed', 'cancelled')).toBe(true);
  });

  it('rejects pending → fulfilled (must confirm first)', () => {
    expect(isValidTransition('pending', 'fulfilled')).toBe(false);
  });

  it('rejects fulfilled → anything (terminal)', () => {
    expect(isValidTransition('fulfilled', 'cancelled')).toBe(false);
    expect(isValidTransition('fulfilled', 'confirmed')).toBe(false);
    expect(isValidTransition('fulfilled', 'pending')).toBe(false);
  });

  it('rejects cancelled → anything (terminal)', () => {
    expect(isValidTransition('cancelled', 'fulfilled')).toBe(false);
    expect(isValidTransition('cancelled', 'confirmed')).toBe(false);
  });

  it('rejects same-state transitions (noop)', () => {
    expect(isValidTransition('pending', 'pending')).toBe(false);
    expect(isValidTransition('confirmed', 'confirmed')).toBe(false);
  });

  it('assertTransition throws for illegal transitions', () => {
    expect(() => assertTransition('fulfilled', 'cancelled')).toThrow(/invalid/i);
  });

  it('assertTransition is silent for legal transitions', () => {
    expect(() => assertTransition('pending', 'confirmed')).not.toThrow();
  });
});
