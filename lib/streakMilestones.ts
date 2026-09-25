// Paliers de série (au-delà du simple record perso) : donne un objectif à
// moyen terme et un petit message dédié à chaque étape. Triés par ordre
// croissant de `days`, c'est important pour reachedMilestone/nextMilestone.
export type Milestone = { days: number; label: string };

export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, label: "🌱 3 jours d'affilée" },
  { days: 7, label: "🎉 1 semaine complète" },
  { days: 14, label: "🔥 2 semaines d'affilée" },
  { days: 21, label: "💪 21 jours, l'habitude est prise" },
  { days: 30, label: "🏅 1 mois complet" },
  { days: 60, label: "🥈 2 mois d'affilée" },
  { days: 100, label: "💯 100 jours" },
  { days: 180, label: "🥇 6 mois d'affilée" },
  { days: 365, label: "👑 1 an complet" },
];

// Le palier le plus haut déjà atteint (ou null si aucun).
export function reachedMilestone(streak: number): Milestone | null {
  let result: Milestone | null = null;
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone.days) {
      result = milestone;
    } else {
      break;
    }
  }
  return result;
}

// Le prochain palier à venir, avec le nombre de jours restants pour l'atteindre.
export function nextMilestone(streak: number): { milestone: Milestone; remaining: number } | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak < milestone.days) {
      return { milestone, remaining: milestone.days - streak };
    }
  }
  return null;
}
