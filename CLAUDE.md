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
- `lib/date.ts` : helpers de date (jour courant, début de semaine/mois,
  addition de jours)
- `lib/history.ts` : calculs à partir des logs bruts — total de points par
  jour, série de jours consécutifs réussis (streak), bilan sur une plage de
  dates (semaine/mois), liste des N derniers jours
- `supabase/schema.sql` : schéma (table `habit_logs`) + policies RLS
- `supabase/migrations/` : scripts de migration ponctuels à exécuter à la
  main dans le SQL Editor Supabase (pas de migration automatique)
- `components/AuthGate.tsx` : bascule connexion / tableau de bord
- `components/Dashboard.tsx` : charge les logs des 90 derniers jours (pas
  seulement aujourd'hui, pour alimenter l'historique), calcule les points
  du jour + les stats d'historique, gère le cocher/décocher, déclenche
  l'animation de succès (`animate-celebrate` dans `globals.css`) au moment
  précis où l'objectif est atteint
- `components/HistorySection.tsx` : série en cours, bilan semaine/mois,
  mini calendrier des 14 derniers jours
- `components/HabitCard.tsx`, `Gauge.tsx`, `LoginForm.tsx`
- `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png` : PWA (site
  installable sur écran d'accueil mobile), pas de service worker/mode
  hors-ligne volontairement — l'appli a besoin du réseau pour Supabase de
  toute façon

## Points d'attention
- Toute nouvelle requête Supabase doit rester compatible avec les policies
  RLS (`user_id = auth.uid()`) définies dans `supabase/schema.sql`.
- Utilisateur débutant en développement : explique les concepts au fur et
  à mesure des changements.
