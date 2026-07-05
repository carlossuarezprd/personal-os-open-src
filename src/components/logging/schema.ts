import type { LogTab } from '../../types/database';

export type ItemType = 'tick' | 'number_decimal' | 'number_integer' | 'computed';

export interface ItemDef {
  id: string;
  label: string;
  type: ItemType;
  note?: string;
}

export interface Section {
  title: string;
  items: ItemDef[];
}

export type TabSchema = { tab: LogTab; sections: Section[] };

// ─── Morning ────────────────────────────────────────────────────────────────

export const morningSchema: TabSchema = {
  tab: 'morning',
  sections: [
    {
      title: 'Hygiene',
      items: [
        { id: 'm_brush_teeth',    label: 'Brush teeth',    type: 'tick' },
        { id: 'm_brush_tongue',   label: 'Brush tongue',   type: 'tick' },
        { id: 'm_hismile',        label: 'HiSmile strips', type: 'tick' },
      ],
    },
    {
      title: 'Supplements',
      items: [
        { id: 'm_pills', label: 'Pills', type: 'tick', note: 'Creatine 6g, Omega 3, Vitamin D 4000 IU x2 — with fatty food' },
      ],
    },
    {
      title: 'Shower',
      items: [
        { id: 'm_cleanse',          label: 'Cleanse face with CeraVe', type: 'tick' },
        { id: 'm_hair_wash',        label: 'Wash hair',                type: 'tick', note: 'Ketoconazole shampoo 2x/week, otherwise normal' },
        { id: 'm_scalp_massager',   label: 'Scalp massager during shampoo', type: 'tick' },
        { id: 'm_shave',            label: 'Shave', type: 'tick', note: 'Every 2 days' },
      ],
    },
    {
      title: 'Skincare',
      items: [
        { id: 'm_pat_dry',        label: 'Pat face dry',            type: 'tick' },
        { id: 'm_cold_compress',  label: 'Cold compress under-eyes', type: 'tick', note: '60-90 sec' },
        { id: 'm_lymph_massage',  label: 'Lymphatic drainage massage', type: 'tick', note: '30 sec per side, light pressure, inner to outer' },
        { id: 'm_vit_c',          label: 'Vitamin C serum',         type: 'tick', note: 'The Ordinary Ascorbyl Glucoside 12% · wait 30-60 sec' },
        { id: 'm_niacinamide',    label: 'Niacinamide 10% + Zinc 1%', type: 'tick', note: 'The Ordinary · wait 30 sec' },
        { id: 'm_ha',             label: 'Hyaluronic Acid 2% + B5', type: 'tick', note: 'The Ordinary, on slightly damp skin' },
        { id: 'm_tallow',         label: 'Ancestra tallow cream',   type: 'tick', note: 'Wait 1 min after' },
        { id: 'm_spf',            label: 'SPF 50',                  type: 'tick', note: 'Face + neck + back of hands' },
        { id: 'm_lip_balm',       label: 'Lip balm',                type: 'tick' },
      ],
    },
    {
      title: 'Makeup & brows',
      items: [
        { id: 'm_corrector',  label: 'Peach color corrector', type: 'tick', note: 'Tiny dot on darkest under-eye, tap-blend' },
        { id: 'm_concealer',  label: 'Skin-tone concealer',   type: 'tick', note: 'Tap-blend over corrector with damp finger or sponge' },
        { id: 'm_brow_pen',   label: 'Brow pen',              type: 'tick', note: 'Match darkest brow hairs' },
        { id: 'm_brow_gel',   label: 'Clear brow gel',        type: 'tick' },
      ],
    },
    {
      title: 'Hair & finish',
      items: [
        { id: 'm_sea_salt',    label: 'Sea salt spray on damp hair', type: 'tick' },
        { id: 'm_blow_dry',    label: 'Blow dry',   type: 'tick', note: 'Cool/medium, fingers as comb, lift roots' },
        { id: 'm_quicksand',   label: 'Hanz de Fuko Quicksand', type: 'tick', note: 'Pea-sized, rub palms invisible, back to front' },
        { id: 'm_heel_lifts',  label: 'Heel lifts in shoes', type: 'tick' },
        { id: 'm_cologne',     label: 'Cologne', type: 'tick', note: '2 sprays, chest/neck not clothing' },
      ],
    },
  ],
};

