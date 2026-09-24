// Petites phrases affichées selon le score du jour. Une seule est tirée par
// jour (voir pickDailyPhrase) : elle reste stable toute la journée, même si
// le score change entre-temps, tant qu'on reste dans la même catégorie.

export const LOW_SCORE_PHRASES = [
  "Allez madame on s'active.",
  "C'est pas encore digne d'une clean girl.",
  "Même ma grand-mère aurait fait mieux.",
  "Tu vas encore te tourner les pouces longtemps ?",
  "Ton canapé va finir par porter plainte pour harcèlement.",
  "Le glow up attendra encore un peu à ce rythme.",
  "Même ta plante verte prend plus soin d'elle que toi aujourd'hui.",
  "La flemme c'est charmant cinq minutes, pas toute la journée.",
  "On se réveille, la routine ne se fait pas toute seule.",
  "T'attends une invitation gravée dans le marbre ou quoi ?",
  "Le mode avion sur ta motivation, ça commence à se voir.",
  "Un petit effort, juste pour prouver que t'es capable.",
] as const;

export const HIGH_SCORE_PHRASES = [
  "Encore une journée où t'as dead ça.",
  "T'es vraiment la reine que tu penses être.",
  "Encore une preuve que t'es une clean girl.",
  "Tu devrais te lancer comme influenceuse bien-être.",
  "Le glow up, c'est maintenant, et c'est toi.",
  "Ta routine est plus propre que ton feed Pinterest.",
  "T'as officiellement ta place au balcon des it-girls.",
  "Tu rayonnes plus que ton highlighter.",
  "C'est ça, être une it-girl à temps plein.",
  "Aujourd'hui, la discipline avait ton visage.",
  "T'as coché toutes les cases, littéralement et symboliquement.",
  "Statut : icône du quotidien confirmée.",
] as const;

// Variantes plus douces les jours marqués "règles" (objectif abaissé).
export const LOW_SCORE_PHRASES_PERIOD = [
  "Les hormones font la loi aujourd'hui, on respecte.",
  "Even queens have a bad day. Repose-toi.",
  "Ton corps bosse dur en coulisses, un peu de douceur ne fera pas de mal.",
  "Le canapé a une bonne excuse de te garder aujourd'hui.",
  "Zéro culpabilité, juste du thé et une bouillotte.",
  "Ce n'est pas de la flemme, c'est de la survie stylée.",
] as const;

export const HIGH_SCORE_PHRASES_PERIOD = [
  "Même en mode boss final hormonal, t'as assuré.",
  "T'as fait le nécessaire avec classe, respect.",
  "Une reine qui gère même sous perfusion de thé et de chocolat.",
  "T'as prouvé que la discipline n'a pas de cycle.",
  "Objectif adapté, mais la victoire est bien réelle.",
  "Même fatiguée, t'es restée une it-girl.",
] as const;

// Sélection stable sur la journée : hash simple de la seed (date + contexte)
// pour retomber toujours sur la même phrase tant que rien ne change.
export function pickDailyPhrase(pool: readonly string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}
