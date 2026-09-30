// Catalogue fixe des capacités (même logique que HABITS dans lib/habits.ts :
// la liste vit dans le code, pas en base). Les quêtes, elles, sont
// éditables par l'utilisateur (table rpg_quests) — c'est plus personnel et
// amené à évoluer, contrairement au catalogue d'habitudes fixe de l'autre
// espace.
//
// Les 8 caractéristiques de The Elder Scrolls IV: Oblivion. Si les clés
// changent un jour, il faut une migration (voir 010_oblivion_stats.sql pour
// la dernière en date) : elles sont dupliquées en base sur chaque ligne de
// rpg_quests/rpg_quest_logs (contrainte check), pas de simple libellé
// d'affichage à renommer sans y toucher.
export const RPG_STATS = [
  { key: "force", name: "Force", icon: "💪" },
  { key: "intelligence", name: "Intelligence", icon: "🧠" },
  { key: "volonte", name: "Volonté", icon: "🛡️" },
  { key: "agilite", name: "Agilité", icon: "🤸" },
  { key: "rapidite", name: "Rapidité", icon: "🏃" },
  { key: "endurance", name: "Endurance", icon: "❤️" },
  { key: "personnalite", name: "Personnalité", icon: "🗣️" },
  { key: "chance", name: "Chance", icon: "🍀" },
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
