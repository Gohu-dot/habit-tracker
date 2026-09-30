// Catalogue fixe des capacités (même logique que HABITS dans lib/habits.ts :
// la liste vit dans le code, pas en base). Les quêtes, elles, sont
// éditables par l'utilisateur (table rpg_quests) — c'est plus personnel et
// amené à évoluer, contrairement au catalogue d'habitudes fixe de l'autre
// espace.
export const RPG_STATS = [
  { key: "physique", name: "Physique", icon: "💪" },
  { key: "mental", name: "Mental", icon: "🧠" },
  { key: "discipline", name: "Discipline", icon: "🛡️" },
  { key: "creativite", name: "Créativité", icon: "🎨" },
  { key: "social", name: "Social", icon: "🗣️" },
] as const;

export type RpgStat = (typeof RPG_STATS)[number];
export type RpgStatKey = RpgStat["key"];

// XP cumulé nécessaire pour atteindre un niveau donné (niveau 1 = 0 XP,
// palier suivant toujours plus coûteux : 100, 300, 600, 1000, 1500...).
export function xpThresholdForLevel(level: number): number {
  return (100 * (level - 1) * level) / 2;
}

export type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

// Convertit un total d'XP en niveau + progression vers le niveau suivant.
export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= totalXp) {
    level++;
  }
  const currentThreshold = xpThresholdForLevel(level);
  const nextThreshold = xpThresholdForLevel(level + 1);
  return {
    level,
    xpIntoLevel: totalXp - currentThreshold,
    xpForNextLevel: nextThreshold - currentThreshold,
  };
}
