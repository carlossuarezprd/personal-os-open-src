import { useState } from 'react';
import MetricsScorecard from '../custom/MetricsScorecard';
import SlipFlag from '../custom/SlipFlag';
import WeeklyProgressTabs from './WeeklyProgressTabs';
import HabitAdherence from './HabitAdherence';

type TopTab = 'performance' | 'warnings' | 'progress' | 'adherence';

const TABS: { id: TopTab; label: string }[] = [
  { id: 'performance', label: 'Weekly performance' },
  { id: 'warnings',    label: 'Warnings'           },
  { id: 'progress',    label: 'Weekly progress'    },
  { id: 'adherence',   label: 'Habit adherence'    },
];

export default function StatsPage() {
  const [active, setActive] = useState<TopTab>('performance');

  return (
    <div style={styles.page}>
      <nav style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.tab,
              color: active === t.id ? 'var(--text-hi)' : 'var(--text-low)',
              borderBottom: active === t.id ? '2px solid var(--teal)' : '2px solid transparent',
            }}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={styles.content}>
        {active === 'performance' && <MetricsScorecard />}
        {active === 'warnings'    && <SlipFlag />}
        {active === 'progress'    && <WeeklyProgressTabs />}
        {active === 'adherence'   && <HabitAdherence />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  tabs: {
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    borderBottom: '1px solid var(--hairline)',
    flexShrink: 0,
  },
  tab: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  content: { flex: 1, overflowY: 'auto', padding: '16px' },
};
