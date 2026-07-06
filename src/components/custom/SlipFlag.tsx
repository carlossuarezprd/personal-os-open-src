import { useMemo, useState } from 'react';
import { useDailyData, mondayOf } from '../../hooks/useProgressData';
import { morningSchema, nightSchema, stretchSchema, weeklySchema } from '../logging/schema';

// Build label lookup from schemas
const ITEM_LABEL: Record<string, string> = {};
for (const schema of [morningSchema, nightSchema, stretchSchema, weeklySchema]) {
  for (const section of schema.sections) {
    for (const item of section.items) {
      ITEM_LABEL[item.id] = item.label;
    }
  }
}

const MORNING_TICKS = morningSchema.sections.flatMap(s => s.items.filter(i => i.type === 'tick').map(i => i.id));
const NIGHT_TICKS   = nightSchema.sections.flatMap(s   => s.items.filter(i => i.type === 'tick').map(i => i.id));
const STRETCH_TICKS = stretchSchema.sections.flatMap(s => s.items.filter(i => i.type === 'tick').map(i => i.id));
const WEEKLY_TICKS  = weeklySchema.sections.flatMap(s  => s.items.filter(i => i.type === 'tick').map(i => i.id));

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function isTabEngaged(tab: Record<string, unknown>): boolean {
  return Object.values(tab).some(v => v !== null && v !== undefined);
}

interface SlipItem { id: string; label: string; detail: string }

export default function SlipFlag() {
  const { days, loading } = useDailyData();
  const today = new Date().toISOString().slice(0, 10);
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));

  const weekEnd = addDays(weekStart, 6);
  const complete = today >= weekEnd;

  const weekDays = useMemo(
    () => days.filter(d => d.date >= weekStart && d.date <= weekEnd),
    [days, weekStart, weekEnd]
  );

  const { morning, night, stretch, weekly } = useMemo(() => {
    // A day is "logged" if any tab has any non-null value
    const loggedDays = weekDays.filter(d =>
      isTabEngaged(d.morning as Record<string, unknown>) ||
      isTabEngaged(d.daily  as Record<string, unknown>) ||
      isTabEngaged(d.night  as Record<string, unknown>) ||
      isTabEngaged(d.stretch as Record<string, unknown>)
    );

    const checkTicks = (ids: string[], tabKey: 'morning' | 'night' | 'stretch'): SlipItem[] =>
      ids.flatMap(id => {
        const checked = loggedDays.filter(d => (d[tabKey] as Record<string, unknown>)[id] === true).length;
        const missed  = loggedDays.length - checked;
        if (loggedDays.length === 0 || missed < 2) return [];
        return [{ id, label: ITEM_LABEL[id] ?? id, detail: `${checked}/${loggedDays.length} days` }];
      });

    const weeklySlips: SlipItem[] = complete
      ? WEEKLY_TICKS.flatMap(id => {
          const checked = weekDays.some(d => (d.weekly as Record<string, unknown>)[id] === true);
          return checked ? [] : [{ id, label: ITEM_LABEL[id] ?? id, detail: 'not done this week' }];
        })
      : [];

    return {
      morning: checkTicks(MORNING_TICKS, 'morning'),
      night:   checkTicks(NIGHT_TICKS,   'night'),
      stretch: checkTicks(STRETCH_TICKS, 'stretch'),
      weekly:  weeklySlips,
    };
  }, [weekDays, complete]);

  const totalSlips = morning.length + night.length + stretch.length + weekly.length;

  if (loading) return <p style={{ color: 'var(--text-mid)' }}>Loading…</p>;

  return (
    <div>
      {/* Week navigator */}
      <div style={styles.weekNav}>
        <button style={styles.navBtn} onClick={() => setWeekStart(prev => addDays(prev, -7))}>‹</button>
        <div style={styles.weekLabel}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{weekStart} – {weekEnd}</span>
          {!complete && <span style={{ color: 'var(--text-mid)', fontSize: 11, marginLeft: 6 }}>in progress</span>}
        </div>
        <button
          style={{ ...styles.navBtn, opacity: weekEnd >= today ? 0.3 : 1, cursor: weekEnd >= today ? 'default' : 'pointer' }}
          onClick={() => { if (weekEnd < today) setWeekStart(prev => addDays(prev, 7)); }}
        >›</button>
      </div>

      {weekDays.length === 0 ? (
        <p style={{ color: 'var(--text-mid)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>No data logged for this week</p>
      ) : totalSlips === 0 ? (
        <div style={styles.allGood}>
          <div style={{ fontSize: 32 }}>✓</div>
          <div style={{ color: 'var(--green)', fontWeight: 700, marginTop: 8 }}>
            {complete ? 'Perfect week!' : 'On track so far'}
          </div>
          <div style={{ color: 'var(--text-mid)', fontSize: 13, marginTop: 4 }}>No slips detected</div>
        </div>
      ) : (
        <div>
          {morning.length > 0 && <SlipGroup title="Morning" items={morning} />}
          {night.length   > 0 && <SlipGroup title="Night"   items={night}   />}
          {stretch.length > 0 && <SlipGroup title="Stretch" items={stretch} />}
          {weekly.length  > 0 && <SlipGroup title="Weekly"  items={weekly}  />}
        </div>
      )}
    </div>
  );
}

function SlipGroup({ title, items }: { title: string; items: SlipItem[] }) {
  return (
    <div style={groupStyles.container}>
      <div style={groupStyles.header}>{title}</div>
      {items.map(item => (
        <div key={item.id} style={groupStyles.row}>
          <span style={groupStyles.label}>{item.label}</span>
          <span style={groupStyles.detail}>{item.detail}</span>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  weekNav:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  navBtn:    { width: 32, height: 32, borderRadius: 'var(--r-chip)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--text-hi)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 13 },
  allGood:   { textAlign: 'center', padding: '32px 0' },
};

const groupStyles: Record<string, React.CSSProperties> = {
  container: { background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-card)', marginBottom: 12, overflow: 'hidden' },
  header:    { fontSize: 11, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 14px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' },
  row:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--hairline)' },
  label:     { fontSize: 13, fontWeight: 600, color: 'var(--text-hi)' },
  detail:    { fontSize: 12, color: 'var(--clay)', fontWeight: 600 },
};
