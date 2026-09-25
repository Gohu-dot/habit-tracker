import type { HabitKey } from "./habits";
import type { RecipeCategoryKey, RecipeStatusKey } from "./recipes";

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
