-- Migration : ajoute les quêtes principales (objectifs à moyen/long terme
-- débloqués en montant de niveau dans une capacité), en plus des quêtes
-- secondaires déjà existantes.
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- La table est créée en premier, avant qu'on touche à ses policies (voir
-- la mésaventure de 002_period_days.sql).

create table if not exists rpg_main_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stat_key text not null check (stat_key in ('force', 'intelligence', 'volonte', 'agilite', 'rapidite', 'endurance', 'personnalite', 'chance')),
  unlock_level integer not null check (unlock_level > 0),
  title text not null,
  xp_reward integer not null default 50 check (xp_reward > 0),
  completed_at timestamptz,
  xp_log_id uuid references rpg_quest_logs (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table rpg_main_quests enable row level security;

drop policy if exists "rpg_main_quests: owner read" on rpg_main_quests;
drop policy if exists "rpg_main_quests: owner insert" on rpg_main_quests;
drop policy if exists "rpg_main_quests: owner update" on rpg_main_quests;
drop policy if exists "rpg_main_quests: owner delete" on rpg_main_quests;

create policy "rpg_main_quests: owner read" on rpg_main_quests
  for select using (auth.uid() = user_id);
create policy "rpg_main_quests: owner insert" on rpg_main_quests
  for insert with check (auth.uid() = user_id);
create policy "rpg_main_quests: owner update" on rpg_main_quests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rpg_main_quests: owner delete" on rpg_main_quests
  for delete using (auth.uid() = user_id);
