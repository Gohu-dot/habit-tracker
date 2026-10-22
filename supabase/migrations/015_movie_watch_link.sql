-- Migration : ajoute la colonne watch_link à la table movies (lien
-- JustWatch vers la page "où regarder" de ce film, fourni par TMDB en même
-- temps que watch_providers — voir app/api/tmdb-watch-providers).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).

alter table movies add column if not exists watch_link text;
