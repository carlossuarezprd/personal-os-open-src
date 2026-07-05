import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Session = Database['public']['Tables']['training_sessions']['Row'];
type MuscleGroup = Database['public']['Tables']['muscle_groups']['Row'];
type Exercise = Database['public']['Tables']['exercises']['Row'];
type Gym = Database['public']['Tables']['gyms']['Row'];
type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row'];
type SetRow = Database['public']['Tables']['sets']['Row'];

export type { Session, MuscleGroup, Exercise, Gym, ExerciseLog, SetRow };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    db.from('training_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false })
      .order('session_time', { ascending: false })
      .then(({ data }: { data: Session[] | null }) => { setSessions(data ?? []); setLoading(false); });
  }, [user]);

  const createSession = useCallback(async (date: string): Promise<Session | null> => {
    if (!user) return null;
    const { data } = await db.from('training_sessions')
      .insert({ user_id: user.id, session_date: date })
      .select().single();
    if (data) setSessions((prev: Session[]) => [data, ...prev]);
    return data ?? null;
  }, [user]);

  const updateSession = useCallback(async (id: string, date: string) => {
    await db.from('training_sessions').update({ session_date: date }).eq('id', id);
    setSessions((prev: Session[]) => prev.map(s => s.id === id ? { ...s, session_date: date } : s));
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await db.from('training_sessions').delete().eq('id', id);
    setSessions((prev: Session[]) => prev.filter(s => s.id !== id));
  }, []);

  return { sessions, loading, createSession, updateSession, deleteSession };
}

export function useSessionDetail(sessionId: string | undefined) {
  const [exerciseLogs, setExerciseLogs] = useState<(ExerciseLog & {
    exercise: Exercise & { muscle_group: MuscleGroup };
    gym: Gym;
    sets: SetRow[];
  })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data } = await db.from('exercise_logs')
      .select('*, exercise:exercises(*, muscle_group:muscle_groups(*)), gym:gyms(*), sets(*)')
      .eq('session_id', sessionId)
      .order('created_at');
    setExerciseLogs(data ?? []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const deleteExerciseLog = useCallback(async (id: string) => {
    await db.from('exercise_logs').delete().eq('id', id);
    setExerciseLogs((prev: typeof exerciseLogs) => prev.filter(e => e.id !== id));
  }, [exerciseLogs]);

  return { exerciseLogs, loading, reload: load, deleteExerciseLog };
}

export function useTaxonomy() {
  const { user } = useAuth();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    if (!user) return;
    db.from('muscle_groups').select('*').eq('user_id', user.id).order('name')
      .then(({ data }: { data: MuscleGroup[] | null }) => setMuscleGroups(data ?? []));
    db.from('exercises').select('*').eq('user_id', user.id).order('name')
      .then(({ data }: { data: Exercise[] | null }) => setExercises(data ?? []));
    db.from('gyms').select('*').eq('user_id', user.id).order('name')
      .then(({ data }: { data: Gym[] | null }) => setGyms(data ?? []));
  }, [user]);

  const createMuscleGroup = useCallback(async (name: string): Promise<MuscleGroup | null> => {
    if (!user) return null;
    const { data } = await db.from('muscle_groups').insert({ user_id: user.id, name }).select().single();
    if (data) setMuscleGroups((prev: MuscleGroup[]) => [...prev, data].sort((a: MuscleGroup, b: MuscleGroup) => a.name.localeCompare(b.name)));
    return data ?? null;
  }, [user]);

  const createExercise = useCallback(async (muscleGroupId: string, name: string): Promise<Exercise | null> => {
    if (!user) return null;
    const { data } = await db.from('exercises').insert({ user_id: user.id, muscle_group_id: muscleGroupId, name }).select().single();
    if (data) setExercises((prev: Exercise[]) => [...prev, data].sort((a: Exercise, b: Exercise) => a.name.localeCompare(b.name)));
    return data ?? null;
  }, [user]);

  const createGym = useCallback(async (name: string): Promise<Gym | null> => {
    if (!user) return null;
    const { data } = await db.from('gyms').insert({ user_id: user.id, name }).select().single();
    if (data) setGyms((prev: Gym[]) => [...prev, data].sort((a: Gym, b: Gym) => a.name.localeCompare(b.name)));
    return data ?? null;
  }, [user]);

  return { muscleGroups, exercises, gyms, createMuscleGroup, createExercise, createGym };
}

