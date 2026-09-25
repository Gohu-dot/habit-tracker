-- Migration : ajoute l'onglet "Recettes" (liens de recettes saines trouvées
-- sur les réseaux, avec catégorie et statut).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- La table est créée en premier, avant qu'on touche à ses policies (voir
-- la mésaventure de 002_period_days.sql : "drop policy ... on X" échoue
-- si la table X n'existe pas encore, même avec "if exists" sur la policy).

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  category text not null,
  status text not null default 'a_tester' check (status in ('a_tester', 'testee', 'validee')),
  note text,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;

drop policy if exists "recipes: owner read" on recipes;
drop policy if exists "recipes: owner insert" on recipes;
drop policy if exists "recipes: owner update" on recipes;
drop policy if exists "recipes: owner delete" on recipes;

create policy "recipes: owner read" on recipes
  for select using (auth.uid() = user_id);
create policy "recipes: owner insert" on recipes
  for insert with check (auth.uid() = user_id);
create policy "recipes: owner update" on recipes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipes: owner delete" on recipes
  for delete using (auth.uid() = user_id);
