-- Migration : passage à un catalogue d'habitudes fixe + système de points.
-- À exécuter une seule fois dans Supabase (SQL Editor) sur un projet qui a
-- déjà l'ancien schéma (tables "habits" + "habit_logs" avec target_per_week).
--
-- Attention : supprime l'historique existant (habits + habit_logs). Sans
-- conséquence si l'app vient d'être créée et n'a pas encore de vraies
-- données à conserver.

drop table if exists habit_logs;
drop table if exists habits;

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_key text not null,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, habit_key, log_date)
);

alter table habit_logs enable row level security;

create policy "habit_logs: owner read" on habit_logs
  for select using (auth.uid() = user_id);
create policy "habit_logs: owner insert" on habit_logs
  for insert with check (auth.uid() = user_id);
create policy "habit_logs: owner delete" on habit_logs
  for delete using (auth.uid() = user_id);
