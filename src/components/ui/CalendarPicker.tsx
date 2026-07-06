import { useState } from 'react';
import { toLocalISO } from './DateNav';

interface Props {
  selected: string;   // YYYY-MM-DD
  max: string;        // YYYY-MM-DD — today
  onSelect: (date: string) => void;
  onClose: () => void;
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function CalendarPicker({ selected, max, onSelect, onClose }: Props) {
  const [view, setView] = useState(() => {
    const d = new Date(selected + 'T12:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const maxDate = new Date(max + 'T12:00:00');

  function prevMonth() {
    setView(v => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: v.month - 1 };
    });
  }

  function nextMonth() {
    setView(v => {
      const next = v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 };
      // Don't go past max month
      const nextFirst = new Date(next.year, next.month, 1);
      if (nextFirst > maxDate) return v;
      return next;
    });
  }

  // Build grid: weeks rows, Mon-Sun columns
  function buildGrid() {
    const firstDay = new Date(view.year, view.month, 1);
    const lastDay = new Date(view.year, view.month + 1, 0);

    // ISO weekday: Mon=0 ... Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(view.year, view.month, d));
    }
    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  const grid = buildGrid();
  const canGoNext = (() => {
    const nextFirst = view.month === 11
      ? new Date(view.year + 1, 0, 1)
      : new Date(view.year, view.month + 1, 1);
    return nextFirst <= maxDate;
  })();

  return (
    // Backdrop
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Month navigation */}
        <div style={styles.header}>
          <button style={styles.navBtn} onClick={prevMonth}>‹</button>
          <span style={styles.monthLabel}>
            {MONTHS[view.month]} {view.year}
          </span>
          <button
            style={{ ...styles.navBtn, opacity: canGoNext ? 1 : 0.25 }}
            onClick={nextMonth}
            disabled={!canGoNext}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div style={styles.grid}>
          {DAYS.map(d => (
            <div key={d} style={styles.dayHeader}>{d}</div>
          ))}

          {grid.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;

            const iso = toLocalISO(date);
            const isSelected = iso === selected;
            const isFuture = date > maxDate;
            const isToday = iso === max;

            return (
              <button
                key={iso}
                disabled={isFuture}
                onClick={() => { onSelect(iso); onClose(); }}
                style={{
                  ...styles.dayBtn,
                  background: isSelected ? 'var(--teal)' : isToday ? 'var(--surface-2)' : 'transparent',
                  color: isSelected ? 'var(--bg-0)' : isFuture ? 'var(--hairline)' : 'var(--text-hi)',
                  fontWeight: isSelected || isToday ? 700 : 400,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(8,9,11,.66)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--bg-1)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-hero)',
    padding: '20px',
    width: '300px',
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  navBtn: {
    fontSize: '22px',
    color: 'var(--text-mid)',
    padding: '4px 10px',
    lineHeight: 1,
  },
  monthLabel: {
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--text-hi)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-mid)',
    padding: '4px 0',
  },
  dayBtn: {
    aspectRatio: '1',
    borderRadius: '50%',
    fontSize: '13px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.1s',
    width: '100%',
  },
};
