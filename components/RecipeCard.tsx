"use client";

import { useState } from "react";
import { RECIPE_CATEGORIES, RECIPE_STATUSES, isTikTokUrl, type RecipeStatusKey } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

type RecipeCardProps = {
  recipe: Recipe;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onThumbnailRefresh: (newThumbnailUrl: string | null) => void;
};

const STATUS_STYLES: Record<RecipeStatusKey, string> = {
  a_tester: "bg-sand text-ink-soft",
  testee: "bg-blush text-ink",
  validee: "bg-blush-deep text-white",
};

export default function RecipeCard({
  recipe,
  onCycleStatus,
  onEdit,
  onDelete,
  onThumbnailRefresh,
}: RecipeCardProps) {
  const categoryName =
    RECIPE_CATEGORIES.find((c) => c.key === recipe.category)?.name ?? recipe.category;
  const statusName = RECIPE_STATUSES.find((s) => s.key === recipe.status)?.name ?? recipe.status;
  // Les miniatures viennent du CDN de TikTok, dont les liens signés expirent
  // avec le temps : un <img> existant qui casse retente une fois toute
  // seule (handleThumbnailError). Mais une recette dont thumbnail_url est
  // resté `null` (ajoutée avant cette fonctionnalité, ou échec silencieux
  // au moment de l'ajout) n'a pas d'<img> du tout, donc rien ne se
  // déclenche automatiquement : on propose alors un bouton de récupération
  // manuelle (fetchFreshThumbnail), utilisable aussi pour réessayer après
  // un échec.
  const [thumbnailBroken, setThumbnailBroken] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [fetchingThumbnail, setFetchingThumbnail] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  // Affiché directement sur la fiche en cas d'échec (voir debugReason dans
  // app/api/tiktok-oembed/route.ts) pour diagnostiquer sans outils de
  // développeur : ni TikTok ni Vercel ne sont joignables depuis
  // l'environnement où ce projet est développé.
  const [fetchDebugReason, setFetchDebugReason] = useState<string | null>(null);

  async function fetchFreshThumbnail() {
    setFetchingThumbnail(true);
    setFetchFailed(false);
    setFetchDebugReason(null);
    try {
      const res = await fetch(`/api/tiktok-oembed?url=${encodeURIComponent(recipe.url)}`);
      const data = await res.json();
      const freshUrl = typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : null;
      if (freshUrl && freshUrl !== recipe.thumbnail_url) {
        onThumbnailRefresh(freshUrl);
        setThumbnailBroken(false);
      } else {
        setFetchFailed(true);
        setFetchDebugReason(typeof data.debugReason === "string" ? data.debugReason : null);
      }
    } catch (err) {
      console.error(err);
      setFetchFailed(true);
      setFetchDebugReason(err instanceof Error ? err.message : null);
    } finally {
      setFetchingThumbnail(false);
    }
  }

  async function handleThumbnailError() {
    if (refreshAttempted) {
      setThumbnailBroken(true);
      return;
    }
    setRefreshAttempted(true);
    await fetchFreshThumbnail();
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-sand bg-ivory shadow-sm">
      {recipe.thumbnail_url && !thumbnailBroken ? (
        // eslint-disable-next-line @next/next/no-img-element -- image hébergée sur le CDN de TikTok, non listable dans next/image
        <img
          src={recipe.thumbnail_url}
          alt=""
          onError={handleThumbnailError}
          className="h-40 w-full object-cover"
        />
      ) : (
        isTikTokUrl(recipe.url) && (
          <button
            type="button"
            onClick={fetchFreshThumbnail}
            disabled={fetchingThumbnail}
            className="flex h-40 w-full flex-col items-center justify-center gap-1 bg-sand/40 px-3 text-center text-xs text-ink-soft hover:bg-sand/60 disabled:opacity-60"
          >
            {fetchingThumbnail
              ? "Récupération..."
              : fetchFailed
                ? "⚠️ Échec — réessayer"
                : "🎬 Récupérer la miniature"}
            {fetchFailed && fetchDebugReason && (
              <span className="text-[10px] text-ink-soft/80">({fetchDebugReason})</span>
            )}
          </button>
        )
      )}

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 font-medium text-ink hover:text-blush-deep hover:underline"
          >
            {recipe.title}
          </a>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onEdit}
              aria-label="Modifier cette recette"
              title="Modifier"
              className="text-ink-soft hover:text-ink"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              aria-label="Supprimer cette recette"
              title="Supprimer"
              className="text-ink-soft hover:text-danger-text"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{categoryName}</span>
          <button
            type="button"
            onClick={onCycleStatus}
            title="Cliquer pour passer au statut suivant"
            className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[recipe.status]}`}
          >
            {statusName}
          </button>
        </div>

        {recipe.note && <p className="text-sm text-ink-soft">{recipe.note}</p>}

        {recipe.caption && (
          <details className="text-xs text-ink-soft">
            <summary className="cursor-pointer select-none hover:text-ink">Légende TikTok</summary>
            <p className="mt-1 whitespace-pre-wrap">{recipe.caption}</p>
          </details>
        )}
      </div>
    </div>
  );
}
