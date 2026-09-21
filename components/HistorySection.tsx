"use client";

import { MAX_DAILY_POINTS, DAILY_TARGET_POINTS } from "@/lib/habits";
import { isSuccessDay, mondayIndex, type RangeStats } from "@/lib/history";

type HistorySectionProps = {
  dailyTotals: Map<string, number>;
  monthDays: string[]; // toutes les dates ISO du mois en cours
  today: string;
  streak: number;
  weekStats: RangeStats;
  monthStats: RangeStats;
};

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function monthLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const label = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function HistorySection({
  dailyTotals,
  monthDays,
  today,
  streak,
  weekStats,
  monthStats,
}: HistorySectionProps) {
  const firstDay = new Date(`${monthDays[0]}T00:00:00`);
  const leadingBlanks = mondayIndex(firstDay);

  return (
    <div className="space-y-4 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
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

      <div>
        <p className="mb-2 text-sm font-medium text-ink">{monthLabel(monthDays[0])}</p>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-ink-soft">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i}>{label}</div>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {monthDays.map((day) => {
            const isFuture = day > today;
            const isToday = day === today;
            const points = dailyTotals.get(day) ?? 0;
            const success = isSuccessDay(points);
            const partial = points > 0 && !success;
            const dayNumber = Number(day.slice(-2));

            return (
              <div
                key={day}
                title={
                  isFuture
                    ? dayLabel(day)
                    : `${dayLabel(day)} : ${points}/${MAX_DAILY_POINTS} points${
                        success ? " — objectif atteint" : ""
                      }`
                }
                className={`flex aspect-square items-center justify-center rounded-md text-sm ${
                  isFuture
                    ? "text-ink-soft/50"
                    : success
                      ? "bg-blush-deep font-medium text-white"
                      : partial
                        ? "bg-blush text-ink"
                        : "bg-sand text-ink-soft"
                } ${isToday ? "ring-2 ring-blush-deep ring-offset-1 ring-offset-ivory" : ""}`}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-soft">Objectif : {DAILY_TARGET_POINTS} points/jour</p>
    </div>
  );
}
