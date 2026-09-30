-- Migration : remplace les 5 capacités génériques de l'espace RPG par les
-- 8 caractéristiques de The Elder Scrolls IV: Oblivion (Force, Intelligence,
-- Volonté, Agilité, Rapidité, Endurance, Personnalité, Chance).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).
--
-- Ordre important : on retire d'abord les anciennes contraintes "check"
-- (sinon impossible d'écrire les nouvelles valeurs), on remappe les
-- quêtes/logs existants vers leur équivalent le plus proche, puis on
-- ajoute les nouvelles contraintes avec les 8 valeurs. Remapping choisi
-- (aucune caractéristique "créativité" n'existe dans Oblivion, fusionnée
-- avec intelligence) :
--   physique    -> force
--   mental      -> intelligence
--   creativite  -> intelligence
--   discipline  -> volonte
--   social      -> personnalite
-- Agilité, Rapidité, Endurance et Chance démarrent à 0 XP : ce sont de
-- nouvelles caractéristiques, aucune ancienne quête n'y correspondait.

alter table rpg_quests drop constraint if exists rpg_quests_stat_key_check;
alter table rpg_quest_logs drop constraint if exists rpg_quest_logs_stat_key_check;

update rpg_quests set stat_key = 'force' where stat_key = 'physique';
update rpg_quests set stat_key = 'intelligence' where stat_key in ('mental', 'creativite');
update rpg_quests set stat_key = 'volonte' where stat_key = 'discipline';
update rpg_quests set stat_key = 'personnalite' where stat_key = 'social';

update rpg_quest_logs set stat_key = 'force' where stat_key = 'physique';
update rpg_quest_logs set stat_key = 'intelligence' where stat_key in ('mental', 'creativite');
update rpg_quest_logs set stat_key = 'volonte' where stat_key = 'discipline';
update rpg_quest_logs set stat_key = 'personnalite' where stat_key = 'social';

alter table rpg_quests add constraint rpg_quests_stat_key_check
  check (stat_key in ('force', 'intelligence', 'volonte', 'agilite', 'rapidite', 'endurance', 'personnalite', 'chance'));
alter table rpg_quest_logs add constraint rpg_quest_logs_stat_key_check
  check (stat_key in ('force', 'intelligence', 'volonte', 'agilite', 'rapidite', 'endurance', 'personnalite', 'chance'));
