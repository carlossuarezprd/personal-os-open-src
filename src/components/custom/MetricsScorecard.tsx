import { useMemo, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDailyData, mondayOf, computeDayDeficit } from '../../hooks/useProgressData';
import { useSettings } from '../../hooks/useSettings';
import { dailySchema } from '../logging/schema';
import type { ThresholdDef } from '../../types/database';

// All numeric daily items (non-computed)
const NUMERIC_DAILY = dailySchema.sections.flatMap(s =>
  s.items
    .filter(i => i.type === 'number_decimal' || i.type === 'number_integer')
    .map(i => ({ id: i.id, label: i.label }))
);
// Count-based tick items
const COUNT_ITEMS = [
  { id: 'd_strength', label: 'Strength training' },
  { id: 'd_sauna',    label: 'Sauna' },
];

function computeDayCalsBurned(daily: Record<string, boolean | number | null>): number | null {
  const steps = typeof daily['d_steps'] === 'number' ? daily['d_steps'] as number : null;
  const trainCals = typeof daily['d_training_cals'] === 'number' ? daily['d_training_cals'] as number : null;
  if (steps == null && trainCals == null) return null;
  return 46 * (steps ?? 0) + 2300 + (trainCals ?? 0);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const LS_KEY = 'kpi_order';
const LS_HIDDEN = 'kpi_hidden';
function loadOrder(): string[] | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
}
function saveOrder(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}
function loadHidden(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_HIDDEN) ?? '[]'); } catch { return []; }
}
function saveHidden(ids: string[]) {
  localStorage.setItem(LS_HIDDEN, JSON.stringify(ids));
}

