import { addDays, toISODate } from "./date";
import type { RpgQuestLog } from "./types";

export type RpgRangeStats = { activeDays: number; totalDays: number };

// Additionne l'XP gagné par date à partir des logs bruts, toutes
// capacités confondues.
export function computeDailyXp(logs: RpgQuestLog[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    totals.set(log.log_date, (totals.get(log.log_date) ?? 0) + log.xp_value);
  }
  return totals;
}

// Un jour est "actif" dès qu'au moins une quête y a été accomplie : pas de
// seuil façon habitudes (pas d'objectif quotidien fixe côté RPG), juste
// "as-tu fait quelque chose aujourd'hui ?".
function isActiveDay(dailyXp: Map<string, number>, day: string): boolean {
  return (dailyXp.get(day) ?? 0) > 0;
}

// Nombre de jours consécutifs actifs (en remontant depuis aujourd'hui). Le
// jour en cours ne casse pas la série tant qu'il n'est pas terminé : s'il
// n'est pas encore actif, on compte simplement à partir d'hier.
export function computeRpgStreak(dailyXp: Map<string, number>, todayISO: string): number {
  let streak = 0;
  let cursor = new Date(`${todayISO}T00:00:00`);

  if (isActiveDay(dailyXp, todayISO)) streak++;
  cursor = addDays(cursor, -1);

  while (true) {
    const key = toISODate(cursor);
    if (isActiveDay(dailyXp, key)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return streak;
}

// La plus longue série de jours actifs consécutifs sur une plage de dates
// (record personnel), pas seulement la série en cours — même logique que
// computeBestStreak côté habitudes.
export function computeRpgBestStreak(
  dailyXp: Map<string, number>,
  startDate: Date,
  endDate: Date
): number {
  let best = 0;
  let current = 0;
  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    const key = toISODate(cursor);
    if (isActiveDay(dailyXp, key)) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

// Compte les jours actifs entre deux dates incluses (bilans hebdo/mensuel).
export function countActiveDaysInRange(
  dailyXp: Map<string, number>,
  startDate: Date,
  endDate: Date
): RpgRangeStats {
  let activeDays = 0;
  let totalDays = 0;
  let cursor = new Date(startDate);
  while (cursor <= endDate) {
    totalDays++;
    if (isActiveDay(dailyXp, toISODate(cursor))) activeDays++;
    cursor = addDays(cursor, 1);
  }
  return { activeDays, totalDays };
}
