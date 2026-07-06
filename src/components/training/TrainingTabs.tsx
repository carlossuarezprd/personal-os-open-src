import { NavLink } from 'react-router-dom';

export default function TrainingTabs() {
  return (
    <div style={styles.row}>
      <NavLink to="/training" end style={({ isActive }) => ({ ...styles.tab, ...(isActive ? styles.active : {}) })}>
        Sessions
      </NavLink>
      <NavLink to="/training/library" style={({ isActive }) => ({ ...styles.tab, ...(isActive ? styles.active : {}) })}>
        Library
      </NavLink>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: '4px', border: '1px solid var(--hairline)', padding: '4px', borderRadius: 'var(--r-pill)', alignSelf: 'flex-start' },
  tab: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-low)',
    borderRadius: 'var(--r-pill)',
    transition: 'color .2s var(--ease), background .2s var(--ease)',
  },
  active: {
    background: 'var(--surface-2)',
    color: 'var(--text-hi)',
  },
};
