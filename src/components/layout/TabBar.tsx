import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/logging',   label: 'Tracker',  icon: '✓' },
  { to: '/training',  label: 'Train',    icon: '💪' },
  { to: '/stats',     label: 'Stats',    icon: '📈' },
  { to: '/health',    label: 'Health',   icon: '🫀' },
  { to: '/settings',  label: 'Settings', icon: '⚙' },
];

export default function TabBar() {
  return (
    <nav style={styles.bar}>
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          style={({ isActive }) => ({ ...styles.tab, color: isActive ? 'var(--purple)' : 'var(--text-muted)' })}
        >
          <span style={styles.icon}>{t.icon}</span>
          <span style={styles.label}>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--tab-bar-h)',
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'stretch',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    textDecoration: 'none',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    transition: 'color 0.15s',
  },
  icon: {
    fontSize: '18px',
    lineHeight: 1,
  },
  label: {},
};
