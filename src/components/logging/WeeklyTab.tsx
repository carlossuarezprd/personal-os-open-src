import { weeklySchema } from './schema';
import NumericCell from '../ui/NumericCell';
import type { useDailyLog } from '../../hooks/useDailyLog';

type LogProps = ReturnType<typeof useDailyLog> & { date: string };

export default function WeeklyTab({ get, setValue, resetTab }: LogProps) {
  // Weekly schema has one numeric item (w_weight) — render it inline
  return (
    <div>
      {weeklySchema.sections.map(section => (
        <div key={section.title}>
          <div style={styles.sectionTitle}>{section.title}</div>
          {section.items.map(item => {
            if (item.type === 'tick') {
              const checked = get('weekly', item.id) === true;
              return (
                <button
                  key={item.id}
                  onClick={() => setValue('weekly', item.id, !checked)}
                  style={{
                    ...styles.row,
                    background: checked ? 'rgba(79,182,188,.08)' : 'transparent',
                  }}
                  aria-pressed={checked}
                >
                  <span style={{ ...styles.check, color: checked ? 'var(--teal)' : 'var(--text-low)'}}>
                    {checked ? '✓' : '○'}
                  </span>
                  <span style={styles.labelWrap}>
                    <span style={{ color: checked ? 'var(--text-hi)' : 'var(--text-mid)' }}>{item.label}</span>
                    {item.note && <span style={styles.note}>{item.note}</span>}
                  </span>
                </button>
              );
            }
            if (item.type === 'number_decimal' || item.type === 'number_integer') {
              return (
                <div key={item.id} style={styles.numRow}>
                  <span style={styles.numLabel}>
                    {item.label}
                    {item.note && <span style={styles.note}> ({item.note})</span>}
                  </span>
                  <NumericCell
                    value={get('weekly', item.id) as number | null}
                    onChange={v => setValue('weekly', item.id, v)}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
      <button style={styles.resetBtn} onClick={() => resetTab('weekly')}>Reset weekly</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: 'var(--text-low)',
    padding: '16px 16px 6px',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    borderRadius: 'var(--r-chip)',
    textAlign: 'left',
    border: 'none',
    transition: 'background 0.12s',
  },
  check: {
    fontSize: '18px',
    lineHeight: 1,
    marginTop: '1px',
    flexShrink: 0,
  },
  labelWrap: { display: 'flex', flexDirection: 'column', gap: '2px' },
  note: { fontSize: '11px', color: 'var(--text-mid)', lineHeight: 1.4 },
  numRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
  },
  numLabel: { fontSize: '15px', color: 'var(--text-mid)' },
  resetBtn: {
    display: 'block',
    margin: '24px auto 0',
    padding: '8px 20px',
    fontSize: '12px',
    color: 'var(--text-low)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-pill)',
  },
};
