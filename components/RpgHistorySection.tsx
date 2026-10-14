"use client";

import { mondayIndex } from "@/lib/history";
import type { RpgRangeStats } from "@/lib/rpgHistory";
import { nextMilestone, reachedMilestone } from "@/lib/streakMilestones";

type RpgHistorySectionProps = {
  dailyXp: Map<string, number>;
  monthDays: string[]; // toutes les dates ISO du mois en cours
  today: string;
  streak: number;
  bestStreak: number;
  weekStats: RpgRangeStats;
  monthStats: RpgRangeStats;
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

// Même principe que HistorySection.tsx côté habitudes, mais un jour est ici
// "réussi" dès qu'au moins une quête a été accomplie — pas d'objectif
// quotidien fixe ni de variante "règles" côté RPG.
export default function RpgHistorySection({
  dailyXp,
  monthDays,
  today,
  streak,
  bestStreak,
  weekStats,
  monthStats,
}: RpgHistorySectionProps) {
  const firstDay = new Date(`${monthDays[0]}T00:00:00`);
  const leadingBlanks = mondayIndex(firstDay);
  const milestone = reachedMilestone(streak);
  const upcoming = nextMilestone(streak);

  return (
    <div className="space-y-4 rounded-xl border border-rpg-border bg-rpg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-rpg-text">
            {streak > 0 ? (
              <>
                🔥 {streak} jour{streak > 1 ? "s" : ""} d&rsquo;affilée
              </>
            ) : (
              <span className="text-rpg-text-soft">Pas encore de série en cours</span>
            )}
            {bestStreak > 0 && (
              <span className="font-normal text-rpg-text-soft">
                {" "}
                ·{" "}
                {streak >= bestStreak
                  ? "🏆 record personnel !"
                  : `record perso : ${bestStreak} jour${bestStreak > 1 ? "s" : ""}`}
              </span>
            )}
          </p>
          {milestone && (
            <p className="text-xs font-medium text-rpg-gold">Palier atteint : {milestone.label}</p>
          )}
          {upcoming && (
            <p className="text-xs text-rpg-text-soft">
              Encore {upcoming.remaining} jour{upcoming.remaining > 1 ? "s" : ""} avant {upcoming.milestone.label}
            </p>
          )}
        </div>
        <p className="text-sm text-rpg-text-soft">
          {weekStats.activeDays}/{weekStats.totalDays} cette semaine ·{" "}
          {monthStats.activeDays}/{monthStats.totalDays} ce mois-ci
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-rpg-text">{monthLabel(monthDays[0])}</p>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-rpg-text-soft">
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
            const xp = dailyXp.get(day) ?? 0;
            const active = xp > 0;
            const dayNumber = Number(day.slice(-2));

            const fillClass = isFuture
              ? "text-rpg-text-soft/50"
              : active
                ? "bg-rpg-gold font-medium text-rpg-bg"
                : "bg-rpg-bg text-rpg-text-soft";

            return (
              <div
                key={day}
                title={isFuture ? dayLabel(day) : `${dayLabel(day)} : ${xp} XP`}
                className={`flex aspect-square items-center justify-center rounded-md text-sm ${fillClass} ${
                  isToday ? "ring-2 ring-rpg-purple ring-offset-1 ring-offset-rpg-panel" : ""
                }`}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
