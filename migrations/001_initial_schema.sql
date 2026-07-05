-- Run this in Supabase SQL Editor

-- Tables

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  morning jsonb default '{}'::jsonb,
  daily jsonb default '{}'::jsonb,
  night jsonb default '{}'::jsonb,
  stretch jsonb default '{}'::jsonb,
  weekly jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  session_date date not null,
  session_time timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

create table if not exists muscle_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  muscle_group_id uuid references muscle_groups not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, muscle_group_id, name)
);

create table if not exists gyms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references training_sessions on delete cascade not null,
  exercise_id uuid references exercises not null,
  gym_id uuid references gyms not null,
  created_at timestamptz default now()
);

create table if not exists sets (
  id uuid primary key default gen_random_uuid(),
  exercise_log_id uuid references exercise_logs on delete cascade not null,
  set_index int not null,
  weight numeric not null,
  weight_unit text not null check (weight_unit in ('kg', 'lbs')),
  reps int not null,
  created_at timestamptz default now()
);

create table if not exists settings (
  user_id uuid primary key references auth.users,
  sleep_target_hours numeric default 7.5,
  primary_weight_unit text default 'kg' check (primary_weight_unit in ('kg', 'lbs')),
  thresholds jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- RLS

alter table daily_logs enable row level security;
alter table training_sessions enable row level security;
alter table muscle_groups enable row level security;
alter table exercises enable row level security;
alter table gyms enable row level security;
alter table exercise_logs enable row level security;
alter table sets enable row level security;
alter table settings enable row level security;

create policy "daily_logs_self" on daily_logs for all using (user_id = auth.uid());
create policy "training_sessions_self" on training_sessions for all using (user_id = auth.uid());
create policy "muscle_groups_self" on muscle_groups for all using (user_id = auth.uid());
create policy "exercises_self" on exercises for all using (user_id = auth.uid());
create policy "gyms_self" on gyms for all using (user_id = auth.uid());

create policy "exercise_logs_self" on exercise_logs for all
  using (
    exists (
      select 1 from training_sessions ts
      where ts.id = exercise_logs.session_id and ts.user_id = auth.uid()
    )
  );

create policy "sets_self" on sets for all
  using (
    exists (
      select 1 from exercise_logs el
      join training_sessions ts on ts.id = el.session_id
      where el.id = sets.exercise_log_id and ts.user_id = auth.uid()
    )
  );

create policy "settings_self" on settings for all using (user_id = auth.uid());

-- Trigger: insert default settings row when Carlos's account is created

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.settings (user_id, thresholds)
  values (
    new.id,
    '{
      "d_hours_sleep":                  { "value": 7.5,  "direction": "min" },
      "d_sleep_efficiency_pct":         { "value": 85,   "direction": "min" },
      "d_restorative_efficiency_pct":   { "value": 40,   "direction": "min" },
      "d_steps":                        { "value": 10.0, "direction": "min" },
      "d_protein":                      { "value": 160,  "direction": "min" },
      "d_cals_consumed":                { "value": 2750, "direction": "max" },
      "d_cal_deficit":                  { "value": 750,  "direction": "min" },
      "d_fruits_veggies":               { "value": 1,    "direction": "min" },
      "d_eggs":                         { "value": 1,    "direction": "min" },
      "d_water":                        { "value": 2.5,  "direction": "min" },
      "d_caffeine":                     { "value": 400,  "direction": "max" },
      "d_strength":                     { "value": 4,    "direction": "min", "unit": "days_per_week" },
      "d_sauna":                        { "value": 1,    "direction": "min", "unit": "days_per_week" }
    }'::jsonb
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
