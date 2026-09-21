"use client";

import { MAX_DAILY_POINTS, DAILY_TARGET_POINTS } from "@/lib/habits";
import { isSuccessDay, type RangeStats } from "@/lib/history";

type HistorySectionProps = {
  dailyTotals: Map<string, number>;
  days: string[]; // dates ISO, du plus ancien au plus récent
  streak: number;
  weekStats: RangeStats;
  monthStats: RangeStats;
};

function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

export default function HistorySection({
  dailyTotals,
  days,
  streak,
  weekStats,
  monthStats,
}: HistorySectionProps) {
  return (
    <div className="space-y-3 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">
          {streak > 0 ? (
            <>
              🔥 {streak} jour{streak > 1 ? "s" : ""} d&rsquo;affilée
            </>
          ) : (
            <span className="text-ink-soft">Pas encore de série en cours</span>
          )}
        </p>
        <p className="text-sm text-ink-soft">
          {weekStats.successDays}/{weekStats.totalDays} cette semaine ·{" "}
          {monthStats.successDays}/{monthStats.totalDays} ce mois-ci
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {days.map((day) => {
          const points = dailyTotals.get(day) ?? 0;
          const success = isSuccessDay(points);
          const partial = points > 0 && !success;
          return (
            <div
              key={day}
              title={`${dayLabel(day)} : ${points}/${MAX_DAILY_POINTS} points${success ? " — objectif atteint" : ""}`}
              aria-label={`${dayLabel(day)}, ${points} points`}
              className={`h-5 w-5 rounded-sm ${
                success ? "bg-blush-deep" : partial ? "bg-blush" : "bg-sand"
              }`}
            />
          );
        })}
      </div>
      <p className="text-xs text-ink-soft">
        14 derniers jours — objectif : {DAILY_TARGET_POINTS} points/jour
      </p>
    </div>
  );
}
