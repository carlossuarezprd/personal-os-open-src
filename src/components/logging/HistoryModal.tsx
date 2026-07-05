import { useMemo, useState } from 'react';
import { useDailyLogHistory, type HistoryRow } from '../../hooks/useDailyLogHistory';
import { morningSchema, dailySchema, nightSchema, stretchSchema, weeklySchema } from './schema';
import type { LogTab } from '../../types/database';

interface Props {
  date: string;
  onClose: () => void;
  onRestore: (tab: LogTab, field: string, value: boolean | number | null) => void;
}

const ITEM_LABEL: Record<string, string> = {};
for (const schema of [morningSchema, dailySchema, nightSchema, stretchSchema, weeklySchema]) {
  for (const section of schema.sections) {
    for (const item of section.items) {
      ITEM_LABEL[item.id] = item.label;
    }
  }
}

function formatValue(v: boolean | number | null): string {
  if (v === null || v === undefined) return '—';
  if (v === true) return '✓';
  if (v === false) return '✗';
  return String(v);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function HistoryModal({ date, onClose, onRestore }: Props) {
  const [refresh, setRefresh] = useState(0);
  const { rows, loading, error } = useDailyLogHistory(date, refresh);

  // Latest-first; deduplicate consecutive snapshots of the same field that
  // would only confuse the restore action.
  const dedupedRows = useMemo(() => {
    const seen = new Set<string>();
    const result: HistoryRow[] = [];
    for (const r of rows) {
      const key = `${r.tab}|${r.field}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(r);
    }
    return result;
  }, [rows]);

  function handleRestore(r: HistoryRow) {
    onRestore(r.tab, r.field, r.prev_value);
    // Force a refresh so the new history row (from the restore action)
    // appears at the top of the modal.
    setTimeout(() => setRefresh(k => k + 1), 250);
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        <div style={styles.handle} />

        <div style={styles.header}>
          <h2 style={styles.title}>Change history</h2>
          <span style={styles.dateLabel}>{date}</span>
        </div>

        {error && (
          <p style={styles.error}>
            Could not load history: {error}
            <br />
            <span style={{ color: 'var(--text-muted)' }}>
              If the daily_logs_history table doesn't exist yet, run migrations/002_daily_logs_history.sql in Supabase.
            </span>
          </p>
        )}

        {loading && <p style={styles.empty}>Loading…</p>}

        {!loading && !error && dedupedRows.length === 0 && (
          <p style={styles.empty}>No changes recorded for this date.</p>
        )}

        {!loading && !error && dedupedRows.length > 0 && (
          <div style={styles.list}>
            <p style={styles.hint}>
              Showing the most recent edit for each field. Tap Restore to swap the value back.
            </p>
            {dedupedRows.map(r => (
              <div key={r.id} style={styles.row}>
                <div style={styles.rowMain}>
                  <div style={styles.label}>{ITEM_LABEL[r.field] ?? r.field}</div>
                  <div style={styles.sub}>
                    <span style={styles.tab}>{r.tab}</span>
                    <span> · </span>
                    <span>{timeAgo(r.changed_at)}</span>
                  </div>
                </div>
                <div style={styles.values}>
                  <div style={styles.prev}>{formatValue(r.prev_value)}</div>
                  <div style={styles.arrow}>→</div>
                  <div style={styles.now}>{formatValue(r.new_value)}</div>
                </div>
                <button style={styles.restoreBtn} onClick={() => handleRestore(r)}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: '#0008', zIndex: 300, display: 'flex', alignItems: 'flex-end' },
  sheet: {
    background: 'var(--surface)',
    borderRadius: '16px 16px 0 0',
    padding: '12px 16px 32px',
    width: '100%',
    maxHeight: '80dvh',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflow: 'hidden',
  },
  handle: { width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px', alignSelf: 'center', marginBottom: '4px' },
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontSize: '18px', fontWeight: 700, color: 'var(--text)' },
  dateLabel: { fontSize: '13px', color: 'var(--text-muted)' },
  hint: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' },
  list: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '10px',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
  rowMain: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  label: { fontSize: '14px', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontSize: '11px', color: 'var(--text-muted)' },
  tab: { textTransform: 'capitalize' },
  values: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', whiteSpace: 'nowrap' },
  prev: { color: 'var(--text-muted)' },
  arrow: { color: 'var(--text-muted)' },
  now: { color: 'var(--text)', fontWeight: 600 },
  restoreBtn: {
    padding: '6px 12px',
    background: 'var(--purple)',
    color: '#0a0a0c',
    fontWeight: 700,
    borderRadius: 'var(--radius)',
    fontSize: '12px',
  },
  empty: { color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' },
  error: { color: 'var(--coral)', fontSize: '13px', padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius)' },
};
