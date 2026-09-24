// Formate une date en "YYYY-MM-DD" selon le fuseau local (évite les décalages de next/prev jour dus à l'UTC).
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Heure à laquelle la journée d'habitudes "bascule" sur le jour suivant.
// Avant cette heure, on est encore considéré comme étant la veille (on peut
// par exemple cocher tard le soir ou tôt le matin les habitudes de la veille).
export const DAY_RESET_HOUR = 7;
export const DAY_RESET_MINUTE = 30;

// Date "métier" du jour en cours, décalée de l'heure de réinitialisation.
export function todayISO(date: Date = new Date()): string {
  const resetOffsetMs = (DAY_RESET_HOUR * 60 + DAY_RESET_MINUTE) * 60 * 1000;
  const shifted = new Date(date.getTime() - resetOffsetMs);
  return toISODate(shifted);
}

// Lundi de la semaine en cours (semaine du lundi au dimanche).
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}
