import { NextRequest, NextResponse } from "next/server";
import { isTikTokUrl } from "@/lib/recipes";

export const dynamic = "force-dynamic";

// Beaucoup de créateurs TikTok écrivent les ingrédients directement dans la
// légende de la vidéo : on va la chercher via l'oEmbed public de TikTok
// (gratuit, sans clé API) pour la proposer à côté du formulaire d'ajout.
// Toujours un 200 avec { caption: null } en cas d'échec ou de lien non
// TikTok : le client n'a qu'un seul cas à gérer, pas de statut d'erreur à
// distinguer. Pas d'équivalent pour Instagram, qui a fermé son oEmbed public
// (accès réservé aux comptes développeur Meta).
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isTikTokUrl(url)) {
    return NextResponse.json({ caption: null });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      return NextResponse.json({ caption: null });
    }
    const data = (await res.json()) as { title?: unknown };
    const caption = typeof data.title === "string" && data.title.trim() ? data.title.trim() : null;
    return NextResponse.json({ caption });
  } catch (err) {
    console.error("Échec de récupération de la légende TikTok", err);
    return NextResponse.json({ caption: null });
  }
}
