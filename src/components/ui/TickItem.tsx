interface Props {
  label: string;
  note?: string;
  checked: boolean;
  onToggle: () => void;
}

export default function TickItem({ label, note, checked, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      style={{
        ...styles.row,
        background: checked ? 'rgba(167,139,250,0.07)' : 'transparent',
      }}
      aria-pressed={checked}
    >
      <span style={{
        ...styles.check,
        color: checked ? 'var(--purple)' : 'var(--border)',
        textShadow: checked ? 'var(--glow-purple)' : 'none',
      }}>
        {checked ? '✓' : '○'}
      </span>
      <span style={styles.labelWrap}>
        <span style={{ color: checked ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
        {note && <span style={styles.note}>{note}</span>}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    textAlign: 'left',
    transition: 'background 0.12s',
    border: 'none',
  },
  check: {
    fontSize: '18px',
    lineHeight: 1,
    marginTop: '1px',
    flexShrink: 0,
    transition: 'color 0.12s, text-shadow 0.12s',
  },
  labelWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  note: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
};
