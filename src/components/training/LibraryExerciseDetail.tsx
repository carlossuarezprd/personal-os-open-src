import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaxonomy, useExerciseHistory } from '../../hooks/useTraining';
import { computeMax, bestE1RM, formatWeight } from '../../lib/maxCalc';
import ProgressionChart from './ProgressionChart';

export default function LibraryExerciseDetail() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { exercises, muscleGroups } = useTaxonomy();
  const { sets, loading } = useExerciseHistory(exerciseId);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const exercise = exercises.find((e) => e.id === exerciseId);
  const muscleGroup = exercise ? muscleGroups.find((m) => m.id === exercise.muscle_group_id) : null;

  const normalized = sets.map((s) => ({
    id: s.id,
    weight: s.weight,
    weight_unit: s.weight_unit as 'kg' | 'lbs',
    reps: s.reps,
    session_date: s.session_date,
  }));
  const heaviest = computeMax(normalized);
  const e1rm = bestE1RM(normalized);

  const sessionCount = new Set(sets.map((s) => s.session_date)).size;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/training/library')}>‹ Library</button>
        <div>
          <div style={styles.exName}>{exercise?.name ?? '…'}</div>
          <div style={styles.exSub}>
            {muscleGroup?.name ?? '—'}
            {sessionCount > 0 && ` · ${sessionCount} session${sessionCount === 1 ? '' : 's'}`}
          </div>
        </div>
      </div>

      <div style={styles.banners}>
        <div style={styles.banner}>
          <span style={styles.bannerLabel}>HEAVIEST</span>
          <span style={styles.bannerValue}>
            {heaviest ? `${formatWeight(heaviest.weight_kg, unit)} × ${heaviest.reps}` : '—'}
          </span>
          {heaviest?.date && <span style={styles.bannerDate}>{heaviest.date}</span>}
        </div>
        <div style={styles.banner}>
          <span style={{ ...styles.bannerLabel, color: 'var(--teal)'}}>1RM (est.)</span>
          <span style={{ ...styles.bannerValue, color: 'var(--teal)' }}>
            {e1rm ? formatWeight(e1rm.e1rm_kg, unit) : '—'}
          </span>
          {e1rm && (
            <span style={styles.bannerDate}>
              from {formatWeight(e1rm.weight_kg, unit)} × {e1rm.reps}
              {e1rm.date && ` · ${e1rm.date}`}
            </span>
          )}
        </div>
      </div>

      <div style={styles.unitRow}>
        {(['kg', 'lbs'] as const).map((u) => (
          <button
            key={u}
            style={{
              ...styles.unitBtn,
              background: unit === u ? 'var(--teal)' : 'var(--surface-2)',
              color: unit === u ? 'var(--bg-0)' : 'var(--text-mid)',
            }}
            onClick={() => setUnit(u)}
          >
            {u}
          </button>
        ))}
      </div>

      <div style={styles.chartWrap}>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : sets.length === 0 ? (
          <p style={styles.empty}>No history yet — log this exercise in a session to see your progression here.</p>
        ) : (
          <ProgressionChart sets={sets} primaryUnit={unit} />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface)', flexShrink: 0 },
  back: { fontSize: '15px', color: 'var(--text-mid)', padding: '4px 8px' },
  exName: { fontSize: '17px', fontWeight: 700, color: 'var(--text-hi)' },
  exSub: { fontSize: '12px', color: 'var(--text-mid)' },
  banners: { display: 'flex', gap: '8px', padding: '12px 16px' },
  banner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    background: 'var(--surface)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-chip)',
    padding: '10px 12px',
  },
  bannerLabel: { fontSize: '10px', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em' },
  bannerValue: { fontSize: '15px', color: 'var(--blue)', fontWeight: 600 },
  bannerDate: { fontSize: '11px', color: 'var(--text-mid)' },
  unitRow: { display: 'flex', gap: '6px', padding: '0 16px 8px' },
  unitBtn: { padding: '5px 14px', borderRadius: 'var(--r-chip)', fontSize: '13px', fontWeight: 600, border: 'none' },
  chartWrap: { padding: '0 8px 16px' },
  empty: { color: 'var(--text-mid)', textAlign: 'center', padding: '40px 16px', fontSize: '13px', lineHeight: 1.5 },
};
