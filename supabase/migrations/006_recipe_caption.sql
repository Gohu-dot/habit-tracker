-- Migration : ajoute la légende récupérée automatiquement pour les recettes
-- TikTok, séparée de la note perso pour que celle-ci reste toujours
-- disponible sans être écrasée.
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).

alter table recipes add column if not exists caption text;
