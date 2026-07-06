import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Toast, useToast } from '../ui/Toast';
import {
  exportAllData,
  importAllData,
  validateBundle,
  downloadBundle,
  type ImportSummary,
} from '../../lib/dataBackup';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast, showToast, dismissToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [lastImport, setLastImport] = useState<ImportSummary | null>(null);

  async function handleExport() {
    if (!user || busy) return;
    setBusy('export');
    try {
      const bundle = await exportAllData(user.id);
      downloadBundle(bundle);
      showToast('Backup downloaded', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user || busy) return;

    setBusy('import');
    try {
      const text = await file.text();
      const bundle = validateBundle(JSON.parse(text));

      const counts = [
        `${bundle.daily_logs.length} daily logs`,
        `${bundle.training_sessions.length} training sessions`,
        `${bundle.exercise_logs.length} exercise logs`,
        `${bundle.sets.length} sets`,
        `${bundle.muscle_groups.length} muscle groups`,
        `${bundle.exercises.length} exercises`,
        `${bundle.gyms.length} gyms`,
        bundle.settings ? '1 settings row' : null,
      ].filter(Boolean);

      const ok = window.confirm(
        `Import this backup into your account?\n\n` +
          counts.join('\n') +
          `\n\nExisting rows with the same date / name / id will be overwritten. ` +
          `Rows not in the backup will NOT be deleted.`
      );
      if (!ok) {
        setBusy(null);
        return;
      }

      const summary = await importAllData(bundle, user.id);
      setLastImport(summary);
      showToast('Backup restored', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Settings</h1>

      <section style={styles.section}>
        <h2 style={styles.h2}>Backup & Restore</h2>
        <p style={styles.body}>
          Export everything you've logged to a single JSON file. Import that file later to restore
          your data — useful before backend changes, or if a migration goes sideways.
        </p>

        <div style={styles.row}>
          <button onClick={handleExport} disabled={busy !== null} style={styles.btnPrimary}>
            {busy === 'export' ? 'Exporting…' : 'Export all data'}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
            style={styles.btnSecondary}
          >
            {busy === 'import' ? 'Importing…' : 'Import from backup'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        {lastImport && (
          <div style={styles.summary}>
            <div style={styles.summaryTitle}>Last import</div>
            <ul style={styles.summaryList}>
              <li>{lastImport.daily_logs} daily logs</li>
              <li>{lastImport.training_sessions} training sessions</li>
              <li>{lastImport.exercise_logs} exercise logs</li>
              <li>{lastImport.sets} sets</li>
              <li>{lastImport.muscle_groups} muscle groups</li>
              <li>{lastImport.exercises} exercises</li>
              <li>{lastImport.gyms} gyms</li>
              <li>{lastImport.settings ? '1 settings row' : '0 settings rows'}</li>
            </ul>
          </div>
        )}
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 720, color: 'var(--text-hi)' },
  h1: { fontSize: 22, fontWeight: 600, marginBottom: 24 },
  section: {
    background: 'var(--surface)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-card)',
    padding: 20,
  },
  h2: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  body: { color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.5, marginBottom: 16 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btnPrimary: {
    background: 'var(--teal)',
    color: 'var(--bg-0)',
    padding: '8px 18px',
    borderRadius: 'var(--r-pill)',
    fontSize: 14,
    fontWeight: 600,
  },
  btnSecondary: {
    background: 'var(--surface-2)',
    color: 'var(--text-hi)',
    border: '1px solid var(--hairline)',
    padding: '8px 16px',
    borderRadius: 'var(--r-chip)',
    fontSize: 14,
  },
  summary: {
    marginTop: 16,
    padding: 12,
    background: 'var(--surface-2)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-chip)',
  },
  summaryTitle: { fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--green)' },
  summaryList: { listStyle: 'none', fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 },
};
