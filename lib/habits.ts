// Catalogue fixe des habitudes suivies, avec leur valeur en points.
// Ce n'est pas modifiable depuis l'interface : la liste est volontairement figée.
export const HABITS = [
  {
    key: "activite_physique",
    name: "Activité physique (muscu, pilates, fitness maison, yoga, 7000 pas)",
    points: 3,
  },
  {
    key: "alimentation",
    name: "Alimentation saine et protéinée",
    points: 3,
  },
  {
    key: "eau",
    name: "Boire 1,5L d'eau",
    points: 2,
  },
  {
    key: "activite_intellectuelle",
    name: "Activité intellectuelle (documentaire, podcast)",
    points: 2,
  },
  {
    key: "lecture",
    name: "Lire 20 pages",
    points: 1,
  },
  {
    key: "gouttieres",
    name: "Porter les gouttières",
    points: 1,
  },
] as const;

export type HabitKey = (typeof HABITS)[number]["key"];

export const DAILY_TARGET_POINTS = 5;
export const MAX_DAILY_POINTS = HABITS.reduce((sum, h) => sum + h.points, 0);
