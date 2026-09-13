@AGENTS.md

# Projet : Habit Tracker (usage personnel)

Site privé, un seul utilisateur, pour suivre un catalogue fixe d'habitudes
de vie valant chacune des points, avec une jauge quotidienne (objectif
minimum de points par jour). Pas d'inscription publique, pas de partage :
le compte est créé manuellement dans Supabase.

## Stack
- Next.js (App Router) + Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/supabase-js`, client navigateur
  uniquement (pas de SSR / middleware) — voir `lib/supabaseClient.ts`
- Déploiement Vercel

## Structure
- `lib/habits.ts` : catalogue fixe des habitudes (clé, nom, points) +
  `DAILY_TARGET_POINTS` (objectif quotidien) — source de vérité unique,
  rien de tout ça n'est en base ni modifiable depuis l'interface
- `lib/supabaseClient.ts` : client Supabase (variables d'env `NEXT_PUBLIC_*`)
- `lib/types.ts` : type `HabitLog` (une ligne = une habitude cochée un jour)
- `lib/date.ts` : helper de date du jour
- `supabase/schema.sql` : schéma (table `habit_logs`) + policies RLS
- `supabase/migrations/` : scripts de migration ponctuels à exécuter à la
  main dans le SQL Editor Supabase (pas de migration automatique)
- `components/AuthGate.tsx` : bascule connexion / tableau de bord
- `components/Dashboard.tsx` : chargement des logs du jour + calcul des
  points + jauge globale + logique métier (cocher/décocher)
- `components/HabitCard.tsx`, `Gauge.tsx`, `LoginForm.tsx`

## Points d'attention
- Toute nouvelle requête Supabase doit rester compatible avec les policies
  RLS (`user_id = auth.uid()`) définies dans `supabase/schema.sql`.
- Utilisateur débutant en développement : explique les concepts au fur et
  à mesure des changements.
