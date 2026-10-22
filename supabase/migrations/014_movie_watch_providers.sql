-- Migration : ajoute la colonne watch_providers à la table movies (liste
-- des plateformes de streaming par abonnement où le film est disponible en
-- France, récupérée via TMDB/JustWatch — voir app/api/tmdb-watch-providers).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- jsonb (pas text[]) car chaque plateforme porte aussi son logo :
-- [{ "name": "Netflix", "logoUrl": "https://..." }, ...]. NULL = jamais
-- récupéré ; [] = récupéré avec succès, confirmé non disponible en
-- streaming actuellement (voir MovieRow.tsx pour la distinction).

alter table movies add column if not exists watch_providers jsonb;
