export const MOVIE_RATING_MAX = 5;

export type ParsedMovieLine = {
  rank: number;
  title: string;
  year: number | null;
};

const CURRENT_YEAR = new Date().getFullYear();

// Numéro de rang en tête de ligne ("1.", "1)", "1 -", "1:") — ponctuation
// obligatoire pour ne pas confondre un vrai numéro de classement avec un
// titre qui commence lui-même par un chiffre ("12 Monkeys", "2001: l'Odyssée
// de l'espace" sans numéro devant). (?!\d) empêche aussi de couper "2001"
// au milieu (ne capture que des groupes de 1 à 3 chiffres isolés, donc un
// classement jusqu'à 999 — largement suffisant pour un top 100).
const LEADING_RANK = /^\s*(\d{1,3})(?!\d)\s*[.)\-:]\s*/;

// Année en fin de ligne, entre parenthèses ou après un tiret/une virgule
// ("(1972)", "- 1972", ", 1972") : exige un séparateur avant les 4 chiffres
// pour ne jamais rogner un titre qui serait lui-même une année ("1917",
// "2001: l'Odyssée de l'espace" une fois le numéro de rang retiré).
const TRAILING_YEAR = /[\s,\-–—(]+(\d{4})\)?\s*$/;

// Essaie d'extraire (rang, titre, année) d'une ligne collée par
// l'utilisateur. Reste volontairement tolérant : si aucun numéro de rang
// n'est reconnu en tête de ligne, le rang retombe sur la position dans le
// texte collé (fallback séquentiel) plutôt que d'échouer — une liste top 100
// est de toute façon déjà dans l'ordre.
export function parseMovieLine(rawLine: string, fallbackRank: number): ParsedMovieLine | null {
  const line = rawLine.trim();
  if (!line) return null;

  let rank = fallbackRank;
  let rest = line;
  const rankMatch = line.match(LEADING_RANK);
  if (rankMatch) {
    rank = Number(rankMatch[1]);
    rest = line.slice(rankMatch[0].length);
  }

  let year: number | null = null;
  const yearMatch = rest.match(TRAILING_YEAR);
  if (yearMatch && yearMatch.index !== undefined && yearMatch.index > 0) {
    const candidate = Number(yearMatch[1]);
    if (candidate >= 1870 && candidate <= CURRENT_YEAR + 1) {
      year = candidate;
      rest = rest.slice(0, yearMatch.index);
    }
  }

  const title = rest.trim().replace(/\s+/g, " ");
  if (!title) return null;

  return { rank, title, year };
}

// Parse un bloc de texte collé (une ligne par film) en lignes exploitables,
// en ignorant les lignes vides. Pas de dédoublonnage par rang ici : c'est
// l'upsert Supabase (on_conflict: "rank") côté MoviesPage.tsx qui gère les
// doublons, en gardant la dernière occurrence.
export function parseMovieList(input: string): ParsedMovieLine[] {
  const lines = input.split("\n");
  const parsed: ParsedMovieLine[] = [];
  let fallbackRank = 1;
  for (const line of lines) {
    const result = parseMovieLine(line, fallbackRank);
    if (result) {
      parsed.push(result);
      fallbackRank = result.rank + 1;
    }
  }
  return parsed;
}
