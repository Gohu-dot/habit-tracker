"use client";

import type { HABITS } from "@/lib/habits";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

type HabitCardProps = {
  habit: (typeof HABITS)[number];
  done: boolean;
  onToggle: (habit: (typeof HABITS)[number]) => void;
};

export default function HabitCard({ habit, done, onToggle }: HabitCardProps) {
  return (
    <Card
      className={`transition-colors ${done ? "border-primary/40 bg-primary/5" : ""}`}
    >
      <label className="flex cursor-pointer items-center gap-4 p-4">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(habit)}
          className="h-6 w-6 shrink-0 accent-blush-deep"
        />

        <span className="min-w-0 flex-1 text-ink">{habit.name}</span>

        <Badge className="shrink-0">
          +{habit.points} pt{habit.points > 1 ? "s" : ""}
        </Badge>
      </label>
    </Card>
  );
}
