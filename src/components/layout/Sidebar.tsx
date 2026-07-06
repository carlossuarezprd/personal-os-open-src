import { NavLink } from 'react-router-dom';
import { CheckCircleIcon, DumbbellIcon, TrendIcon, HeartIcon, SlidersIcon } from '../ui/Icons';

const navItems = [
  { to: '/logging',  label: 'Tracker',       Icon: CheckCircleIcon },
  { to: '/training', label: 'Training',      Icon: DumbbellIcon },
  { to: '/stats',    label: 'Stats',         Icon: TrendIcon },
  { to: '/health',   label: 'Health Center', Icon: HeartIcon },
  { to: '/settings', label: 'Settings',      Icon: SlidersIcon },
];

export default function Sidebar() {
  return (
    <nav style={styles.sidebar}>
      <div style={styles.wordmark}>
        <span style={styles.dot} />
        Routine
      </div>

      <div style={styles.links}>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? 'var(--surface)' : 'transparent',
              borderColor: isActive ? 'var(--hairline)' : 'transparent',
              color: isActive ? 'var(--text-hi)' : 'var(--text-low)',
            })}
          >
            <Icon size={20} />
            {label}
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
    borderRight: '1px solid var(--hairline)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    paddingTop: 'env(safe-area-inset-top)',
  },
  wordmark: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '28px 20px 24px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '.2em',
    textTransform: 'uppercase',
    color: 'var(--text-hi)',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 12px var(--green)',
    flexShrink: 0,
  },
  links: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    border: '1px solid transparent',
    borderRadius: 'var(--r-chip)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease)',
  },
};
