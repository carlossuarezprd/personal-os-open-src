-- Per-field change history for daily_logs.
-- Captures every value edit so users can revert accidental overwrites.
--
-- Apply manually via the Supabase SQL Editor (no auto-migration in this app).

create table if not exists daily_logs_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  date        date not null,
  tab         text not null check (tab in ('morning','daily','night','stretch','weekly')),
  field       text not null,
  prev_value  jsonb,
  new_value   jsonb,
  changed_at  timestamptz default now()
);

create index if not exists daily_logs_history_user_date_idx
  on daily_logs_history (user_id, date, changed_at desc);

alter table daily_logs_history enable row level security;

create policy "daily_logs_history_self_select"
  on daily_logs_history for select
  using (user_id = auth.uid());

create policy "daily_logs_history_self_insert"
  on daily_logs_history for insert
  with check (user_id = auth.uid());

create policy "daily_logs_history_self_delete"
  on daily_logs_history for delete
  using (user_id = auth.uid());
