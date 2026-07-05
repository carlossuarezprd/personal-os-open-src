import { useMemo } from 'react';
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toKg, maxPerSession } from '../../lib/maxCalc';
import type { SetRow } from '../../hooks/useTraining';

interface Props {
  sets: (SetRow & { session_date: string })[];
  primaryUnit: 'kg' | 'lbs';
}

interface Point {
  date: number;
  weight: number;
  reps: number;
  dateLabel: string;
}

function CustomDot(props: { cx?: number; cy?: number; payload?: Point }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const r = Math.max(4, Math.min(11, payload.reps * 1.1));
  return <circle cx={cx} cy={cy} r={r} fill="var(--purple)" opacity={0.9} style={{ filter: 'drop-shadow(0 0 4px #39ff1488)' }} />;
}

export default function ProgressionChart({ sets, primaryUnit }: Props) {
  const points = useMemo((): Point[] => {
    const normalized = sets.map(s => ({ ...s, weight_unit: s.weight_unit as 'kg' | 'lbs' }));
    const bestPerDay = maxPerSession(normalized) as (SetRow & { session_date: string })[];
    return bestPerDay
      .sort((a, b) => a.session_date.localeCompare(b.session_date))
      .map(s => {
        const kg = toKg(s.weight, s.weight_unit as 'kg' | 'lbs');
        const display = primaryUnit === 'lbs' ? kg / 0.45359237 : kg;
        const d = new Date(s.session_date + 'T12:00:00');
        return {
          date: d.getTime(),
          weight: Math.round(display * 10) / 10,
          reps: s.reps,
          dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        };
      });
  }, [sets, primaryUnit]);

  if (points.length === 0) return (
    <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>
      No history yet
    </div>
  );

  const minDate = Math.min(...points.map(p => p.date));
  const maxDate = Math.max(...points.map(p => p.date));

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '12px' }}>
        <div style={{ color: 'var(--text-muted)' }}>{p.dateLabel}</div>
        <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{p.weight}{primaryUnit} × {p.reps}</div>
      </div>
    );
  }

  return (
    <div style={{ height: 200, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={[minDate - 86400000 * 2, maxDate + 86400000 * 2]}
            tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="weight"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Connecting line */}
          <Line
            dataKey="weight"
            stroke="var(--purple)"
            strokeWidth={1.5}
            strokeOpacity={0.4}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Dots sized by reps */}
          <Scatter
            dataKey="weight"
            shape={<CustomDot />}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
