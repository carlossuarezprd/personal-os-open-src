import { useNavigate } from 'react-router-dom';
import { useSessions } from '../../hooks/useTraining';
import { todayISO } from '../ui/DateNav';
import TrainingTabs from './TrainingTabs';

export default function SessionList() {
  const navigate = useNavigate();
  const { sessions, loading, createSession } = useSessions();

  async function handleNew() {
    const session = await createSession(todayISO());
    if (session) navigate(`/training/session/${session.id}`);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Training</h1>
        <button style={styles.newBtn} onClick={handleNew}>+ New session</button>
      </div>

      <div style={styles.tabsRow}>
        <TrainingTabs />
      </div>

      {loading ? (
        <p style={styles.empty}>Loading…</p>
      ) : sessions.length === 0 ? (
        <p style={styles.empty}>No sessions yet. Start one!</p>
      ) : (
        <div style={styles.list}>
          {sessions.map(s => (
            <button
              key={s.id}
              style={styles.card}
              onClick={() => navigate(`/training/session/${s.id}`)}
            >
              <span style={styles.date}>{formatDate(s.session_date)}</span>
              <span style={styles.arrow}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '16px', paddingBottom: '40px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  tabsRow: { marginBottom: '16px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--text-hi)' },
  newBtn: {
    padding: '8px 16px',
    background: 'var(--teal)',
    color: 'var(--bg-0)',
    fontWeight: 600,
    borderRadius: 'var(--r-pill)',
    fontSize: '14px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-chip)',
    textAlign: 'left',
    width: '100%',
  },
  date: { fontSize: '15px', color: 'var(--text-hi)' },
  arrow: { fontSize: '20px', color: 'var(--text-mid)' },
  empty: { color: 'var(--text-mid)', padding: '40px 0', textAlign: 'center' },
};
