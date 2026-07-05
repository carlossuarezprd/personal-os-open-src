import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AppShell from './components/layout/AppShell';
import './styles/globals.css';

const LoggingPage  = lazy(() => import('./components/logging/LoggingPage'));
const TrainingPage = lazy(() => import('./components/training/TrainingPage'));
const StatsPage    = lazy(() => import('./components/stats/StatsPage'));
const HealthCenterPage = lazy(() => import('./components/health/HealthCenterPage'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route index element={<Navigate to="/logging" replace />} />
            <Route path="logging/*" element={<Suspense fallback={null}><LoggingPage /></Suspense>} />
            <Route path="training/*" element={<Suspense fallback={null}><TrainingPage /></Suspense>} />
            <Route path="stats/*" element={<Suspense fallback={null}><StatsPage /></Suspense>} />
            <Route path="health/*" element={<Suspense fallback={null}><HealthCenterPage /></Suspense>} />
            <Route path="progress/*" element={<Navigate to="/stats" replace />} />
            <Route path="custom/*" element={<Navigate to="/health" replace />} />
            <Route path="settings/*" element={<Suspense fallback={null}><SettingsPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
