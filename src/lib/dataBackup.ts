import { supabase } from './supabase';
import type { Database } from '../types/database';

export const BACKUP_VERSION = 1;

type Tables = Database['public']['Tables'];

// The hand-rolled Database type doesn't fully satisfy supabase-js's generic
// shape, so upsert payloads infer as `never[]`. Match the codebase pattern and
// cast at the boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface BackupBundle {
  version: number;
  exportedAt: string;
  userId: string;
  daily_logs: Tables['daily_logs']['Row'][];
  training_sessions: Tables['training_sessions']['Row'][];
  muscle_groups: Tables['muscle_groups']['Row'][];
  exercises: Tables['exercises']['Row'][];
  gyms: Tables['gyms']['Row'][];
  exercise_logs: Tables['exercise_logs']['Row'][];
  sets: Tables['sets']['Row'][];
  settings: Tables['settings']['Row'] | null;
}

export interface ImportSummary {
  daily_logs: number;
  training_sessions: number;
  muscle_groups: number;
  exercises: number;
  gyms: number;
  exercise_logs: number;
  sets: number;
  settings: number;
}

export async function exportAllData(userId: string): Promise<BackupBundle> {
  const dailyLogsP = supabase.from('daily_logs').select('*').eq('user_id', userId);
  const trainingSessionsP = supabase.from('training_sessions').select('*').eq('user_id', userId);
  const muscleGroupsP = supabase.from('muscle_groups').select('*').eq('user_id', userId);
  const exercisesP = supabase.from('exercises').select('*').eq('user_id', userId);
  const gymsP = supabase.from('gyms').select('*').eq('user_id', userId);
  const settingsP = supabase.from('settings').select('*').eq('user_id', userId).maybeSingle();

  const [dailyLogs, trainingSessions, muscleGroups, exercises, gyms, settings] = await Promise.all([
    dailyLogsP,
    trainingSessionsP,
    muscleGroupsP,
    exercisesP,
    gymsP,
    settingsP,
  ]);

  if (dailyLogs.error) throw new Error(`Export failed: ${dailyLogs.error.message}`);
  if (trainingSessions.error) throw new Error(`Export failed: ${trainingSessions.error.message}`);
  if (muscleGroups.error) throw new Error(`Export failed: ${muscleGroups.error.message}`);
  if (exercises.error) throw new Error(`Export failed: ${exercises.error.message}`);
  if (gyms.error) throw new Error(`Export failed: ${gyms.error.message}`);
  if (settings.error) throw new Error(`Export failed: ${settings.error.message}`);

  const sessions = (trainingSessions.data ?? []) as Tables['training_sessions']['Row'][];
  const sessionIds = sessions.map((s) => s.id);

  let exerciseLogs: Tables['exercise_logs']['Row'][] = [];
  let sets: Tables['sets']['Row'][] = [];

  if (sessionIds.length) {
    const elRes = await supabase.from('exercise_logs').select('*').in('session_id', sessionIds);
    if (elRes.error) throw new Error(`Export failed: ${elRes.error.message}`);
    exerciseLogs = elRes.data ?? [];

    const logIds = exerciseLogs.map((el) => el.id);
    if (logIds.length) {
      const setsRes = await supabase.from('sets').select('*').in('exercise_log_id', logIds);
      if (setsRes.error) throw new Error(`Export failed: ${setsRes.error.message}`);
      sets = setsRes.data ?? [];
    }
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    userId,
    daily_logs: (dailyLogs.data ?? []) as Tables['daily_logs']['Row'][],
    training_sessions: sessions,
    muscle_groups: (muscleGroups.data ?? []) as Tables['muscle_groups']['Row'][],
    exercises: (exercises.data ?? []) as Tables['exercises']['Row'][],
    gyms: (gyms.data ?? []) as Tables['gyms']['Row'][],
    exercise_logs: exerciseLogs,
    sets,
    settings: (settings.data ?? null) as Tables['settings']['Row'] | null,
  };
}

