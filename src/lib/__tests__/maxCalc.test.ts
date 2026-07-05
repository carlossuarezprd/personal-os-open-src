import { describe, it, expect } from 'vitest';
import { computeMax, isNewMax, toKg } from '../maxCalc';

const s = (id: string, weight: number, unit: 'kg' | 'lbs', reps: number) =>
  ({ id, weight, weight_unit: unit, reps });

describe('toKg', () => {
  it('passes kg through', () => expect(toKg(100, 'kg')).toBe(100));
  it('converts lbs', () => expect(toKg(100, 'lbs')).toBeCloseTo(45.36, 1));
});

describe('computeMax', () => {
  it('returns null for empty', () => expect(computeMax([])).toBeNull());
  it('returns the heaviest set', () => {
    const result = computeMax([s('a', 80, 'kg', 5), s('b', 100, 'kg', 3), s('c', 90, 'kg', 8)]);
    expect(result?.weight_kg).toBe(100);
    expect(result?.reps).toBe(3);
  });
  it('picks highest reps when weights tie', () => {
    const result = computeMax([s('a', 100, 'kg', 5), s('b', 100, 'kg', 8)]);
    expect(result?.weight_kg).toBe(100);
    expect(result?.reps).toBe(8);
  });
  it('handles lbs correctly', () => {
    const result = computeMax([s('a', 225, 'lbs', 5)]);
    expect(result?.weight_kg).toBeCloseTo(102.1, 0);
  });
});

describe('isNewMax', () => {
  it('true when no other sets', () => {
    const set = s('a', 100, 'kg', 5);
    expect(isNewMax([set], set)).toBe(true);
  });
  it('true when heavier than all others', () => {
    const all = [s('a', 80, 'kg', 5), s('b', 100, 'kg', 3)];
    expect(isNewMax(all, all[1])).toBe(true);
  });
  it('true when same weight but more reps', () => {
    const all = [s('a', 100, 'kg', 5), s('b', 100, 'kg', 8)];
    expect(isNewMax(all, all[1])).toBe(true);
  });
  it('false when lighter', () => {
    const all = [s('a', 100, 'kg', 5), s('b', 80, 'kg', 10)];
    expect(isNewMax(all, all[1])).toBe(false);
  });
  it('false when same weight fewer reps', () => {
    const all = [s('a', 100, 'kg', 8), s('b', 100, 'kg', 5)];
    expect(isNewMax(all, all[1])).toBe(false);
  });
});
