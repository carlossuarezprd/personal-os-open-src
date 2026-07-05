import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import Sidebar from './Sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function AppShell() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div style={isDesktop ? styles.desktopRoot : styles.mobileRoot}>
      {isDesktop ? <Sidebar /> : null}

      <main style={{
        ...styles.main,
        marginLeft: isDesktop ? 'var(--sidebar-w)' : 0,
        paddingBottom: isDesktop ? 0 : 'calc(var(--tab-bar-h) + env(safe-area-inset-bottom))',
        width: isDesktop ? 'calc(100% - var(--sidebar-w))' : '100%',
      }}>
        <Outlet />
      </main>

      {!isDesktop && <TabBar />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mobileRoot: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    paddingTop: 'env(safe-area-inset-top)',
  },
  desktopRoot: {
    height: '100dvh',
    display: 'flex',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
};
