import { NextRequest, NextResponse } from "next/server";
import { isTikTokUrl } from "@/lib/recipes";

export const dynamic = "force-dynamic";

// Un seul appel à l'oEmbed public de TikTok pour récupérer à la fois la
// légende (beaucoup de créateurs y écrivent les ingrédients) et une
// miniature de la vidéo (pour reconnaître la recette en un coup d'œil) —
// gratuit, sans clé API, côté serveur pour éviter tout souci de CORS.
// Toujours un 200 avec des champs à null en cas d'échec ou de lien non
// TikTok : le client n'a qu'un seul cas à gérer, pas de statut d'erreur à
// distinguer. Pas d'équivalent pour Instagram, qui a fermé son oEmbed public
// (accès réservé aux comptes développeur Meta).
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isTikTokUrl(url)) {
    return NextResponse.json({ caption: null, thumbnailUrl: null });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      return NextResponse.json({ caption: null, thumbnailUrl: null });
    }
    const data = (await res.json()) as { title?: unknown; thumbnail_url?: unknown };
    const caption = typeof data.title === "string" && data.title.trim() ? data.title.trim() : null;
    const thumbnailUrl =
      typeof data.thumbnail_url === "string" && data.thumbnail_url.trim()
        ? data.thumbnail_url.trim()
        : null;
    return NextResponse.json({ caption, thumbnailUrl });
  } catch (err) {
    console.error("Échec de récupération de l'oEmbed TikTok", err);
    return NextResponse.json({ caption: null, thumbnailUrl: null });
  }
}
