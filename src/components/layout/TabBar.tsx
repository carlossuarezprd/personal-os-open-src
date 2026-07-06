import { NavLink } from 'react-router-dom';
import { CheckCircleIcon, DumbbellIcon, TrendIcon, HeartIcon, SlidersIcon } from '../ui/Icons';

const tabs = [
  { to: '/logging',  label: 'Tracker',  Icon: CheckCircleIcon },
  { to: '/training', label: 'Train',    Icon: DumbbellIcon },
  { to: '/stats',    label: 'Stats',    Icon: TrendIcon },
  { to: '/health',   label: 'Health',   Icon: HeartIcon },
  { to: '/settings', label: 'Settings', Icon: SlidersIcon },
];

export default function TabBar() {
  return (
    <nav style={styles.bar}>
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            ...styles.tab,
            color: isActive ? 'var(--text-hi)' : 'var(--text-low)',
          })}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    left: '12px',
    right: '12px',
    bottom: 'calc(12px + env(safe-area-inset-bottom))',
    height: '64px',
    maxWidth: '420px',
    margin: '0 auto',
    background: 'rgba(20, 24, 29, .92)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-pill)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'stretch',
    padding: '0 8px',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    textDecoration: 'none',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.04em',
    transition: 'color .2s var(--ease)',
  },
};
