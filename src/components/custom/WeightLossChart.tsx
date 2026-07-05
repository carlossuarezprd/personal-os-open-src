import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import ChartCard, { axisProps } from '../progress/ChartCard';
import { useDailyData, computeDayDeficit } from '../../hooks/useProgressData';

type Range = 90 | 180 | 365 | 'all';
const RANGES: { value: Range; label: string }[] = [
  { value: 90,    label: '90d'  },
  { value: 180,   label: '6m'   },
  { value: 365,   label: '1y'   },
  { value: 'all', label: 'All'  },
];

export default function WeightLossChart() {
  const { days, loading } = useDailyData();
  const [range, setRange] = useState<Range>(90);

  const chartData = useMemo(() => {
    let filtered = days;
    if (range !== 'all' && days.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - range);
      filtered = days.filter(d => new Date(d.date + 'T12:00:00') >= cutoff);
    }

    // Balance = consumed - burned. Negative = deficit (fat loss); positive = surplus (fat gain).
    let cumBalance = 0;
    return filtered.map(d => {
      const deficit = computeDayDeficit(d.daily);
      const balance = deficit != null ? -deficit : 0;
      cumBalance += balance;
      return {
        date: d.date,
        label: d.date.slice(5),
        cum: Math.round(cumBalance),
        daily: deficit != null ? Math.round(-deficit) : null,
      };
    });
  }, [days, range]);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  if (chartData.length === 0) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No data yet</p>;

  // cum is signed: positive = surplus (gain), negative = deficit (loss)
  const totalKcal = chartData[chartData.length - 1]?.cum ?? 0;
  const lbsFat = (totalKcal / 3500).toFixed(1);
  const kgFat = (totalKcal / 7700).toFixed(1);

  const maxVal = Math.max(...chartData.map(d => d.cum), 0);
  const minVal = Math.min(...chartData.map(d => d.cum), 0);
  const totalRange = maxVal - minVal;
  // Surplus (positive) renders above zero in coral; deficit (negative) below in green.
  const zeroFraction = totalRange === 0 ? 0.5 : maxVal / totalRange;

  return (
    <div>
      {/* Running totals */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={{ color: totalKcal <= 0 ? 'var(--green)' : 'var(--coral)', fontWeight: 700, fontSize: 18 }}>
            {totalKcal >= 0 ? '+' : ''}{totalKcal.toLocaleString()} kcal
          </span>
          <span style={styles.statLabel}>{totalKcal <= 0 ? 'deficit' : 'surplus'}</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ color: Number(lbsFat) <= 0 ? 'var(--green)' : 'var(--coral)', fontWeight: 600, fontSize: 16 }}>
            {Number(lbsFat) >= 0 ? '+' : ''}{lbsFat} lbs
          </span>
          <span style={styles.statLabel}>fat</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ color: Number(kgFat) <= 0 ? 'var(--green)' : 'var(--coral)', fontWeight: 600, fontSize: 16 }}>
            {Number(kgFat) >= 0 ? '+' : ''}{kgFat} kg
          </span>
          <span style={styles.statLabel}>fat</span>
        </div>
      </div>

      <div style={styles.rangeRow}>
        {RANGES.map(r => (
          <button
            key={String(r.value)}
            style={{ ...styles.rangeBtn, background: range === r.value ? 'var(--surface2)' : 'transparent', color: range === r.value ? 'var(--purple)' : 'var(--text-muted)', fontWeight: range === r.value ? 700 : 400 }}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ChartCard title="Cumulative calorie balance (kcal · negative = deficit)" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset={zeroFraction} stopColor="var(--coral)" stopOpacity={0.45} />
              <stop offset={zeroFraction} stopColor="var(--green)" stopOpacity={0.45} />
            </linearGradient>
            <linearGradient id="weightStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={zeroFraction} stopColor="var(--coral)" stopOpacity={1} />
              <stop offset={zeroFraction} stopColor="var(--green)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
          <YAxis {...axisProps} width={56} />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              const cumIsLoss = d.cum <= 0;
              const dailyIsLoss = (d.daily ?? 0) <= 0;
              return (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 12 }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{d.date}</div>
                  <div style={{ color: cumIsLoss ? 'var(--green)' : 'var(--coral)', fontWeight: 600 }}>
                    {d.cum >= 0 ? '+' : ''}{d.cum.toLocaleString()} kcal cumulative
                  </div>
                  {d.daily != null && (
                    <div style={{ color: dailyIsLoss ? 'var(--green)' : 'var(--coral)' }}>
                      Today: {d.daily >= 0 ? '+' : ''}{d.daily.toLocaleString()} kcal
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="cum"
            stroke="url(#weightStroke)"
            strokeWidth={2}
            fill="url(#weightGradient)"
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
  statsRow: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  statLabel: { color: 'var(--text-muted)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, background: 'var(--border)', margin: '0 8px' },
  rangeRow: { display: 'flex', gap: '4px', marginBottom: '12px' },
  rangeBtn: { padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.1s' },
};
