-- Schéma pour l'app "habit-tracker"
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
--
-- Le catalogue des habitudes (nom, points) est fixe et vit dans le code
-- (lib/habits.ts), pas en base : seule la table ci-dessous enregistre,
-- pour un utilisateur et une date donnés, quelles habitudes ont été cochées.

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_key text not null,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, habit_key, log_date)
);

alter table habit_logs enable row level security;

-- Chaque utilisateur ne voit et ne modifie que ses propres données.
create policy "habit_logs: owner read" on habit_logs
  for select using (auth.uid() = user_id);
create policy "habit_logs: owner insert" on habit_logs
  for insert with check (auth.uid() = user_id);
create policy "habit_logs: owner delete" on habit_logs
  for delete using (auth.uid() = user_id);

-- Jours marqués comme "règles" : abaisse l'objectif du jour à
-- PERIOD_TARGET_POINTS (voir lib/habits.ts). La présence d'une ligne pour
-- une date donnée suffit à marquer ce jour-là ; pas de colonne booléenne.
create table if not exists period_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table period_days enable row level security;

create policy "period_days: owner read" on period_days
  for select using (auth.uid() = user_id);
create policy "period_days: owner insert" on period_days
  for insert with check (auth.uid() = user_id);
create policy "period_days: owner delete" on period_days
  for delete using (auth.uid() = user_id);
