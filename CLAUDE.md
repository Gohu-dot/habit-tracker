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
  `DAILY_TARGET_POINTS` (objectif quotidien) + `PERIOD_TARGET_POINTS`
  (objectif abaissé les jours de règles) — source de vérité unique, rien de
  tout ça n'est en base ni modifiable depuis l'interface
- `lib/supabaseClient.ts` : client Supabase (variables d'env `NEXT_PUBLIC_*`)
- `lib/types.ts` : types `HabitLog` (une habitude cochée un jour) et
  `PeriodDay` (un jour marqué "règles")
- `lib/date.ts` : helpers de date — `todayISO()` renvoie la date "métier" du
  jour, décalée par `DAY_RESET_HOUR`/`DAY_RESET_MINUTE` (7h30 par défaut :
  avant cette heure, on est encore sur la veille), + début de semaine/mois,
  addition de jours
- `lib/history.ts` : calculs à partir des logs bruts — total de points par
  jour, `targetForDay(day, periodDays)` (objectif variable selon si le jour
  est marqué "règles"), série de jours consécutifs réussis (streak), bilan
  sur une plage de dates (semaine/mois), toutes les dates d'un mois donné
  (`monthDays`) pour le calendrier. **Toute fonction qui compare des points
  à un objectif prend `periodDays` en paramètre** — ne jamais réintroduire
  une comparaison à `DAILY_TARGET_POINTS` en dur.
- `lib/phrases.ts` : pools de phrases (drôles / valorisantes, variantes
  "règles" plus douces) + `pickDailyPhrase` (tirage stable sur la journée
  via un hash de la date, pas de re-tirage à chaque coche)
- `supabase/schema.sql` : schéma (tables `habit_logs` et `period_days`) +
  policies RLS
- `supabase/migrations/` : scripts de migration ponctuels à exécuter à la
  main dans le SQL Editor Supabase (pas de migration automatique)
- `components/AuthGate.tsx` : bascule connexion / tableau de bord
- `components/Dashboard.tsx` : charge les logs et les jours de règles des
  90 derniers jours (pas seulement aujourd'hui, pour alimenter
  l'historique), calcule les points du jour + les stats d'historique +
  l'objectif/la phrase du jour selon `periodDays`, gère le cocher/décocher
  (habitudes et case "règles"), déclenche l'animation de succès
  (`animate-celebrate` dans `globals.css`) au moment précis où l'objectif
  est atteint
- `components/HistorySection.tsx` : série en cours, bilan semaine/mois,
  calendrier complet du mois en cours (grille 7 colonnes alignée sur le
  jour de la semaine, jours futurs affichés en grisé/neutre, jours de
  règles teintés terracotta avec un petit point indicateur)
- `components/PointsChart.tsx` : graphique SVG fait main (pas de librairie
  de charts) de l'évolution des points du mois, avec ligne de seuil en
  escalier (l'objectif baisse les jours de règles) et infobulle
  interactive (pointermove/pointerleave, donc souris et tactile)
- `components/ThemeToggle.tsx` : bascule thème clair/sombre, persistée en
  `localStorage`, appliquée via l'attribut `data-theme` sur `<html>`
- `components/HabitCard.tsx`, `Gauge.tsx`, `LoginForm.tsx`
- `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png` : PWA (site
  installable sur écran d'accueil mobile) — toujours pas de mode
  hors-ligne (l'appli a besoin du réseau pour Supabase de toute façon),
  mais un service worker existe désormais pour les notifications push
  (voir plus bas)

## Rappel du soir (notifications push)
- `public/sw.js` : service worker minimal, écoute juste `push` (affiche la
  notification) et `notificationclick` (ramène au site) — pas de cache/
  mode hors-ligne.
- `lib/push.ts` : côté navigateur — détection du support, conversion de la
  clé VAPID publique, abonnement/désabonnement (`PushManager`).
- `components/PushReminderToggle.tsx` : bouton d'activation/désactivation,
  enregistre l'abonnement dans la table `push_subscriptions` (RLS comme
  les autres tables).
- `lib/supabaseAdmin.ts` : client Supabase avec la clé `service_role`
  (contourne RLS) — **réservé au code serveur**, jamais importé dans un
  composant `"use client"`.
- `app/api/cron/evening-check/route.ts` : route appelée chaque soir par
  Vercel Cron (`vercel.json`, `0 17 * * *` UTC = 19h en heure d'été ; à
  ajuster à `0 18 * * *` en heure d'hiver si on veut rester précis à
  19h — Vercel ne gère pas les fuseaux horaires locaux). Protégée par
  `CRON_SECRET` (Vercel l'ajoute automatiquement en en-tête
  `Authorization` sur ses propres appels). Calcule les points du jour de
  chaque abonné avec les mêmes règles que le reste de l'app
  (`lib/habits.ts`, objectif variable selon `period_days`), envoie une
  notification via `web-push` si l'objectif n'est pas atteint, et supprime
  les abonnements expirés/révoqués (erreurs 404/410 du service de push).

## Thème clair/sombre
- Toutes les couleurs de l'appli sont des tokens sémantiques définis dans
  `app/globals.css` sous un bloc `@theme` (cream/ivory/sand/blush/
  blush-deep/ink/ink-soft/danger-*/terracotta/terracotta-deep),
  **jamais** dans le bloc `@theme inline`
  du haut (qui ne sert qu'aux variables de police) : Tailwind y fige les
  valeurs au build, ce qui casserait le thème sombre puisque les classes
  générées (`bg-cream`, `text-ink`, ...) doivent référencer les variables
  CSS via `var()` pour que `:root[data-theme="dark"]` puisse les
  redéfinir.
- Toute nouvelle couleur doit passer par un de ces tokens (ou un nouveau
  token si besoin), jamais par une classe Tailwind de palette brute
  (`text-red-600`, `bg-neutral-900`, ...) qui ne suivrait pas le thème.
- Le `<html>` porte volontairement `suppressHydrationWarning` : le script
  anti-flash (`app/layout.tsx`, stratégie `beforeInteractive`) pose
  `data-theme` avant l'hydratation React, ce qui provoque un mismatch
  serveur/client attendu et sans conséquence sur cet attribut précis.
- Deux familles d'accent cohabitent : blush/blush-deep (jours normaux) et
  terracotta/terracotta-deep (jours de règles). Elles suivent le même
  schéma clair (succès = teinte foncée) / sombre (succès = teinte
  éclaircie) — voir les classes conditionnelles dans Dashboard.tsx,
  HistorySection.tsx et PointsChart.tsx plutôt qu'une couleur en dur.

## Points d'attention
- Toute nouvelle requête Supabase doit rester compatible avec les policies
  RLS (`user_id = auth.uid()`) définies dans `supabase/schema.sql`.
- Utilisateur débutant en développement : explique les concepts au fur et
  à mesure des changements.
