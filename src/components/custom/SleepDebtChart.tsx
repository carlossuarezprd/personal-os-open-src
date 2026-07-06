import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import ChartCard, { axisProps } from '../progress/ChartCard';
import { useDailyData } from '../../hooks/useProgressData';
import { useSettings } from '../../hooks/useSettings';

function fmtMinHM(min: number): string {
  const sign = min < 0 ? '-' : min > 0 ? '+' : '';
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

type Range = 90 | 180 | 365 | 'all';
const RANGES: { value: Range; label: string }[] = [
  { value: 90,    label: '90d'  },
  { value: 180,   label: '6m'   },
  { value: 365,   label: '1y'   },
  { value: 'all', label: 'All'  },
];

export default function SleepDebtChart() {
  const { days, loading: daysLoading } = useDailyData();
  const { settings, loading: setLoading, update } = useSettings();
  const [range, setRange] = useState<Range>(90);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const chartData = useMemo(() => {
    if (!settings) return [];
    const target = settings.sleep_target_hours;

    // Filter to range
    let filtered = days;
    if (range !== 'all' && days.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - range);
      filtered = days.filter(d => new Date(d.date + 'T12:00:00') >= cutoff);
    }

    // Compute cumulative delta in minutes
    let cum = 0;
    return filtered.map(d => {
      const sleep = typeof d.daily['d_hours_sleep'] === 'number' ? d.daily['d_hours_sleep'] as number : null;
      const delta = sleep != null ? (sleep - target) * 60 : 0;
      cum += delta;
      return {
        date: d.date,
        label: d.date.slice(5),
        cum: Math.round(cum),
        delta: sleep != null ? Math.round(delta) : null,
      };
    });
  }, [days, settings, range]);

  if (daysLoading || setLoading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;
  if (chartData.length === 0) return <p style={{ color: 'var(--text-mid)', textAlign: 'center', padding: '20px 0' }}>No data yet</p>;

  const maxVal = Math.max(...chartData.map(d => d.cum), 0);
  const minVal = Math.min(...chartData.map(d => d.cum), 0);
  const totalRange = maxVal - minVal;
  // Where 0 sits as a fraction from top (y=1 in gradient coords)
  const zeroFraction = totalRange === 0 ? 0.5 : maxVal / totalRange;

  const currentDebt = chartData[chartData.length - 1]?.cum ?? 0;

  return (
    <div>
      <div style={styles.summary}>
        <span style={{ color: currentDebt >= 0 ? 'var(--blue)' : 'var(--clay)', fontWeight: 700, fontSize: 20 }}>
          {fmtMinHM(currentDebt)}
        </span>
        <span style={{ color: 'var(--text-mid)', fontSize: 13, marginLeft: 8 }}>
          {currentDebt >= 0 ? 'surplus' : 'debt'} · target{' '}
        </span>
        {editingTarget ? (
          <input
            autoFocus
            type="number"
            step="any"
            min="4"
            max="12"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            onBlur={() => {
              const val = parseFloat(targetInput);
              if (!isNaN(val) && val >= 4 && val <= 12) update({ sleep_target_hours: val });
              setEditingTarget(false);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditingTarget(false);
            }}
            style={styles.targetInput}
          />
        ) : (
          <button
            style={styles.targetBtn}
            onClick={() => { setTargetInput(String(settings?.sleep_target_hours ?? 7.5)); setEditingTarget(true); }}
          >
            {settings?.sleep_target_hours}h/night ✎
          </button>
        )}
      </div>

      <div style={styles.rangeRow}>
        {RANGES.map(r => (
          <button
            key={String(r.value)}
            style={{ ...styles.rangeBtn, background: range === r.value ? 'var(--surface-2)' : 'transparent', color: range === r.value ? 'var(--text-hi)' : 'var(--text-low)', fontWeight: range === r.value ? 700 : 400 }}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ChartCard title="Cumulative sleep debt / surplus" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset={zeroFraction} stopColor="var(--blue)" stopOpacity={0.45} />
              <stop offset={zeroFraction} stopColor="var(--clay)" stopOpacity={0.45} />
            </linearGradient>
            <linearGradient id="sleepStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={zeroFraction} stopColor="var(--blue)" stopOpacity={1} />
              <stop offset={zeroFraction} stopColor="var(--clay)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
          <YAxis
            {...axisProps}
            width={56}
            tickFormatter={(v: number) => fmtMinHM(v)}
          />
          <ReferenceLine y={0} stroke="var(--hairline)" strokeDasharray="4 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-chip)', padding: '8px 12px', fontSize: 12 }}>
                  <div style={{ color: 'var(--text-mid)', marginBottom: 4 }}>{d.date}</div>
                  <div style={{ color: d.cum >= 0 ? 'var(--blue)' : 'var(--clay)', fontWeight: 600 }}>
                    {fmtMinHM(d.cum)} cumulative {d.cum >= 0 ? '(surplus)' : '(debt)'}
                  </div>
                  {d.delta != null && (
                    <div style={{ color: 'var(--text-mid)' }}>
                      Today: {fmtMinHM(d.delta)}
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="cum"
            stroke="url(#sleepStroke)"
            strokeWidth={2}
            fill="url(#sleepGradient)"
            dot={false}
            isAnimationActive={false}
            baseValue={0}
          />
        </AreaChart>
      </ChartCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  summary: { marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  targetBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontSize: 13, fontWeight: 600, padding: '0 2px', textDecoration: 'underline dotted' },
  targetInput: { width: 56, background: 'var(--surface-2)', border: '1px solid var(--teal)', borderRadius: 'var(--r-chip)', color: 'var(--text-hi)', fontSize: 13, padding: '2px 6px', outline: 'none' },
  rangeRow: { display: 'flex', gap: '4px', marginBottom: '12px' },
  rangeBtn: { padding: '4px 10px', borderRadius: 'var(--r-chip)', fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.1s' },
};
