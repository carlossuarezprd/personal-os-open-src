import { ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  title: string;
  children: React.ReactNode;
  height?: number;
}

export default function ChartCard({ title, children, height = 220 }: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export function noData() {
  return <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data yet</p>;
}

/** Soft horizontal gridlines aligned with Y-axis ticks. Place inside a LineChart/BarChart/etc. */
export function SoftGrid() {
  return (
    <CartesianGrid
      horizontal={true}
      vertical={false}
      strokeDasharray="2 4"
      stroke="var(--border)"
      strokeOpacity={0.55}
    />
  );
}

// Shared axis/tooltip styles — typed as any so recharts spread accepts them without TS errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const axisProps: any = {
  tick: { fill: 'var(--text-muted)', fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

export function ChartTooltip({ active, payload, label, unit = '' }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '12px' }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}{unit}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px',
  },
};
