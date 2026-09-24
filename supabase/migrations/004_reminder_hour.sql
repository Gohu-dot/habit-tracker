-- Migration : ajoute l'heure de rappel réglable (au lieu de 19h fixe).
-- À exécuter dans Supabase (SQL Editor, nouvelle requête vide).

alter table push_subscriptions
  add column if not exists reminder_hour smallint not null default 19
    check (reminder_hour between 0 and 23);
