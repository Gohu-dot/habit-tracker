import { NextRequest, NextResponse } from "next/server";
import { searchTmdbMovie } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

// Taille de logo "w45" : largement suffisant pour une petite pastille
// (voir MovieRow.tsx), même logique que w342 pour les affiches.
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w45";

export type WatchProvider = { name: string; logoUrl: string | null };

type TmdbProvidersResponse = {
  results?: Record<
    string,
    {
      flatrate?: { provider_name: string; logo_path?: string | null }[];
    }
  >;
};

// Même contrat que /api/tmdb-poster (toujours 200, providers à null en cas
// d'échec + debugReason) mais avec une distinction en plus côté client :
// `providers: null` = pas encore récupéré ou erreur, `providers: []` =
// récupéré avec succès, confirmé non disponible en streaming par
// abonnement en France actuellement (voir MovieRow.tsx, qui s'appuie sur
// cette nuance pour ne pas réessayer en boucle un film réellement absent).
//
// Uniquement les offres par ABONNEMENT ("flatrate" dans l'API TMDB) —
// Netflix/Prime Video/Disney+ etc. — pas la location/achat à l'unité, hors
// sujet pour "sur quelle plateforme de streaming ce film se trouve-t-il".
// Région FR en dur (site francophone, pas de sélecteur de pays prévu).
//
// Ces données viennent de JustWatch via TMDB : une mention d'attribution
// est affichée sur la page (voir MoviesPage.tsx), condition de JustWatch
// pour leur réutilisation — voir https://www.themoviedb.org/talk/...
// (conditions d'usage de l'API TMDB, section watch providers).
//
// Non testable en conditions réelles depuis cet environnement (ni TMDB ni
// Vercel ne sont joignables ici, voir CLAUDE.md) : à confirmer au premier
// usage réel, comme pour /api/tmdb-poster.
export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : null;

  if (!title || !title.trim()) {
    return NextResponse.json({ providers: null, debugReason: "Titre manquant" });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ providers: null, debugReason: "TMDB_API_KEY manquante côté serveur" });
  }

  try {
    const { match, debugReason: searchDebugReason } = await searchTmdbMovie(apiKey, title, year);
    if (!match) {
      return NextResponse.json({ providers: null, debugReason: searchDebugReason });
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${match.id}/watch/providers?api_key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      return NextResponse.json({ providers: null, debugReason: `TMDB a répondu ${res.status}` });
    }

    const data = (await res.json()) as TmdbProvidersResponse;
    const flatrate = data.results?.FR?.flatrate ?? [];
    // Un même service peut apparaître plusieurs fois (offres groupées,
    // chaînes additionnelles) : dédoublonné par nom.
    const byName = new Map<string, WatchProvider>();
    for (const p of flatrate) {
      if (!byName.has(p.provider_name)) {
        byName.set(p.provider_name, {
          name: p.provider_name,
          logoUrl: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : null,
        });
      }
    }

    return NextResponse.json({ providers: Array.from(byName.values()), debugReason: null });
  } catch (err) {
    return NextResponse.json({
      providers: null,
      debugReason: err instanceof Error ? err.message : "Erreur inconnue",
    });
  }
}
