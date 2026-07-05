import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import ChartCard, { axisProps, ChartTooltip, noData, SoftGrid } from './ChartCard';
import { useDailyData, groupByWeek, weekAvg, filterWeeks, computeDayDeficit, type RangeWeeks } from '../../hooks/useProgressData';

const VIEWS = ['Balance', 'Calories', 'Protein', 'Water', 'Caffeine'] as const;
type View = typeof VIEWS[number];

export default function NutritionDashboard({ range }: { range: RangeWeeks }) {
  const { days, loading } = useDailyData();
  const [view, setView] = useState<View>('Balance');
  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  const weeks = filterWeeks(groupByWeek(days), range);
  if (weeks.length === 0) return noData();

  const allData = weeks.map(w => {
    const deficits = w.days.map(d => computeDayDeficit(d.daily)).filter((v): v is number => v != null);
    const avgDeficit = deficits.length ? deficits.reduce((a, b) => a + b, 0) / deficits.length : null;
    // Balance = consumed - burned (negative = deficit / fat loss; positive = surplus)
    return {
      label: w.weekStart.slice(5),
      balance: avgDeficit != null ? -avgDeficit : null,
      calories: weekAvg(w.days, 'd_cals_consumed'),
      protein: weekAvg(w.days, 'd_protein'),
      water: weekAvg(w.days, 'd_water'),
      caffeine: weekAvg(w.days, 'd_caffeine'),
    };
  });

  function filterFor(key: 'balance' | 'calories' | 'protein' | 'water' | 'caffeine') {
    return allData.filter(d => d[key] != null);
  }

  return (
    <div>
      <div style={styles.toggle}>
        {VIEWS.map(v => (
          <button key={v} style={{ ...styles.toggleBtn, background: view === v ? 'var(--surface2)' : 'transparent', color: view === v ? 'var(--purple)' : 'var(--text-muted)' }} onClick={() => setView(v)}>{v}</button>
        ))}
      </div>

      {view === 'Balance' && (() => {
        const d = filterFor('balance');
        if (d.length === 0) return noData();
        return (
          <ChartCard title="Calorie balance (weekly avg · negative = deficit)">
            <LineChart data={d}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 3" />
              <Tooltip content={<ChartTooltip unit=" kcal" />} />
              <Line dataKey="balance" name="Balance" stroke="var(--purple)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        );
      })()}
      {view === 'Calories' && (() => {
        const d = filterFor('calories');
        if (d.length === 0) return noData();
        return (
          <ChartCard title="Calories consumed (weekly avg)">
            <LineChart data={d}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<ChartTooltip unit=" kcal" />} />
              <Line dataKey="calories" name="Calories" stroke="var(--yellow)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        );
      })()}
      {view === 'Protein' && (() => {
        const d = filterFor('protein');
        if (d.length === 0) return noData();
        return (
          <ChartCard title="Protein (weekly avg g/day)">
            <LineChart data={d}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} unit="g" />
              <Tooltip content={<ChartTooltip unit="g" />} />
              <Line dataKey="protein" name="Protein" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        );
      })()}
      {view === 'Water' && (() => {
        const d = filterFor('water');
        if (d.length === 0) return noData();
        return (
          <ChartCard title="Water (weekly avg L/day)">
            <LineChart data={d}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} unit="L" />
              <Tooltip content={<ChartTooltip unit="L" />} />
              <Line dataKey="water" name="Water" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        );
      })()}
      {view === 'Caffeine' && (() => {
        const d = filterFor('caffeine');
        if (d.length === 0) return noData();
        return (
          <ChartCard title="Caffeine (weekly avg mg/day)">
            <LineChart data={d}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} unit="mg" />
              <Tooltip content={<ChartTooltip unit="mg" />} />
              <Line dataKey="caffeine" name="Caffeine" stroke="var(--yellow)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        );
      })()}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggle: { display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' },
  toggleBtn: { padding: '5px 12px', borderRadius: 'var(--radius)', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
