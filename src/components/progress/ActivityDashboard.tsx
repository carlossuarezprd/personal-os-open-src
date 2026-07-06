import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import ChartCard, { axisProps, ChartTooltip, noData, SoftGrid } from './ChartCard';
import { useDailyData, groupByWeek, weekAvg, weekCount, filterWeeks, type RangeWeeks } from '../../hooks/useProgressData';

const VIEWS = ['Steps', 'Strength', 'Sauna'] as const;
type View = typeof VIEWS[number];

export default function ActivityDashboard({ range }: { range: RangeWeeks }) {
  const { days, loading } = useDailyData();
  const [view, setView] = useState<View>('Steps');
  if (loading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;

  const weeks = filterWeeks(groupByWeek(days), range);
  if (weeks.length === 0) return noData();

  const allData = weeks.map(w => ({
    label: w.weekStart.slice(5),
    steps: weekAvg(w.days, 'd_steps'),
    strength: weekCount(w.days, 'd_strength'),
    sauna: weekCount(w.days, 'd_sauna'),
  }));

  const stepsData = allData.filter(d => d.steps != null);
  const strengthData = allData.filter(d => d.strength > 0);
  const saunaData = allData.filter(d => d.sauna > 0);

  return (
    <div>
      <div style={styles.toggle}>
        {VIEWS.map(v => (
          <button key={v} style={{ ...styles.toggleBtn, background: view === v ? 'var(--surface-2)' : 'transparent', color: view === v ? 'var(--text-hi)' : 'var(--text-low)' }} onClick={() => setView(v)}>{v}</button>
        ))}
      </div>

      {view === 'Steps' && (stepsData.length === 0 ? noData() : (
        <ChartCard title="Steps (weekly avg, thousands)">
          <LineChart data={stepsData}>
            <SoftGrid />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} unit="k" />
            <Tooltip content={<ChartTooltip unit="k" />} />
            <Line dataKey="steps" name="Steps" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ChartCard>
      ))}
      {view === 'Strength' && (strengthData.length === 0 ? noData() : (
        <ChartCard title="Strength sessions per week">
          <LineChart data={strengthData}>
            <SoftGrid />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit=" days" />} />
            <Line dataKey="strength" name="Strength" stroke="var(--teal)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ChartCard>
      ))}
      {view === 'Sauna' && (saunaData.length === 0 ? noData() : (
        <ChartCard title="Sauna sessions per week">
          <LineChart data={saunaData}>
            <SoftGrid />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit=" days" />} />
            <Line dataKey="sauna" name="Sauna" stroke="var(--clay)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ChartCard>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggle: { display: 'flex', gap: '6px', marginBottom: '12px' },
  toggleBtn: { padding: '5px 14px', borderRadius: 'var(--r-chip)', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
