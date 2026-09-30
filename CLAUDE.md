@AGENTS.md

# Projet : Habit Tracker (usage personnel)

Site privé, initialement un seul utilisateur, pour suivre un catalogue fixe
d'habitudes de vie valant chacune des points, avec une jauge quotidienne
(objectif minimum de points par jour). Pas d'inscription publique, pas de
partage : les comptes sont créés manuellement dans Supabase.

Deux comptes coexistent désormais sur le même site, chacun avec son propre
onglet dédié en plus des onglets communs (Habitudes/Recettes) : le compte
d'origine, et un second compte (voir "Onglet RPG" plus bas) dont l'onglet
n'est visible que sur ce compte-là. RLS s'occupe déjà d'isoler les données
de chaque compte ; seul l'affichage des onglets diffère selon qui est
connecté (voir `NavTabs.tsx`).

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
  de dupliquer `handleSignOut` dans chaque page. Prend `userId` (transmis à
  `NavTabs`) et `variant?: "default" | "rpg"` — en variante RPG, masque
  `ThemeToggle` (sans effet sur cet espace, qui ne suit pas le
  clair/sombre du reste du site) et adapte les couleurs du texte.
- `components/NavTabs.tsx` : liens Habitudes/Recettes (+ RPG si le compte
  connecté correspond à `NEXT_PUBLIC_RPG_USER_ID`, voir "Onglet RPG"
  plus bas), onglet actif détecté via `usePathname()`. Prend `variant?:
  "default" | "rpg"` pour adapter ses couleurs au fond sombre de l'espace
  RPG (voir `AppHeader.tsx`).
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
  même pattern que `habit_logs`/`period_days`). Un seul formulaire sert à
  la fois à l'ajout et à la modification (`editingId: string | null` —
  `null` = mode ajout) : cliquer "✏️" sur une fiche appelle
  `handleStartEdit`, qui charge cette recette dans le formulaire (y
  compris `caption`/`thumbnail_url` déjà connus, pour ne pas les perdre si
  l'URL n'est pas retouchée) et fait défiler la page en haut ; `Annuler la
  modification` et un ajout/une modification réussie appellent tous les
  deux `resetForm`. `handleSubmit` fait un `update` ou un `insert` selon
  `editingId`. Recherche texte (`searchQuery`, sur titre + note + légende)
  et filtres catégorie/statut se combinent dans `filteredRecipes`.
  `handleSurprise` tire une recette au hasard dans `filteredRecipes`
  (respecte donc recherche/filtres en cours), évite de retomber deux fois
  de suite sur la même quand il y a le choix, et s'affiche dans un encart
  séparé (bordure `ring-blush-deep`) au-dessus de la liste — se ferme tout
  seul si la recette affichée est éditée (`handleStartEdit` vide
  `surpriseRecipe`) ou supprimée (`handleDelete` la retire si l'id
  correspond).
- `components/RecipeCard.tsx` : une fiche = titre cliquable (ouvre le lien
  TikTok/Instagram dans un nouvel onglet), boutons modifier (✏️, appelle
  `onEdit`) et supprimer (✕), pastille catégorie, pastille statut
  cliquable qui fait avancer le cycle (`nextRecipeStatus`), note
  optionnelle, miniature en couverture si disponible, légende repliable.