export function validateBundle(value: unknown): BackupBundle {
  if (!value || typeof value !== 'object') throw new Error('Backup file is not a JSON object');
  const b = value as Partial<BackupBundle>;
  if (b.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version ${b.version} (expected ${BACKUP_VERSION})`);
  }
  const required: (keyof BackupBundle)[] = [
    'daily_logs',
    'training_sessions',
    'muscle_groups',
    'exercises',
    'gyms',
    'exercise_logs',
    'sets',
  ];
  for (const key of required) {
    if (!Array.isArray(b[key])) throw new Error(`Backup is missing "${key}" array`);
  }
  return b as BackupBundle;
}

export async function importAllData(bundle: BackupBundle, userId: string): Promise<ImportSummary> {
  const summary: ImportSummary = {
    daily_logs: 0,
    training_sessions: 0,
    muscle_groups: 0,
    exercises: 0,
    gyms: 0,
    exercise_logs: 0,
    sets: 0,
    settings: 0,
  };

  const mgIdMap = new Map<string, string>();
  if (bundle.muscle_groups.length) {
    const rows = bundle.muscle_groups.map((mg) => ({ user_id: userId, name: mg.name }));
    const { data, error } = await db
      .from('muscle_groups')
      .upsert(rows, { onConflict: 'user_id,name' })
      .select('id, name');
    if (error) throw new Error(`muscle_groups: ${error.message}`);
    const byName = new Map<string, string>((data ?? []).map((r: { id: string; name: string }) => [r.name, r.id]));
    for (const mg of bundle.muscle_groups) {
      const newId = byName.get(mg.name);
      if (newId) mgIdMap.set(mg.id, newId);
    }
    summary.muscle_groups = data?.length ?? 0;
  }

  const gymIdMap = new Map<string, string>();
  if (bundle.gyms.length) {
    const rows = bundle.gyms.map((g) => ({ user_id: userId, name: g.name }));
    const { data, error } = await db
      .from('gyms')
      .upsert(rows, { onConflict: 'user_id,name' })
      .select('id, name');
    if (error) throw new Error(`gyms: ${error.message}`);
    const byName = new Map<string, string>((data ?? []).map((r: { id: string; name: string }) => [r.name, r.id]));
    for (const g of bundle.gyms) {
      const newId = byName.get(g.name);
      if (newId) gymIdMap.set(g.id, newId);
    }
    summary.gyms = data?.length ?? 0;
  }

  const exIdMap = new Map<string, string>();
  if (bundle.exercises.length) {
    const rows = bundle.exercises
      .map((ex) => {
        const mgId = mgIdMap.get(ex.muscle_group_id);
        if (!mgId) return null;
        return { user_id: userId, muscle_group_id: mgId, name: ex.name };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length) {
      const { data, error } = await db
        .from('exercises')
        .upsert(rows, { onConflict: 'user_id,muscle_group_id,name' })
        .select('id, muscle_group_id, name');
      if (error) throw new Error(`exercises: ${error.message}`);
      const byKey = new Map<string, string>(
        (data ?? []).map((r: { id: string; muscle_group_id: string; name: string }) => [
          `${r.muscle_group_id}|${r.name}`,
          r.id,
        ])
      );
      for (const ex of bundle.exercises) {
        const mgId = mgIdMap.get(ex.muscle_group_id);
        if (!mgId) continue;
        const newId = byKey.get(`${mgId}|${ex.name}`);
        if (newId) exIdMap.set(ex.id, newId);
      }
      summary.exercises = data?.length ?? 0;
    }
  }

  if (bundle.training_sessions.length) {
    const rows = bundle.training_sessions.map((s) => ({
      id: s.id,
      user_id: userId,
      session_date: s.session_date,
      session_time: s.session_time,
      notes: s.notes,
    }));
    const { data, error } = await db
      .from('training_sessions')
      .upsert(rows, { onConflict: 'id' })
      .select('id');
    if (error) throw new Error(`training_sessions: ${error.message}`);
    summary.training_sessions = data?.length ?? rows.length;
  }

  if (bundle.exercise_logs.length) {
    const rows = bundle.exercise_logs
      .map((el) => {
        const exId = exIdMap.get(el.exercise_id);
        const gymId = gymIdMap.get(el.gym_id);
        if (!exId || !gymId) return null;
        return {
          id: el.id,
          session_id: el.session_id,
          exercise_id: exId,
          gym_id: gymId,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length) {
      const { data, error } = await db
        .from('exercise_logs')
        .upsert(rows, { onConflict: 'id' })
        .select('id');
      if (error) throw new Error(`exercise_logs: ${error.message}`);
      summary.exercise_logs = data?.length ?? rows.length;
    }
  }

  if (bundle.sets.length) {
    const rows = bundle.sets.map((s) => ({
      id: s.id,
      exercise_log_id: s.exercise_log_id,
      set_index: s.set_index,
      weight: s.weight,
      weight_unit: s.weight_unit,
      reps: s.reps,
    }));
    const { data, error } = await db.from('sets').upsert(rows, { onConflict: 'id' }).select('id');
    if (error) throw new Error(`sets: ${error.message}`);
    summary.sets = data?.length ?? rows.length;
  }

  if (bundle.daily_logs.length) {
    const rows = bundle.daily_logs.map((d) => ({
      user_id: userId,
      date: d.date,
      morning: d.morning,
      daily: d.daily,
      night: d.night,
      stretch: d.stretch,
      weekly: d.weekly,
    }));
    const { data, error } = await db
      .from('daily_logs')
      .upsert(rows, { onConflict: 'user_id,date' })
      .select('id');
    if (error) throw new Error(`daily_logs: ${error.message}`);
    summary.daily_logs = data?.length ?? rows.length;
  }

  if (bundle.settings) {
    const row = {
      user_id: userId,
      sleep_target_hours: bundle.settings.sleep_target_hours,
      primary_weight_unit: bundle.settings.primary_weight_unit,
      thresholds: bundle.settings.thresholds,
    };
    const { error } = await db.from('settings').upsert(row, { onConflict: 'user_id' });
    if (error) throw new Error(`settings: ${error.message}`);
    summary.settings = 1;
  }

  return summary;
}

export function downloadBundle(bundle: BackupBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = bundle.exportedAt.slice(0, 10);
  a.href = url;
  a.download = `personal-os-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
