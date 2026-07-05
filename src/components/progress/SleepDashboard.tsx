import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ChartCard, { axisProps, ChartTooltip, noData, SoftGrid } from './ChartCard';
import { useDailyData, groupByWeek, weekAvg, filterWeeks, type RangeWeeks } from '../../hooks/useProgressData';

const VIEWS = ['Totals', 'Efficiency'] as const;

export default function SleepDashboard({ range }: { range: RangeWeeks }) {
  const { days, loading } = useDailyData();
  const [view, setView] = useState<'Totals' | 'Efficiency'>('Totals');

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  const weeks = filterWeeks(groupByWeek(days), range);
  if (weeks.length === 0) return noData();

  const allData = weeks.map(w => ({
    label: w.weekStart.slice(5),
    inBed:  weekAvg(w.days, 'd_hours_in_bed'),
    sleep:  weekAvg(w.days, 'd_hours_sleep'),
    restorative: weekAvg(w.days, 'd_hours_restorative'),
    sleepEff: (() => {
      const s = weekAvg(w.days, 'd_hours_sleep');
      const b = weekAvg(w.days, 'd_hours_in_bed');
      return s != null && b != null && b > 0 ? (s / b) * 100 : null;
    })(),
    restEff: (() => {
      const r = weekAvg(w.days, 'd_hours_restorative');
      const s = weekAvg(w.days, 'd_hours_sleep');
      return r != null && s != null && s > 0 ? (r / s) * 100 : null;
    })(),
  }));

  const totalsData = allData.filter(d => d.inBed != null || d.sleep != null || d.restorative != null);
  const effData = allData.filter(d => d.sleepEff != null || d.restEff != null);

  return (
    <div>
      <div style={styles.toggle}>
        {VIEWS.map(v => (
          <button key={v} style={{ ...styles.toggleBtn, background: view === v ? 'var(--surface2)' : 'transparent', color: view === v ? 'var(--purple)' : 'var(--text-muted)' }} onClick={() => setView(v)}>{v}</button>
        ))}
      </div>

      {view === 'Totals' ? (
        totalsData.length === 0 ? noData() : (
          <ChartCard title="Sleep hours (weekly avg)">
            <LineChart data={totalsData}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} unit="h" />
              <Tooltip content={<ChartTooltip unit="h" />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              <Line dataKey="inBed" name="In bed" stroke="var(--text-muted)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line dataKey="sleep" name="Sleep" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line dataKey="restorative" name="Restorative" stroke="var(--purple)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        )
      ) : (
        effData.length === 0 ? noData() : (
          <ChartCard title="Sleep efficiency (weekly avg)">
            <LineChart data={effData}>
              <SoftGrid />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} unit="%" domain={[0, 100]} />
              <Tooltip content={<ChartTooltip unit="%" />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              <Line dataKey="sleepEff" name="Sleep eff" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line dataKey="restEff" name="Restorative eff" stroke="var(--purple)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartCard>
        )
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggle: { display: 'flex', gap: '6px', marginBottom: '12px' },
  toggleBtn: { padding: '5px 14px', borderRadius: 'var(--radius)', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
