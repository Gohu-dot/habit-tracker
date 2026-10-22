// Recherche TMDB partagée entre les routes serveur /api/tmdb-poster et
// /api/tmdb-watch-providers (toutes deux ont besoin de retrouver le film
// correspondant avant d'en exploiter une propriété différente) — évite que
// la logique de correspondance titre/année diverge entre les deux routes
// au fil du temps.
export type TmdbMovieMatch = {
  id: number;
  posterPath: string | null;
};

type TmdbSearchResult = {
  results?: { id: number; poster_path?: string | null }[];
};

// L'année (primary_release_year) désambiguïse les titres partagés par
// plusieurs films — ex. les deux "La vie est belle" (1946 et 1997) du top
// 100 fourni par l'utilisateur.
export async function searchTmdbMovie(
  apiKey: string,
  title: string,
  year: number | null
): Promise<{ match: TmdbMovieMatch | null; debugReason: string | null }> {
  const params = new URLSearchParams({
    api_key: apiKey,
    query: title.trim(),
    language: "fr-FR",
    include_adult: "false",
  });
  if (year) params.set("primary_release_year", String(year));

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    return { match: null, debugReason: `TMDB a répondu ${res.status}` };
  }

  const data = (await res.json()) as TmdbSearchResult;
  const first = data.results?.[0];
  if (!first) {
    return { match: null, debugReason: `Aucun film trouvé pour "${title}"${year ? ` (${year})` : ""}` };
  }

  return { match: { id: first.id, posterPath: first.poster_path ?? null }, debugReason: null };
}
