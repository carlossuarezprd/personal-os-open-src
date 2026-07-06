import { useState, useEffect } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import DateNav, { todayISO } from '../ui/DateNav';
import { useDailyLog } from '../../hooks/useDailyLog';
import MorningTab from './MorningTab';
import DailyTab from './DailyTab';
import NightTab from './NightTab';
import StretchTab from './StretchTab';
import WeeklyTab from './WeeklyTab';
import HistoryModal from './HistoryModal';

const SUB_TABS = [
  { to: '/logging/morning',  label: 'Morning'  },
  { to: '/logging/daily',    label: 'Daily'    },
  { to: '/logging/night',    label: 'Night'    },
  { to: '/logging/stretch',  label: 'Stretch'  },
  { to: '/logging/weekly',   label: 'Weekly'   },
];

export default function LoggingPage() {
  const [date, setDate] = useState(todayISO);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Day rollover: poll every 30s + on visibility change
  useEffect(() => {
    function checkDate() {
      const today = todayISO();
      setDate(prev => (prev !== today ? today : prev));
    }
    const interval = setInterval(checkDate, 30_000);
    document.addEventListener('visibilitychange', checkDate);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', checkDate);
    };
  }, []);

  const logProps = useDailyLog(date);

  return (
    <div style={styles.page}>
      <DateNav date={date} onChange={setDate} />
      <button
        style={styles.historyBtn}
        onClick={() => setHistoryOpen(true)}
        title="Recent changes for this date"
        aria-label="Change history"
      >⟲</button>

      <nav style={styles.subTabs}>
        {SUB_TABS.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            style={({ isActive }) => ({
              ...styles.subTab,
              color: isActive ? 'var(--text-hi)' : 'var(--text-low)',
              borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
            })}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.content}>
        <Routes>
          <Route index element={<Navigate to="/logging/morning" replace />} />
          <Route path="morning" element={<MorningTab date={date} {...logProps} />} />
          <Route path="daily"   element={<DailyTab   date={date} {...logProps} />} />
          <Route path="night"   element={<NightTab   date={date} {...logProps} />} />
          <Route path="stretch" element={<StretchTab date={date} {...logProps} />} />
          <Route path="weekly"  element={<WeeklyTab  date={date} {...logProps} />} />
        </Routes>
      </div>

      {historyOpen && (
        <HistoryModal
          date={date}
          onClose={() => setHistoryOpen(false)}
          onRestore={(tab, field, value) => logProps.setValue(tab, field, value)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  historyBtn: {
    position: 'absolute',
    top: '16px',
    right: '14px',
    zIndex: 50,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-pill)',
    fontSize: '15px',
    color: 'var(--text-low)',
    cursor: 'pointer',
    lineHeight: 1,
    transition: 'color .2s var(--ease), border-color .2s var(--ease)',
  },
  subTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--hairline)',
    padding: '0 8px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    flexShrink: 0,
  },
  subTab: {
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '.02em',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'color .2s var(--ease)',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
  },
};
