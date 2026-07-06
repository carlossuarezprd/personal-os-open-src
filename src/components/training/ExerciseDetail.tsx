import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExerciseDetail } from '../../hooks/useTraining';
import { computeMax, isNewMax, formatWeight } from '../../lib/maxCalc';
import { supabase } from '../../lib/supabase';
import ProgressionChart from './ProgressionChart';

interface ExerciseMeta {
  name: string;
  muscle_group: { name: string };
  gym: { name: string };
  exercise_id: string;
  gym_id: string;
}

export default function ExerciseDetail() {
  const { sessionId, exerciseLogId } = useParams<{ sessionId: string; exerciseLogId: string }>();
  const navigate = useNavigate();
  const { sets, loading, addSet, updateSet, deleteSet } = useExerciseDetail(exerciseLogId);
  const [meta, setMeta] = useState<ExerciseMeta | null>(null);
  const [allHistorySets, setAllHistorySets] = useState<(typeof sets[0] & { session_date: string })[]>([]);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [editing, setEditing] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('');

  useEffect(() => {
    if (!exerciseLogId) return;
    supabase
      .from('exercise_logs')
      .select('*, exercise:exercises(*, muscle_group:muscle_groups(*)), gym:gyms(*)')
      .eq('id', exerciseLogId)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as unknown as { exercise: { name: string; muscle_group: { name: string }; id: string }; gym: { name: string; id: string } };
          setMeta({ name: d.exercise.name, muscle_group: d.exercise.muscle_group, gym: d.gym, exercise_id: d.exercise.id, gym_id: d.gym.id });
        }
      });
  }, [exerciseLogId]);

  // Load all history for this exercise+gym combo across sessions
  useEffect(() => {
    if (!meta) return;
    supabase
      .from('sets')
      .select('*, exercise_log:exercise_logs!inner(exercise_id, gym_id, session:training_sessions(session_date))')
      .eq('exercise_log.exercise_id', meta.exercise_id)
      .eq('exercise_log.gym_id', meta.gym_id)
      .then(({ data }) => {
        if (!data) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flat = (data as any[]).map(s => ({ ...s, session_date: s.exercise_log?.session?.session_date ?? '' }));
        setAllHistorySets(flat);
      });
  }, [meta, sets]);

  const normalizedSets = sets.map(s => ({ ...s, weight_unit: s.weight_unit as 'kg' | 'lbs' }));
  const max = computeMax(allHistorySets.map(s => ({ ...s, weight_unit: s.weight_unit as 'kg' | 'lbs' })));

  async function handleAdd() {
    if (!exerciseLogId || !newWeight || !newReps) return;
    await addSet(exerciseLogId, parseFloat(newWeight), unit, parseInt(newReps));
    setNewWeight('');
    setNewReps('');
  }

  async function handleSaveEdit(id: string) {
    await updateSet(id, parseFloat(editWeight), unit, parseInt(editReps));
    setEditing(null);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate(`/training/session/${sessionId}`)}>‹ Back</button>
        <div>
          <div style={styles.exName}>{meta?.name ?? '…'}</div>
          <div style={styles.exSub}>{meta?.muscle_group.name} · {meta?.gym.name}</div>
        </div>
      </div>

      {/* MAX display */}
      {max && (
        <div style={styles.maxBanner}>
          <span style={styles.maxLabel}>MAX</span>
          <span style={styles.maxValue}>
            {formatWeight(max.weight_kg, unit)} × {max.reps}
            {max.date && <span style={styles.maxDate}> · {max.date}</span>}
          </span>
        </div>
      )}

      {/* Progression chart */}
      <div style={styles.chartWrap}>
        <ProgressionChart sets={allHistorySets as (typeof allHistorySets[0])[]} primaryUnit={unit} />
      </div>

      {/* Unit toggle */}
      <div style={styles.unitRow}>
        {(['kg', 'lbs'] as const).map(u => (
          <button
            key={u}
            style={{ ...styles.unitBtn, background: unit === u ? 'var(--teal)' : 'var(--surface-2)', color: unit === u ? 'var(--bg-0)' : 'var(--text-mid)' }}
            onClick={() => setUnit(u)}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Sets list */}
      <div style={styles.setsList}>
        {loading ? <p style={styles.empty}>Loading…</p> : normalizedSets.map((s, i) => {
          const isMax = isNewMax(normalizedSets, s);
          return editing === s.id ? (
            <div key={s.id} style={styles.editRow}>
              <span style={styles.setNum}>{i + 1}</span>
              <input style={styles.setInput} value={editWeight} onChange={e => setEditWeight(e.target.value)} placeholder="kg" inputMode="decimal" />
              <span style={styles.x}>×</span>
              <input style={styles.setInput} value={editReps} onChange={e => setEditReps(e.target.value)} placeholder="reps" inputMode="numeric" />
              <button style={styles.saveBtn} onClick={() => handleSaveEdit(s.id)}>✓</button>
              <button style={styles.cancelBtn} onClick={() => setEditing(null)}>✕</button>
            </div>
          ) : (
            <div key={s.id} style={{ ...styles.setRow, borderColor: isMax ? 'var(--green)' : 'var(--hairline)' }}>
              <span style={styles.setNum}>{i + 1}</span>
              <span style={{ color: isMax ? 'var(--green)' : 'var(--text-hi)', fontWeight: isMax ? 700 : 400}}>
                {s.weight}{s.weight_unit} × {s.reps}
              </span>
              {isMax && <span style={{ fontSize: '12px', color: 'var(--green)' }}>MAX</span>}
              <button style={styles.editBtn} onClick={() => { setEditing(s.id); setEditWeight(String(s.weight)); setEditReps(String(s.reps)); }}>✎</button>
              <button style={styles.delBtn} onClick={() => deleteSet(s.id)}>✕</button>
            </div>
          );
        })}
      </div>

      {/* Add set */}
      <div style={styles.addRow}>
        <input style={styles.setInput} value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder={unit} inputMode="decimal" />
        <span style={styles.x}>×</span>
        <input style={styles.setInput} value={newReps} onChange={e => setNewReps(e.target.value)} placeholder="reps" inputMode="numeric" />
        <button style={styles.addSetBtn} onClick={handleAdd} disabled={!newWeight || !newReps}>+ Add</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface)', flexShrink: 0 },
  back: { fontSize: '22px', color: 'var(--text-mid)', padding: '4px 8px' },
  exName: { fontSize: '17px', fontWeight: 700, color: 'var(--text-hi)' },
  exSub: { fontSize: '12px', color: 'var(--text-mid)' },
  maxBanner: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)', flexShrink: 0 },
  maxLabel: { fontSize: '11px', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em' },
  maxValue: { fontSize: '14px', color: 'var(--blue)', fontWeight: 600 },
  maxDate: { color: 'var(--text-mid)', fontWeight: 400 },
  chartWrap: { padding: '0 8px', flexShrink: 0, borderBottom: '1px solid var(--hairline)' },
  unitRow: { display: 'flex', gap: '6px', padding: '10px 16px', flexShrink: 0 },
  unitBtn: { padding: '5px 14px', borderRadius: 'var(--r-chip)', fontSize: '13px', fontWeight: 600, border: 'none' },
  setsList: { flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  setRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--surface)', border: '1px solid', borderRadius: 'var(--r-chip)' },
  editRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-chip)' },
  setNum: { fontSize: '12px', color: 'var(--text-mid)', width: '16px', flexShrink: 0 },
  setInput: { width: '70px', padding: '6px 8px', fontSize: '14px', textAlign: 'center' },
  x: { color: 'var(--text-mid)', fontSize: '14px' },
  editBtn: { marginLeft: 'auto', color: 'var(--text-mid)', fontSize: '14px', padding: '2px 6px' },
  delBtn: { color: 'var(--clay)', fontSize: '14px', padding: '2px 6px' },
  saveBtn: { padding: '4px 10px', background: 'var(--green)', color: 'var(--bg-0)', borderRadius: 'var(--r-pill)', fontWeight: 600, fontSize: '13px' },
  cancelBtn: { padding: '4px 10px', color: 'var(--text-mid)', fontSize: '13px' },
  addRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderTop: '1px solid var(--hairline)', background: 'var(--surface)', flexShrink: 0 },
  addSetBtn: { marginLeft: 'auto', padding: '8px 16px', background: 'var(--teal)', color: 'var(--bg-0)', fontWeight: 600, borderRadius: 'var(--r-pill)', fontSize: '14px' },
  empty: { color: 'var(--text-mid)', textAlign: 'center', padding: '20px 0' },
};
