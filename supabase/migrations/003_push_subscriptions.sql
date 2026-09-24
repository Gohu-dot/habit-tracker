-- Migration : ajoute le stockage des abonnements aux notifications push.
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- La table est créée en premier, avant qu'on touche à ses policies (voir
-- la mésaventure de 002_period_days.sql : "drop policy ... on X" échoue
-- si la table X n'existe pas encore, même avec "if exists" sur la policy).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

drop policy if exists "push_subscriptions: owner read" on push_subscriptions;
drop policy if exists "push_subscriptions: owner insert" on push_subscriptions;
drop policy if exists "push_subscriptions: owner update" on push_subscriptions;
drop policy if exists "push_subscriptions: owner delete" on push_subscriptions;

create policy "push_subscriptions: owner read" on push_subscriptions
  for select using (auth.uid() = user_id);
create policy "push_subscriptions: owner insert" on push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "push_subscriptions: owner update" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions: owner delete" on push_subscriptions
  for delete using (auth.uid() = user_id);