// ─── Night ───────────────────────────────────────────────────────────────────

export const nightSchema: TabSchema = {
  tab: 'night',
  sections: [
    {
      title: 'Wind-down',
      items: [
        { id: 'n_dinner',     label: 'Dinner 3h before bed', type: 'tick' },
        { id: 'n_oura',       label: 'Charge Oura ring',     type: 'tick' },
        { id: 'n_blue_light', label: 'Blue light glasses on', type: 'tick' },
        { id: 'n_stretch',    label: 'Stretch routine',       type: 'tick', note: '~12 min — see Stretch tab' },
      ],
    },
    {
      title: 'Hygiene',
      items: [
        { id: 'n_brush_teeth', label: 'Brush teeth', type: 'tick' },
      ],
    },
    {
      title: 'Skincare',
      items: [
        { id: 'n_cleanse',  label: 'Cleanse face with CeraVe', type: 'tick', note: 'Wait 5 min after — skin must be fully dry' },
        { id: 'n_active',   label: 'Active treatment for tonight', type: 'tick', note: 'Mon: Retinal · Tue: Azelaic · Wed: NIOD CAIS 3:1 · Thu: Azelaic · Fri: Retinal · Sat: NIOD CAIS 3:1 · Sun: Reedle Shot 300 · wait 5-10 min after (15 for Reedle Shot)' },
        { id: 'n_tallow',   label: 'Ancestra tallow cream', type: 'tick' },
        { id: 'n_minox',    label: 'Minoxidil on hairline + brows', type: 'tick', note: 'Let dry fully before pillow contact' },
        { id: 'n_lip_balm', label: 'Lip balm', type: 'tick' },
      ],
    },
    {
      title: 'Supplements & sleep',
      items: [
        { id: 'n_pills',      label: 'Pills',       type: 'tick', note: 'Carotene x3, Magnesium x3, Ashwagandha, Finasteride, Zinc' },
        { id: 'n_alarms',     label: 'Set alarms',  type: 'tick', note: 'Wrist device and phone' },
        { id: 'n_mouth_tape', label: 'Tape mouth',  type: 'tick' },
      ],
    },
  ],
};

// ─── Daily ───────────────────────────────────────────────────────────────────

export const dailySchema: TabSchema = {
  tab: 'daily',
  sections: [
    {
      title: 'Sleep',
      items: [
        { id: 'd_hours_in_bed',              label: 'Hours in bed',          type: 'number_decimal' },
        { id: 'd_hours_sleep',               label: 'Hours sleep',           type: 'number_decimal' },
        { id: 'd_hours_restorative',         label: 'Hours restorative sleep', type: 'number_decimal' },
        { id: 'd_sleep_efficiency_pct',      label: 'Sleep efficiency',      type: 'computed' },
        { id: 'd_restorative_efficiency_pct', label: 'Restorative efficiency', type: 'computed' },
      ],
    },
    {
      title: 'Movement',
      items: [
        { id: 'd_strength',      label: 'Strength training',      type: 'tick' },
        { id: 'd_sauna',         label: 'Sauna',                  type: 'tick' },
        { id: 'd_training_cals', label: 'Training calories burned', type: 'number_integer' },
        { id: 'd_steps',         label: 'Steps',                  type: 'number_decimal', note: 'In thousands (e.g. 8.4 = 8,400)' },
      ],
    },
    {
      title: 'Nutrition',
      items: [
        { id: 'd_cals_burned',   label: 'Calories burned',   type: 'computed' },
        { id: 'd_cals_consumed', label: 'Calories consumed', type: 'number_integer' },
        { id: 'd_cal_deficit',   label: 'Calorie deficit',   type: 'computed' },
        { id: 'd_protein',       label: 'Protein consumed',  type: 'number_decimal', note: 'grams' },
      ],
    },
    {
      title: 'Food quality',
      items: [
        { id: 'd_fruits_veggies', label: 'Fruits or veggies servings', type: 'number_integer' },
        { id: 'd_eggs',           label: 'Eggs',    type: 'number_integer' },
        { id: 'd_water',          label: 'Water',   type: 'number_decimal', note: 'liters' },
        { id: 'd_caffeine',       label: 'Caffeine', type: 'number_integer', note: 'mg' },
      ],
    },
  ],
};

