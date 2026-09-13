"use client";

import type { HABITS } from "@/lib/habits";

type HabitCardProps = {
  habit: (typeof HABITS)[number];
  done: boolean;
  onToggle: (habit: (typeof HABITS)[number]) => void;
};

export default function HabitCard({ habit, done, onToggle }: HabitCardProps) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(habit)}
        className="h-6 w-6 shrink-0 accent-emerald-600"
      />

      <span className="min-w-0 flex-1 text-neutral-100">{habit.name}</span>

      <span className="shrink-0 rounded-full bg-neutral-800 px-2.5 py-1 text-sm font-medium text-emerald-400">
        +{habit.points} pt{habit.points > 1 ? "s" : ""}
      </span>
    </label>
  );
}