- Table `recipes` (voir `supabase/schema.sql` /
  `supabase/migrations/005_recipes.sql`) : `title`, `url`, `category`,
  `status` (contrainte `check` en base sur les 3 valeurs), `note`
  (nullable). **Table partagée entre tous les comptes**, contrairement à
  toutes les autres tables de l'app (`habit_logs`, `rpg_quests`...) : les
  policies RLS vérifient juste `auth.uid() is not null` (n'importe quel
  compte connecté), pas `user_id = auth.uid()` — voir
  `supabase/migrations/009_shared_recipes.sql`. `user_id` reste enregistré
  sur chaque ligne (qui a ajouté la recette) mais ne sert plus à
  restreindre l'accès. Raison : un seul compte a un téléphone Android
  capable d'importer facilement via le partage TikTok/Instagram (voir plus
  bas), mais les deux doivent pouvoir consulter/modifier les recettes.
  `RecipesPage.tsx` n'a **aucun changement de code** à faire pour ça : sa
  requête ne filtrait déjà pas par `user_id` (comme `habit_logs`/
  `period_days`), donc élargir les policies RLS suffit.
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
  Piège vécu : une réinstallation via l'icône seule peut ne pas suffire si
  Android considère encore l'app comme "installée" (WebAPK toujours présent
  dans Paramètres > Applications) — dans ce cas Chrome ne repropose même
  plus "Installer l'application". Il faut désinstaller depuis Paramètres >
  Applications, effacer les données du site dans Chrome (Paramètres >
  Paramètres des sites > chercher le site > Effacer et réinitialiser), puis
  réinstaller.

