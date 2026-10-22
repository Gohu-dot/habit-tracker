-- Migration : ajoute l'onglet "Films" (top 100 des meilleurs films de tous
-- les temps, fourni par l'utilisateur — liste à importer depuis l'app une
-- fois ce schéma en place, voir le bouton "Importer la liste" sur la page).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- PARTAGÉE entre tous les comptes du site dès la création (contrairement à
-- `recipes`, partagée seulement après coup — voir 009_shared_recipes.sql) :
-- les deux membres du couple doivent voir/cocher/noter les mêmes films.
-- `user_id` reste enregistré à titre informatif (qui a ajouté/modifié la
-- ligne) mais ne restreint pas l'accès.
--
-- `rank` est la position dans le classement fourni (1 à 100, mais pas de
-- contrainte "<= 100" en dur : rien n'empêche d'étendre la liste plus tard),
-- UNIQUE pour permettre un import en upsert (`on_conflict: rank`) : coller
-- la liste une seconde fois pour corriger une faute de frappe met à jour
-- title/year/director sans toucher watched/rating/note déjà renseignés
-- (l'upsert ne porte que sur les colonnes envoyées).

create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rank integer not null unique check (rank > 0),
  title text not null,
  year integer,
  director text,
  watched boolean not null default false,
  watched_at date,
  rating smallint check (rating between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

alter table movies enable row level security;

drop policy if exists "movies: any authenticated read" on movies;
drop policy if exists "movies: any authenticated insert" on movies;
drop policy if exists "movies: any authenticated update" on movies;
drop policy if exists "movies: any authenticated delete" on movies;

create policy "movies: any authenticated read" on movies
  for select using (auth.uid() is not null);
create policy "movies: any authenticated insert" on movies
  for insert with check (auth.uid() is not null);
create policy "movies: any authenticated update" on movies
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "movies: any authenticated delete" on movies
  for delete using (auth.uid() is not null);
