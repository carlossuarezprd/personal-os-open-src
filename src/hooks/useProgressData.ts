import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DayRow {
  date: string;
  morning: Record<string, boolean | number | null>;
  daily: Record<string, boolean | number | null>;
  night: Record<string, boolean | number | null>;
  stretch: Record<string, boolean | number | null>;
  weekly: Record<string, boolean | number | null>;
}

export interface WeekBucket {
  weekKey: string;   // "2026-W18"
  weekStart: string; // ISO Monday
  days: DayRow[];
}

// ISO week key from a date string
export function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const tmp = new Date(d);
  tmp.setDate(tmp.getDate() + 4 - ((tmp.getDay() + 6) % 7 + 1 + 1));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Monday of the ISO week containing a date
export function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function groupByWeek(days: DayRow[]): WeekBucket[] {
  const map = new Map<string, WeekBucket>();
  for (const day of days) {
    const key = isoWeekKey(day.date);
    if (!map.has(key)) map.set(key, { weekKey: key, weekStart: mondayOf(day.date), days: [] });
    map.get(key)!.days.push(day);
  }
  return [...map.values()].sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

export function weekAvg(days: DayRow[], field: string): number | null {
  const vals = days
    .map(d => d.daily[field])
    .filter((v): v is number => typeof v === 'number');
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function weekCount(days: DayRow[], field: string): number {
  return days.filter(d => d.daily[field] === true).length;
}

// Calorie deficit computed per day (mirrors DailyTab logic)
export function computeDayDeficit(daily: Record<string, boolean | number | null>): number | null {
  const steps = typeof daily['d_steps'] === 'number' ? daily['d_steps'] : null;
  const trainCals = typeof daily['d_training_cals'] === 'number' ? daily['d_training_cals'] : null;
  const consumed = typeof daily['d_cals_consumed'] === 'number' ? daily['d_cals_consumed'] : null;
  if (consumed == null || (steps == null && trainCals == null)) return null;
  const burned = 46 * (steps ?? 0) + 2300 + (trainCals ?? 0);
  return burned - consumed;
}

export type RangeWeeks = 4 | 12 | 26 | 52 | 'all';

export function filterWeeks(weeks: WeekBucket[], range: RangeWeeks): WeekBucket[] {
  if (range === 'all') return weeks;
  return weeks.slice(-range);
}

export function useDailyData() {
  const { user } = useAuth();
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('daily_logs')
      .select('date, morning, daily, night, stretch, weekly')
      .eq('user_id', user.id)
      .order('date')
      .then(({ data }: { data: DayRow[] | null }) => {
        setDays(data ?? []);
        setLoading(false);
      });
  }, [user]);

  return { days, loading };
}

export function useTrainingData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<{ session_date: string; sets: { weight: number; weight_unit: string; reps: number; muscle_group: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('training_sessions')
      .select(`session_date, exercise_logs(exercise_id, exercises(muscle_group_id, muscle_groups(name)), sets(weight, weight_unit, reps))`)
      .eq('user_id', user.id)
      .order('session_date')
      .then(({ data }: { data: unknown[] | null }) => {
        // Flatten to per-session with sets+muscle group
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flat = (data ?? []).map((s: any) => ({
          session_date: s.session_date,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sets: (s.exercise_logs ?? []).flatMap((el: any) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (el.sets ?? []).map((set: any) => ({
              weight: set.weight,
              weight_unit: set.weight_unit,
              reps: set.reps,
              muscle_group: el.exercises?.muscle_groups?.name ?? 'Unknown',
            }))
          ),
        }));
        setSessions(flat);
        setLoading(false);
      });
  }, [user]);

  return { sessions, loading };
}
