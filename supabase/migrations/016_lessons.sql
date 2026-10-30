-- Migration : ajoute l'onglet "Leçons" (bibliothèque de culture générale,
-- lecture longue + révision espacée). À exécuter dans Supabase (SQL
-- Editor, nouvelle requête vide).
--
-- Trois tables aux périmètres différents, contrairement à l'habitude
-- "tout partagé" de movies/recipes :
--  - lessons        : PARTAGÉE entre tous les comptes (la bibliothèque de
--                      contenu elle-même, comme movies/recipes).
--  - lesson_progress : scopée par compte (chacun avance à son rythme,
--                      comme habit_logs) — une ligne par (compte, leçon).
--  - lesson_notes    : scopée par compte (notes personnelles, pas
--                      partagées).

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  -- Texte libre (pas un catalogue figé en "check") : l'architecture doit
  -- permettre d'ajouter facilement de nouvelles disciplines sans migration
  -- — voir DOMAIN_SUGGESTIONS dans lib/lessons.ts pour les suggestions
  -- proposées à la saisie.
  domain text not null,
  summary text,
  -- Markdown "maison" minimal (## / ### / "> " encadré / "- " liste),
  -- parsé côté client par parseLessonContent (lib/lessons.ts) — pas de
  -- dépendance markdown ajoutée pour ce premier palier.
  content text not null default '',
  estimated_minutes integer,
  difficulty text not null default 'intermediaire'
    check (difficulty in ('decouverte', 'intermediaire', 'avance')),
  -- 'a_importer' : cas des leçons 1/2 déjà évoquées hors de cette session
  -- (voir CLAUDE.md), dont je n'ai pas le texte intégral — contenu vide en
  -- attendant qu'il soit collé dans l'app.
  editorial_status text not null default 'brouillon'
    check (editorial_status in ('brouillon', 'a_verifier', 'verifiee', 'publiee', 'a_importer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lessons enable row level security;

create policy "lessons: any authenticated read" on lessons
  for select using (auth.uid() is not null);
create policy "lessons: any authenticated insert" on lessons
  for insert with check (auth.uid() is not null);
create policy "lessons: any authenticated update" on lessons
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "lessons: any authenticated delete" on lessons
  for delete using (auth.uid() is not null);

-- Pas de colonne "status" séparée pour "à réviser" : dérivé côté client de
-- next_review_at <= aujourd'hui quand status = 'terminee' (voir
-- lib/lessons.ts) — un état de moins à garder synchronisé.
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  status text not null default 'en_cours' check (status in ('en_cours', 'terminee')),
  -- Index de la section (titre ##) la plus récemment consultée, pour
  -- reprendre la lecture au bon endroit — voir LessonReader.tsx.
  last_section_index integer not null default 0,
  -- Position dans l'échelle de répétition espacée [1, 3, 7, 14, 30] jours
  -- (voir REVIEW_INTERVALS_DAYS, lib/lessons.ts) ; remise à 0 si la
  -- révision est ratée.
  review_stage integer not null default 0,
  next_review_at date,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;

create policy "lesson_progress: owner read" on lesson_progress
  for select using (auth.uid() = user_id);
create policy "lesson_progress: owner insert" on lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "lesson_progress: owner update" on lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress: owner delete" on lesson_progress
  for delete using (auth.uid() = user_id);

create table if not exists lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lesson_notes enable row level security;

create policy "lesson_notes: owner read" on lesson_notes
  for select using (auth.uid() = user_id);
create policy "lesson_notes: owner insert" on lesson_notes
  for insert with check (auth.uid() = user_id);
create policy "lesson_notes: owner update" on lesson_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_notes: owner delete" on lesson_notes
  for delete using (auth.uid() = user_id);

-- Continuité avec les deux leçons déjà évoquées hors de cette session (voir
-- CLAUDE.md) : entrées créées avec leur titre connu, contenu vide et statut
-- "a_importer" — je n'ai pas le texte intégral de ces échanges passés, donc
-- pas question de l'inventer. À compléter en collant le texte dans l'app
-- (le champ "contenu" peut être modifié après création).
-- "where not exists" plutôt que "on conflict" : la table n'a pas de
-- contrainte unique sur le titre (et ne devrait pas en avoir, rien
-- n'empêche deux leçons de partager un titre en général), donc pas de
-- cible de conflit valable pour dédoublonner — ce garde-fou sert
-- uniquement à ce que relancer cette migration par erreur ne duplique pas
-- ces deux entrées précises.
insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status)
select (select id from auth.users order by created_at limit 1),
  'Pourquoi y a-t-il quelque chose plutôt que rien ?',
  'Cosmologie et philosophie',
  'Exploration de l''existence, de la cosmologie et de la philosophie — contenu à importer.',
  '',
  'intermediaire',
  'a_importer'
where not exists (
  select 1 from lessons where title = 'Pourquoi y a-t-il quelque chose plutôt que rien ?'
);

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status)
select (select id from auth.users order by created_at limit 1),
  'Qu''est-ce que la matière ?',
  'Physique et chimie',
  'Introduction aux constituants du monde physique — contenu à importer.',
  '',
  'intermediaire',
  'a_importer'
where not exists (
  select 1 from lessons where title = 'Qu''est-ce que la matière ?'
);
