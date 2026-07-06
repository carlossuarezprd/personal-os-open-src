import NumericCell from '../ui/NumericCell';
import TickItem from '../ui/TickItem';
import { dailySchema } from './schema';
import type { useDailyLog } from '../../hooks/useDailyLog';

type LogProps = ReturnType<typeof useDailyLog> & { date: string };

// ─── Computed field helpers ────────────────────────────────────────────────

function num(v: boolean | number | null): number | null {
  return typeof v === 'number' ? v : null;
}

function computedFields(log: ReturnType<typeof useDailyLog>['log']) {
  const d = log.daily as Record<string, boolean | number | null>;

  const hoursInBed  = num(d['d_hours_in_bed']);
  const hoursSleep  = num(d['d_hours_sleep']);
  const hoursRest   = num(d['d_hours_restorative']);
  const steps       = num(d['d_steps']);
  const trainCals   = num(d['d_training_cals']);
  const calsConsumed = num(d['d_cals_consumed']);

  const sleepEff = hoursSleep != null && hoursInBed != null && hoursInBed > 0
    ? (hoursSleep / hoursInBed) * 100 : null;

  const restEff = hoursRest != null && hoursSleep != null && hoursSleep > 0
    ? (hoursRest / hoursSleep) * 100 : null;

  const hasMovement = steps != null || trainCals != null;
  const calsBurned = hasMovement
    ? 46 * (steps ?? 0) + 2300 + (trainCals ?? 0)
    : null;

  const calDeficit = calsConsumed != null && calsBurned != null
    ? calsBurned - calsConsumed : null;

  return { sleepEff, restEff, calsBurned, calDeficit };
}

// ─── Computed display ──────────────────────────────────────────────────────

function pct(v: number | null) {
  if (v == null) return <span style={{ color: 'var(--text-mid)' }}>—</span>;
  const rounded = Math.round(v);
  return <span style={{ color: 'var(--blue)'}}>{rounded}%</span>;
}

function cals(v: number | null, signed = false) {
  if (v == null) return <span style={{ color: 'var(--text-mid)' }}>—</span>;
  const rounded = Math.round(v);
  const display = signed ? (rounded >= 0 ? `+${rounded}` : `${rounded}`) : String(rounded);
  return <span style={{ color: 'var(--blue)'}}>{display} kcal</span>;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function DailyTab({ get, setValue, resetTab, log }: LogProps) {
  const computed = computedFields(log);

  return (
    <div style={{ paddingBottom: 32 }}>
      {dailySchema.sections.map(section => (
        <div key={section.title}>
          <div style={styles.sectionTitle}>{section.title}</div>

          {section.items.map(item => {
            // ── Computed display rows ──
            if (item.type === 'computed') {
              let display: React.ReactNode = '—';
              if (item.id === 'd_sleep_efficiency_pct')      display = pct(computed.sleepEff);
              if (item.id === 'd_restorative_efficiency_pct') display = pct(computed.restEff);
              if (item.id === 'd_cals_burned')  display = cals(computed.calsBurned);
              if (item.id === 'd_cal_deficit')  display = cals(computed.calDeficit, true);
              return (
                <div key={item.id} style={styles.numRow}>
                  <span style={styles.numLabel}>{item.label}</span>
                  <span style={styles.computedValue}>{display}</span>
                </div>
              );
            }

            // ── Tick rows ──
            if (item.type === 'tick') {
              return (
                <TickItem
                  key={item.id}
                  label={item.label}
                  note={item.note}
                  checked={get('daily', item.id) === true}
                  onToggle={() => setValue('daily', item.id, get('daily', item.id) === true ? false : true)}
                />
              );
            }

            // ── Numeric rows ──
            return (
              <div key={item.id} style={styles.numRow}>
                <span style={styles.numLabel}>
                  {item.label}
                  {item.note && <span style={styles.note}> ({item.note})</span>}
                </span>
                <NumericCell
                  value={get('daily', item.id) as number | null}
                  onChange={v => setValue('daily', item.id, v)}
                />
              </div>
            );
          })}
        </div>
      ))}

      <button style={styles.resetBtn} onClick={() => resetTab('daily')}>Reset daily</button>
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
  numRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    minHeight: '44px',
  },
  numLabel: { fontSize: '15px', color: 'var(--text-mid)', flex: 1 },
  note: { fontSize: '11px' },
  computedValue: { fontSize: '15px', fontWeight: 600, minWidth: '80px', textAlign: 'right' },
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
