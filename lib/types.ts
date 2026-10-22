import type { HabitKey } from "./habits";
import type { RecipeCategoryKey, RecipeStatusKey } from "./recipes";
import type { RpgStatKey } from "./rpg";

export type HabitLog = {
  id: string;
  user_id: string;
  habit_key: HabitKey;
  log_date: string;
};

export type PeriodDay = {
  id: string;
  user_id: string;
  log_date: string;
};

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  reminder_hour: number;
};

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  category: RecipeCategoryKey;
  status: RecipeStatusKey;
  note: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  created_at: string;
};

export type MovieWatchProvider = { name: string; logoUrl: string | null };

export type Movie = {
  id: string;
  user_id: string;
  rank: number;
  title: string;
  year: number | null;
  director: string | null;
  watched: boolean;
  watched_at: string | null;
  rating: number | null;
  note: string | null;
  poster_url: string | null;
  // null = jamais récupéré, [] = récupéré, confirmé non disponible
  // actuellement (voir app/api/tmdb-watch-providers).
  watch_providers: MovieWatchProvider[] | null;
  created_at: string;
};

export type RpgQuest = {
  id: string;
  user_id: string;
  title: string;
  stat_key: RpgStatKey;
  xp_value: number;
  created_at: string;
};

// xp_value/stat_key sont dupliqués depuis la quête au moment de la coche
// (plutôt que recalculés via une jointure) : l'XP déjà gagné reste exact
// même si la quête est ensuite modifiée ou supprimée.
export type RpgQuestLog = {
  id: string;
  user_id: string;
  quest_id: string | null;
  log_date: string;
  stat_key: RpgStatKey;
  xp_value: number;
  created_at: string;
};

// Objectif à moyen/long terme débloqué en atteignant `unlock_level` dans
// `stat_key` (contrairement aux quêtes secondaires, répétables au
// quotidien). `completed_at` null = pas encore validée. `xp_log_id`
// pointe vers la ligne de RpgQuestLog créée au moment de la validation
// (le bonus d'XP) : permet d'annuler proprement si décochée/supprimée par
// erreur, sans laisser un bonus fantôme dans les totaux.
export type RpgMainQuest = {
  id: string;
  user_id: string;
  stat_key: RpgStatKey;
  unlock_level: number;
  title: string;
  xp_reward: number;
  completed_at: string | null;
  xp_log_id: string | null;
  created_at: string;
};
