import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import ChartCard, { axisProps, noData, SoftGrid } from '../progress/ChartCard';
import { useDailyData, groupByWeek, isoWeekKey, mondayOf } from '../../hooks/useProgressData';
import { computeGroupAdherenceRange, computeGroupAdherence, ADHERENCE_GROUPS } from '../../lib/adherenceCalc';

type RangeKind = 'week' | 'month' | 'year' | 'all' | 'custom';

const RANGES: { value: RangeKind; label: string }[] = [
  { value: 'week',   label: 'Week'     },
  { value: 'month',  label: 'Month'    },
  { value: 'year',   label: 'Year'     },
  { value: 'all',    label: 'All time' },
  { value: 'custom', label: 'Custom'   },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function adherenceColor(pct: number): string {
  if (pct >= 80) return 'var(--green)';
  if (pct >= 50) return 'var(--amber)';
  return 'var(--clay)';
}

export default function HabitAdherence() {
  const { days, loading } = useDailyData();
  const today = todayISO();
  const [rangeKind, setRangeKind] = useState<RangeKind>('week');
  const [customStart, setCustomStart] = useState(addDays(today, -30));
  const [customEnd, setCustomEnd] = useState(today);
  const [trendGroup, setTrendGroup] = useState(ADHERENCE_GROUPS[0].name);
  const [view, setView] = useState<'summary' | 'trend'>('summary');

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (rangeKind === 'all') return { rangeStart: '0000-01-01', rangeEnd: today };
    if (rangeKind === 'week')  return { rangeStart: addDays(today, -6),   rangeEnd: today };
    if (rangeKind === 'month') return { rangeStart: addDays(today, -29),  rangeEnd: today };
    if (rangeKind === 'year')  return { rangeStart: addDays(today, -364), rangeEnd: today };
    return { rangeStart: customStart, rangeEnd: customEnd };
  }, [rangeKind, customStart, customEnd, today]);

  const filteredDays = useMemo(
    () => days.filter(d => d.date >= rangeStart && d.date <= rangeEnd),
    [days, rangeStart, rangeEnd]
  );

  // Summary: per-group adherence over the range
  const summary = useMemo(() => {
    return ADHERENCE_GROUPS.map(g => {
      const r = computeGroupAdherenceRange(g, filteredDays, today);
      return { name: g.name, pct: Math.round(r.pct), num: r.numerator, den: r.denominator };
    });
  }, [filteredDays, today]);

  // Trend: per-week adherence for the selected group over the range
  const trendData = useMemo(() => {
    const weeks = groupByWeek(filteredDays);
    const g = ADHERENCE_GROUPS.find(x => x.name === trendGroup);
    if (!g) return [];
    return weeks.map(w => {
      // For weekly items, "complete" if the latest day in the week is strictly before today
      const weekDates = w.days.map(d => d.date);
      const last = weekDates.reduce((a, b) => (a > b ? a : b), weekDates[0] ?? '');
      const complete = today > last;
      const r = computeGroupAdherence(g, w.days, complete);
      return { label: w.weekStart.slice(5), pct: r.denominator > 0 ? Math.round(r.pct) : null };
    }).filter(d => d.pct != null);
  }, [filteredDays, trendGroup, today]);

  if (loading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;

  return (
    <div>
      {/* Range selector */}
      <div style={styles.rangeRow}>
        {RANGES.map(r => (
          <button
            key={r.value}
            style={{
              ...styles.rangeBtn,
              background: rangeKind === r.value ? 'var(--surface-2)' : 'transparent',
              color: rangeKind === r.value ? 'var(--text-hi)' : 'var(--text-low)',
              fontWeight: rangeKind === r.value ? 700 : 400,
            }}
            onClick={() => setRangeKind(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {rangeKind === 'custom' && (
        <div style={styles.customRow}>
          <label style={styles.dateLabel}>
            From
            <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)} style={styles.dateInput} />
          </label>
          <label style={styles.dateLabel}>
            To
            <input type="date" value={customEnd} min={customStart} max={today} onChange={e => setCustomEnd(e.target.value)} style={styles.dateInput} />
          </label>
        </div>
      )}

      <div style={styles.rangeSummary}>
        Showing <span style={{ color: 'var(--text-hi)' }}>{rangeStart === '0000-01-01' ? 'all data' : `${rangeStart} → ${rangeEnd}`}</span>
        {filteredDays.length > 0 && ` · ${filteredDays.length} days`}
      </div>

      {/* View toggle */}
      <div style={styles.viewRow}>
        <button style={{ ...styles.viewBtn, background: view === 'summary' ? 'var(--surface-2)' : 'transparent', color: view === 'summary' ? 'var(--text-hi)' : 'var(--text-low)' }} onClick={() => setView('summary')}>Summary</button>
        <button style={{ ...styles.viewBtn, background: view === 'trend' ? 'var(--surface-2)' : 'transparent', color: view === 'trend' ? 'var(--text-hi)' : 'var(--text-low)' }} onClick={() => setView('trend')}>Trend</button>
      </div>

      {filteredDays.length === 0 ? noData() : view === 'summary' ? (
        <ChartCard title="Adherence by group" height={Math.max(220, ADHERENCE_GROUPS.length * 32)}>
          <BarChart data={summary} layout="vertical" margin={{ left: 80, right: 20 }}>
            <SoftGrid />
            <XAxis type="number" domain={[0, 100]} {...axisProps} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-mid)', fontSize: 11 }} width={80} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: unknown) => [`${v}%`, 'Adherence']} />
            <Bar dataKey="pct" isAnimationActive={false} radius={[0, 4, 4, 0]}>
              {summary.map((d, i) => <Cell key={i} fill={adherenceColor(d.pct)} />)}
            </Bar>
          </BarChart>
        </ChartCard>
      ) : (
        <div>
          <div style={styles.groupPicker}>
            {ADHERENCE_GROUPS.map(g => (
              <button
                key={g.name}
                style={{ ...styles.groupBtn, background: trendGroup === g.name ? 'var(--surface-2)' : 'transparent', color: trendGroup === g.name ? 'var(--text-hi)' : 'var(--text-low)' }}
                onClick={() => setTrendGroup(g.name)}
              >
                {g.name}
              </button>
            ))}
          </div>
          {trendData.length === 0 ? noData() : (
            <ChartCard title={`${trendGroup} adherence — weekly`}>
              <LineChart data={trendData}>
                <SoftGrid />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v: unknown) => [`${v}%`]} />
                <Line dataKey="pct" name="Adherence" stroke="var(--teal)" strokeWidth={2} dot={{ r: 3, fill: 'var(--teal)' }} connectNulls />
              </LineChart>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}

// Silence unused-var warnings on optional helpers (keeps file changes minimal if reused later).
void mondayOf;
void isoWeekKey;

const styles: Record<string, React.CSSProperties> = {
  rangeRow:     { display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' },
  rangeBtn:     { padding: '5px 12px', borderRadius: 'var(--r-chip)', fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.1s' },
  customRow:    { display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' },
  dateLabel:    { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-mid)' },
  dateInput:    { padding: '5px 8px', fontSize: '13px', borderRadius: 'var(--r-chip)', color: 'var(--text-hi)', background: 'var(--surface-2)', border: '1px solid var(--hairline)' },
  rangeSummary: { fontSize: '12px', color: 'var(--text-mid)', marginBottom: '12px' },
  viewRow:      { display: 'flex', gap: '6px', marginBottom: '12px' },
  viewBtn:      { padding: '5px 14px', borderRadius: 'var(--r-chip)', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: 600 },
  groupPicker:  { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
  groupBtn:     { padding: '4px 10px', borderRadius: 'var(--r-chip)', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
