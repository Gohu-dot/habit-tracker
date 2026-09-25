"use client";

import { HABITS, type HabitKey } from "@/lib/habits";
import type { HabitStat } from "@/lib/history";

type HabitStatsSectionProps = {
  stats: HabitStat[];
};

const NAMES: Record<HabitKey, string> = Object.fromEntries(
  HABITS.map((h) => [h.key, h.name])
) as Record<HabitKey, string>;

export default function HabitStatsSection({ stats }: HabitStatsSectionProps) {
  // Triées du pire au meilleur taux : la première ligne, c'est celle qu'on
  // loupe le plus souvent.
  const sorted = [...stats].sort((a, b) => a.percent - b.percent);
  const totalDays = stats[0]?.totalDays ?? 0;

  return (
    <div className="space-y-3 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <p className="text-sm font-medium text-ink">Par habitude ({totalDays} derniers jours)</p>

      <div className="space-y-2.5">
        {sorted.map((stat) => (
          <div key={stat.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-ink-soft">
              <span className="min-w-0 flex-1 truncate">{NAMES[stat.key]}</span>
              <span className="shrink-0">
                {stat.percent}% ({stat.count}/{stat.totalDays})
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-blush-deep"
                style={{ width: `${stat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
