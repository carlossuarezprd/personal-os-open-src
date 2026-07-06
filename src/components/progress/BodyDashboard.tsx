import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import ChartCard, { axisProps, ChartTooltip, noData, SoftGrid } from './ChartCard';
import { useDailyData, groupByWeek, filterWeeks, type RangeWeeks } from '../../hooks/useProgressData';

export default function BodyDashboard({ range }: { range: RangeWeeks }) {
  const { days, loading } = useDailyData();
  if (loading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;

  const weeks = filterWeeks(groupByWeek(days), range);
  if (weeks.length === 0) return noData();

  const data = weeks.map(w => {
    // w_weight is in the weekly column — take the value if any day of the week has it
    const vals = w.days
      .map(d => d.weekly?.['w_weight'])
      .filter((v): v is number => typeof v === 'number');
    return { label: w.weekStart.slice(5), weight: vals.length ? vals[vals.length - 1] : null };
  }).filter(d => d.weight != null);

  if (data.length === 0) return noData();

  return (
    <ChartCard title="Weight (kg)">
      <LineChart data={data}>
        <SoftGrid />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} unit="kg" domain={['auto', 'auto']} />
        <Tooltip content={<ChartTooltip unit="kg" />} />
        <Line dataKey="weight" name="Weight" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3, fill: 'var(--blue)' }} connectNulls />
      </LineChart>
    </ChartCard>
  );
}
