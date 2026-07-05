import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'reset') {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) return setError(error);
      setResetSent(true);
      return;
    }

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate('/logging');
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>PERSONAL OS</h1>

        {resetSent ? (
          <p style={styles.success}>Reset email sent. Check your inbox.</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
              autoComplete="email"
            />

            {mode === 'login' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={styles.input}
                autoComplete="current-password"
              />
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? '…' : mode === 'login' ? 'Sign in' : 'Send reset email'}
            </button>

            <button
              type="button"
              style={styles.link}
              onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Forgot password?' : '← Back to sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--purple)',
    textShadow: 'var(--glow-purple)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    borderRadius: 'var(--radius)',
  },
  error: {
    color: 'var(--coral)',
    fontSize: '13px',
  },
  success: {
    color: 'var(--green)',
    fontSize: '14px',
    textAlign: 'center',
  },
  btn: {
    padding: '11px',
    background: 'var(--purple)',
    color: '#0a0a0c',
    fontWeight: 700,
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    marginTop: '4px',
  },
  link: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    textAlign: 'center',
    textDecoration: 'underline',
  },
};
