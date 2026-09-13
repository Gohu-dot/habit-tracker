"use client";

import type { HABITS } from "@/lib/habits";

type HabitCardProps = {
  habit: (typeof HABITS)[number];
  done: boolean;
  onToggle: (habit: (typeof HABITS)[number]) => void;
};

export default function HabitCard({ habit, done, onToggle }: HabitCardProps) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(habit)}
        className="h-6 w-6 shrink-0 accent-blush-deep"
      />

      <span className="min-w-0 flex-1 text-ink">{habit.name}</span>

      <span className="shrink-0 rounded-full bg-blush/40 px-2.5 py-1 text-sm font-medium text-blush-deep">
        +{habit.points} pt{habit.points > 1 ? "s" : ""}
      </span>
    </label>
  );
}
