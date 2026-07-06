import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ChartCard, { axisProps, noData, SoftGrid } from './ChartCard';
import { useTrainingData, isoWeekKey, type RangeWeeks } from '../../hooks/useProgressData';
import { toKg } from '../../lib/maxCalc';

const VIEWS = ['Sessions', 'Volume'] as const;
type View = typeof VIEWS[number];

// Data viz stays in the cool, equal-lightness accent family (blue-led)
const MUSCLE_COLORS = [
  'var(--blue)', 'var(--teal)', 'var(--green)', 'var(--blue-lite)',
  'var(--amber)', 'var(--clay)', 'var(--blue-deep)', 'var(--teal-deep)',
];

export default function TrainingDashboard({ range }: { range: RangeWeeks }) {
  const { sessions, loading } = useTrainingData();
  const [view, setView] = useState<View>('Sessions');
  if (loading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;
  if (sessions.length === 0) return noData();

  // Sessions per week
  const sessionsByWeek = new Map<string, number>();
  for (const s of sessions) {
    const key = isoWeekKey(s.session_date);
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1);
  }

  // Volume per week per muscle group
  const muscleNames = [...new Set(sessions.flatMap(s => s.sets.map(set => set.muscle_group)))].sort();
  const volumeByWeek = new Map<string, Record<string, number>>();
  for (const s of sessions) {
    const key = isoWeekKey(s.session_date);
    if (!volumeByWeek.has(key)) volumeByWeek.set(key, {});
    for (const set of s.sets) {
      const kg = toKg(set.weight, set.weight_unit as 'kg' | 'lbs');
      const vol = kg * set.reps;
      volumeByWeek.get(key)![set.muscle_group] = (volumeByWeek.get(key)![set.muscle_group] ?? 0) + vol;
    }
  }

  // Build week labels from daily data weeks (reuse same range logic)
  const allWeekKeys = [...new Set([...sessionsByWeek.keys(), ...volumeByWeek.keys()])].sort();
  const filteredKeys = range === 'all' ? allWeekKeys : allWeekKeys.slice(-range);

  const sessionData = filteredKeys.map(k => ({ label: k.slice(5), sessions: sessionsByWeek.get(k) ?? 0 }));
  const volumeData = filteredKeys.map(k => {
    const entry: Record<string, string | number> = { label: k.slice(5) };
    for (const m of muscleNames) entry[m] = Math.round((volumeByWeek.get(k)?.[m] ?? 0));
    return entry;
  });

  return (
    <div>
      <div style={styles.toggle}>
        {VIEWS.map(v => (
          <button key={v} style={{ ...styles.toggleBtn, background: view === v ? 'var(--surface-2)' : 'transparent', color: view === v ? 'var(--text-hi)' : 'var(--text-low)' }} onClick={() => setView(v)}>{v}</button>
        ))}
      </div>

      {view === 'Sessions' && (
        <ChartCard title="Training sessions per week">
          <LineChart data={sessionData}>
            <SoftGrid />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip />
            <Line dataKey="sessions" name="Sessions" stroke="var(--teal)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} connectNulls />
          </LineChart>
        </ChartCard>
      )}

      {view === 'Volume' && (
        <ChartCard title="Volume per muscle group (kg×reps)" height={260}>
          <LineChart data={volumeData}>
            <SoftGrid />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-mid)' }} />
            {muscleNames.map((m, i) => (
              <Line key={m} dataKey={m} name={m} stroke={MUSCLE_COLORS[i % MUSCLE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} connectNulls />
            ))}
          </LineChart>
        </ChartCard>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggle: { display: 'flex', gap: '6px', marginBottom: '12px' },
  toggleBtn: { padding: '5px 14px', borderRadius: 'var(--r-chip)', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
