@AGENTS.md

# Projet : Habit Tracker (usage personnel)

Site privé, un seul utilisateur, pour suivre des habitudes de vie via des
jauges de progression hebdomadaires. Pas d'inscription publique, pas de
partage : le compte est créé manuellement dans Supabase.

## Stack
- Next.js (App Router) + Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/supabase-js`, client navigateur
  uniquement (pas de SSR / middleware) — voir `lib/supabaseClient.ts`
- Déploiement Vercel

## Structure
- `lib/supabaseClient.ts` : client Supabase (variables d'env `NEXT_PUBLIC_*`)
- `lib/types.ts` : types `Habit` / `HabitLog`
- `lib/date.ts` : helpers de date (semaine du lundi au dimanche)
- `supabase/schema.sql` : schéma + policies RLS à exécuter dans Supabase
- `components/AuthGate.tsx` : bascule connexion / tableau de bord
- `components/Dashboard.tsx` : chargement des données + logique métier
- `components/HabitCard.tsx`, `Gauge.tsx`, `AddHabitForm.tsx`, `LoginForm.tsx`

## Points d'attention
- Toute nouvelle requête Supabase doit rester compatible avec les policies
  RLS (`user_id = auth.uid()`) définies dans `supabase/schema.sql`.
- Utilisateur débutant en développement : explique les concepts au fur et
  à mesure des changements.
