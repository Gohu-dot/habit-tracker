import { HABITS, DAILY_TARGET_POINTS, PERIOD_TARGET_POINTS, type HabitKey } from "./habits";
import type { HabitLog } from "./types";
import { addDays, startOfMonth, toISODate } from "./date";

const POINTS_BY_KEY = new Map(HABITS.map((h) => [h.key, h.points]));

// Objectif du jour : abaissé si ce jour est marqué "règles" (period_days).
export function targetForDay(day: string, periodDays: ReadonlySet<string>): number {
  return periodDays.has(day) ? PERIOD_TARGET_POINTS : DAILY_TARGET_POINTS;
}

export function isSuccessDay(totalPoints: number, target: number): boolean {
  return totalPoints >= target;
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
// du jour (variable si "règles") a été atteint. Le jour en cours ne casse
// pas la série tant qu'il n'est pas terminé : s'il n'est pas encore réussi,
// on compte simplement à partir d'hier.
export function computeStreak(
  dailyTotals: Map<string, number>,
  todayISO: string,
  periodDays: ReadonlySet<string>
): number {
  let streak = 0;
  let cursor = new Date(`${todayISO}T00:00:00`);

  if (isSuccessDay(dailyTotals.get(todayISO) ?? 0, targetForDay(todayISO, periodDays))) {
    streak++;
  }
  cursor = addDays(cursor, -1);

  while (true) {
    const key = toISODate(cursor);
    if (isSuccessDay(dailyTotals.get(key) ?? 0, targetForDay(key, periodDays))) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return streak;
}

// La plus longue série de jours consécutifs réussis sur une plage de dates
// (record personnel), pas seulement la série en cours. Contrairement à
// computeStreak, un jour en cours pas encore réussi n'a pas de traitement
// spécial ici : il compte simplement comme 0 pour l'instant, ce qui
// n'efface jamais un record déjà atteint plus tôt sur la plage.
export function computeBestStreak(
  dailyTotals: Map<string, number>,
  periodDays: ReadonlySet<string>,
  startDate: Date,
  endDate: Date
): number {
  let best = 0;
  let current = 0;
  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    const key = toISODate(cursor);
    if (isSuccessDay(dailyTotals.get(key) ?? 0, targetForDay(key, periodDays))) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

export type RangeStats = { successDays: number; totalDays: number };

// Compte les jours réussis entre deux dates incluses (utilisé pour les
// bilans hebdo/mensuel : de lundi/1er du mois jusqu'à aujourd'hui).
export function countSuccessDaysInRange(
  dailyTotals: Map<string, number>,
  startDate: Date,
  endDate: Date,
  periodDays: ReadonlySet<string>
): RangeStats {
  let successDays = 0;
  let totalDays = 0;
  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    totalDays++;
    const key = toISODate(cursor);
    if (isSuccessDay(dailyTotals.get(key) ?? 0, targetForDay(key, periodDays))) successDays++;
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
