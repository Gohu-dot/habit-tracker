"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { parseMovieList } from "@/lib/movies";
import type { Movie } from "@/lib/types";
import AppHeader from "./AppHeader";
import MovieRow from "./MovieRow";

type MoviesPageProps = {
  userId: string;
};

const WATCHED_FILTER_ALL = "tous";
const WATCHED_FILTER_SEEN = "vus";
const WATCHED_FILTER_UNSEEN = "a_voir";

export default function MoviesPage({ userId }: MoviesPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [rank, setRank] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [director, setDirector] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [watchedFilter, setWatchedFilter] = useState(WATCHED_FILTER_ALL);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      const { data, error } = await supabase.from("movies").select("*").order("rank", { ascending: true });
      if (ignore) return;
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les films : " + error.message);
      } else {
        setMovies(data ?? []);
      }
      setLoading(false);
    }

    loadMovies();
    return () => {
      ignore = true;
    };
  }, []);

  function resetForm() {
    setEditingId(null);
    setRank("");
    setTitle("");
    setYear("");
    setDirector("");
    setNote("");
  }

  function handleStartEdit(movie: Movie) {
    setErrorMessage(null);
    setEditingId(movie.id);
    setRank(String(movie.rank));
    setTitle(movie.title);
    setYear(movie.year ? String(movie.year) : "");
    setDirector(movie.director ?? "");
    setNote(movie.note ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rankNumber = Number(rank);
    if (!title.trim() || !rankNumber || rankNumber <= 0) return;
    setErrorMessage(null);
    setSaving(true);
    const payload = {
      rank: rankNumber,
      title: title.trim(),
      year: year.trim() ? Number(year) : null,
      director: director.trim() || null,
      note: note.trim() || null,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("movies")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      setSaving(false);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de modifier le film : " + error.message);
      } else if (data) {
        setMovies((prev) => prev.map((m) => (m.id === editingId ? data : m)).sort((a, b) => a.rank - b.rank));
        resetForm();
      }
      return;
    }

    const { data, error } = await supabase
      .from("movies")
      .insert({ user_id: userId, ...payload })
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible d'ajouter le film : " + error.message);
    } else if (data) {
      setMovies((prev) => [...prev, data].sort((a, b) => a.rank - b.rank));
      resetForm();
    }
  }

  async function handleToggleWatched(movie: Movie) {
    setErrorMessage(null);
    const nextWatched = !movie.watched;
    const payload = { watched: nextWatched, watched_at: nextWatched ? new Date().toISOString().slice(0, 10) : null };
    const { error } = await supabase.from("movies").update(payload).eq("id", movie.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de mettre à jour ce film : " + error.message);
    } else {
      setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, ...payload } : m)));
    }
  }

  async function handleRate(movie: Movie, newRating: number | null) {
    setErrorMessage(null);
    const { error } = await supabase.from("movies").update({ rating: newRating }).eq("id", movie.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible d'enregistrer la note : " + error.message);
    } else {
      setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, rating: newRating } : m)));
    }
  }

  async function handleDelete(movie: Movie) {
    setErrorMessage(null);
    const { error } = await supabase.from("movies").delete().eq("id", movie.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer ce film : " + error.message);
    } else {
      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
    }
  }

  // Colle une liste (un film par ligne, numérotée ou non) et l'upsert en une
  // fois par rang (on_conflict: "rank") : recoller la liste pour corriger
  // une faute de frappe met à jour title/year sans toucher watched/rating/
  // note déjà renseignés, puisque ces colonnes ne font pas partie du payload
  // envoyé (voir lib/movies.ts et 012_movies.sql).
  async function handleImport() {
    const parsed = parseMovieList(importText);
    if (parsed.length === 0) return;
    // Un même rang collé deux fois dans le même lot ferait échouer l'upsert
    // ("cannot affect row a second time") : on ne garde que la dernière
    // occurrence, cohérent avec l'idée d'une correction.
    const byRank = new Map(parsed.map((m) => [m.rank, m]));
    const rows = Array.from(byRank.values()).map((m) => ({
      user_id: userId,
      rank: m.rank,
      title: m.title,
      year: m.year,
    }));

    setImporting(true);
    setImportSummary(null);
    setErrorMessage(null);
    const { data, error } = await supabase.from("movies").upsert(rows, { onConflict: "rank" }).select();
    setImporting(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible d'importer la liste : " + error.message);
      return;
    }
    if (data) {
      setMovies((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const row of data) byId.set(row.id, row);
        return Array.from(byId.values()).sort((a, b) => a.rank - b.rank);
      });
    }
    setImportSummary(`${rows.length} film${rows.length > 1 ? "s" : ""} importé${rows.length > 1 ? "s" : ""}.`);
    setImportText("");
  }

  const watchedCount = useMemo(() => movies.filter((m) => m.watched).length, [movies]);

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return movies.filter((m) => {
      const matchesWatched =
        watchedFilter === WATCHED_FILTER_ALL ||
        (watchedFilter === WATCHED_FILTER_SEEN && m.watched) ||
        (watchedFilter === WATCHED_FILTER_UNSEEN && !m.watched);
      const matchesQuery =
        !query || m.title.toLowerCase().includes(query) || (m.director ?? "").toLowerCase().includes(query);
      return matchesWatched && matchesQuery;
    });
  }, [movies, searchQuery, watchedFilter]);

  if (loading) {
    return (
      <div className="films-backdrop min-h-screen">
        <p className="p-8 text-ink-soft">Chargement...</p>
      </div>
    );
  }

  const progressPercent = movies.length > 0 ? Math.round((watchedCount / movies.length) * 100) : 0;

  return (
    <div className="films-backdrop min-h-screen">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-8">
        <AppHeader userId={userId} />

        {errorMessage && (
          <p className="rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
            {errorMessage}
          </p>
        )}

        <div className="space-y-1.5 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-ink">🎬 Progression</p>
            <p className="text-ink-soft">
              {watchedCount}/{movies.length} vus
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-blush-deep" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <details
          open={importOpen}
          onToggle={(e) => setImportOpen(e.currentTarget.open)}
          className="rounded-xl border border-sand bg-ivory p-4 shadow-sm"
        >
          <summary className="cursor-pointer select-none text-sm font-medium text-ink">
            📋 Importer la liste (coller le top 100)
          </summary>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-ink-soft">
              Un film par ligne, numéroté ou non (ex. &laquo;&nbsp;1. Le Parrain (1972)&nbsp;&raquo;). Recoller la
              liste plus tard pour corriger un titre ne touche pas aux films déjà marqués vus/notés.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              placeholder={"1. Le Parrain (1972)\n2. Citizen Kane (1941)\n..."}
              className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !importText.trim()}
              className="rounded-md bg-blush-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {importing ? "Import en cours..." : "Importer"}
            </button>
            {importSummary && <p className="text-xs text-ink-soft">{importSummary}</p>}
          </div>
        </details>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-sand bg-ivory p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{editingId ? "Modifier le film" : "Ajouter un film"}</p>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-ink-soft underline hover:text-ink"
              >
                Annuler la modification
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-ink-soft" htmlFor="movie-rank">
                Rang
              </label>
              <input
                id="movie-rank"
                type="number"
                min={1}
                required
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-ink-soft" htmlFor="movie-title">
                Titre
              </label>
              <input
                id="movie-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Le Parrain"
                className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-ink-soft" htmlFor="movie-year">
                Année (optionnel)
              </label>
              <input
                id="movie-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1972"
                className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-ink-soft" htmlFor="movie-director">
                Réalisateur (optionnel)
              </label>
              <input
                id="movie-director"
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-ink-soft" htmlFor="movie-note">
                Note libre (optionnel)
              </label>
              <input
                id="movie-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Un avis, un souvenir..."
                className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blush-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un film..."
            className="min-w-0 flex-1 rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink placeholder:text-ink-soft sm:flex-none sm:w-48"
          />
          <select
            value={watchedFilter}
            onChange={(e) => setWatchedFilter(e.target.value)}
            className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
          >
            <option value={WATCHED_FILTER_ALL}>Tous</option>
            <option value={WATCHED_FILTER_SEEN}>Vus</option>
            <option value={WATCHED_FILTER_UNSEEN}>À voir</option>
          </select>
          <span className="text-ink-soft">
            {filteredMovies.length} film{filteredMovies.length > 1 ? "s" : ""}
          </span>
        </div>

        {filteredMovies.length === 0 ? (
          <p className="rounded-xl border border-sand bg-ivory p-4 text-sm text-ink-soft shadow-sm">
            {movies.length === 0
              ? "Aucun film pour l'instant — importe la liste ou ajoute-en un avec le formulaire ci-dessus."
              : "Aucun film ne correspond à ces filtres."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredMovies.map((movie) => (
              <MovieRow
                key={movie.id}
                movie={movie}
                onToggleWatched={() => handleToggleWatched(movie)}
                onRate={(newRating) => handleRate(movie, newRating)}
                onEdit={() => handleStartEdit(movie)}
                onDelete={() => handleDelete(movie)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
