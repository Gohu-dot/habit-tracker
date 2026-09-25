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
- `lib/recipes.ts` : catalogue fixe des catégories de recettes (petit-déj,
  déjeuner, dîner, encas, dessert, boisson) et des statuts (à tester /
  testée / validée), même logique que `lib/habits.ts` — fixe dans le code,
  pas en base. `nextRecipeStatus` fait avancer le statut d'un cran (cycle
  à_tester → testée → validée → à_tester), utilisé par le bouton-pastille
  sur chaque fiche recette plutôt qu'un menu déroulant.
- `lib/supabaseClient.ts` : client Supabase (variables d'env `NEXT_PUBLIC_*`)
- `lib/types.ts` : types `HabitLog` (une habitude cochée un jour) et
  `PeriodDay` (un jour marqué "règles")
- `lib/date.ts` : helpers de date — `todayISO()` renvoie la date "métier" du
  jour, décalée par `DAY_RESET_HOUR`/`DAY_RESET_MINUTE` (7h30 par défaut :
  avant cette heure, on est encore sur la veille), + début de semaine/mois,
  addition de jours
- `lib/history.ts` : calculs à partir des logs bruts — total de points par
  jour, `targetForDay(day, periodDays)` (objectif variable selon si le jour
  est marqué "règles"), série de jours consécutifs réussis en cours
  (`computeStreak`) et record absolu sur la plage disponible
  (`computeBestStreak` — ne traite pas le jour en cours spécialement,
  contrairement à `computeStreak`, puisqu'un record ne "casse" jamais),
  bilan sur une plage de dates (semaine/mois), toutes les dates d'un mois
  donné (`monthDays`) pour le calendrier, taux de complétion par habitude sur
  une plage (`computeHabitStats`, utilisé pour repérer l'habitude la plus
  loupée). **Toute fonction qui compare des points à un objectif prend
  `periodDays` en paramètre** — ne jamais réintroduire une comparaison à
  `DAILY_TARGET_POINTS` en dur.
- `lib/streakMilestones.ts` : paliers de série fixes (3, 7, 14, 21, 30, 60,
  100, 180, 365 jours) avec un label dédié chacun — `reachedMilestone`
  (le plus haut déjà atteint) et `nextMilestone` (le suivant + jours
  restants), tous deux purs fonctions de `streak`, pas de state ni de
  persistance de "premier jour où le palier a été atteint" (pas de
  confetti one-shot, juste un affichage stable tant que la série tient).
- `lib/phrases.ts` : pools de phrases (drôles / valorisantes, variantes
  "règles" plus douces) + `pickDailyPhrase` (tirage stable sur la journée
  via un hash de la date, pas de re-tirage à chaque coche)
- `supabase/schema.sql` : schéma (tables `habit_logs` et `period_days`) +
  policies RLS
- `supabase/migrations/` : scripts de migration ponctuels à exécuter à la
  main dans le SQL Editor Supabase (pas de migration automatique)
- `components/AuthGate.tsx` : bascule connexion / contenu authentifié. Prend
  un render-prop `children: (userId) => ReactNode` plutôt qu'un composant
  fixe, pour servir plusieurs pages (`app/page.tsx` → `Dashboard`,
  `app/recettes/page.tsx` → `RecipesPage`) sans dupliquer la logique de
  session. Ses deux appelants sont des Client Components (`"use client"`
  en tête de fichier) : un Server Component ne peut pas passer une fonction
  en prop à un composant client (erreur de build sinon).
- `components/AppHeader.tsx` : header partagé par toutes les pages
  authentifiées (navigation `NavTabs`, `ThemeToggle`, déconnexion) — évite
  de dupliquer `handleSignOut` dans chaque page.
- `components/NavTabs.tsx` : liens Habitudes/Recettes, onglet actif détecté
  via `usePathname()`.
- `components/Dashboard.tsx` : charge les logs et les jours de règles des
  90 derniers jours (pas seulement aujourd'hui, pour alimenter
  l'historique), calcule les points du jour + les stats d'historique +
  l'objectif/la phrase du jour selon `periodDays`, gère le cocher/décocher
  (habitudes et case "règles"), déclenche l'animation de succès
  (`animate-celebrate` dans `globals.css`) au moment précis où l'objectif
  est atteint. Les handlers de coche (`handleToggleForDate`,
  `handleTogglePeriodForDate`) sont génériques sur une date : la grille du
  jour les appelle avec `today` codé en dur (`handleToggle`/
  `handleTogglePeriod`), et `EditPastDay` les appelle avec la date choisie —
  ne pas dupliquer cette logique si un nouvel endroit doit un jour modifier
  une habitude sur une date arbitraire.
- `components/HistorySection.tsx` : série en cours, record perso, palier de
  série atteint/à venir (`lib/streakMilestones.ts`), bilan semaine/mois,
  calendrier complet du mois en cours (grille 7 colonnes alignée sur le
  jour de la semaine, jours futurs affichés en grisé/neutre, jours de
  règles teintés terracotta avec un petit point indicateur)
- `components/HabitStatsSection.tsx` : taux de complétion par habitude sur
  les 30 derniers jours glissants (`computeHabitStats`), barres triées du
  pire au meilleur taux pour repérer d'un coup d'œil l'habitude la plus
  loupée — pas de librairie de charts, juste des barres CSS.
- `components/EditPastDay.tsx` : panneau repliable (fermé par défaut) pour
  corriger un jour passé — sélecteur de date borné entre `today` et le
  début de la fenêtre de 90 jours chargée par `Dashboard`, puis les mêmes
  6 habitudes + la case "règles" pour cette date-là. Ne fait aucun appel
  Supabase lui-même : reçoit les données (`doneKeysForDate`,
  `isPeriodForDate`) et les handlers (`onToggleHabit`, `onTogglePeriod`) de
  `Dashboard`, qui reste seul propriétaire du state `logs`/`periodDayRows`.
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

## Onglet Recettes
- `app/recettes/page.tsx` : route dédiée, même schéma que `app/page.tsx`
  (`AuthGate` + composant de page).
- `components/RecipesPage.tsx` : charge les recettes de l'utilisateur
  (RLS filtre automatiquement, pas de `.eq("user_id", ...)` explicite —
  même pattern que `habit_logs`/`period_days`), formulaire d'ajout
  toujours visible (titre + lien + catégorie + note optionnelle), filtres
  par catégorie/statut, liste de `RecipeCard`.
- `components/RecipeCard.tsx` : une fiche = titre cliquable (ouvre le lien
  TikTok/Instagram dans un nouvel onglet), pastille catégorie, pastille
  statut cliquable qui fait avancer le cycle (`nextRecipeStatus`), note
  optionnelle, bouton supprimer. Volontairement pas d'aperçu/miniature de
  la vidéo (dépendrait d'un service oEmbed tiers fragile) : juste un lien
  propre.
- Table `recipes` (voir `supabase/schema.sql` /
  `supabase/migrations/005_recipes.sql`) : `title`, `url`, `category`,
  `status` (contrainte `check` en base sur les 3 valeurs), `note`
  (nullable). RLS classique (`user_id = auth.uid()`) sur les 4 opérations,
  y compris `update` (nécessaire pour le changement de statut).
- **Partage direct depuis TikTok/Instagram** (Android uniquement — voir
  `app/manifest.ts`, champ `share_target` : `action: "/recettes"`,
  `method: "GET"`, mappe `text`/`url`/`title` du partage vers les query
  params `shared_text`/`shared_url`/`shared_title`). Une fois l'app
  installée sur l'écran d'accueil, elle apparaît dans le menu "Partager"
  d'Android. `RecipesPage.tsx` lit ces query params dans un `useEffect`
  au montage : `extractSharedUrl` privilégie `shared_url` s'il est rempli,
  sinon extrait le premier lien `http(s)` trouvé dans `shared_text` par
  regex — **nécessaire pour TikTok/Instagram**, qui envoient le lien via
  l'intent Android `ACTION_SEND`/`EXTRA_TEXT` (mappé sur `text`), quasiment
  jamais sur `url`. Le lien extrait pré-remplit le champ URL du formulaire
  (+ le titre si `shared_title` est fourni, rare en pratique), une bannière
  s'affiche, puis `router.replace("/recettes")` nettoie l'URL pour qu'un
  rechargement de page ne re-déclenche rien. Pas d'ajout automatique en
  base à la réception : elle valide elle-même après avoir vérifié
  titre/catégorie, par sécurité et parce que la catégorie ne peut pas être
  déduite du partage.
  `useSearchParams()` impose un `<Suspense>` autour du composant qui
  l'utilise (voir `app/recettes/page.tsx`), sinon Next.js échoue au build.
  ⚠️ **iOS ne supporte pas `share_target`** (limitation Safari/WebKit,
  toujours vraie à ce jour) : si le site est un jour installé sur iPhone,
  le partage direct n'y fonctionnera pas, il faudra continuer à
  copier-coller le lien manuellement sur cet appareil-là.
  ⚠️ Après un changement du manifest (comme celui-ci), Android/Chrome ne
  met pas forcément à jour le WebAPK de l'app déjà installée
  instantanément : si "Habitudes" n'apparaît pas tout de suite dans le
  menu Partager, réessayer après avoir rouvert l'app une fois (ou, en
  dernier recours, la désinstaller/réinstaller depuis l'écran d'accueil).

## Rappel du soir (notifications push)
- `public/sw.js` : service worker minimal, écoute juste `push` (affiche la
  notification) et `notificationclick` (ramène au site) — pas de cache/
  mode hors-ligne.
- `lib/push.ts` : côté navigateur — détection du support, conversion de la
  clé VAPID publique, abonnement/désabonnement (`PushManager`).
- `components/PushReminderToggle.tsx` : bouton d'activation/désactivation,
  enregistre l'abonnement dans la table `push_subscriptions` (RLS comme les
  autres tables). La table a une colonne `reminder_hour` (0-23, défaut 19)
  qui n'est plus lue ni écrite par le code actuel (retirée après avoir
  cassé le déploiement, voir ci-dessous) — inoffensive, pas la peine de la
  supprimer par migration.
- `lib/supabaseAdmin.ts` : client Supabase avec la clé `service_role`
  (contourne RLS) — **réservé au code serveur**, jamais importé dans un
  composant `"use client"`.
- `app/api/cron/evening-check/route.ts` : route appelée **une fois par
  jour** par Vercel Cron (`vercel.json`, `0 17 * * *` UTC = 19h en heure
  d'été ; à ajuster à `0 18 * * *` en heure d'hiver pour rester précis à
  19h). Protégée par `CRON_SECRET` (Vercel l'ajoute automatiquement en
  en-tête `Authorization` sur ses propres appels) ; un appel manuel via
  `?secret=...` reste possible pour tester. Calcule les points du jour de
  chaque abonné avec les mêmes règles que le reste de l'app
  (`lib/habits.ts`, objectif variable selon `period_days`), envoie une
  notification via `web-push` si l'objectif n'est pas atteint, et supprime
  les abonnements expirés/révoqués (erreurs 404/410 du service de push).
- ⚠️ **Piège vécu** : un Cron Job qui tourne plus d'une fois/jour (ex.
  `0 * * * *`) fait **échouer le déploiement Vercel** sur le plan gratuit
  (Hobby limite à une exécution/jour — erreur *"Hobby accounts are limited
  to daily cron jobs"*), et ce silencieusement côté GitHub (le check
  Vercel passe juste en rouge, sans bloquer le merge). On avait
  temporairement une heure de rappel réglable par utilisateur
  (`reminder_hour` + cron horaire + calcul d'heure Paris via
  `Intl.DateTimeFormat`, DST-proof) ; revenue à une heure fixe sur demande
  explicite de l'utilisateur plutôt que de dépendre d'un service externe
  ou de payer Vercel Pro. Si une heure réglable redevient utile : soit
  passer à Pro, soit un service externe gratuit (ex. cron-job.org) qui
  appelle `/api/cron/evening-check?secret=...` aussi souvent que voulu,
  indépendamment des Cron Jobs Vercel — **toujours vérifier l'onglet
  Deployments/le check GitHub après un push touchant `vercel.json`**,
  l'échec ne se voit pas autrement.

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
- Thème par défaut = préférence système (`prefers-color-scheme`) tant
  qu'aucun choix explicite n'a été fait : le script anti-flash lit
  `matchMedia('(prefers-color-scheme: dark)')` si `localStorage` ne
  contient rien, et `ThemeToggle` écoute les changements de cette
  media query en direct (`change` event) pour suivre le système sans
  recharger la page. Dès que l'utilisateur clique une fois sur le bouton,
  `localStorage.theme` est posé et ce choix explicite prend le pas sur le
  système pour toujours (le listener système se contente alors de ne plus
  rien faire, voir la condition `if (stored === ...) return` dans
  `ThemeToggle.tsx`).
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