interface EditState { id: string; value: string }
interface Row { id: string; label: string; avg: number | null; threshold: ThresholdDef | undefined; onTrack: boolean | null; isCount: boolean; n: number }

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({ row, editing, manageMode, hidden, onEdit, onSave, onToggleDir, onToggleHidden }: {
  row: Row;
  editing: EditState | null;
  manageMode: boolean;
  hidden: boolean;
  onEdit: (id: string, val: string) => void;
  onSave: (id: string, val: string, threshold: ThresholdDef | undefined) => void;
  onToggleDir: (id: string, threshold: ThresholdDef | undefined) => void;
  onToggleHidden: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const { id, label, avg, threshold, onTrack, isCount, n } = row;
  const isEditing = editing?.id === id;

  const dispAvg = avg == null ? '—'
    : isCount ? `${avg} days`
    : avg % 1 === 0 ? String(avg) : avg.toFixed(1);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.row,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : hidden ? 0.4 : 1,
        background: isDragging ? 'var(--surface2)' : undefined,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={styles.handle}
        title="Drag to reorder"
      >⠿</span>

      <span style={styles.colLabel}>{label}</span>

      <span style={{ ...styles.colAvg, color: onTrack === true ? 'var(--green)' : onTrack === false ? 'var(--coral)' : 'var(--text)' }}>
        {dispAvg}
        {avg != null && !isCount && n < 7 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 4 }}>({n}d)</span>
        )}
      </span>

      <span style={styles.colTarget}>
        {isEditing ? (
          <input
            autoFocus
            type="number"
            step="any"
            value={editing!.value}
            onChange={e => onEdit(id, e.target.value)}
            onBlur={() => { onSave(id, editing!.value, threshold); }}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') onEdit('', '');
            }}
            style={styles.input}
          />
        ) : (
          <button style={styles.targetBtn} onClick={() => onEdit(id, String(threshold?.value ?? ''))}>
            {threshold
              ? (isCount ? `${threshold.value} days` : String(threshold.value))
              : <span style={{ color: 'var(--text-muted)' }}>set</span>}
          </button>
        )}
      </span>

      <span style={styles.colDir}>
        {threshold && !isCount && (
          <button
            style={{ ...styles.dirBtn, color: threshold.direction === 'min' ? 'var(--cyan)' : 'var(--yellow)' }}
            onClick={() => onToggleDir(id, threshold)}
          >
            {threshold.direction === 'min' ? '≥' : '≤'}
          </button>
        )}
      </span>

      <span style={styles.colStatus}>
        {manageMode ? (
          <button
            style={styles.eyeBtn}
            onClick={() => onToggleHidden(id)}
            title={hidden ? 'Show in scorecard' : 'Hide from scorecard'}
          >
            {hidden ? '⊘' : '👁'}
          </button>
        ) : (
          <>
            {onTrack === true  && <span style={{ color: 'var(--green)',  fontSize: 14 }}>✓</span>}
            {onTrack === false && <span style={{ color: 'var(--coral)', fontSize: 14 }}>✗</span>}
          </>
        )}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MetricsScorecard() {
  const { days, loading: daysLoading } = useDailyData();
  const { settings, loading: setLoading, update } = useSettings();
  const today = new Date().toISOString().slice(0, 10);
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [editing, setEditing] = useState<EditState | null>(null);
  const [order, setOrder] = useState<string[]>(() => loadOrder() ?? []);
  const [hidden, setHidden] = useState<string[]>(() => loadHidden());
  const [manageMode, setManageMode] = useState(false);
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const weekEnd = addDays(weekStart, 6);

  const weekDays = useMemo(
    () => days.filter(d => d.date >= weekStart && d.date <= weekEnd),
    [days, weekStart, weekEnd]
  );
  const loggedDays = useMemo(
    () => weekDays.filter(d => Object.values(d.daily).some(v => v !== null && v !== undefined)),
    [weekDays]
  );

  const thresholds = settings?.thresholds ?? {};

  const allRows: Row[] = useMemo(() => [
    ...NUMERIC_DAILY.map(({ id, label }) => {
      const vals = loggedDays.map(d => d.daily[id]).filter((v): v is number => typeof v === 'number');
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      const threshold = thresholds[id];
      const onTrack = avg == null || !threshold ? null : threshold.direction === 'min' ? avg >= threshold.value : avg <= threshold.value;
      return { id, label, avg, threshold, onTrack, isCount: false, n: vals.length };
    }),
    ...COUNT_ITEMS.map(({ id, label }) => {
      const count = weekDays.filter(d => d.daily[id] === true).length;
      const threshold = thresholds[id];
      return { id, label, avg: count, threshold, onTrack: !threshold ? null : count >= threshold.value, isCount: true, n: weekDays.length };
    }),
    ...[
      { id: 'd_cals_burned', label: 'Calories burned', compute: (d: typeof loggedDays[0]) => computeDayCalsBurned(d.daily) },
      { id: 'd_cal_deficit', label: 'Calorie deficit', compute: (d: typeof loggedDays[0]) => computeDayDeficit(d.daily) },
    ].map(({ id, label, compute }) => {
      const vals = loggedDays.map(compute).filter((v): v is number => v !== null);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      const threshold = thresholds[id];
      const onTrack = avg == null || !threshold ? null : threshold.direction === 'min' ? avg >= threshold.value : avg <= threshold.value;
      return { id, label, avg, threshold, onTrack, isCount: false, n: vals.length };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [loggedDays, weekDays, JSON.stringify(thresholds)]);

  // Apply saved order; new items appear at the end
  const orderedRows = useMemo(() => {
    if (order.length === 0) return allRows;
    const byId = Object.fromEntries(allRows.map(r => [r.id, r]));
    const ordered = order.filter(id => byId[id]).map(id => byId[id]);
    const newItems = allRows.filter(r => !order.includes(r.id));
    return [...ordered, ...newItems];
  }, [allRows, order]);

  // In normal mode, hide rows the user has hidden. In manage mode, show all so they can toggle.
  const rows = useMemo(
    () => manageMode ? orderedRows : orderedRows.filter(r => !hiddenSet.has(r.id)),
    [orderedRows, manageMode, hiddenSet]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex(r => r.id === active.id);
    const newIndex = rows.findIndex(r => r.id === over.id);
    const newRows = arrayMove(rows, oldIndex, newIndex);
    const newOrder = newRows.map(r => r.id);
    setOrder(newOrder);
    saveOrder(newOrder);
  }

  function saveThreshold(id: string, rawValue: string, existing: ThresholdDef | undefined) {
    const val = parseFloat(rawValue);
    if (isNaN(val)) return;
    const updated: ThresholdDef = existing ? { ...existing, value: val } : { value: val, direction: 'min' };
    update({ thresholds: { ...thresholds, [id]: updated } });
  }

  function toggleDirection(id: string, existing: ThresholdDef | undefined) {
    if (!existing) return;
    update({ thresholds: { ...thresholds, [id]: { ...existing, direction: existing.direction === 'min' ? 'max' : 'min' } } });
  }

  function toggleHidden(id: string) {
    const next = hiddenSet.has(id) ? hidden.filter(h => h !== id) : [...hidden, id];
    setHidden(next);
    saveHidden(next);
  }

  if (daysLoading || setLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  return (
    <div>
      {/* Week navigator */}
      <div style={styles.weekNav}>
        <button style={styles.navBtn} onClick={() => setWeekStart(prev => addDays(prev, -7))}>‹</button>
        <div style={styles.weekLabel}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{weekStart} – {weekEnd}</span>
          {weekEnd >= today && <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>in progress · {loggedDays.length} days logged</span>}
        </div>
        <button
          style={{ ...styles.navBtn, opacity: weekEnd >= today ? 0.3 : 1, cursor: weekEnd >= today ? 'default' : 'pointer' }}
          onClick={() => { if (weekEnd < today) setWeekStart(prev => addDays(prev, 7)); }}
        >›</button>
      </div>

      {/* Manage toggle */}
      <div style={styles.manageRow}>
        <button
          style={{ ...styles.manageBtn, color: manageMode ? 'var(--purple)' : 'var(--text-muted)', borderColor: manageMode ? 'var(--purple)' : 'var(--border)' }}
          onClick={() => setManageMode(m => !m)}
        >
          {manageMode ? 'Done' : 'Manage'}
        </button>
        {hidden.length > 0 && !manageMode && (
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{hidden.length} hidden</span>
        )}
      </div>

      <div style={styles.table}>
        {/* Header */}
        <div style={{ ...styles.row, ...styles.header }}>
          <span style={{ width: 20 }} />
          <span style={styles.colLabel}>Metric</span>
          <span style={styles.colAvg}>Week avg</span>
          <span style={styles.colTarget}>Target</span>
          <span style={styles.colDir}>Dir</span>
          <span style={styles.colStatus} />
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            {rows.map(row => (
              <SortableRow
                key={row.id}
                row={row}
                editing={editing}
                manageMode={manageMode}
                hidden={hiddenSet.has(row.id)}
                onEdit={(id, val) => setEditing(id ? { id, value: val } : null)}
                onSave={(id, val, threshold) => { saveThreshold(id, val, threshold); setEditing(null); }}
                onToggleDir={toggleDirection}
                onToggleHidden={toggleHidden}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 12 }}>
        Drag ⠿ to reorder · tap target to edit · tap ≥/≤ to flip direction
        {manageMode && ' · tap 👁/⊘ to show/hide'}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  weekNav:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  navBtn:    { width: 32, height: 32, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 13 },
  table:     { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  row:       { display: 'grid', gridTemplateColumns: '20px 1fr 80px 72px 32px 24px', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--border)' },
  header:    { background: 'var(--surface2)', padding: '7px 14px' },
  handle:    { color: 'var(--text-muted)', fontSize: 16, cursor: 'grab', touchAction: 'none', userSelect: 'none', lineHeight: 1 },
  colLabel:  { fontSize: 13, color: 'var(--text)' },
  colAvg:    { fontSize: 13, fontWeight: 600, textAlign: 'right' as const },
  colTarget: { fontSize: 13, textAlign: 'right' as const },
  colDir:    { fontSize: 14, textAlign: 'center' as const },
  colStatus: { fontSize: 14, textAlign: 'center' as const },
  targetBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple)', fontSize: 13, fontWeight: 600, padding: 0, textDecoration: 'underline dotted', width: '100%', textAlign: 'right' as const },
  dirBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: 0 },
  input:     { width: 60, background: 'var(--surface2)', border: '1px solid var(--purple)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 12, padding: '2px 4px', outline: 'none', textAlign: 'right' as const },
  manageRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  manageBtn: { background: 'var(--surface)', border: '1px solid', borderRadius: 'var(--radius)', padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  eyeBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0, color: 'var(--text-muted)' },
};
