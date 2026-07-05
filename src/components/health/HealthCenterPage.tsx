import { useState } from 'react';
import SleepDebtChart from '../custom/SleepDebtChart';
import WeightLossChart from '../custom/WeightLossChart';

type Tab = 'sleep-debt' | 'weight-loss';

const TABS: { id: Tab; label: string }[] = [
  { id: 'sleep-debt',  label: 'Sleep debt'  },
  { id: 'weight-loss', label: 'Weight loss' },
];

export default function HealthCenterPage() {
  const [active, setActive] = useState<Tab>('sleep-debt');

  return (
    <div style={styles.page}>
      <nav style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.tab,
              color: active === t.id ? 'var(--purple)' : 'var(--text-muted)',
              borderBottom: active === t.id ? '2px solid var(--purple)' : '2px solid transparent',
            }}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={styles.content}>
        {active === 'sleep-debt'  && <SleepDebtChart />}
        {active === 'weight-loss' && <WeightLossChart />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  tab: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  content: { flex: 1, overflowY: 'auto', padding: '16px' },
};
