import { NextRequest, NextResponse } from "next/server";
import { isTikTokUrl } from "@/lib/recipes";

export const dynamic = "force-dynamic";

// Extrait le contenu d'une balise <meta property="..." content="..."> (ou
// name="...") d'un bloc HTML, sans dépendance de parsing HTML — l'ordre des
// attributs peut varier, donc on cherche la balise <meta> entière contenant
// la clé, puis on en extrait content= séparément plutôt que d'exiger un
// ordre précis.
function extractMetaContent(html: string, key: string): string | null {
  const tagRegex = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i");
  const tagMatch = html.match(tagRegex);
  if (!tagMatch) return null;
  const contentMatch = tagMatch[0].match(/content=["']([^"']*)["']/i);
  if (!contentMatch) return null;
  const value = contentMatch[1].trim();
  return value ? value.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'") : null;
}

// Repli quand l'oEmbed ne fournit ni légende ni miniature (voir plus bas) :
// va chercher les balises Open Graph directement sur la page publique de la
// vidéo. Ces balises sont celles que lisent les aperçus de lien
// Facebook/Discord/iMessage, donc généralement présentes dans le HTML
// initial sans avoir besoin d'exécuter de JavaScript — contrairement au
// reste du contenu TikTok, rendu côté client.
async function fetchOpenGraphFallback(
  videoUrl: string
): Promise<{ caption: string | null; thumbnailUrl: string | null; debugDetail: string }> {
  const res = await fetch(videoUrl, {
    signal: AbortSignal.timeout(5000),
    headers: {
      // Sans en-tête User-Agent "navigateur", TikTok peut servir une page
      // différente (ou bloquer la requête) aux clients non reconnus.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) {
    return { caption: null, thumbnailUrl: null, debugDetail: `page HTTP ${res.status}` };
  }
  const html = await res.text();
  const caption = extractMetaContent(html, "og:title") ?? extractMetaContent(html, "og:description");
  const thumbnailUrl = extractMetaContent(html, "og:image");
  return {
    caption,
    thumbnailUrl,
    // Diagnostic : la taille de la page reçue distingue un vrai blocage
    // (page courte, interstitiel captcha/consentement) d'une page complète
    // qui n'a simplement pas ces balises pour ce contenu précis.
    debugDetail: `page HTTP ${res.status}, ${html.length} caractères reçus`,
  };
}

// Un seul appel à l'oEmbed public de TikTok pour récupérer à la fois la
// légende (beaucoup de créateurs y écrivent les ingrédients) et une
// miniature de la vidéo (pour reconnaître la recette en un coup d'œil) —
// gratuit, sans clé API, côté serveur pour éviter tout souci de CORS.
// Toujours un 200 avec des champs à null en cas d'échec ou de lien non
// TikTok : le client n'a qu'un seul cas à gérer, pas de statut d'erreur à
// distinguer. Pas d'équivalent pour Instagram, qui a fermé son oEmbed public
// (accès réservé aux comptes développeur Meta).
//
// Constaté en production (voir debugReason affiché dans RecipeCard.tsx) :
// l'oEmbed de TikTok a cessé de renvoyer title/thumbnail_url (il ne renvoie
// plus que des métadonnées techniques : embed_product_id, html...) — un
// changement côté TikTok, pas un bug de ce code. D'où le repli Open Graph
// ci-dessus, tenté uniquement quand l'oEmbed ne donne ni l'un ni l'autre.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isTikTokUrl(url)) {
    return NextResponse.json({ caption: null, thumbnailUrl: null, debugReason: null });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      return NextResponse.json({
        caption: null,
        thumbnailUrl: null,
        debugReason: `TikTok a répondu ${res.status} (oEmbed)`,
      });
    }
    const data = (await res.json()) as { title?: unknown; thumbnail_url?: unknown };
    let caption = typeof data.title === "string" && data.title.trim() ? data.title.trim() : null;
    let thumbnailUrl =
      typeof data.thumbnail_url === "string" && data.thumbnail_url.trim()
        ? data.thumbnail_url.trim()
        : null;
    let debugReason: string | null = null;

    if (!caption && !thumbnailUrl) {
      try {
        const fallback = await fetchOpenGraphFallback(url);
        caption = fallback.caption;
        thumbnailUrl = fallback.thumbnailUrl;
        if (!caption && !thumbnailUrl) {
          debugReason = `oEmbed et Open Graph sans résultat (${fallback.debugDetail})`;
        }
      } catch (fallbackErr) {
        console.error("Échec du repli Open Graph TikTok", fallbackErr);
        const reason = fallbackErr instanceof Error ? fallbackErr.message : "erreur inconnue";
        debugReason = `oEmbed sans résultat, repli Open Graph en échec (${reason})`;
      }
    }

    return NextResponse.json({ caption, thumbnailUrl, debugReason });
  } catch (err) {
    console.error("Échec de récupération de l'oEmbed TikTok", err);
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : "Erreur inconnue";
    return NextResponse.json({ caption: null, thumbnailUrl: null, debugReason: reason });
  }
}