// ─── Stretch ─────────────────────────────────────────────────────────────────

export const stretchSchema: TabSchema = {
  tab: 'stretch',
  sections: [
    {
      title: 'Lower body — APT',
      items: [
        { id: 's_couch_stretch', label: 'Couch stretch',              type: 'tick', note: '60 sec per side · tuck pelvis under, squeeze rear glute' },
        { id: 's_90_90',         label: '90/90 hip stretch',          type: 'tick', note: '45 sec per side · square shoulders to front shin, lean forward' },
        { id: 's_pigeon',        label: 'Pigeon pose',                type: 'tick', note: '60 sec per side · front knee to wrist, rear leg extended back' },
        { id: 's_glute_bridge',  label: 'Glute bridge with pelvic tilt', type: 'tick', note: '12 reps, 2-sec hold · tilt pelvis posteriorly first, then lift' },
      ],
    },
    {
      title: 'Upper body — head & shoulders',
      items: [
        { id: 's_doorway_pec',  label: 'Doorway pec stretch',             type: 'tick', note: '45 sec per side · forearm against frame, step forward' },
        { id: 's_thoracic_ext', label: 'Thoracic extension over foam roller', type: 'tick', note: '60 sec · roller at shoulder blade level, support neck' },
        { id: 's_wall_angels',  label: 'Wall angels',                     type: 'tick', note: '10 slow reps · keep elbows and forearms on wall throughout' },
        { id: 's_chin_tucks',   label: 'Chin tucks (lying)',              type: 'tick', note: '10 reps, 3-sec hold · press head into floor, pull chin to throat' },
      ],
    },
  ],
};

// ─── Weekly ──────────────────────────────────────────────────────────────────

export const weeklySchema: TabSchema = {
  tab: 'weekly',
  sections: [
    {
      title: 'Grooming',
      items: [
        { id: 'w_body_shaving',     label: 'Body shaving',    type: 'tick', note: 'Chest, belly, armpits — not within 24h of face shave' },
        { id: 'w_body_exfoliating', label: 'Body exfoliating', type: 'tick', note: 'Scrubbing glove + body gel, body only' },
        { id: 'w_trim_facial_hair', label: 'Trim facial hair', type: 'tick', note: 'Brows, sideburns, neck, ears, etc.' },
        { id: 'w_brow_tinting',     label: 'Brow tinting',    type: 'tick', note: 'RefectoCil #3 Natural Brown · every 4 weeks' },
        { id: 'w_toenails',         label: 'Toenails',        type: 'tick' },
        { id: 'w_floss',            label: 'Floss',           type: 'tick' },
      ],
    },
    {
      title: 'Body',
      items: [
        { id: 'w_weight',         label: 'Weight',         type: 'number_decimal', note: 'kg' },
        { id: 'w_progress_photo', label: 'Progress photo', type: 'tick', note: 'Front + side, neutral lighting, no shirt' },
      ],
    },
    {
      title: 'To-dos',
      items: [
        { id: 'w_groceries',     label: 'Buy groceries',   type: 'tick' },
        { id: 'w_meal_prep',     label: 'Meal prep',       type: 'tick' },
        { id: 'w_housekeeping',  label: 'Housekeeping',    type: 'tick', note: 'Tidy up, clean, laundry' },
        { id: 'w_budget_review', label: 'Budget review',   type: 'tick' },
        { id: 'w_call_parents',  label: 'Call mom and dad', type: 'tick' },
      ],
    },
  ],
};
