import TickItem from '../ui/TickItem';
import type { TabSchema } from './schema';
import type { LogTab } from '../../types/database';

interface Props {
  schema: TabSchema;
  get: (tab: LogTab, id: string) => boolean | number | null;
  setValue: (tab: LogTab, id: string, value: boolean | number | null) => void;
  resetTab: (tab: LogTab) => void;
}

export default function TabShell({ schema, get, setValue, resetTab }: Props) {
  const { tab, sections } = schema;

  return (
    <div style={styles.page}>
      {sections.map(section => (
        <div key={section.title} style={styles.section}>
          <div style={styles.sectionTitle}>{section.title}</div>
          {section.items.map(item => {
            if (item.type === 'tick') {
              return (
                <TickItem
                  key={item.id}
                  label={item.label}
                  note={item.note}
                  checked={get(tab, item.id) === true}
                  onToggle={() => setValue(tab, item.id, get(tab, item.id) === true ? false : true)}
                />
              );
            }
            return null; // numeric/computed items handled by specialised tabs
          })}
        </div>
      ))}

      <button style={styles.resetBtn} onClick={() => resetTab(tab)}>
        Reset {tab}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    paddingBottom: '32px',
  },
  section: {
    marginTop: '8px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: 'var(--text-low)',
    padding: '16px 16px 6px',
  },
  resetBtn: {
    display: 'block',
    margin: '24px auto 0',
    padding: '8px 20px',
    fontSize: '12px',
    color: 'var(--text-low)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-pill)',
  },
};
