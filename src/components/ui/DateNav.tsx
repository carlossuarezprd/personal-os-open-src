import { useMemo, useState } from 'react';
import CalendarPicker from './CalendarPicker';

interface Props {
  date: string;
  onChange: (date: string) => void;
}

export function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayISO(): string {
  return toLocalISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toLocalISO(d);
}

function formatLabel(iso: string): string {
  const today = todayISO();
  const yesterday = addDays(today, -1);
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function DateNav({ date, onChange }: Props) {
  const isToday = date === todayISO();
  const label = useMemo(() => formatLabel(date), [date]);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      <div style={styles.nav}>
        <button
          style={styles.arrow}
          onClick={() => onChange(addDays(date, -1))}
          aria-label="Previous day"
        >
          ‹
        </button>

        <button style={styles.labelBtn} onClick={() => setShowCalendar(true)}>
          <span style={styles.label}>{label}</span>
          <span style={styles.calIcon}>📅</span>
        </button>

        <button
          style={{ ...styles.arrow, opacity: isToday ? 0.25 : 1 }}
          onClick={() => !isToday && onChange(addDays(date, 1))}
          aria-label="Next day"
          disabled={isToday}
        >
          ›
        </button>
      </div>

      {showCalendar && (
        <CalendarPicker
          selected={date}
          max={todayISO()}
          onSelect={onChange}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  arrow: {
    fontSize: '24px',
    color: 'var(--text-muted)',
    padding: '4px 10px',
    lineHeight: 1,
  },
  labelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: 'var(--radius)',
  },
  label: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  calIcon: {
    fontSize: '14px',
    opacity: 0.6,
  },
};
