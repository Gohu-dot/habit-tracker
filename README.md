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
   exécute-le. Cela crée la table `habit_logs`, avec des règles de sécurité
   (Row Level Security) qui garantissent que seul le propriétaire des
   données peut les lire ou les modifier. Le catalogue des habitudes (nom,
   points) n'est pas en base : il vit dans le code, voir `lib/habits.ts`.
3. Dans **Authentication > Users**, crée manuellement ton unique compte
   (e-mail + mot de passe). Il n'y a pas de page d'inscription publique :
   c'est volontaire, ce site est fait pour un seul utilisateur.
4. Dans **Project Settings > API**, récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurer les variables d'environnement

Copie `.env.local.example` vers `.env.local` et renseigne les deux valeurs
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
2. Renseigne les deux variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans les réglages du projet Vercel.
3. Déploie. Le site est accessible via l'URL Vercel — pense à ne pas la
   partager publiquement puisque le contenu est personnel (même si l'accès
   reste protégé par la connexion Supabase).

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
  date du jour.
- La jauge du haut affiche le total de points gagnés aujourd'hui, et passe
  au rose soutenu avec "✓ Objectif atteint" (+ une petite animation au
  moment précis où l'objectif est franchi) dès que le minimum quotidien
  (5 points, `DAILY_TARGET_POINTS` dans `lib/habits.ts`) est atteint.
- Un bloc historique affiche la série de jours consécutifs réussis
  ("🔥 N jours d'affilée"), un bilan de la semaine et du mois en cours, et
  un calendrier complet du mois en cours (voir `lib/history.ts` pour les
  calculs et `components/HistorySection.tsx` pour l'affichage). Rien n'est
  jamais supprimé en base : chaque jour reste dans `habit_logs` avec sa
  propre date, l'appli ne fait que recharger les 90 derniers jours à
  chaque visite pour calculer ces statistiques.
- Le site est installable comme une application (PWA) : "Ajouter à l'écran
  d'accueil" sur téléphone ouvre le site en plein écran, sans barre
  d'adresse, avec sa propre icône (voir `app/manifest.ts`, `app/icon.png`,
  `app/apple-icon.png`). Pas de mode hors-ligne : l'appli a de toute façon
  besoin du réseau pour parler à Supabase.
- Toutes les requêtes passent par les policies RLS de Supabase : même en
  cas de fuite de la clé publique (`anon key`, faite pour être exposée côté
  client), personne ne peut lire ou écrire les données d'un autre compte.

## Modifier le catalogue d'habitudes ou l'objectif

Tout se passe dans `lib/habits.ts` : ajoute/modifie une entrée dans le
tableau `HABITS` (clé, nom, points) ou change `DAILY_TARGET_POINTS`. Aucune
migration de base de données n'est nécessaire pour ça, seul le nom affiché
et les points changent — l'historique déjà enregistré (`habit_key`) reste
valable tant que la clé (`key`) d'une habitude existante n'est pas modifiée
ou supprimée.
