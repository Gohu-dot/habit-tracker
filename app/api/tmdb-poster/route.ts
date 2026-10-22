import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Taille d'affiche "w342" : assez grande pour une miniature nette sur
// écran rétina sans peser trop lourd (TMDB sert plusieurs tailles pré-
// générées, pas besoin de redimensionner nous-mêmes). Voir
// https://developer.themoviedb.org/docs/image-basics pour les tailles
// disponibles.
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

type TmdbSearchResult = {
  results?: { poster_path?: string | null; title?: string; release_date?: string }[];
};

// Recherche côté serveur (clé API jamais exposée au client, voir
// TMDB_API_KEY ci-dessous) : étant donné un titre (et une année en
// désambiguïsation, ex. les deux films "La vie est belle" de 1946 et 1997
// du top 100), retrouve l'affiche correspondante sur TMDB. Toujours un 200
// avec posterUrl à null en cas d'échec, même logique que
// /api/tiktok-oembed : le client n'a qu'un seul cas à gérer, et
// debugReason permet de diagnostiquer sans accès aux logs Vercel (voir
// CLAUDE.md — ni TMDB ni Vercel ne sont joignables depuis cet
// environnement de développement, donc cette route n'a pu être testée
// qu'avec une clé API absente : son vrai comportement en production reste
// à confirmer au premier usage réel).
export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : null;

  if (!title || !title.trim()) {
    return NextResponse.json({ posterUrl: null, debugReason: "Titre manquant" });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ posterUrl: null, debugReason: "TMDB_API_KEY manquante côté serveur" });
  }

  try {
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
      return NextResponse.json({ posterUrl: null, debugReason: `TMDB a répondu ${res.status}` });
    }

    const data = (await res.json()) as TmdbSearchResult;
    const match = data.results?.[0];
    if (!match || !match.poster_path) {
      return NextResponse.json({
        posterUrl: null,
        debugReason: `Aucune affiche trouvée pour "${title}"${year ? ` (${year})` : ""}`,
      });
    }

    return NextResponse.json({ posterUrl: `${TMDB_IMAGE_BASE}${match.poster_path}`, debugReason: null });
  } catch (err) {
    return NextResponse.json({
      posterUrl: null,
      debugReason: err instanceof Error ? err.message : "Erreur inconnue",
    });
  }
}
