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
      {/* aurora hero — generated gradient, drifting slowly */}
      <div style={styles.auroraWrap} aria-hidden="true">
        <div style={styles.aurora} />
        <div style={styles.auroraFade} />
      </div>

      <div className="screen-in" style={styles.column}>
        <div style={styles.wordmark}>
          <span style={styles.dot} />
          Routine · Personal OS
        </div>

        <h1 style={styles.headline}>A calm home for your habits</h1>

        <div style={styles.card}>
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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'relative',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflow: 'hidden',
  },
  auroraWrap: {
    position: 'absolute',
    top: '-18%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(560px, 120vw)',
    aspectRatio: '1 / 1',
    pointerEvents: 'none',
  },
  aurora: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'conic-gradient(from 210deg at 50% 45%, var(--green-deep), var(--blue-deep), var(--teal-deep), var(--green), var(--green-deep))',
    filter: 'blur(48px)',
    opacity: .55,
    animation: 'aurora-drift 36s linear infinite',
  },
  auroraFade: {
    position: 'absolute',
    inset: '-10%',
    background: 'radial-gradient(closest-side, transparent 55%, var(--bg-0) 92%)',
  },
  column: {
    position: 'relative',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  wordmark: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '.2em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 12px var(--green)',
  },
  headline: {
    // the one human headline — serif for voice
    fontFamily: 'var(--font-serif)',
    fontSize: '34px',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-.01em',
    textAlign: 'center',
    color: 'var(--text-hi)',
    margin: '0 0 8px',
  },
  card: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-hero)',
    padding: '28px 24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: 'var(--r-chip)',
  },
  error: {
    color: 'var(--st-care)',
    fontSize: '13px',
  },
  success: {
    color: 'var(--st-optimal)',
    fontSize: '14px',
    textAlign: 'center',
  },
  btn: {
    padding: '12px',
    background: 'var(--teal)',
    color: 'var(--bg-0)',
    fontWeight: 600,
    borderRadius: 'var(--r-pill)',
    fontSize: '15px',
    marginTop: '4px',
    transition: 'opacity .2s var(--ease)',
  },
  link: {
    color: 'var(--text-low)',
    fontSize: '13px',
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: '2px',
  },
};
