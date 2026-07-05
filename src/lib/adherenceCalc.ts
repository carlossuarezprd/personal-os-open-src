export type FrequencyType = 'daily' | 'weekly';
export type TabName = 'morning' | 'daily' | 'night' | 'stretch' | 'weekly';

export interface ItemDef {
  id: string;
  tab: TabName;
  frequency: FrequencyType;
}

export interface GroupDef {
  name: string;
  items: ItemDef[];
}

export interface DayData {
  date: string;
  morning: Record<string, boolean | number | null>;
  daily: Record<string, boolean | number | null>;
  night: Record<string, boolean | number | null>;
  stretch: Record<string, boolean | number | null>;
  weekly: Record<string, boolean | number | null>;
}

function tabData(day: DayData, tab: TabName): Record<string, boolean | number | null> {
  return day[tab] ?? {};
}

function isTabEngaged(day: DayData, tab: TabName): boolean {
  return Object.values(tabData(day, tab)).some(v => v !== null && v !== undefined);
}

export interface AdherenceResult {
  group: string;
  pct: number;
  numerator: number;
  denominator: number;
}

export function computeGroupAdherence(
  group: GroupDef,
  days: DayData[],
  weekIsComplete: boolean,
): AdherenceResult {
  let num = 0;
  let den = 0;

  for (const item of group.items) {
    if (item.frequency === 'daily') {
      const engaged = days.filter(d => isTabEngaged(d, item.tab));
      den += engaged.length;
      num += engaged.filter(d => tabData(d, item.tab)[item.id] === true).length;
    } else {
      // weekly
      if (!weekIsComplete) continue;
      den += 1;
      const checked = days.some(d => tabData(d, item.tab)[item.id] === true);
      if (checked) num += 1;
    }
  }

  return { group: group.name, numerator: num, denominator: den, pct: den === 0 ? 0 : (num / den) * 100 };
}

function isoWeekKeyLocal(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const tmp = new Date(d);
  tmp.setDate(tmp.getDate() + 4 - ((tmp.getDay() + 6) % 7 + 1 + 1));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Adherence across an arbitrary date range.
 * - Daily items: count engaged days vs days where the item was ticked.
 * - Weekly items: only count weeks that ended on/before `today` (complete weeks).
 */
export function computeGroupAdherenceRange(
  group: GroupDef,
  days: DayData[],
  today: string,
): AdherenceResult {
  let num = 0;
  let den = 0;

  // For weekly items, find which ISO weeks present in `days` have already ended.
  const weekKeys = [...new Set(days.map(d => isoWeekKeyLocal(d.date)))];
  const completeWeeks = weekKeys.filter(wk => {
    const weekDates = days.filter(d => isoWeekKeyLocal(d.date) === wk).map(d => d.date);
    if (weekDates.length === 0) return false;
    const lastDateInWeek = weekDates.reduce((a, b) => (a > b ? a : b));
    return today > lastDateInWeek;
  });

  for (const item of group.items) {
    if (item.frequency === 'daily') {
      const engaged = days.filter(d => isTabEngaged(d, item.tab));
      den += engaged.length;
      num += engaged.filter(d => tabData(d, item.tab)[item.id] === true).length;
    } else {
      for (const wk of completeWeeks) {
        const weekDays = days.filter(d => isoWeekKeyLocal(d.date) === wk);
        den += 1;
        if (weekDays.some(d => tabData(d, item.tab)[item.id] === true)) num += 1;
      }
    }
  }

  return { group: group.name, numerator: num, denominator: den, pct: den === 0 ? 0 : (num / den) * 100 };
}

// ─── Group definitions (from brief §6) ────────────────────────────────────

export const ADHERENCE_GROUPS: GroupDef[] = [
  {
    name: 'Skincare',
    items: [
      ...['m_pat_dry','m_cold_compress','m_lymph_massage','m_vit_c','m_niacinamide','m_ha','m_tallow','m_spf','m_lip_balm','m_corrector','m_concealer','m_brow_pen','m_brow_gel']
        .map(id => ({ id, tab: 'morning' as TabName, frequency: 'daily' as FrequencyType })),
      ...['n_cleanse','n_tallow','n_lip_balm']
        .map(id => ({ id, tab: 'night' as TabName, frequency: 'daily' as FrequencyType })),
    ],
  },
  {
    name: 'Active treatments',
    items: ['n_active','n_minox'].map(id => ({ id, tab: 'night' as TabName, frequency: 'daily' as FrequencyType })),
  },
  {
    name: 'Teeth',
    items: [
      ...['m_brush_teeth','m_brush_tongue','m_hismile'].map(id => ({ id, tab: 'morning' as TabName, frequency: 'daily' as FrequencyType })),
      { id: 'n_brush_teeth', tab: 'night' as TabName, frequency: 'daily' as FrequencyType },
      { id: 'w_floss', tab: 'weekly' as TabName, frequency: 'weekly' as FrequencyType },
    ],
  },
  {
    name: 'Stretches',
    items: ['s_couch_stretch','s_90_90','s_pigeon','s_glute_bridge','s_doorway_pec','s_thoracic_ext','s_wall_angels','s_chin_tucks']
      .map(id => ({ id, tab: 'stretch' as TabName, frequency: 'daily' as FrequencyType })),
  },
  {
    name: 'Supplements',
    items: [
      { id: 'm_pills', tab: 'morning' as TabName, frequency: 'daily' as FrequencyType },
      { id: 'n_pills', tab: 'night' as TabName, frequency: 'daily' as FrequencyType },
    ],
  },
  {
    name: 'Hair care',
    items: [
      ...['m_hair_wash','m_scalp_massager','m_sea_salt','m_blow_dry','m_quicksand'].map(id => ({ id, tab: 'morning' as TabName, frequency: 'daily' as FrequencyType })),
      ...['w_trim_facial_hair','w_brow_tinting'].map(id => ({ id, tab: 'weekly' as TabName, frequency: 'weekly' as FrequencyType })),
    ],
  },
  {
    name: 'Hygiene body',
    items: [
      { id: 'm_shave', tab: 'morning' as TabName, frequency: 'daily' as FrequencyType },
      ...['w_body_shaving','w_body_exfoliating','w_toenails'].map(id => ({ id, tab: 'weekly' as TabName, frequency: 'weekly' as FrequencyType })),
    ],
  },
  {
    name: 'Sleep prep',
    items: ['n_dinner','n_oura','n_blue_light','n_alarms','n_mouth_tape']
      .map(id => ({ id, tab: 'night' as TabName, frequency: 'daily' as FrequencyType })),
  },
];
