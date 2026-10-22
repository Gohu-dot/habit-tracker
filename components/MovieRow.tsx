"use client";

import { MOVIE_RATING_MAX } from "@/lib/movies";
import type { Movie } from "@/lib/types";

type MovieRowProps = {
  movie: Movie;
  onToggleWatched: () => void;
  onRate: (rating: number | null) => void;
  onEdit: () => void;
  onDelete: () => void;
};

// Une ligne = un film du classement. Volontairement compact (deux lignes de
// texte max) plutôt qu'une carte façon RecipeCard : la liste va jusqu'à 100
// entrées, un format carte serait bien trop long à parcourir.
export default function MovieRow({ movie, onToggleWatched, onRate, onEdit, onDelete }: MovieRowProps) {
  const subtitle = [movie.year, movie.director].filter(Boolean).join(" · ");

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-sand bg-ivory px-3 py-2 ${
        movie.watched ? "" : "opacity-80"
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-medium text-ink-soft">
        {movie.rank}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate font-medium text-ink">{movie.title}</p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onEdit}
              aria-label="Modifier ce film"
              title="Modifier"
              className="text-ink-soft hover:text-ink"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              aria-label="Supprimer ce film"
              title="Supprimer"
              className="text-ink-soft hover:text-danger-text"
            >
              ✕
            </button>
          </div>
        </div>

        {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onToggleWatched}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              movie.watched ? "bg-blush-deep text-white" : "bg-sand text-ink-soft"
            }`}
          >
            {movie.watched ? "✓ Vu" : "À voir"}
          </button>
          <div className="flex items-center" role="group" aria-label="Note">
            {Array.from({ length: MOVIE_RATING_MAX }).map((_, i) => {
              const value = i + 1;
              const filled = (movie.rating ?? 0) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRate(movie.rating === value ? null : value)}
                  aria-label={`Noter ${value} étoile${value > 1 ? "s" : ""}`}
                  className={`text-sm leading-none ${filled ? "text-blush-deep" : "text-sand"} hover:text-blush-deep`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

        {movie.note && <p className="text-xs text-ink-soft">{movie.note}</p>}
      </div>
    </div>
  );
}
