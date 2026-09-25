-- Migration : ajoute la miniature récupérée automatiquement pour les
-- recettes TikTok (même appel oEmbed que la légende, voir 006 et
-- app/api/tiktok-oembed).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).

alter table recipes add column if not exists thumbnail_url text;
