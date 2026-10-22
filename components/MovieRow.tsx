"use client";

import { useState } from "react";
import { MOVIE_RATING_MAX } from "@/lib/movies";
import type { Movie, MovieWatchProvider } from "@/lib/types";

type MovieRowProps = {
  movie: Movie;
  onToggleWatched: () => void;
  onRate: (rating: number | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onPosterFetched: (posterUrl: string | null) => void;
  onProvidersFetched: (providers: MovieWatchProvider[]) => void;
};

// Une ligne = un film du classement. Volontairement compact (deux lignes de
// texte max) plutôt qu'une carte façon RecipeCard : la liste va jusqu'à 100
// entrées, un format carte serait bien trop long à parcourir.
export default function MovieRow({
  movie,
  onToggleWatched,
  onRate,
  onEdit,
  onDelete,
  onPosterFetched,
  onProvidersFetched,
}: MovieRowProps) {
  const subtitle = [movie.year, movie.director].filter(Boolean).join(" · ");

  // Même logique que RecipeCard.tsx pour les miniatures TikTok : le
  // composant va chercher lui-même l'affiche (route /api/tmdb-poster),
  // puis délègue la persistance au parent via onPosterFetched — pas de
  // retry automatique ici (contrairement à TikTok, une URL d'affiche TMDB
  // est stable dans le temps, pas un lien signé qui expire).
  const [fetching, setFetching] = useState(false);
  const [debugReason, setDebugReason] = useState<string | null>(null);

  async function fetchPoster() {
    setFetching(true);
    setDebugReason(null);
    try {
      const params = new URLSearchParams({ title: movie.title });
      if (movie.year) params.set("year", String(movie.year));
      const res = await fetch(`/api/tmdb-poster?${params.toString()}`);
      const data = await res.json();
      const posterUrl = typeof data.posterUrl === "string" ? data.posterUrl : null;
      if (posterUrl) {
        onPosterFetched(posterUrl);
      } else {
        setDebugReason(typeof data.debugReason === "string" ? data.debugReason : "Affiche introuvable");
      }
    } catch (err) {
      setDebugReason(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setFetching(false);
    }
  }

  // Même principe que fetchPoster ci-dessus, pour les plateformes de
  // streaming. debugReason n'est affiché que si providers est resté
  // `undefined` côté réponse (erreur) : un tableau vide `[]` est un
  // résultat valide ("pas sur une plateforme actuellement"), pas une
  // erreur à signaler.
  const [fetchingProviders, setFetchingProviders] = useState(false);
  const [providersDebugReason, setProvidersDebugReason] = useState<string | null>(null);

  async function fetchProviders() {
    setFetchingProviders(true);
    setProvidersDebugReason(null);
    try {
      const params = new URLSearchParams({ title: movie.title });
      if (movie.year) params.set("year", String(movie.year));
      const res = await fetch(`/api/tmdb-watch-providers?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data.providers)) {
        onProvidersFetched(data.providers);
      } else {
        setProvidersDebugReason(
          typeof data.debugReason === "string" ? data.debugReason : "Plateformes introuvables"
        );
      }
    } catch (err) {
      setProvidersDebugReason(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setFetchingProviders(false);
    }
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-sand bg-ivory px-3 py-2 ${
        movie.watched ? "" : "opacity-80"
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-medium text-ink-soft">
        {movie.rank}
      </span>

      {movie.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- image hébergée sur le CDN de TMDB, non listable dans next/image
        <img
          src={movie.poster_url}
          alt=""
          className="h-[72px] w-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={fetchPoster}
          disabled={fetching}
          title={debugReason ?? "Récupérer l'affiche"}
          className="flex h-[72px] w-12 shrink-0 items-center justify-center rounded-md bg-sand/60 text-base text-ink-soft hover:bg-sand disabled:opacity-60"
        >
          {fetching ? "…" : debugReason ? "⚠️" : "🎬"}
        </button>
      )}

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

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {movie.watch_providers === null ? (
            <button
              type="button"
              onClick={fetchProviders}
              disabled={fetchingProviders}
              title={providersDebugReason ?? "Récupérer les plateformes de streaming"}
              className="rounded-full bg-sand/60 px-2 py-0.5 text-xs text-ink-soft hover:bg-sand disabled:opacity-60"
            >
              {fetchingProviders ? "…" : providersDebugReason ? "⚠️ Plateformes" : "📺 Plateformes"}
            </button>
          ) : movie.watch_providers.length === 0 ? (
            <button
              type="button"
              onClick={fetchProviders}
              disabled={fetchingProviders}
              title="Revérifier (peut avoir changé depuis)"
              className="text-xs text-ink-soft/70 hover:text-ink-soft"
            >
              {fetchingProviders ? "…" : "Pas en streaming actuellement 🔄"}
            </button>
          ) : (
            movie.watch_providers.map((provider) => (
              <span
                key={provider.name}
                title={provider.name}
                className="flex items-center gap-1 rounded-full bg-sand/60 px-2 py-0.5 text-xs text-ink-soft"
              >
                {provider.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- logo hébergé sur le CDN de TMDB, non listable dans next/image
                  <img src={provider.logoUrl} alt="" className="h-3.5 w-3.5 rounded-sm" />
                )}
                {provider.name}
              </span>
            ))
          )}
        </div>

        {movie.note && <p className="text-xs text-ink-soft">{movie.note}</p>}
      </div>
    </div>
  );
}
