import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/logging',   label: 'Tracker',       icon: '✓'  },
  { to: '/training',  label: 'Training',      icon: '💪' },
  { to: '/stats',     label: 'Stats',         icon: '📈' },
  { to: '/health',    label: 'Health Center', icon: '🫀' },
  { to: '/settings',  label: 'Settings',      icon: '⚙'  },
];

export default function Sidebar() {
  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>Routine</div>

      <div style={styles.links}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? 'var(--surface2)' : 'transparent',
              color: isActive ? 'var(--purple)' : 'var(--text)',
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-w)',
    height: '100dvh',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    paddingTop: 'env(safe-area-inset-top)',
  },
  logo: {
    padding: '20px 20px 16px',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--purple)',
    textShadow: 'var(--glow-purple)',
  },
  links: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 8px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background 0.1s, color 0.1s',
  },
  icon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
};
