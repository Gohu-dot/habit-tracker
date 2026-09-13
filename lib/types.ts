import type { HabitKey } from "./habits";

export type HabitLog = {
  id: string;
  user_id: string;
  habit_key: HabitKey;
  log_date: string;
};
