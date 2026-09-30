-- Migration : rend l'onglet Recettes partagé entre tous les comptes du site
-- (avant, chaque compte ne voyait que les recettes qu'il avait lui-même
-- ajoutées — problématique puisqu'un seul des deux comptes a un téléphone
-- Android capable d'importer facilement depuis TikTok/Instagram).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- `user_id` reste enregistré sur chaque ligne (qui a ajouté la recette)
-- mais n'est plus utilisé pour restreindre la lecture/écriture : n'importe
-- quel compte connecté sur ce site peut désormais voir, ajouter, modifier
-- ou supprimer n'importe quelle recette.

drop policy if exists "recipes: owner read" on recipes;
drop policy if exists "recipes: owner insert" on recipes;
drop policy if exists "recipes: owner update" on recipes;
drop policy if exists "recipes: owner delete" on recipes;
drop policy if exists "recipes: any authenticated read" on recipes;
drop policy if exists "recipes: any authenticated insert" on recipes;
drop policy if exists "recipes: any authenticated update" on recipes;
drop policy if exists "recipes: any authenticated delete" on recipes;

create policy "recipes: any authenticated read" on recipes
  for select using (auth.uid() is not null);
create policy "recipes: any authenticated insert" on recipes
  for insert with check (auth.uid() is not null);
create policy "recipes: any authenticated update" on recipes
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "recipes: any authenticated delete" on recipes
  for delete using (auth.uid() is not null);
