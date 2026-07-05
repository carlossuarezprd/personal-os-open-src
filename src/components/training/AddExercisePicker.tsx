import { useState, useMemo } from 'react';
import { useTaxonomy, useAllExerciseMaxes } from '../../hooks/useTraining';
import type { MuscleGroup, Exercise } from '../../hooks/useTraining';
import { formatWeight, toKg } from '../../lib/maxCalc';

interface Props {
  onDone: (muscleGroupId: string, exerciseId: string, gymId: string) => void;
  onClose: () => void;
}

type Step = 'muscle' | 'exercise' | 'gym';

export default function AddExercisePicker({ onDone, onClose }: Props) {
  const { muscleGroups, exercises, gyms, createMuscleGroup, createExercise, createGym } = useTaxonomy();
  const { maxes } = useAllExerciseMaxes();
  const [step, setStep] = useState<Step>('muscle');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const filteredMuscles = useMemo(() =>
    muscleGroups.filter(m => m.name.toLowerCase().includes(search.toLowerCase())),
    [muscleGroups, search]);

  const filteredExercises = useMemo(() =>
    exercises
      .filter(e => e.muscle_group_id === selectedMuscle?.id)
      .filter(e => e.name.toLowerCase().includes(search.toLowerCase())),
    [exercises, selectedMuscle, search]);

  const filteredGyms = useMemo(() =>
    gyms.filter(g => g.name.toLowerCase().includes(search.toLowerCase())),
    [gyms, search]);

  function goToStep(s: Step) { setStep(s); setSearch(''); setCreating(false); setNewName(''); }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    if (step === 'muscle') {
      const mg = await createMuscleGroup(name);
      if (mg) { setSelectedMuscle(mg); goToStep('exercise'); }
    } else if (step === 'exercise' && selectedMuscle) {
      const ex = await createExercise(selectedMuscle.id, name);
      if (ex) { setSelectedExercise(ex); goToStep('gym'); }
    } else if (step === 'gym') {
      const gym = await createGym(name);
      if (gym && selectedMuscle && selectedExercise) onDone(selectedMuscle.id, selectedExercise.id, gym.id);
    }
  }

  const stepTitle = { muscle: 'Muscle group', exercise: 'Exercise', gym: 'Gym' }[step];
  const items = step === 'muscle' ? filteredMuscles : step === 'exercise' ? filteredExercises : filteredGyms;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        <div style={styles.handle} />

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          {selectedMuscle && (
            <button style={styles.crumb} onClick={() => goToStep('muscle')}>{selectedMuscle.name}</button>
          )}
          {selectedExercise && (
            <><span style={styles.crumbSep}>›</span>
            <button style={styles.crumb} onClick={() => goToStep('exercise')}>{selectedExercise.name}</button></>
          )}
        </div>

        <h2 style={styles.stepTitle}>{stepTitle}</h2>

        <input
          style={styles.search}
          placeholder={`Search ${stepTitle.toLowerCase()}…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div style={styles.list}>
          {items.map(item => {
            const prev = step === 'exercise' ? maxes.get(item.id) : null;
            return (
              <button
                key={item.id}
                style={styles.item}
                onClick={() => {
                  if (step === 'muscle') { setSelectedMuscle(item as MuscleGroup); goToStep('exercise'); }
                  else if (step === 'exercise') { setSelectedExercise(item as Exercise); goToStep('gym'); }
                  else if (step === 'gym' && selectedMuscle && selectedExercise) {
                    onDone(selectedMuscle.id, selectedExercise.id, item.id);
                  }
                }}
              >
                <div>{item.name}</div>
                {prev && (
                  <div style={styles.prevMax}>
                    Prev max: {formatWeight(toKg(prev.weight, prev.weight_unit), prev.weight_unit)} × {prev.reps}
                  </div>
                )}
              </button>
            );
          })}

          {/* Create new */}
          {creating ? (
            <div style={styles.createRow}>
              <input
                style={{ ...styles.search, flex: 1, marginBottom: 0 }}
                placeholder={`New ${stepTitle.toLowerCase()} name`}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <button style={styles.createBtn} onClick={handleCreate}>Add</button>
            </div>
          ) : (
            <button style={styles.createTrigger} onClick={() => setCreating(true)}>
              + Create new {stepTitle.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: '#0008', zIndex: 300, display: 'flex', alignItems: 'flex-end' },
  sheet: {
    background: 'var(--surface)',
    borderRadius: '16px 16px 0 0',
    padding: '12px 16px 32px',
    width: '100%',
    maxHeight: '80dvh',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  handle: { width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px', alignSelf: 'center', marginBottom: '4px' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },
  crumb: { fontSize: '13px', color: 'var(--purple)', fontWeight: 600 },
  crumbSep: { color: 'var(--text-muted)', fontSize: '13px' },
  stepTitle: { fontSize: '18px', fontWeight: 700, color: 'var(--text)' },
  search: { padding: '9px 12px', borderRadius: 'var(--radius)', fontSize: '15px', width: '100%', marginBottom: '4px' },
  list: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  item: {
    padding: '12px 14px',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius)',
    textAlign: 'left',
    fontSize: '15px',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  createRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  createBtn: { padding: '9px 16px', background: 'var(--purple)', color: '#0a0a0c', fontWeight: 700, borderRadius: 'var(--radius)', fontSize: '14px' },
  createTrigger: { padding: '12px 14px', color: 'var(--purple)', fontSize: '14px', fontWeight: 600, textAlign: 'left' },
  prevMax: { fontSize: '12px', color: 'var(--cyan)', marginTop: '2px', fontWeight: 500 },
};
