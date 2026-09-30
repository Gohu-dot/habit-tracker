-- Migration : ajoute l'espace RPG (compte séparé, voir CLAUDE.md) — table
-- de catalogue de quêtes personnelles + journal des quêtes accomplies.
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- La table est créée en premier, avant qu'on touche à ses policies (voir
-- la mésaventure de 002_period_days.sql : "drop policy ... on X" échoue
-- si la table X n'existe pas encore, même avec "if exists" sur la policy).

create table if not exists rpg_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  stat_key text not null check (stat_key in ('physique', 'mental', 'discipline', 'creativite', 'social')),
  xp_value integer not null default 10 check (xp_value > 0),
  created_at timestamptz not null default now()
);

alter table rpg_quests enable row level security;

drop policy if exists "rpg_quests: owner read" on rpg_quests;
drop policy if exists "rpg_quests: owner insert" on rpg_quests;
drop policy if exists "rpg_quests: owner update" on rpg_quests;
drop policy if exists "rpg_quests: owner delete" on rpg_quests;

create policy "rpg_quests: owner read" on rpg_quests
  for select using (auth.uid() = user_id);
create policy "rpg_quests: owner insert" on rpg_quests
  for insert with check (auth.uid() = user_id);
create policy "rpg_quests: owner update" on rpg_quests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rpg_quests: owner delete" on rpg_quests
  for delete using (auth.uid() = user_id);

create table if not exists rpg_quest_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quest_id uuid references rpg_quests (id) on delete set null,
  log_date date not null,
  stat_key text not null check (stat_key in ('physique', 'mental', 'discipline', 'creativite', 'social')),
  xp_value integer not null check (xp_value > 0),
  created_at timestamptz not null default now(),
  unique (user_id, quest_id, log_date)
);

alter table rpg_quest_logs enable row level security;

drop policy if exists "rpg_quest_logs: owner read" on rpg_quest_logs;
drop policy if exists "rpg_quest_logs: owner insert" on rpg_quest_logs;
drop policy if exists "rpg_quest_logs: owner delete" on rpg_quest_logs;

create policy "rpg_quest_logs: owner read" on rpg_quest_logs
  for select using (auth.uid() = user_id);
create policy "rpg_quest_logs: owner insert" on rpg_quest_logs
  for insert with check (auth.uid() = user_id);
create policy "rpg_quest_logs: owner delete" on rpg_quest_logs
  for delete using (auth.uid() = user_id);
