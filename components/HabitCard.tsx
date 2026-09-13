"use client";

import Gauge from "./Gauge";
import type { Habit } from "@/lib/types";

type HabitCardProps = {
  habit: Habit;
  weekCount: number;
  doneToday: boolean;
  onToggleToday: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
};

export default function HabitCard({
  habit,
  weekCount,
  doneToday,
  onToggleToday,
  onDelete,
}: HabitCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <Gauge value={weekCount} target={habit.target_per_week} color={habit.color} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-100">{habit.name}</p>
        <p className="text-sm text-neutral-400">
          {weekCount}/{habit.target_per_week} cette semaine
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={doneToday}
          onChange={() => onToggleToday(habit)}
          className="h-5 w-5 accent-emerald-600"
        />
        Aujourd&rsquo;hui
      </label>

      <button
        onClick={() => onDelete(habit)}
        aria-label={`Supprimer ${habit.name}`}
        className="text-neutral-500 hover:text-red-400"
      >
        ✕
      </button>
    </div>
  );
}
