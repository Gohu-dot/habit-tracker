# Habit Tracker

Site privé (usage personnel uniquement) pour suivre mes habitudes de vie :
chaque habitude a une jauge circulaire qui se remplit selon le nombre de
fois où elle a été cochée dans la semaine en cours.

Stack : Next.js (App Router) + Tailwind CSS pour le front, Supabase
(Postgres + Auth) pour la base de données et l'authentification,
déploiement sur Vercel.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com), crée un compte puis un
   nouveau projet (région Europe conseillée).
2. Dans **SQL Editor**, colle le contenu de `supabase/schema.sql` et
   exécute-le. Cela crée les tables `habits` et `habit_logs`, avec des
   règles de sécurité (Row Level Security) qui garantissent que seul le
   propriétaire des données peut les lire ou les modifier.
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

- Chaque habitude a un nom, une couleur et un objectif hebdomadaire
  (1 à 7 fois par semaine).
- Une case à cocher "Aujourd'hui" enregistre/retire une ligne dans
  `habit_logs` pour la date du jour.
- La jauge circulaire affiche le nombre de jours cochés cette semaine
  (lundi à dimanche) par rapport à l'objectif.
- Toutes les requêtes passent par les policies RLS de Supabase : même en
  cas de fuite de la clé publique (`anon key`, faite pour être exposée côté
  client), personne ne peut lire ou écrire les données d'un autre compte.
