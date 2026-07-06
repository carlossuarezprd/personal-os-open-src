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
        background: checked ? 'rgba(79,182,188,.08)' : 'transparent',
      }}
      aria-pressed={checked}
    >
      <span style={{
        ...styles.check,
        color: checked ? 'var(--teal)' : 'var(--text-low)',
      }}>
        {checked ? '✓' : '○'}
      </span>
      <span style={styles.labelWrap}>
        <span style={{ color: checked ? 'var(--text-hi)' : 'var(--text-mid)' }}>{label}</span>
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
    borderRadius: 'var(--r-chip)',
    textAlign: 'left',
    transition: 'background 0.12s',
    border: 'none',
  },
  check: {
    fontSize: '18px',
    lineHeight: 1,
    marginTop: '1px',
    flexShrink: 0,
    transition: 'color 0.12s',
  },
  labelWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  note: {
    fontSize: '11px',
    color: 'var(--text-mid)',
    lineHeight: 1.4,
  },
};
