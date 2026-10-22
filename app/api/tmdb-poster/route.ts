import { NextRequest, NextResponse } from "next/server";
import { searchTmdbMovie } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

// Taille d'affiche "w342" : assez grande pour une miniature nette sur
// écran rétina sans peser trop lourd (TMDB sert plusieurs tailles pré-
// générées, pas besoin de redimensionner nous-mêmes). Voir
// https://developer.themoviedb.org/docs/image-basics pour les tailles
// disponibles.
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

// Recherche côté serveur (clé API jamais exposée au client, voir
// TMDB_API_KEY ci-dessous) : étant donné un titre (et une année en
// désambiguïsation), retrouve l'affiche correspondante sur TMDB (voir
// lib/tmdb.ts pour la recherche, partagée avec /api/tmdb-watch-providers).
// Toujours un 200 avec posterUrl à null en cas d'échec, même logique que
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
    const { match, debugReason } = await searchTmdbMovie(apiKey, title, year);
    if (!match || !match.posterPath) {
      return NextResponse.json({
        posterUrl: null,
        debugReason: debugReason ?? `Aucune affiche trouvée pour "${title}"${year ? ` (${year})` : ""}`,
      });
    }

    return NextResponse.json({ posterUrl: `${TMDB_IMAGE_BASE}${match.posterPath}`, debugReason: null });
  } catch (err) {
    return NextResponse.json({
      posterUrl: null,
      debugReason: err instanceof Error ? err.message : "Erreur inconnue",
    });
  }
}
