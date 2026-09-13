-- Migration : passage à un catalogue d'habitudes fixe + système de points.
-- À exécuter dans Supabase (SQL Editor, dans une NOUVELLE requête vide) sur
-- un projet qui a l'ancien schéma (tables "habits" + "habit_logs" avec
-- target_per_week).
--
-- Ce script est rejouable : il supprime d'abord les policies et tables
-- existantes (si elles existent) avant de tout recréer, donc pas d'erreur
-- "already exists" même en cas de deuxième exécution.
--
-- Attention : supprime l'historique existant (habits + habit_logs). Sans
-- conséquence si l'app vient d'être créée et n'a pas encore de vraies
-- données à conserver.

drop policy if exists "habits: owner read" on habits;
drop policy if exists "habits: owner insert" on habits;
drop policy if exists "habits: owner update" on habits;
drop policy if exists "habits: owner delete" on habits;
drop policy if exists "habit_logs: owner read" on habit_logs;
drop policy if exists "habit_logs: owner insert" on habit_logs;
drop policy if exists "habit_logs: owner delete" on habit_logs;

drop table if exists habit_logs cascade;
drop table if exists habits cascade;

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