- **Légende + miniature TikTok récupérées automatiquement**
  (`app/api/tiktok-oembed/route.ts`, `lib/recipes.ts` → `isTikTokUrl`) :
  beaucoup de créateurs écrivent les ingrédients dans la légende de la
  vidéo, et une miniature permet de reconnaître la recette en un coup
  d'œil. Un seul appel à l'oEmbed public de TikTok
  (`https://www.tiktok.com/oembed?url=...`, gratuit, aucune clé) fournit
  les deux (`title` → légende, `thumbnail_url` → miniature) — fait côté
  serveur pour éviter tout souci de CORS. La route renvoie toujours un 200
  avec `{ caption: string | null, thumbnailUrl: string | null }`, jamais
  d'erreur à gérer côté client, y compris si le lien n'est pas TikTok
  (Instagram n'a pas d'oEmbed public exploitable sans compte développeur
  Meta, donc la route renvoie `null` sans même essayer).
  Stockées dans des colonnes `caption`/`thumbnail_url` **séparées de
  `note`** (voir `supabase/migrations/006_recipe_caption.sql` et
  `007_recipe_thumbnail.sql`) pour que la note perso reste toujours
  disponible, jamais écrasée par les données automatiques — affichées dans
  un encart dédié du formulaire (`RecipesPage.tsx`, fonction
  `fetchTikTokPreview`). Sur chaque fiche (`RecipeCard.tsx`), la miniature
  devient l'image de couverture en haut de la carte (`<img>` natif plutôt
  que `next/image`, pour ne pas avoir à lister tous les sous-domaines du
  CDN TikTok dans `next.config` — un `onError` masque l'image si son lien
  expire un jour) et la légende reste dans un `<details>` repliable en
  dessous.
  Déclenchement automatique à deux endroits : (1) juste après un partage
  Android si le lien partagé est TikTok, (2) à la perte de focus (`onBlur`)
  du champ lien si elle colle un lien manuellement — `lastFetchedCaptionUrl`
  (un `useRef`) évite de re-déclencher un appel identique à chaque blur.
  Testée dans cet environnement seulement avec des URLs non-TikTok et des
  liens TikTok invalides (le réseau sandbox bloque tiktok.com) : le
  comportement de repli (toujours des champs à `null`, jamais d'exception)
  a été vérifié, mais la récupération réelle d'une légende/miniature n'a pu
  être confirmée qu'en observant le comportement attendu — à surveiller au
  premier vrai partage en production si jamais l'aperçu ne remonte pas.

## Onglet RPG
Espace séparé pour un second compte (voir en tête de fichier), pensé comme
un mini-RPG plutôt qu'un tableau de bord "clean girl" : 5 capacités fixes
qui montent de niveau grâce à des quêtes personnelles qu'il définit
lui-même, contrairement au catalogue d'habitudes figé de l'autre espace.

- `lib/rpg.ts` : `RPG_STATS`, catalogue fixe des 5 capacités (Physique,
  Mental, Discipline, Créativité, Social), même logique que `HABITS` —
  fixe dans le code. `xpThresholdForLevel(level)` et `computeLevel(xp)`
  (niveau + XP dans le niveau + XP nécessaire pour le suivant) : palier
  suivant toujours plus coûteux (100, 300, 600, 1000, 1500 XP cumulés...),
  purs calculs sans state, réutilisés à la fois pour chaque capacité et
  pour le niveau de personnage global (somme des 5).
- Tables `rpg_quests` (catalogue de quêtes, **éditable depuis
  l'interface** — titre, capacité liée, valeur en XP) et `rpg_quest_logs`
  (quêtes cochées, par date). Contrairement à `habit_logs`, `stat_key` et
  `xp_value` sont **dupliqués sur chaque ligne de log au moment de la
  coche**, pas recalculés via une jointure vers `rpg_quests` : l'XP déjà
  gagné reste exact même si la quête est ensuite modifiée ou supprimée
  (`quest_id` passe alors à `null` via `on delete set null`, la ligne de
  log elle-même n'est jamais perdue). Voir `supabase/schema.sql` /
  `supabase/migrations/008_rpg.sql`. RLS classique (`user_id = auth.uid()`).
- `components/RpgPage.tsx` : charge tout l'historique des quêtes accomplies
  (pas de fenêtre de 90 jours comme `Dashboard` — l'XP est cumulé depuis le
  début), calcule l'XP total par capacité + le niveau de personnage
  (somme des 5) côté client. Cocher/décocher une quête aujourd'hui insère/
  supprime une ligne dans `rpg_quest_logs`. La gestion des quêtes (ajout/
  modification/suppression) suit le même schéma formulaire unique +
  `editingQuestId` que `RecipesPage.tsx`, dans un panneau repliable
  (ouvert par défaut si aucune quête n'existe encore, pour guider la
  première utilisation).
- `components/RpgStatPanel.tsx` : une capacité = icône/nom, niveau, barre
  de progression XP → niveau suivant (calculée via `computeLevel`).
- Palette dédiée dans `app/globals.css` (tokens `--color-rpg-*` : fond
  très sombre, panneaux violet foncé, accent or pour l'XP, violet clair
  pour la progression de niveau) — **volontairement pas redéfinie sous
  `[data-theme="dark"]`** : cet espace garde toujours la même ambiance
  dark fantasy, indépendamment du choix clair/sombre du reste du site
  (voir aussi pourquoi `ThemeToggle` est masqué dans `AppHeader`
  ci-dessus). `RpgPage.tsx` pose son propre fond plein écran
  (`min-h-screen bg-rpg-bg`) plutôt que de compter sur le fond de
  `<body>` (`bg-cream`), sinon ce dernier resterait visible autour du
  contenu.
- **Visibilité de l'onglet** : `NEXT_PUBLIC_RPG_USER_ID` (env var, UUID du
  compte Supabase Auth du second utilisateur) contrôle qui voit l'onglet
  "RPG" dans `NavTabs.tsx` — comparaison simple côté client, pas une vraie
  protection d'accès (RLS s'en charge déjà pour les données ; rien
  n'empêche de visiter `/rpg` directement au clavier, ça ne montrerait
  juste aucune donnée pour un autre compte). Sans cette variable définie,
  l'onglet n'apparaît pour personne.
- Simplification assumée pour ce premier jet : pas de bascule automatique
  du "jour métier" façon `Dashboard` (`scheduleNextRollover`) — `today` est
  calculé une fois au chargement de la page (`todayISO()`, même décalage
  7h30 que le reste du site). Un onglet RPG resté ouvert à cheval sur cette
  heure de reset affichera les quêtes de la veille jusqu'au rechargement de
  la page. Pas non plus d'historique/calendrier RPG pour l'instant
  (seulement le total cumulé par capacité) — à ajouter si utile un jour, en
  s'inspirant de `HistorySection.tsx`.

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
