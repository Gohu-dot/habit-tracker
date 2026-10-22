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
  CDN TikTok dans `next.config`) et la légende reste dans un `<details>`
  repliable en dessous.
  **Miniatures auto-réparées + repli Open Graph** : `thumbnail_url` est un
  lien signé du CDN TikTok qui peut expirer avec le temps.
  `RecipeCard.tsx` (`handleThumbnailError`, déclenché par l'`onError` de
  l'`<img>`) redemande alors l'oEmbed TikTok pour obtenir une URL fraîche,
  et `RecipesPage.tsx` (`handleThumbnailRefresh`) la persiste en base.
  Pour une recette dont `thumbnail_url` est resté `null` (pas d'`<img>`
  donc rien ne se déclenche tout seul), un bouton "🎬 Récupérer la
  miniature" permet de déclencher la même tentative manuellement.
  **Cause racine identifiée en production** (via le champ `debugReason` de
  la route, affiché sur la fiche en cas d'échec) : l'oEmbed public de
  TikTok a cessé de renvoyer `title`/`thumbnail_url` — il ne renvoie plus
  que des métadonnées techniques (`embed_product_id`, `html`...), un
  changement côté TikTok et non un bug de ce code.
  `app/api/tiktok-oembed/route.ts` tente donc un repli en deux temps sur
  une seule page récupérée (`fetchTikTokPageFallback`, avec un en-tête
  `User-Agent` de navigateur — TikTok peut servir une page différente aux
  clients non reconnus) quand l'oEmbed ne donne ni légende ni miniature :
  (1) les balises Open Graph (`og:title`/`og:description`, `og:image`),
  celles lues par les aperçus de lien Facebook/Discord/iMessage,
  normalement présentes sans exécuter de JavaScript ; (2) si absentes
  (constaté en production : TikTok renvoie une page complète ~400 Ko mais
  sans balises `og:*` du tout), le bloc JSON d'hydratation que TikTok
  embarque pour son appli React (`extractJsonStringValue`, clés
  `cover`/`originCover`/`dynamicCover` pour la miniature, `desc` pour la
  légende). `extractMetaContent`/`extractJsonStringValue` font ce parsing
  par regex ciblée, sans dépendance de parsing HTML — suffisant pour
  quelques clés précises, pas un DOM complet.
  Déclenchement automatique à deux endroits : (1) juste après un partage
  Android si le lien partagé est TikTok, (2) à la perte de focus (`onBlur`)
  du champ lien si elle colle un lien manuellement — `lastFetchedCaptionUrl`
  (un `useRef`) évite de re-déclencher un appel identique à chaque blur.
  **Récupération groupée** : `RecipesPage.tsx` (`handleBulkThumbnailFetch`)
  traite en un clic toutes les recettes TikTok sans miniature, une par une
  (petite pause entre chaque pour rester poli vis-à-vis de TikTok, pas de
  rafale de requêtes simultanées), avec un compteur de progression et un
  résumé final — réutilise le même appel que le bouton par fiche, pas de
  logique dupliquée.
  Testée dans cet environnement seulement avec des URLs non-TikTok et des
  liens TikTok invalides (le réseau sandbox bloque tiktok.com) : le
  comportement de repli (toujours des champs à `null`, jamais d'exception)
  a été vérifié, mais la récupération réelle d'une légende/miniature n'a pu
  être confirmée qu'en observant le comportement attendu — à surveiller au
  premier vrai partage en production si jamais l'aperçu ne remonte pas.

## Onglet RPG
Espace séparé pour un second compte (voir en tête de fichier), pensé comme
un mini-RPG plutôt qu'un tableau de bord "clean girl" : des capacités fixes
qui montent de niveau grâce à des quêtes personnelles qu'il définit
lui-même, contrairement au catalogue d'habitudes figé de l'autre espace.

- `lib/rpg.ts` : `RPG_STATS`, catalogue fixe des 8 caractéristiques de
  *The Elder Scrolls IV: Oblivion* (Force, Intelligence, Volonté, Agilité,
  Rapidité, Endurance, Personnalité, Chance), même logique que `HABITS` —
  fixe dans le code. Les clés (`force`, `intelligence`, ...) sont
  dupliquées en base sur chaque ligne de `rpg_quests`/`rpg_quest_logs`
  (contrainte `check`) : les changer demande une migration qui remappe
  aussi les données existantes, pas un simple renommage d'affichage — voir
  `supabase/migrations/010_oblivion_stats.sql` pour un exemple (passage
  d'un premier jeu générique à 5 capacités vers les 8 d'Oblivion).
  `xpThresholdForLevel(level)` et `computeLevel(xp)`
  (niveau + XP dans le niveau + XP nécessaire pour le suivant) : palier
  suivant toujours plus coûteux (100, 300, 600, 1000, 1500 XP cumulés...),
  purs calculs sans state, réutilisés à la fois pour chaque capacité et
  pour le niveau de personnage global (somme de toutes les capacités).
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
  (somme des 8) côté client. Cocher/décocher une quête secondaire
  aujourd'hui insère/supprime une ligne dans `rpg_quest_logs`. La gestion
  des quêtes secondaires (ajout/modification/suppression) suit le même
  schéma formulaire unique + `editingQuestId` que `RecipesPage.tsx`, dans
  un panneau repliable (ouvert par défaut si aucune quête n'existe encore,
  pour guider la première utilisation).
- **Quêtes principales** (table `rpg_main_quests`, voir
  `supabase/migrations/011_rpg_main_quests.sql`) : objectifs à moyen/long
  terme débloqués en atteignant un niveau donné dans une capacité (ex.
  niveau 5 en Endurance → "Courir 10km"), par opposition aux quêtes
  secondaires qui sont des tâches répétables au quotidien. Éditables
  depuis l'interface (titre, capacité, `unlock_level`, `xp_reward`),
  panneau de gestion séparé (`manageMainOpen`/`handleMainQuestSubmit`,
  même schéma que les quêtes secondaires). `levelByStat` (niveau courant
  de chaque capacité, calculé via `computeLevel`) détermine quelles
  quêtes sont 🔒 verrouillées, 🎯 débloquées ou ✅ accomplies — l'affichage
  (`statsWithMainQuests`) ne montre que les capacités où au moins une
  quête principale existe, triées par `unlock_level` croissant dans
  chaque chaîne.
  **Validation = bonus d'XP** : `handleToggleMainQuestComplete` insère une
  ligne dans `rpg_quest_logs` avec `quest_id: null` (réservé aux quêtes
  secondaires) et `xp_value: xp_reward`, puis pose `completed_at` et
  `xp_log_id` (référence vers cette ligne) sur la quête principale — la
  jauge, le graphique et le calendrier reflètent donc automatiquement le
  bonus sans code dédié, puisqu'ils ne font que sommer `rpg_quest_logs`.
  Annuler (ou supprimer) une quête principale validée retire la même
  ligne pour ne laisser aucun bonus fantôme dans les totaux —
  `on delete set null` sur `xp_log_id` gère le cas où la ligne de log
  aurait déjà disparu autrement.
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
  la page.
- **Historique RPG** (`lib/rpgHistory.ts`, `components/RpgXpChart.tsx`,
  `components/RpgHistorySection.tsx`) : même principe que côté habitudes,
  mais sans objectif quotidien fixe — un jour est "actif" dès qu'au moins
  une quête y a été accomplie (`computeDailyXp` + `isActiveDay`), pas de
  seuil de points à comparer. `computeRpgStreak`/`computeRpgBestStreak`/
  `countActiveDaysInRange` sont les équivalents RPG de
  `computeStreak`/`computeBestStreak`/`countSuccessDaysInRange` dans
  `lib/history.ts`, réécrits plutôt que généralisés (la fonction habitudes
  dépend de `targetForDay`/`periodDays`, propres à ce domaine-là) — en
  revanche `monthDays`/`mondayIndex` (lib/history.ts) et les paliers de
  série (`lib/streakMilestones.ts`) sont de purs utilitaires génériques,
  réutilisés tels quels sans dupliquer quoi que ce soit.
  `computeRpgBestStreak` tourne sur toute la plage disponible (du log le
  plus ancien à aujourd'hui), pas une fenêtre de 90 jours comme côté
  habitudes — `RpgPage.tsx` ne charge déjà aucune limite de date sur
  `rpg_quest_logs`. `RpgXpChart.tsx` est un `PointsChart.tsx` simplifié
  (pas de ligne de seuil, l'axe vertical s'ajuste au meilleur jour du mois
  plutôt qu'à un maximum fixe).
- **Rappel du soir** : `PushReminderToggle` (voir plus bas) est aussi rendu
  dans `RpgPage.tsx` (`variant="rpg"` pour l'habillage sombre) — même
  mécanisme d'abonnement que côté habitudes (`push_subscriptions`), pas de
  nouvelle table. La route `/api/cron/evening-check` reste **unique**
  (pas de second Cron Job Vercel, pour rester sous la limite du plan
  Hobby) : elle branche sa logique par abonnement selon que
  `sub.user_id === NEXT_PUBLIC_RPG_USER_ID` — compte RPG : notifie si
  aucune ligne dans `rpg_quest_logs` pour aujourd'hui ; sinon, logique
  habitudes/points inchangée. `sendReminder` factorise l'envoi + le
  nettoyage des abonnements expirés (404/410), commun aux deux branches.

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
  Branche aussi vers une vérification RPG (quête accomplie aujourd'hui ou
  non) pour l'abonné dont `user_id` correspond à `NEXT_PUBLIC_RPG_USER_ID`
  — voir la section "Onglet RPG" plus haut pour le détail, toujours une
  seule route/un seul Cron Job pour les deux comptes.
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

## Composants UI (shadcn/ui, écrits à la main)
- `components/ui/` contient des primitives façon shadcn/ui (`Button`,
  `Card`, `Badge`) — code standard de cette bibliothèque, mais recopié à
  la main plutôt que généré par leur CLI (`npx shadcn init`/`add` appelle
  `ui.shadcn.com`, bloqué par la politique réseau du conteneur cloud où ce
  projet est développé). Le résultat est équivalent : mêmes fichiers, même
  API (`variant`/`size` via `class-variance-authority`), juste sans
  l'assistant interactif.
- `lib/utils.ts` : `cn()` (clsx + tailwind-merge), utilitaire standard de
  tous les composants `ui/`.
- Ces primitives ne redéfinissent **pas** de nouvelles couleurs : elles
  lisent des tokens sémantiques (`--color-background`, `--color-card`,
  `--color-primary`, `--color-secondary`, `--color-muted`,
  `--color-border`, `--color-destructive`, ...) ajoutés dans le même bloc
  `@theme` que la palette "clean girl" dans `app/globals.css`, et qui
  pointent via `var()` vers les tokens existants (`--color-blush-deep`,
  `--color-ivory`, `--color-sand`, ...). Conséquence : `<Button>`,
  `<Card>`, `<Badge>` suivent automatiquement le thème clair/sombre sans
  code supplémentaire, exactement comme le reste de l'appli.
- L'espace RPG utilise ces mêmes composants, mais avec des variantes
  dédiées (`variant="rpg"` / `"rpg-outline"` sur `Button`, `"rpg"` sur
  `Card`/`Badge`, `"rpg-locked"` sur `Badge`) plutôt que les variantes
  `default`/`outline`/`secondary` du reste du site : design nettement plus
  marqué (voir section "Relooking RPG" ci-dessous), pas juste une palette
  différente. `PushReminderToggle.tsx` illustre le pattern : un seul
  `buttonVariant = isRpg ? "rpg-outline" : "outline"`, toujours le même
  composant `<Button>`.
- Adopté pour l'instant sur le Dashboard (variantes par défaut :
  `HabitCard`, panneau jauge du jour, `PushReminderToggle`) et sur tout
  l'onglet RPG (variantes `rpg`) ; Recettes reste à faire si le rendu
  convient.

## Relooking RPG (style "dark fantasy" marqué)
Contrairement au Dashboard (pilote plus sobre, même palette qu'avant), le
relooking de l'onglet RPG visait un changement visuel net, pas juste une
consolidation technique :
- **Police display** : `Cinzel` (Google Font, `app/layout.tsx` →
  `--font-rpg-cinzel`, exposée à Tailwind sous `--font-rpg-display` dans
  `@theme inline` de `globals.css`, classe `font-rpg-display`) —
  réservée aux titres de l'espace RPG (`RpgSectionHeading.tsx`, "Niveau
  X"), jamais utilisée ailleurs sur le site qui garde Geist partout.
- **Fond** : `.rpg-frame` et `.rpg-backdrop` (classes utilitaires dans
  `globals.css`, pas de composant) remplacent le simple `bg-rpg-bg` par
  un dégradé radial discret (atmosphère "lueur de bougie hors-champ") et
  un cadre de panneau à coins coupés (`clip-path`) + liseré doré
  intérieur très subtil (`box-shadow inset`), au lieu d'une bordure plate.
  `.rpg-backdrop` superpose aussi un motif SVG en répétition (étincelles
  dorées + repères lie-de-vin, tuile 160×160, opacité ~0.08-0.12) —
  encodé en base64 dans `background-image`, avec la source SVG lisible en
  commentaire juste après dans `globals.css` pour pouvoir la modifier sans
  décoder le base64. Choisi plutôt qu'une illustration unique ou une
  texture externe (pas d'outil de génération d'image disponible, et une
  image externe pose des questions de licence) : 100% vectoriel, aucun
  fichier à gérer, cohérent avec le reste dessiné à la main. (Couleurs
  d'origine : violet/or — voir "Palette Oblivion" plus bas pour la
  bascule vers lie-de-vin/bronze.)
- **Jauges XP/niveau** : dégradé lie-de-vin→or (`from-rpg-accent
  to-rpg-gold`) au lieu d'un aplat, et `.rpg-glow` (pulsation lumineuse,
  `@keyframes rpg-glow-pulse`, respecte `prefers-reduced-motion` comme
  `.animate-celebrate`) quand une capacité est à ≥85% de son prochain
  niveau (`RpgStatPanel.tsx`) — un signal visuel "tu y es presque".
- **`RpgSectionHeading.tsx`** : petit composant partagé (titre en
  `font-rpg-display` majuscules espacées + `.rpg-rule`, un liseré doré en
  dégradé) pour ne pas dupliquer ce style sur chaque panneau (quêtes
  principales, quêtes du jour, historique, graphique XP, gestion...).
- Nouveaux tokens dans `app/globals.css` : `--color-rpg-panel-deep`
  (dégradé de fond des panneaux) et `--color-rpg-gold-dim` (liserés/
  ornements non interactifs, ex. anneau d'icône de capacité dans
  `RpgStatPanel.tsx`) — toujours **pas** redéfinis sous
  `[data-theme="dark"]`, l'espace RPG reste insensible au thème
  clair/sombre du reste du site.

### Rapprochement visuel d'Oblivion (écran de caractéristiques)
Trois leviers supplémentaires, demandés explicitement pour coller à
l'esthétique de l'écran de stats d'Oblivion plutôt qu'un style RPG
générique :
- **`RpgStatIcon.tsx`** : remplace les emoji du catalogue (`stat.icon`
  dans `lib/rpg.ts`, toujours utilisés tels quels dans les `<select>` —
  une balise `<option>` ne peut pas contenir de SVG) par des glyphes SVG
  dessinés à la main en traits (`stroke="currentColor"`, pas de
  remplissage) façon sceau gravé : épée (Force), livre ouvert
  (Intelligence), œil (Volonté), plume (Agilité), éclair (Rapidité),
  bouclier (Endurance), masque (Personnalité), fer à cheval (Chance).
  Utilisé dans `RpgStatPanel.tsx` (badge circulaire) et partout où
  `RpgPage.tsx` affichait `{stat.icon}` à côté d'un titre de quête.
- **`levelTitle()`** (`lib/rpg.ts`) : rang affiché à côté du niveau
  (Novice/Apprenti/Vétéran/Expert/Maître, paliers à 1/3/5/8/11) — pure
  décoration pour la fiche de personnage, sans incidence sur le
  déblocage des quêtes principales (qui reste basé sur le niveau d'une
  capacité précise).
- **Bandeau "fiche de personnage"** (`RpgPage.tsx`, panneau de niveau) :
  titre `{levelTitle} — Niveau {X}` en `font-rpg-display`, `.rpg-rule`
  en séparateur, puis une ligne de stats (XP total · séparateur vertical
  · XP du jour) avant la jauge de progression — mise en page proche d'un
  écran de personnage plutôt qu'une simple carte avec une barre.
- **Police de texte courant** : `EB_Garamond` (Google Font,
  `app/layout.tsx` → `--font-rpg-garamond`, exposée sous
  `--font-rpg-serif` dans `@theme inline`), posée une seule fois en
  `font-family` sur `.rpg-backdrop` (`globals.css`) pour que tout le
  texte de l'espace RPG en hérite par défaut — les titres explicites
  (`font-rpg-display`, Cinzel) le redéfinissent localement. Jamais
  utilisée hors de l'espace RPG, même logique que Cinzel.

### Palette Oblivion (lie-de-vin/bronze/parchemin)
Après validation du style ci-dessus, demande explicite d'aller plus loin
"quitte à changer les couleurs et tout ce qui va avec" — la palette
violet/or d'origine (ambiance "magie cosmique" générique) a été
remplacée par des teintes évoquant une reliure en cuir/un vieux grimoire,
plus proche du chrome des menus d'Oblivion :
- `--color-rpg-bg`/`--color-rpg-panel`/`--color-rpg-panel-deep` : bruns
  cuir foncés (`#140d08`/`#2b1d12`/`#1c130b`) au lieu du bleu-violet
  sombre d'origine.
- `--color-rpg-border`/`--color-rpg-gold-dim` : bronze/laiton vieilli
  (`#5c4328`/`#7a5a1e`) au lieu de violet/or vifs.
- `--color-rpg-gold` : or plus mat/antique (`#c9a227`, contre `#f2b705`
  avant) — tous les dégradés et lueurs qui en dépendent (`.rpg-glow`,
  jauges, `RpgXpChart.tsx` via `var(--color-rpg-gold)`) suivent
  automatiquement, aucune valeur à dupliquer ailleurs.
- `--color-rpg-purple` **renommé** `--color-rpg-accent` (pas juste
  recoloré : le nom "purple" aurait été trompeur avec une valeur
  lie-de-vin `#7a241e`) — a nécessité de mettre à jour les 3 endroits qui
  le référençaient par classe Tailwind (`from-rpg-purple`/`ring-rpg-purple`
  dans `RpgStatPanel.tsx`, `RpgHistorySection.tsx`, `RpgPage.tsx`) en
  `-accent`. Tout nouvel usage de ce second accent doit utiliser
  `rpg-accent`, pas réintroduire "purple".
- `--color-rpg-text`/`--color-rpg-text-soft`/`--color-rpg-danger` :
  réchauffés vers crème parchemin/brun tabac/rouge brique plutôt que les
  teintes froides d'origine.
- Motif de fond (voir plus haut) recoloré à l'identique (même SVG,
  mêmes positions) avec les nouvelles couleurs — seule la palette change.
- **Nouveau** : une texture de grain façon cuir (`repeating-linear-gradient`
  diagonal, noir à 12% d'opacité, posé en 3ᵉ couche de
  `background-image` sur `.rpg-backdrop`, avant le motif SVG) — pure
  matière, aucune dépendance supplémentaire.
- Les couleurs codées en dur dans `components/ui/button.tsx` (variante
  `rpg`, dégradé + lueur au survol) ont été recalculées à la main pour
  rester cohérentes avec le nouvel or (`#8f6f1c`, `rgba(201,162,39,...)`)
  — ce sont les deux seules valeurs RPG qui ne passent pas par un token
  CSS (limitation de `shadow-[...]` en classe Tailwind arbitraire), à
  resynchroniser manuellement si `--color-rpg-gold` change à nouveau.

### Refonte structurelle "fiche de personnage" (pas que visuelle)
Après la palette, retour que l'ensemble ne se sentait toujours pas comme
une vraie fiche de personnage médiévale-fantasy — besoin de toucher au
fonctionnement, pas que l'habillage :
- **`RpgTabs.tsx`** : navigation interne à l'onglet RPG
  (Personnage/Quêtes/Journal), **distincte** de `NavTabs.tsx` (qui
  navigue entre les routes Habitudes/Recettes/RPG). `RpgPage.tsx` garde
  un seul `useEffect` de chargement (quests/logs/mainQuests) et un seul
  état `activeTab` qui bascule l'affichage entre trois blocs JSX — pas de
  sous-routes, pas de rechargement de données au changement d'onglet.
  Répartition : Personnage = portrait + bandeau de niveau + liste de
  caractéristiques ; Quêtes = quêtes principales + quêtes du jour + les
  deux panneaux de gestion (repliables, inchangés) ; Journal = graphique
  XP + historique/série (contenu inchangé, juste déplacé).
- **`RpgStatPanel.tsx` repensé en rangée, pas en carte** : le niveau
  devient un gros chiffre (score, façon "Force : 42" dans Oblivion)
  plutôt qu'une barre de progression en élément principal — la barre XP
  redescend en détail secondaire, fine, sous le nom. Affichées en liste à
  deux colonnes dans un seul `Card` (`RpgPage.tsx`), pas en grille de
  tuiles séparées : plus proche d'un écran de stats que d'un tableau de
  bord.
- **`RpgPortrait.tsx`** : médaillon avec silhouette SVG générique
  (placeholder) + légende (rang). Prend une prop `imageSrc` optionnelle
  non utilisée pour l'instant : si un vrai portrait est généré plus tard
  (en dehors de cette session — pas d'outil de génération d'image ici),
  il suffit de déposer le fichier dans `public/` et de passer son chemin
  à cette prop, aucune autre modification nécessaire.
- **Quêtes accomplies barrées** (`line-through italic text-rpg-text-soft`)
  plutôt que juste un fond doré — lecture "entrée de journal cochée"
  plutôt que "case à cocher d'application de productivité", sur les
  quêtes du jour et les quêtes principales.

### Direction artistique pixel art + portrait de personnage
Suite à un premier portrait généré par l'utilisateur (Gemini, style pixel
art 16-bit, cadre ornemental peint directement dans l'image) : adoption
du pixel art comme direction graphique de l'espace RPG, avec un système
de portrait évolutif par niveau.
- **`public/rpg/portraits/`** : portraits de personnage (pixel art,
  générés hors session — pas d'outil de génération d'image disponible
  ici). Chaque image porte déjà son propre cadre peint ; `RpgPortrait.tsx`
  les affiche donc **carrées telles quelles** (`imageSrc` fourni), sans
  médaillon circulaire CSS par-dessus — ce médaillon (silhouette SVG +
  cadre `border-2 border-rpg-gold-dim`) ne reste qu'en repli quand
  `imageSrc` est absent.
- **`portraitForLevel()`** (`lib/rpg.ts`) : fait correspondre le niveau du
  personnage au portrait du palier débloqué, même convention que
  `levelTitle()` (tableau de paliers triés du plus haut seuil au plus
  bas, un seul palier pour l'instant — niveau 1). Le personnage est censé
  évoluer visuellement en montant de niveau (templier déchu au départ) ;
  ajouter un portrait = ajouter une entrée à `PORTRAIT_TIERS`, rien
  d'autre à modifier.
  **Système d'équipement évoqué mais pas construit** : l'idée de pouvoir
  équiper le personnage (bonus de stats via de l'équipement visuel sur le
  portrait) a été mentionnée comme direction souhaitée, mais rien n'existe
  en base ni en code pour l'instant — pas de table dédiée, pas
  d'inventaire. À concevoir explicitement (schéma de données, règles de
  bonus) avant d'être implémenté, ne pas improviser une mini-version
  incomplète.
- **Polices remplacées** : `Press_Start_2P`/`VT323` (Google Fonts,
  `app/layout.tsx` → `--font-rpg-pixel-display`/`--font-rpg-pixel-body`)
  à la place de Cinzel/EB Garamond (essai précédent, plus "manuscrit
  médiéval" que "jeu vidéo rétro", écarté une fois le pixel art choisi
  comme direction). `--font-rpg-display` (texte courant + titres, via la
  classe déjà existante `font-rpg-display`) pointe maintenant vers VT323
  — choisie pour sa lisibilité même sur des mots longs
  ("PERSONNALITÉ", "QUÊTES PRINCIPALES"), contrairement à Press Start 2P
  qui est réservée à un nouveau token `--font-rpg-pixel`
  (`font-rpg-pixel`) pour les seuls gros chiffres "héros" (score d'une
  caractéristique dans `RpgStatPanel.tsx`, numéro de niveau dans le
  bandeau de personnage) : à cette taille de police, Press Start 2P
  déborderait ou passerait à la ligne sur un mot un peu long.
- **`public/rpg/backgrounds/ruines-chateau.jpg`** : illustration de fond
  (scène complète, pas une texture tramée) qui remplace le dégradé CSS +
  motif d'étincelles SVG essayés précédemment sur `.rpg-backdrop`
  (`globals.css`) — superflus une fois une vraie scène disponible, les
  deux systèmes de texture superposés auraient fait "chargé". Affichée en
  `background-size: cover` fixe, avec un dégradé sombre uniforme
  par-dessus (`color-mix` à 55% d'opacité) pour garder le texte et les
  panneaux lisibles sans masquer la scène, plus une lueur dorée discrète
  en haut qui raccorde avec la palette "vieux grimoire" du reste de
  l'espace. Une seule image pour l'instant ; si plusieurs scènes de fond
  existent un jour (ex. une par palier de rang, comme les portraits), même
  logique de palier à prévoir que `portraitForLevel()`.
- **Composants resserrés** pour laisser voir davantage le fond : conteneur
  `max-w-5xl` → `max-w-4xl`, padding des `Card` réduit d'un cran
  (`p-5`→`p-4`, `p-4`→`p-3`), espacements entre sections (`space-y-6` →
  `space-y-4`), portrait (`h-36/h-40` → `h-28/h-32`), badge-icône de
  capacité (`h-9 w-9` → `h-8 w-8`) et tailles de police ajustées en
  conséquence dans `RpgStatPanel.tsx`/`RpgSectionHeading.tsx`/
  `RpgTabs.tsx`. Pas de règle générale à en tirer : juste "un peu plus
  compact" demandé explicitement, pas une nouvelle convention de densité.
- **`public/rpg/icons/`** : les 8 icônes de capacités générées par
  l'utilisateur (chance, endurance, agilité, intelligence, personnalité,
  puis rapidité, volonté, force dans un second lot) — le glyphe SVG
  dessiné à la main (`GLYPHS` dans `RpgStatIcon.tsx`) ne sert donc plus
  en pratique, mais reste en repli si une entrée de
  `RPG_STAT_ICON_IMAGES` est un jour retirée. Fournies en 1195×896 avec
  une bonne marge de fond autour du médaillon carré (pas directement
  exploitables telles quelles) : recadrées à l'import avec ImageMagick
  (`convert -fuzz 15% -trim` pour repérer les bords, puis un recadrage
  uniforme `572x572+318+180` appliqué à tous les lots — le fuzz-trim seul
  n'est pas fiable sur ces images à cause du grain de papier du fond, qui
  fait illusion de contenu sur les bords ; vérifié visuellement que ce
  recadrage uniforme ne coupe aucun des deux lots avant de le fixer).
  `RPG_STAT_ICON_IMAGES` (`RpgStatIcon.tsx`) liste les capacités qui ont
  une icône générée ; `RpgStatIcon` affiche l'image carrée telle quelle
  (cadre déjà peint dedans, même logique que le portrait) si elle existe,
  sinon le glyphe SVG. `RpgStatPanel.tsx` lit cette même liste pour
  savoir s'il doit omettre son badge circulaire CSS (utile seulement
  pour envelopper un glyphe SVG nu, pas une icône déjà encadrée) —
  ajouter une icône = ajouter une entrée à `RPG_STAT_ICON_IMAGES`, le
  recadrage éventuel se fait à part avant de déposer le fichier.
- **`public/rpg/frames/cadre-grimoire.png`** : cadre ornemental (bronze
  gravé/délabré, généré par l'utilisateur) qui remplace le cadre CSS
  (bordure + coins coupés en `clip-path`) de `.rpg-frame`
  (`globals.css`) — utilisé par tous les panneaux `Card variant="rpg"`,
  sur les trois onglets (Personnage, Quêtes, Journal), puisqu'ils
  partagent tous cette classe. Technique **border-image 9-slice** plutôt
  qu'une image de fond classique, car les panneaux n'ont pas une taille
  fixe (d'une simple rangée d'en-tête à une longue carte de quêtes) :
  `border-image-slice: 115` découpe le PNG (512×512, réduit depuis l'export
  1024×1024 d'origine — un cadre affiché à ~18px sur l'écran n'a pas besoin
  de plus de résolution) en 4 coins + 4 bords + 1 centre ; seuls les 8
  morceaux de bordure sont dessinés (pas de mot-clé `fill`), donc le centre
  — transparent dans le fichier — n'est jamais utilisé et c'est le dégradé
  de fond du panneau qui reste visible à l'intérieur, quelle que soit sa
  taille réelle. `border-image-repeat: round` pour que le motif de rivets
  des bords se répète sans s'étirer de façon disproportionnée sur les
  panneaux larges.
  **Image source livrée en JPEG avec un fond "transparent" seulement en
  apparence** (damier gris/blanc dessiné dans les pixels, pas un vrai
  canal alpha) : la transparence réelle a été reconstruite après coup par
  floodfill ImageMagick (`-fuzz 22% -fill none -draw "color X,Y
  floodfill"` depuis plusieurs points du trou central et des quatre coins
  du canevas) plutôt que par un simple remplacement de couleur, pour ne
  pas aussi rendre transparents les reflets clairs du cadre lui-même — à
  refaire de la même façon si un futur visuel généré arrive dans le même
  état.
  **`rounded-xl` retiré de la variante `rpg` de `Card`** (`ui/card.tsx`) :
  gardé par erreur lors du premier ajout du cadre, il arrondissait le
  fond dégradé du panneau (`background-clip: padding-box`) sans arrondir
  le cadre lui-même (border-image ignore toujours `border-radius`), ce
  qui laissait un petit triangle du fond de page visible dans chacun des
  quatre coins. Les panneaux `rpg` restent donc des rectangles francs —
  cohérent avec le cadre lui-même, qui n'est pas arrondi.
  **Deux autres écarts corrigés après coup**, visibles entre le fond
  marron du panneau et l'ornement doré : (1) l'image source avait une
  marge transparente autour du dessin du cadre (reste du damier d'origine,
  ~25 px sur un canevas 512) — recadrée avec `convert -shave 20x20` pour
  que le cadre touche les bords du fichier, et `border-image-slice` ajusté
  de 115 à 140 sur la nouvelle taille (472 px) pour couvrir tout le motif
  d'angle ; (2) le motif d'angle a lui-même des creux/échancrures (volutes
  ajourées) qui restaient transparents une fois découpés en 9-slice —
  `background-clip: padding-box` → `border-box` pour que le dégradé du
  panneau remplisse aussi ces creux au lieu de laisser voir le fond de
  page à travers.

## Points d'attention
- Toute nouvelle requête Supabase doit rester compatible avec les policies
  RLS (`user_id = auth.uid()`) définies dans `supabase/schema.sql`.
- Utilisateur débutant en développement : explique les concepts au fur et
  à mesure des changements.
