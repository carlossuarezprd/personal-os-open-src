import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaxonomy, useAllExerciseMaxes } from '../../hooks/useTraining';
import { formatWeight, toKg } from '../../lib/maxCalc';
import TrainingTabs from './TrainingTabs';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { muscleGroups, exercises } = useTaxonomy();
  const { maxes } = useAllExerciseMaxes();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const filtered = exercises
      .filter((ex) => filter === 'all' || ex.muscle_group_id === filter)
      .filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));

    const byMuscle = new Map<string, typeof exercises>();
    for (const ex of filtered) {
      const list = byMuscle.get(ex.muscle_group_id) ?? [];
      list.push(ex);
      byMuscle.set(ex.muscle_group_id, list);
    }
    return muscleGroups
      .map((mg) => ({ mg, items: byMuscle.get(mg.id) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [exercises, muscleGroups, filter, search]);

  return (
    <div style={styles.page}>
      <div style={styles.headerBlock}>
        <h1 style={styles.title}>Training</h1>
        <TrainingTabs />
      </div>

      <input
        style={styles.search}
        placeholder="Search exercises…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.chipRow}>
        <button
          style={{ ...styles.chip, ...(filter === 'all' ? styles.chipActive : {}) }}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {muscleGroups.map((mg) => (
          <button
            key={mg.id}
            style={{ ...styles.chip, ...(filter === mg.id ? styles.chipActive : {}) }}
            onClick={() => setFilter(mg.id)}
          >
            {mg.name}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {groups.length === 0 && <p style={styles.empty}>No exercises match.</p>}
        {groups.map(({ mg, items }) => (
          <div key={mg.id} style={styles.group}>
            <div style={styles.groupHeader}>{mg.name}</div>
            {items.map((ex) => {
              const m = maxes.get(ex.id);
              return (
                <button
                  key={ex.id}
                  style={styles.card}
                  onClick={() => navigate(`/training/library/${ex.id}`)}
                >
                  <div style={styles.cardName}>{ex.name}</div>
                  {m ? (
                    <div style={styles.cardMax}>
                      MAX: {formatWeight(toKg(m.weight, m.weight_unit), m.weight_unit)} × {m.reps}
                    </div>
                  ) : (
                    <div style={styles.cardEmpty}>No history yet</div>
                  )}
                  <span style={styles.chevron}>›</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '16px', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' },
  headerBlock: { display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--text)' },
  search: { padding: '9px 12px', borderRadius: 'var(--radius)', fontSize: '14px', width: '100%' },
  chipRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chip: {
    padding: '6px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  chipActive: {
    background: 'var(--purple)',
    color: '#0a0a0c',
    borderColor: 'var(--purple)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  group: { display: 'flex', flexDirection: 'column', gap: '6px' },
  groupHeader: { fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  card: {
    position: 'relative',
    padding: '12px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    textAlign: 'left',
    width: '100%',
  },
  cardName: { fontSize: '15px', color: 'var(--text)', fontWeight: 600 },
  cardMax: { fontSize: '12px', color: 'var(--cyan)', marginTop: '2px' },
  cardEmpty: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  chevron: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--text-muted)' },
  empty: { color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' },
};
