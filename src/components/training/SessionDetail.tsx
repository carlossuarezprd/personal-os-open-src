import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionDetail, useSessions, useAllExerciseMaxes } from '../../hooks/useTraining';
import { computeMax, isNewMax, formatWeight, toKg } from '../../lib/maxCalc';
import { supabase } from '../../lib/supabase';
import AddExercisePicker from './AddExercisePicker';
import { todayISO } from '../ui/DateNav';

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { exerciseLogs, loading, reload } = useSessionDetail(sessionId);
  const { sessions, updateSession, deleteSession } = useSessions();
  const { maxes: allTimeMaxes } = useAllExerciseMaxes();
  const session = sessions.find(s => s.id === sessionId);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleAddExercise(muscleGroupId: string, exerciseId: string, gymId: string) {
    if (!sessionId) return;
    setShowPicker(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('exercise_logs').insert({ session_id: sessionId, exercise_id: exerciseId, gym_id: gymId });
    reload();
    // suppress unused warning
    void muscleGroupId;
  }

  async function handleDelete() {
    if (!sessionId) return;
    await deleteSession(sessionId);
    navigate('/training');
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/training')}>‹ Back</button>
        <div style={styles.dateRow}>
          <input
            type="date"
            value={session?.session_date ?? todayISO()}
            max={todayISO()}
            onChange={e => sessionId && updateSession(sessionId, e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <button style={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>🗑</button>
      </div>

      {confirmDelete && (
        <div style={styles.confirmBanner}>
          <span style={{ color: 'var(--clay)' }}>Delete this session?</span>
          <button style={styles.confirmYes} onClick={handleDelete}>Delete</button>
          <button style={styles.confirmNo} onClick={() => setConfirmDelete(false)}>Cancel</button>
        </div>
      )}

      {/* Exercise logs */}
      {loading ? <p style={styles.empty}>Loading…</p> : (
        <div style={styles.list}>
          {exerciseLogs.map(el => {
            const allSets = el.sets.map(s => ({ ...s, weight_unit: s.weight_unit as 'kg' | 'lbs' }));
            const max = computeMax(allSets);
            const hasNewMax = allSets.some(s => isNewMax(allSets, { ...s, weight_unit: s.weight_unit as 'kg' | 'lbs' }));
            const prev = allTimeMaxes.get(el.exercise.id);

            return (
              <button
                key={el.id}
                style={styles.card}
                onClick={() => navigate(`/training/session/${sessionId}/exercise/${el.id}`)}
              >
                <div style={styles.cardTop}>
                  <span style={styles.exName}>{el.exercise.name}</span>
                  {hasNewMax && <span style={styles.flame}>🔥 NEW MAX</span>}
                </div>
                <div style={styles.cardSub}>
                  {el.exercise.muscle_group.name} · {el.gym.name}
                </div>
                <div style={styles.cardStats}>
                  <span>{el.sets.length} set{el.sets.length !== 1 ? 's' : ''}</span>
                  {max ? (
                    <span style={{ color: 'var(--blue)' }}>
                      MAX: {formatWeight(max.weight_kg, 'kg')} × {max.reps}
                    </span>
                  ) : prev ? (
                    <span style={{ color: 'var(--blue)' }}>
                      Prev: {formatWeight(toKg(prev.weight, prev.weight_unit), prev.weight_unit)} × {prev.reps}
                    </span>
                  ) : null}
                </div>
                <span style={styles.chevron}>›</span>
              </button>
            );
          })}

          {exerciseLogs.length === 0 && !loading && (
            <p style={styles.empty}>No exercises yet. Add one!</p>
          )}
        </div>
      )}

      <button style={styles.addBtn} onClick={() => setShowPicker(true)}>+ Add exercise</button>

      {showPicker && (
        <AddExercisePicker onDone={handleAddExercise} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 16px', borderBottom: '1px solid var(--hairline)',
    background: 'var(--surface)', flexShrink: 0,
  },
  back: { fontSize: '22px', color: 'var(--text-mid)', padding: '4px 8px' },
  dateRow: { flex: 1 },
  dateInput: { background: 'transparent', border: 'none', color: 'var(--text-hi)', fontSize: '15px', fontWeight: 600 },
  deleteBtn: { fontSize: '18px', padding: '4px 8px', color: 'var(--text-mid)' },
  confirmBanner: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)',
    fontSize: '14px', flexShrink: 0,
  },
  confirmYes: { padding: '6px 14px', background: 'var(--clay)', color: 'var(--bg-0)', borderRadius: 'var(--r-pill)', fontWeight: 600, fontSize: '13px' },
  confirmNo: { padding: '6px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--r-chip)', fontSize: '13px', color: 'var(--text-mid)' },
  list: { flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  card: {
    position: 'relative', padding: '14px',
    background: 'var(--surface)', border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-chip)', textAlign: 'left', width: '100%',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  exName: { fontSize: '16px', fontWeight: 600, color: 'var(--text-hi)' },
  flame: { fontSize: '11px', fontWeight: 700, color: 'var(--green)'},
  cardSub: { fontSize: '12px', color: 'var(--text-mid)', marginBottom: '6px' },
  cardStats: { display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-mid)' },
  chevron: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-mid)' },
  addBtn: {
    margin: '12px 16px', padding: '12px',
    background: 'var(--teal)', color: 'var(--bg-0)',
    fontWeight: 600, borderRadius: 'var(--r-pill)', fontSize: '15px', flexShrink: 0,
  },
  empty: { color: 'var(--text-mid)', textAlign: 'center', padding: '40px 0' },
};