export interface ExerciseMaxInfo {
  weight: number;
  weight_unit: 'kg' | 'lbs';
  reps: number;
  session_date: string;
}

interface HistorySetRow {
  weight: number;
  weight_unit: 'kg' | 'lbs';
  reps: number;
  exercise_log: {
    exercise_id: string;
    gym_id: string;
    session: { user_id: string; session_date: string } | null;
  } | null;
}

/** Pre-fetches max-set-per-exercise for the current user (across all gyms). */
export function useAllExerciseMaxes() {
  const { user } = useAuth();
  const [maxes, setMaxes] = useState<Map<string, ExerciseMaxInfo>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    db.from('sets')
      .select(
        'weight, weight_unit, reps, exercise_log:exercise_logs!inner(exercise_id, gym_id, session:training_sessions!inner(user_id, session_date))'
      )
      .eq('exercise_log.session.user_id', user.id)
      .then(({ data }: { data: HistorySetRow[] | null }) => {
        const result = new Map<string, ExerciseMaxInfo>();
        for (const s of data ?? []) {
          const exId = s.exercise_log?.exercise_id;
          const date = s.exercise_log?.session?.session_date ?? '';
          if (!exId) continue;
          const kg = s.weight_unit === 'lbs' ? s.weight * 0.45359237 : s.weight;
          const current = result.get(exId);
          if (!current) {
            result.set(exId, { weight: s.weight, weight_unit: s.weight_unit, reps: s.reps, session_date: date });
            continue;
          }
          const currentKg = current.weight_unit === 'lbs' ? current.weight * 0.45359237 : current.weight;
          if (kg > currentKg || (kg === currentKg && s.reps > current.reps)) {
            result.set(exId, { weight: s.weight, weight_unit: s.weight_unit, reps: s.reps, session_date: date });
          }
        }
        setMaxes(result);
        setLoading(false);
      });
  }, [user]);

  return { maxes, loading };
}

interface HistorySetWithGym extends HistorySetRow {
  exercise_log: HistorySetRow['exercise_log'] & {
    gym: { name: string } | null;
  };
}

/** All sets logged by the current user for a given exercise, across every session and gym. */
export function useExerciseHistory(exerciseId: string | undefined) {
  const { user } = useAuth();
  const [sets, setSets] = useState<(SetRow & { session_date: string; gym_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !exerciseId) return;
    db.from('sets')
      .select(
        '*, exercise_log:exercise_logs!inner(exercise_id, gym_id, gym:gyms(name), session:training_sessions!inner(user_id, session_date))'
      )
      .eq('exercise_log.exercise_id', exerciseId)
      .eq('exercise_log.session.user_id', user.id)
      .then(({ data }: { data: (SetRow & HistorySetWithGym)[] | null }) => {
        const flat = (data ?? []).map((s) => ({
          ...s,
          session_date: s.exercise_log?.session?.session_date ?? '',
          gym_name: s.exercise_log?.gym?.name ?? '',
        }));
        setSets(flat);
        setLoading(false);
      });
  }, [exerciseId, user]);

  return { sets, loading };
}

export function useExerciseDetail(exerciseLogId: string | undefined) {
  const [sets, setSets] = useState<SetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseLogId) return;
    db.from('sets').select('*').eq('exercise_log_id', exerciseLogId).order('set_index')
      .then(({ data }: { data: SetRow[] | null }) => { setSets(data ?? []); setLoading(false); });
  }, [exerciseLogId]);

  const addSet = useCallback(async (elId: string, weight: number, weightUnit: 'kg' | 'lbs', reps: number): Promise<SetRow | null> => {
    const { data } = await db.from('sets')
      .insert({ exercise_log_id: elId, set_index: sets.length, weight, weight_unit: weightUnit, reps })
      .select().single();
    if (data) setSets((prev: SetRow[]) => [...prev, data]);
    return data ?? null;
  }, [sets]);

  const updateSet = useCallback(async (id: string, weight: number, weightUnit: 'kg' | 'lbs', reps: number) => {
    await db.from('sets').update({ weight, weight_unit: weightUnit, reps }).eq('id', id);
    setSets((prev: SetRow[]) => prev.map(s => s.id === id ? { ...s, weight, weight_unit: weightUnit, reps } : s));
  }, []);

  const deleteSet = useCallback(async (id: string) => {
    await db.from('sets').delete().eq('id', id);
    setSets((prev: SetRow[]) => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, set_index: i })));
  }, []);

  return { sets, loading, addSet, updateSet, deleteSet };
}
