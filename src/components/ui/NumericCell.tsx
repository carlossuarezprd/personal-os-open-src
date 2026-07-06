import { useState, useRef, useEffect } from 'react';
import { evalExpr } from '../../lib/expr';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function NumericCell({ value, onChange, placeholder, style }: Props) {
  const [raw, setRaw] = useState(value !== null ? String(value) : '');
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes (e.g., from Realtime)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setRaw(value !== null ? String(value) : '');
      setHasError(false);
    }
  }, [value]);

  function handleBlur() {
    const trimmed = raw.trim();
    if (trimmed === '') {
      setHasError(false);
      onChange(null);
      return;
    }
    const result = evalExpr(trimmed);
    if (result.ok) {
      const rounded = Math.round(result.value * 10000) / 10000;
      setRaw(String(rounded));
      setHasError(false);
      onChange(rounded);
    } else {
      setHasError(true);
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      value={raw}
      placeholder={placeholder ?? '—'}
      onChange={e => { setRaw(e.target.value); setHasError(false); }}
      onBlur={handleBlur}
      style={{
        width: '80px',
        padding: '5px 8px',
        textAlign: 'right',
        borderColor: hasError ? 'var(--clay)' : undefined,
        ...style,
      }}
    />
  );
}
