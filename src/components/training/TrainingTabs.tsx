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
  row: { display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: 'var(--radius)', alignSelf: 'flex-start' },
  tab: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius)',
  },
  active: {
    background: 'var(--purple)',
    color: '#0a0a0c',
    boxShadow: 'var(--glow-purple)',
  },
};
