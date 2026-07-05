import { describe, it, expect } from 'vitest';
import { computeGroupAdherence, type GroupDef, type DayData } from '../adherenceCalc';

const group: GroupDef = {
  name: 'Test',
  items: [
    { id: 'item_a', tab: 'morning', frequency: 'daily' },
    { id: 'item_b', tab: 'weekly', frequency: 'weekly' },
  ],
};

function day(date: string, itemA: boolean | null, itemB?: boolean): DayData {
  return {
    date,
    morning: { item_a: itemA, other: true }, // other=true makes tab "engaged"
    daily: {},
    night: {},
    stretch: {},
    weekly: itemB != null ? { item_b: itemB } : {},
  };
}

describe('computeGroupAdherence', () => {
  it('100% when all daily items checked on all engaged days', () => {
    const days = [day('2026-01-05', true), day('2026-01-06', true)];
    const r = computeGroupAdherence(group, days, false);
    expect(r.pct).toBe(100);
  });

  it('50% when checked on half of engaged days', () => {
    const days = [day('2026-01-05', true), day('2026-01-06', false)];
    const r = computeGroupAdherence(group, days, false);
    expect(r.pct).toBe(50);
  });

  it('excludes weekly item when week is incomplete', () => {
    const days = [day('2026-01-05', true, false)];
    const r = computeGroupAdherence(group, days, false);
    // Only daily item counts, checked → 100%
    expect(r.pct).toBe(100);
    expect(r.denominator).toBe(1);
  });

  it('includes weekly item when week is complete and missed → lowers %', () => {
    const days = [day('2026-01-05', true, false)];
    const r = computeGroupAdherence(group, days, true);
    // 1 daily checked (num=1, den=1) + 1 weekly missed (num+=0, den+=1) → 1/2 = 50%
    expect(r.pct).toBe(50);
    expect(r.denominator).toBe(2);
  });

  it('includes weekly item when week is complete and hit', () => {
    const days = [day('2026-01-05', true, true)];
    const r = computeGroupAdherence(group, days, true);
    expect(r.pct).toBe(100);
    expect(r.denominator).toBe(2);
  });

  it('skips non-engaged days', () => {
    // Day with empty morning tab — not engaged
    const days: DayData[] = [
      { date: '2026-01-05', morning: {}, daily: {}, night: {}, stretch: {}, weekly: {} },
    ];
    const r = computeGroupAdherence(group, days, false);
    expect(r.denominator).toBe(0);
    expect(r.pct).toBe(0);
  });
});
