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

// Extrait une valeur de chaîne JSON échappée (ex. "cover":"https:\/\/...")
// embarquée telle quelle dans le HTML, sans l'isoler dans un objet JSON
// complet au préalable (le blob d'hydratation de TikTok est un JSON énorme
// et pas toujours un JSON strictement valide une fois extrait brut — plus
// simple et plus robuste de cibler juste la paire clé/valeur voulue).
// JSON.parse sur la valeur ré-encapsulée entre guillemets gère proprement
// les échappements (\/, \uXXXX, \"...) sans réinventer un dé-échappement.
function extractJsonStringValue(html: string, key: string): string | null {
  const regex = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`);
  const match = html.match(regex);
  if (!match) return null;
  try {
    const value = JSON.parse(`"${match[1]}"`) as string;
    return value.trim() || null;
  } catch {
    return null;
  }
}

// Repli quand l'oEmbed ne fournit ni légende ni miniature (voir plus bas) :
// va chercher l'info directement sur la page publique de la vidéo, en deux
// temps sur le même HTML récupéré (une seule requête) :
//  1. Balises Open Graph (og:title/og:image) — ce que lisent les aperçus de
//     lien Facebook/Discord/iMessage, normalement présentes sans exécuter
//     de JavaScript.
//  2. Repli supplémentaire : le bloc JSON d'hydratation que TikTok embarque
//     dans la page pour son appli React (clés "cover"/"originCover"/
//     "dynamicCover" pour la miniature, "desc" pour la légende) — nécessaire
//     car en production (voir debugReason) TikTok renvoie une page complète
//     (~400 Ko) mais SANS balises og:* du tout : leurs métadonnées de
//     partage semblent être passées uniquement par ce JSON désormais.
async function fetchTikTokPageFallback(
  videoUrl: string
): Promise<{ caption: string | null; thumbnailUrl: string | null; debugDetail: string }> {
  const res = await fetch(videoUrl, {
    signal: AbortSignal.timeout(8000),
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

  const ogCaption = extractMetaContent(html, "og:title") ?? extractMetaContent(html, "og:description");
  const ogThumbnail = extractMetaContent(html, "og:image");
  if (ogCaption || ogThumbnail) {
    return {
      caption: ogCaption,
      thumbnailUrl: ogThumbnail,
      debugDetail: `page HTTP ${res.status}, trouvé via Open Graph`,
    };
  }

  const jsonThumbnail =
    extractJsonStringValue(html, "originCover") ??
    extractJsonStringValue(html, "cover") ??
    extractJsonStringValue(html, "dynamicCover");
  const jsonCaption = extractJsonStringValue(html, "desc");
  return {
    caption: jsonCaption,
    thumbnailUrl: jsonThumbnail,
    debugDetail:
      jsonThumbnail || jsonCaption
        ? `page HTTP ${res.status}, trouvé via le JSON embarqué`
        : `page HTTP ${res.status}, ${html.length} caractères reçus, rien trouvé (ni og:*, ni JSON embarqué)`,
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
// changement côté TikTok, pas un bug de ce code. D'où le repli
// fetchTikTokPageFallback ci-dessus, tenté uniquement quand l'oEmbed ne
// donne ni l'un ni l'autre.
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
        const fallback = await fetchTikTokPageFallback(url);
        caption = fallback.caption;
        thumbnailUrl = fallback.thumbnailUrl;
        if (!caption && !thumbnailUrl) {
          debugReason = `oEmbed sans résultat (${fallback.debugDetail})`;
        }
      } catch (fallbackErr) {
        console.error("Échec du repli page TikTok", fallbackErr);
        const reason = fallbackErr instanceof Error ? fallbackErr.message : "erreur inconnue";
        debugReason = `oEmbed sans résultat, repli page en échec (${reason})`;
      }
    }

    return NextResponse.json({ caption, thumbnailUrl, debugReason });
  } catch (err) {
    console.error("Échec de récupération de l'oEmbed TikTok", err);
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : "Erreur inconnue";
    return NextResponse.json({ caption: null, thumbnailUrl: null, debugReason: reason });
  }
}
