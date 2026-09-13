export type Habit = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  target_per_week: number;
  archived: boolean;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
};
