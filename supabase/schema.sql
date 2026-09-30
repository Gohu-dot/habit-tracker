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

-- Abonnements aux notifications push (un par appareil/navigateur où le site
-- a été installé et les notifications activées). Le endpoint identifie de
-- façon unique un appareil auprès du service de push (Google, Mozilla...).
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  -- Heure locale (Europe/Paris, 0-23) à laquelle envoyer le rappel du soir.
  reminder_hour smallint not null default 19 check (reminder_hour between 0 and 23),
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions: owner read" on push_subscriptions
  for select using (auth.uid() = user_id);
create policy "push_subscriptions: owner insert" on push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "push_subscriptions: owner update" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions: owner delete" on push_subscriptions
  for delete using (auth.uid() = user_id);

-- Recettes saines repérées sur les réseaux (TikTok, Instagram...) : juste un
-- lien à conserver, pas de tentative d'intégrer la vidéo elle-même. La
-- catégorie et le statut sont des catalogues fixes (voir lib/recipes.ts),
-- comme le catalogue des habitudes.
--
-- Contrairement aux autres tables (habit_logs, rpg_quests...), celle-ci est
-- PARTAGÉE entre tous les comptes du site plutôt que scopée par
-- utilisateur : les deux membres du couple doivent voir/gérer les mêmes
-- recettes (l'un importe depuis Android, l'autre doit pouvoir les
-- consulter et les modifier). `user_id` reste enregistré à titre
-- informatif (qui a ajouté la recette) mais n'est plus utilisé pour
-- restreindre l'accès — voir les policies "any authenticated" ci-dessous.
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  category text not null,
  status text not null default 'a_tester' check (status in ('a_tester', 'testee', 'validee')),
  note text,
  -- Légende et miniature d'origine de la vidéo (récupérées automatiquement
  -- pour TikTok via son oEmbed public, voir app/api/tiktok-oembed) :
  -- `caption` séparée de `note` pour que la note perso reste toujours
  -- disponible, sans être écrasée.
  caption text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;

create policy "recipes: any authenticated read" on recipes
  for select using (auth.uid() is not null);
create policy "recipes: any authenticated insert" on recipes
  for insert with check (auth.uid() is not null);
create policy "recipes: any authenticated update" on recipes
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "recipes: any authenticated delete" on recipes
  for delete using (auth.uid() is not null);

-- Espace RPG (compte séparé, voir CLAUDE.md) : catalogue de quêtes
-- personnelles éditable par l'utilisateur (contrairement au catalogue fixe
-- des habitudes) et journal des quêtes accomplies chaque jour.
create table if not exists rpg_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  stat_key text not null check (stat_key in ('physique', 'mental', 'discipline', 'creativite', 'social')),
  xp_value integer not null default 10 check (xp_value > 0),
  created_at timestamptz not null default now()
);

alter table rpg_quests enable row level security;

create policy "rpg_quests: owner read" on rpg_quests
  for select using (auth.uid() = user_id);
create policy "rpg_quests: owner insert" on rpg_quests
  for insert with check (auth.uid() = user_id);
create policy "rpg_quests: owner update" on rpg_quests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rpg_quests: owner delete" on rpg_quests
  for delete using (auth.uid() = user_id);

-- stat_key et xp_value sont dupliqués depuis la quête au moment de la coche
-- (pas de jointure vers rpg_quests) : l'XP déjà gagné reste exact même si
-- la quête est ensuite modifiée ou supprimée (quest_id passe alors à null,
-- la ligne elle-même n'est jamais perdue).
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

create policy "rpg_quest_logs: owner read" on rpg_quest_logs
  for select using (auth.uid() = user_id);
create policy "rpg_quest_logs: owner insert" on rpg_quest_logs
  for insert with check (auth.uid() = user_id);
create policy "rpg_quest_logs: owner delete" on rpg_quest_logs
  for delete using (auth.uid() = user_id);
