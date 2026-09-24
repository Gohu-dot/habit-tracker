-- Migration : ajoute le suivi des jours de règles (objectif abaissé).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide) sur un
-- projet qui a déjà le schéma du système de points (001_points_system.sql).
--
-- Rejouable sans erreur (policies supprimées puis recréées).

drop policy if exists "period_days: owner read" on period_days;
drop policy if exists "period_days: owner insert" on period_days;
drop policy if exists "period_days: owner delete" on period_days;

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
