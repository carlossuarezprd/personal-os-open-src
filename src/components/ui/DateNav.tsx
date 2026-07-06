import { useMemo, useState } from 'react';
import CalendarPicker from './CalendarPicker';
import { CalendarIcon } from './Icons';

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
          <span style={styles.calIcon}><CalendarIcon size={16} /></span>
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
    justifyContent: 'center',
    gap: '6px',
    padding: '18px 48px 10px',
    flexShrink: 0,
  },
  arrow: {
    fontSize: '22px',
    color: 'var(--text-low)',
    padding: '4px 12px',
    lineHeight: 1,
    transition: 'color .2s var(--ease)',
  },
  labelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px',
    borderRadius: 'var(--r-chip)',
  },
  label: {
    // the screen's one human headline — serif for voice
    fontFamily: 'var(--font-serif)',
    fontSize: '26px',
    fontWeight: 400,
    lineHeight: 1.1,
    color: 'var(--text-hi)',
  },
  calIcon: {
    color: 'var(--text-low)',
    display: 'flex',
    alignItems: 'center',
  },
};
