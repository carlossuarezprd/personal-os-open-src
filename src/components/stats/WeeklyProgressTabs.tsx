import { useState } from 'react';
import SleepDashboard from '../progress/SleepDashboard';
import BodyDashboard from '../progress/BodyDashboard';
import NutritionDashboard from '../progress/NutritionDashboard';
import ActivityDashboard from '../progress/ActivityDashboard';
import TrainingDashboard from '../progress/TrainingDashboard';
import type { RangeWeeks } from '../../hooks/useProgressData';

type SubTab = 'sleep' | 'weight' | 'nutrition' | 'activity' | 'training';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'sleep',     label: 'Sleep'     },
  { id: 'weight',    label: 'Weight'    },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'activity',  label: 'Activity'  },
  { id: 'training',  label: 'Training'  },
];

const RANGES: { value: RangeWeeks; label: string }[] = [
  { value: 4,     label: '4w'  },
  { value: 12,    label: '12w' },
  { value: 26,    label: '26w' },
  { value: 52,    label: '1y'  },
  { value: 'all', label: 'All' },
];

export default function WeeklyProgressTabs() {
  const [active, setActive] = useState<SubTab>('sleep');
  const [range, setRange] = useState<RangeWeeks>(12);

  return (
    <div>
      <nav style={styles.subTabs}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.subTab,
              color: active === t.id ? 'var(--purple)' : 'var(--text-muted)',
              borderBottom: active === t.id ? '2px solid var(--purple)' : '2px solid transparent',
            }}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={styles.rangeRow}>
        {RANGES.map(r => (
          <button
            key={String(r.value)}
            style={{
              ...styles.rangeBtn,
              background: range === r.value ? 'var(--surface2)' : 'transparent',
              color: range === r.value ? 'var(--purple)' : 'var(--text-muted)',
              fontWeight: range === r.value ? 700 : 400,
            }}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {active === 'sleep'     && <SleepDashboard     range={range} />}
      {active === 'weight'    && <BodyDashboard      range={range} />}
      {active === 'nutrition' && <NutritionDashboard range={range} />}
      {active === 'activity'  && <ActivityDashboard  range={range} />}
      {active === 'training'  && <TrainingDashboard  range={range} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  subTabs: {
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    borderBottom: '1px solid var(--border)',
    marginBottom: '12px',
    gap: '4px',
  },
  subTab: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  rangeRow: { display: 'flex', gap: '4px', marginBottom: '12px' },
  rangeBtn: { padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.1s' },
};
