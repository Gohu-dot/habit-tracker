-- Schéma pour l'app "habit-tracker"
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#22c55e',
  target_per_week smallint not null default 7 check (target_per_week between 1 and 7),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

alter table habits enable row level security;
alter table habit_logs enable row level security;

-- Chaque utilisateur ne voit et ne modifie que ses propres données.
create policy "habits: owner read" on habits
  for select using (auth.uid() = user_id);
create policy "habits: owner insert" on habits
  for insert with check (auth.uid() = user_id);
create policy "habits: owner update" on habits
  for update using (auth.uid() = user_id);
create policy "habits: owner delete" on habits
  for delete using (auth.uid() = user_id);

create policy "habit_logs: owner read" on habit_logs
  for select using (auth.uid() = user_id);
create policy "habit_logs: owner insert" on habit_logs
  for insert with check (auth.uid() = user_id);
create policy "habit_logs: owner delete" on habit_logs
  for delete using (auth.uid() = user_id);
