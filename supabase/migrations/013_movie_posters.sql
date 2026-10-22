-- Migration : ajoute la colonne poster_url à la table movies (affiches
-- récupérées automatiquement via TMDB, voir app/api/tmdb-poster).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).

alter table movies add column if not exists poster_url text;
