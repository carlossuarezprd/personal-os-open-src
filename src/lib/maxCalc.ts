const LBS_TO_KG = 0.45359237;

export function toKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? weight * LBS_TO_KG : weight;
}

export interface SetRecord {
  id: string;
  weight: number;
  weight_unit: 'kg' | 'lbs';
  reps: number;
  session_date?: string;
}

export interface MaxResult {
  weight_kg: number;
  reps: number;
  date?: string;
}

export function computeMax(sets: SetRecord[]): MaxResult | null {
  if (sets.length === 0) return null;
  const maxWeight = Math.max(...sets.map(s => toKg(s.weight, s.weight_unit)));
  const atMax = sets.filter(s => toKg(s.weight, s.weight_unit) === maxWeight);
  const maxReps = Math.max(...atMax.map(s => s.reps));
  const best = atMax.find(s => s.reps === maxReps)!;
  return { weight_kg: maxWeight, reps: maxReps, date: best.session_date };
}

/** Returns true if this set ties or beats the max from all OTHER sets */
export function isNewMax(allSets: SetRecord[], thisSet: SetRecord): boolean {
  const others = allSets.filter(s => s.id !== thisSet.id);
  const prev = computeMax(others);
  if (!prev) return true;
  const thisKg = toKg(thisSet.weight, thisSet.weight_unit);
  if (thisKg > prev.weight_kg) return true;
  if (thisKg === prev.weight_kg && thisSet.reps >= prev.reps) return true;
  return false;
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs'): string {
  if (unit === 'lbs') return `${Math.round(kg / LBS_TO_KG * 10) / 10}lbs`;
  return `${Math.round(kg * 10) / 10}kg`;
}

/** Epley estimate of 1RM in kg. */
export function epley1RM(weight_kg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight_kg;
  return weight_kg * (1 + reps / 30);
}

export interface E1RMResult {
  e1rm_kg: number;
  weight_kg: number;
  reps: number;
  date?: string;
}

/** Best estimated 1RM across a list of sets (Epley). */
export function bestE1RM(sets: SetRecord[]): E1RMResult | null {
  if (sets.length === 0) return null;
  let best: E1RMResult | null = null;
  for (const s of sets) {
    const kg = toKg(s.weight, s.weight_unit);
    const e1rm = epley1RM(kg, s.reps);
    if (!best || e1rm > best.e1rm_kg) {
      best = { e1rm_kg: e1rm, weight_kg: kg, reps: s.reps, date: s.session_date };
    }
  }
  return best;
}

/** Reduce sets to one max-set per session_date (heaviest weight, then most reps). */
export function maxPerSession(sets: SetRecord[]): SetRecord[] {
  const byDate = new Map<string, SetRecord>();
  for (const s of sets) {
    const date = s.session_date ?? '';
    if (!date) continue;
    const current = byDate.get(date);
    if (!current) {
      byDate.set(date, s);
      continue;
    }
    const sKg = toKg(s.weight, s.weight_unit);
    const cKg = toKg(current.weight, current.weight_unit);
    if (sKg > cKg || (sKg === cKg && s.reps > current.reps)) {
      byDate.set(date, s);
    }
  }
  return [...byDate.values()];
}
