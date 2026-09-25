"use client";

import { RECIPE_CATEGORIES, RECIPE_STATUSES, type RecipeStatusKey } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

type RecipeCardProps = {
  recipe: Recipe;
  onCycleStatus: () => void;
  onDelete: () => void;
};

const STATUS_STYLES: Record<RecipeStatusKey, string> = {
  a_tester: "bg-sand text-ink-soft",
  testee: "bg-blush text-ink",
  validee: "bg-blush-deep text-white",
};

export default function RecipeCard({ recipe, onCycleStatus, onDelete }: RecipeCardProps) {
  const categoryName =
    RECIPE_CATEGORIES.find((c) => c.key === recipe.category)?.name ?? recipe.category;
  const statusName = RECIPE_STATUSES.find((s) => s.key === recipe.status)?.name ?? recipe.status;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 font-medium text-ink hover:text-blush-deep hover:underline"
        >
          {recipe.title}
        </a>
        <button
          onClick={onDelete}
          aria-label="Supprimer cette recette"
          title="Supprimer"
          className="shrink-0 text-ink-soft hover:text-danger-text"
        >
          ✕
        </button>
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
    </div>
  );
}
