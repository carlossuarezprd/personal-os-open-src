import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onDismiss: () => void;
}

export function Toast({ message, type = 'error', onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const color = type === 'error' ? 'var(--coral)' : 'var(--green)';

  return (
    <div style={{ ...styles.toast, borderColor: color, color }}>
      {message}
      <button onClick={onDismiss} style={styles.x}>✕</button>
    </div>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  function showToast(message: string, type: 'error' | 'success' = 'error') {
    setToast({ message, type });
  }

  function dismissToast() {
    setToast(null);
  }

  return { toast, showToast, dismissToast };
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 'calc(var(--tab-bar-h) + 12px + env(safe-area-inset-bottom))',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--surface)',
    border: '1px solid',
    borderRadius: 'var(--radius)',
    padding: '10px 16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 200,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px #0006',
  },
  x: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    padding: '2px 4px',
  },
};
