import { HABITS, DAILY_TARGET_POINTS, type HabitKey } from "./habits";
import type { HabitLog } from "./types";
import { addDays, startOfMonth, toISODate } from "./date";

const POINTS_BY_KEY = new Map(HABITS.map((h) => [h.key, h.points]));

export function isSuccessDay(totalPoints: number): boolean {
  return totalPoints >= DAILY_TARGET_POINTS;
}

// Additionne les points par date à partir des logs bruts.
export function computeDailyTotals(logs: HabitLog[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    const points = POINTS_BY_KEY.get(log.habit_key as HabitKey) ?? 0;
    totals.set(log.log_date, (totals.get(log.log_date) ?? 0) + points);
  }
  return totals;
}

// Nombre de jours consécutifs (en remontant depuis aujourd'hui) où l'objectif
// a été atteint. Le jour en cours ne casse pas la série tant qu'il n'est pas
// terminé : s'il n'est pas encore réussi, on compte simplement à partir d'hier.
export function computeStreak(dailyTotals: Map<string, number>, todayISO: string): number {
  let streak = 0;
  let cursor = new Date(`${todayISO}T00:00:00`);

  if (isSuccessDay(dailyTotals.get(todayISO) ?? 0)) {
    streak++;
  }
  cursor = addDays(cursor, -1);

  while (isSuccessDay(dailyTotals.get(toISODate(cursor)) ?? 0)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export type RangeStats = { successDays: number; totalDays: number };

// Compte les jours réussis entre deux dates incluses (utilisé pour les
// bilans hebdo/mensuel : de lundi/1er du mois jusqu'à aujourd'hui).
export function countSuccessDaysInRange(
  dailyTotals: Map<string, number>,
  startDate: Date,
  endDate: Date
): RangeStats {
  let successDays = 0;
  let totalDays = 0;
  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    totalDays++;
    if (isSuccessDay(dailyTotals.get(toISODate(cursor)) ?? 0)) successDays++;
    cursor = addDays(cursor, 1);
  }
  return { successDays, totalDays };
}

// Toutes les dates ISO du mois contenant `date`, du 1er au dernier jour.
export function monthDays(date: Date): string[] {
  const start = startOfMonth(date);
  const days: string[] = [];
  let cursor = new Date(start);
  while (cursor.getMonth() === start.getMonth()) {
    days.push(toISODate(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

// Index du jour dans une semaine qui commence le lundi (0 = lundi ... 6 = dimanche).
export function mondayIndex(date: Date): number {
  const day = date.getDay(); // 0 = dimanche
  return day === 0 ? 6 : day - 1;
}
