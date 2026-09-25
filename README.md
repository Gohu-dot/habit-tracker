# Habit Tracker

Site privé (usage personnel uniquement) pour suivre mes habitudes de vie :
6 habitudes fixes valent chacune un certain nombre de points, et une jauge
quotidienne indique le total de points gagnés dans la journée, avec un
objectif minimum de 5 points/jour.

Stack : Next.js (App Router) + Tailwind CSS pour le front, Supabase
(Postgres + Auth) pour la base de données et l'authentification,
déploiement sur Vercel.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com), crée un compte puis un
   nouveau projet (région Europe conseillée).
2. Dans **SQL Editor**, colle le contenu de `supabase/schema.sql` et
   exécute-le. Cela crée les tables `habit_logs`, `period_days`,
   `push_subscriptions` et `recipes`, avec des règles de sécurité (Row
   Level Security) qui garantissent que seul le propriétaire des données
   peut les lire ou les modifier. Le catalogue des habitudes (nom, points)
   et celui des catégories/statuts de recettes ne sont pas en base : ils
   vivent dans le code, voir `lib/habits.ts` et `lib/recipes.ts`.
   Si le projet existait déjà avant l'ajout d'une fonctionnalité, exécute
   plutôt le script de migration correspondant dans `supabase/migrations/`
   (ex. `005_recipes.sql` pour l'onglet Recettes) au lieu de rejouer tout
   `schema.sql`.
3. Dans **Authentication > Users**, crée manuellement ton unique compte
   (e-mail + mot de passe). Il n'y a pas de page d'inscription publique :
   c'est volontaire, ce site est fait pour un seul utilisateur.
4. Dans **Project Settings > API**, récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (⚠️ secrète, ne jamais l'exposer côté client) →
     `SUPABASE_SERVICE_ROLE_KEY`, utilisée uniquement par le rappel du soir
     (voir plus bas)

## 2. Configurer les variables d'environnement

Copie `.env.local.example` vers `.env.local` et renseigne les valeurs
récupérées à l'étape précédente. Ce fichier n'est jamais commité (voir
`.gitignore`).

```bash
cp .env.local.example .env.local
```

## 3. Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) et connecte-toi avec
le compte créé dans Supabase.

## 4. Déployer sur Vercel

1. Importe ce dépôt GitHub dans [Vercel](https://vercel.com/new).
2. Renseigne toutes les variables d'environnement de `.env.local.example`
   dans les réglages du projet Vercel (Settings > Environment Variables).
3. Déploie. Le site est accessible via l'URL Vercel — pense à ne pas la
   partager publiquement puisque le contenu est personnel (même si l'accès
   reste protégé par la connexion Supabase).

## 5. Rappel du soir (notifications push)

Une tâche planifiée Vercel ("Cron Job", voir `vercel.json`) se déclenche
**une fois par jour à 19h (heure de Paris)** et envoie une notification si
l'objectif du jour n'est pas encore atteint. Heure fixe, pas réglable
depuis le site — le plan gratuit Vercel (Hobby) limite les Cron Jobs à une
exécution par jour, donc une tâche qui vérifierait plusieurs heures
possibles échouerait au déploiement (vu en pratique : voir l'historique de
`app/api/cron/evening-check/route.ts` si besoin de comprendre pourquoi
c'est resté volontairement simple).

1. **Générer les clés VAPID** (identifient ton site auprès des services de
   notification des navigateurs) :
   ```bash
   npx web-push generate-vapid-keys
   ```
   Renseigne la clé publique dans `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et la clé
   privée dans `VAPID_PRIVATE_KEY`. `VAPID_SUBJECT` doit être l'URL de ton
   site (ex. `https://habit-tracker-xxxx.vercel.app`).
2. **`SUPABASE_SERVICE_ROLE_KEY`** : récupérée à l'étape 1 (Project Settings
   > API). Elle permet à la tâche planifiée de lire tes données sans être
   connecté — à ne jamais utiliser côté client.
3. **`CRON_SECRET`** : une valeur aléatoire de ton choix (ex.
   `openssl rand -hex 32` dans un terminal, ou n'importe quelle chaîne
   longue et imprévisible). Vercel l'ajoute automatiquement dans l'en-tête
   des appels de ses propres Cron Jobs, ce qui empêche n'importe qui
   d'autre de déclencher l'envoi de notifications en visitant l'URL. Un
   appel manuel de test reste possible via `?secret=...` dans l'URL.
4. Renseigne ces 4 variables dans Vercel (Settings > Environment
   Variables), puis redéploie.
5. Une fois le site installé sur l'écran d'accueil (voir plus bas), clique
   **"🔔 Activer le rappel du soir"** sur le tableau de bord.

⚠️ La tâche est programmée en heure UTC fixe (`0 17 * * *` dans
`vercel.json`, soit 19h en heure d'été/CEST). Comme la France change
d'heure deux fois par an et que Vercel ne convertit pas automatiquement,
le rappel arrivera avec 1h de décalage (18h ou 20h) pendant l'heure d'hiver
(CET) tant que cette ligne n'est pas ajustée à la main (`0 18 * * *` pour
rester à 19h en hiver).

⚠️ **Plan Vercel** : un Cron Job qui tourne plus d'une fois par jour
demande le plan payant (Pro) — le plan gratuit (Hobby) refuse le
déploiement dans ce cas avec l'erreur *"Hobby accounts are limited to
daily cron jobs"*. Si une heure réglable par utilisateur redevient
utile un jour, la piste la plus simple sans passer à Pro est un service
externe gratuit (ex. [cron-job.org](https://cron-job.org)) qui appelle
`https://ton-site.vercel.app/api/cron/evening-check?secret=...` aussi
souvent que voulu, indépendamment des Cron Jobs Vercel.

## Fonctionnement

- Le catalogue des 6 habitudes (nom + points) est fixe et défini dans
  `lib/habits.ts` — il n'y a pas d'ajout/suppression d'habitude depuis
  l'interface, elles sont toujours toutes affichées :
  - Activité physique (muscu, pilates, fitness maison, yoga, 7000 pas) — 3 pts
  - Alimentation saine et protéinée — 3 pts
  - Boire 1,5L d'eau — 2 pts
  - Activité intellectuelle (documentaire, podcast) — 2 pts
  - Lire 20 pages — 1 pt
  - Porter les gouttières — 1 pt
- Cocher une case enregistre/retire une ligne dans `habit_logs` pour la
  date du jour. La journée ne bascule pas à minuit mais à 7h30 du matin
  (`DAY_RESET_HOUR`/`DAY_RESET_MINUTE` dans `lib/date.ts`) : les habitudes
  de la veille restent donc cochables jusqu'à 7h30 le lendemain matin.
- La jauge du haut affiche le total de points gagnés aujourd'hui, et passe
  au rose soutenu avec "✓ Objectif atteint" (+ une petite animation au
  moment précis où l'objectif est franchi) dès que le minimum quotidien
  (5 points, `DAILY_TARGET_POINTS` dans `lib/habits.ts`) est atteint.
- Une petite phrase (drôle en dessous de l'objectif, valorisante dès qu'il
  est atteint) s'affiche sous la jauge du jour. Elle est tirée une fois par
  jour dans `lib/phrases.ts` et reste stable toute la journée.
- Une case "J'ai mes règles aujourd'hui" abaisse l'objectif du jour à
  3 points (`PERIOD_TARGET_POINTS` dans `lib/habits.ts`) et fait basculer
  la jauge, le calendrier, le graphique et les phrases sur une teinte
  terracotta dédiée. La coche est mémorisée par date en base
  (table `period_days`), donc l'historique reste exact si tu regardes en
  arrière.
- Un graphique (`components/PointsChart.tsx`) trace l'évolution des points
  jour par jour sur le mois en cours, avec une ligne de seuil (en escalier
  les jours où l'objectif est abaissé) et une infobulle au survol/tap
  (souris ou tactile) indiquant la date et le score exacts.
- Un bloc historique affiche la série de jours consécutifs réussis
  ("🔥 N jours d'affilée"), le **record personnel** de la plus longue série
  jamais réalisée (dans la limite des 90 derniers jours conservés), les
  **paliers de série** (3, 7, 14, 21, 30, 60, 100, 180, 365 jours — le
  dernier atteint et le prochain à venir avec le nombre de jours restants),
  un bilan de la semaine et du mois en cours, et un calendrier complet du
  mois en cours (voir `lib/history.ts` et `lib/streakMilestones.ts` pour les
  calculs, `components/HistorySection.tsx` pour l'affichage). Rien n'est
  jamais supprimé en base : chaque jour reste dans `habit_logs` avec sa
  propre date, l'appli ne fait que recharger les 90 derniers jours à chaque
  visite pour calculer ces statistiques.
- Un bloc "Par habitude" affiche le taux de complétion de chacune des 6
  habitudes sur les 30 derniers jours glissants, trié de la moins tenue à
  la plus tenue — pratique pour repérer d'un coup d'œil celle qu'on loupe
  le plus souvent (`components/HabitStatsSection.tsx`).
- Un panneau repliable "✏️ Corriger un jour passé" permet de cocher/décocher
  une habitude (ou la case "règles") sur une date antérieure, dans la limite
  des 90 derniers jours, pour rattraper un oubli sans attendre le lendemain
  (`components/EditPastDay.tsx`).
- Thème clair ou sombre : par défaut, le site suit la préférence système
  (`prefers-color-scheme`) et s'ajuste automatiquement si elle change (ex.
  mode sombre programmé le soir sur le téléphone). Cliquer sur l'icône
  🌙/☀️ (en haut de l'écran de connexion et du tableau de bord) fixe un
  choix explicite, mémorisé dans le navigateur (`localStorage`) et
  réappliqué à chaque visite, sans flash du thème clair au chargement.
- Le site est installable comme une application (PWA) : "Ajouter à l'écran
  d'accueil" sur téléphone ouvre le site en plein écran, sans barre
  d'adresse, avec sa propre icône (voir `app/manifest.ts`, `app/icon.png`,
  `app/apple-icon.png`). Pas de mode hors-ligne : l'appli a de toute façon
  besoin du réseau pour parler à Supabase.
- Rappel du soir : une fois activé (bouton sur le tableau de bord), une
  tâche planifiée Vercel vérifie chaque soir à 19h (heure fixe) si
  l'objectif du jour est atteint, et envoie une notification push sinon
  (voir section 5 ci-dessus). Sur iPhone, ça ne fonctionne que si le site
  a été ajouté à l'écran d'accueil au préalable (contrainte d'Apple, pas
  du site).
- Toutes les requêtes passent par les policies RLS de Supabase : même en
  cas de fuite de la clé publique (`anon key`, faite pour être exposée côté
  client), personne ne peut lire ou écrire les données d'un autre compte.
- Un onglet **Recettes** (à côté de "Habitudes" en haut de l'écran) permet
  de garder les recettes saines repérées sur TikTok/Instagram : titre, lien
  vers la vidéo, catégorie (petit-déj, déjeuner, dîner, encas, dessert,
  boisson) et note libre optionnelle. Chaque fiche a un statut — à tester,
  testée, validée ⭐ — qui avance d'un clic sur la pastille. Filtres par
  catégorie et par statut pour retrouver une recette dans une liste qui
  grossit. Pas d'aperçu vidéo intégré (TikTok/Instagram ne s'y prêtent pas
  bien) : juste un lien propre qui ouvre la vidéo dans un nouvel onglet.
- **Partage direct depuis TikTok/Instagram (Android)** : une fois le site
  installé sur l'écran d'accueil, il apparaît directement dans le menu
  "Partager" d'une vidéo. Le lien atterrit pré-rempli dans le formulaire
  d'ajout de recette — il ne reste qu'à vérifier le titre/la catégorie et
  valider. Fonctionne uniquement sur Android (Chrome) : iOS/Safari ne
  supporte pas cette fonctionnalité des PWA, donc sur iPhone il faut
  continuer à copier-coller le lien manuellement.

## Modifier le catalogue d'habitudes ou l'objectif

Tout se passe dans `lib/habits.ts` : ajoute/modifie une entrée dans le
tableau `HABITS` (clé, nom, points) ou change `DAILY_TARGET_POINTS`. Aucune
migration de base de données n'est nécessaire pour ça, seul le nom affiché
et les points changent — l'historique déjà enregistré (`habit_key`) reste
valable tant que la clé (`key`) d'une habitude existante n'est pas modifiée
ou supprimée.
