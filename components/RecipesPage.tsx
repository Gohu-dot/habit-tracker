"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  RECIPE_CATEGORIES,
  RECIPE_STATUSES,
  isTikTokUrl,
  nextRecipeStatus,
  type RecipeCategoryKey,
} from "@/lib/recipes";
import type { Recipe } from "@/lib/types";
import AppHeader from "./AppHeader";
import RecipeCard from "./RecipeCard";

type RecipesPageProps = {
  userId: string;
};

const CATEGORY_FILTER_ALL = "toutes";
const STATUS_FILTER_ALL = "tous";

// Partager depuis TikTok/Instagram envoie le lien dans "text" (intent Android
// ACTION_SEND), pas dans "url" : ces apps ne renseignent quasiment jamais ce
// second champ. On l'extrait donc avec une regex plutôt que de compter dessus.
function extractSharedUrl(text: string | null, urlParam: string | null): string {
  if (urlParam) return urlParam;
  if (!text) return "";
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : "";
}

export default function RecipesPage({ userId }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<RecipeCategoryKey>(RECIPE_CATEGORIES[0].key);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>(CATEGORY_FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTER_ALL);

  const [sharedBanner, setSharedBanner] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [caption, setCaption] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionAttempted, setCaptionAttempted] = useState(false);
  const lastFetchedCaptionUrl = useRef<string | null>(null);

  // Légende d'origine de la vidéo, séparée de la note perso pour que celle-ci
  // reste toujours disponible sans être écrasée (voir caption en base).
  // TikTok uniquement : Instagram a fermé son oEmbed public.
  async function fetchCaption(targetUrl: string) {
    lastFetchedCaptionUrl.current = targetUrl;
    setCaptionLoading(true);
    setCaptionAttempted(true);
    try {
      const res = await fetch(`/api/tiktok-caption?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      setCaption(typeof data.caption === "string" ? data.caption : null);
    } catch (err) {
      console.error(err);
      setCaption(null);
    } finally {
      setCaptionLoading(false);
    }
  }

  // Arrivée depuis le menu "Partager" d'Android (voir share_target dans
  // app/manifest.ts) : pré-remplit le formulaire avec le lien partagé, puis
  // nettoie l'URL pour qu'un rechargement de la page ne re-déclenche rien.
  useEffect(() => {
    const sharedUrl = extractSharedUrl(searchParams.get("shared_text"), searchParams.get("shared_url"));
    if (!sharedUrl) return;
    const sharedTitle = searchParams.get("shared_title");
    queueMicrotask(() => {
      setUrl(sharedUrl);
      if (sharedTitle) setTitle(sharedTitle);
      setSharedBanner(true);
      if (isTikTokUrl(sharedUrl)) {
        fetchCaption(sharedUrl);
      }
    });
    router.replace("/recettes");
  }, [searchParams, router]);

  useEffect(() => {
    let ignore = false;

    async function loadRecipes() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });
      if (ignore) return;
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les recettes : " + error.message);
      } else {
        setRecipes(data ?? []);
      }
      setLoading(false);
    }

    loadRecipes();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setErrorMessage(null);
    setSaving(true);
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: title.trim(),
        url: url.trim(),
        category,
        note: note.trim() || null,
        caption,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible d'ajouter la recette : " + error.message);
    } else if (data) {
      setRecipes((prev) => [data, ...prev]);
      setTitle("");
      setUrl("");
      setNote("");
      setSharedBanner(false);
      setCaption(null);
      setCaptionAttempted(false);
      lastFetchedCaptionUrl.current = null;
    }
  }

  async function handleStatusCycle(recipe: Recipe) {
    setErrorMessage(null);
    const next = nextRecipeStatus(recipe.status);
    const { error } = await supabase.from("recipes").update({ status: next }).eq("id", recipe.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de changer le statut : " + error.message);
    } else {
      setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, status: next } : r)));
    }
  }

  async function handleDelete(recipe: Recipe) {
    setErrorMessage(null);
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer la recette : " + error.message);
    } else {
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    }
  }

  const filteredRecipes = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (categoryFilter === CATEGORY_FILTER_ALL || r.category === categoryFilter) &&
          (statusFilter === STATUS_FILTER_ALL || r.status === statusFilter)
      ),
    [recipes, categoryFilter, statusFilter]
  );

  if (loading) {
    return <p className="p-8 text-ink-soft">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
      <AppHeader />

      {errorMessage && (
        <p className="rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
          {errorMessage}
        </p>
      )}

      <form
        onSubmit={handleAdd}
        className="space-y-3 rounded-xl border border-sand bg-ivory p-4 shadow-sm"
      >
        <p className="text-sm font-medium text-ink">Ajouter une recette</p>
        {sharedBanner && (
          <p className="rounded-lg border border-sand bg-blush/20 px-3 py-2 text-sm text-ink">
            🔗 Lien récupéré depuis le partage — vérifie le titre et la catégorie avant d&rsquo;ajouter.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-ink-soft" htmlFor="recipe-title">
              Titre
            </label>
            <input
              id="recipe-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Bowl protéiné au poulet"
              className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ink-soft" htmlFor="recipe-url">
              Lien (TikTok, Instagram...)
            </label>
            <input
              id="recipe-url"
              type="url"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value !== lastFetchedCaptionUrl.current) {
                  setCaption(null);
                  setCaptionAttempted(false);
                }
              }}
              onBlur={() => {
                if (isTikTokUrl(url) && url !== lastFetchedCaptionUrl.current) {
                  fetchCaption(url);
                }
              }}
              placeholder="https://..."
              className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ink-soft" htmlFor="recipe-category">
              Catégorie
            </label>
            <select
              id="recipe-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as RecipeCategoryKey)}
              className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
            >
              {RECIPE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ink-soft" htmlFor="recipe-note">
              Note (optionnel)
            </label>
            <input
              id="recipe-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. remplacer le riz par du quinoa"
              className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        {isTikTokUrl(url) && (captionLoading || captionAttempted) && (
          <div className="rounded-lg border border-sand bg-cream p-3 text-sm">
            <p className="mb-1 font-medium text-ink">📋 Légende TikTok récupérée automatiquement</p>
            {captionLoading ? (
              <p className="text-ink-soft">Récupération en cours...</p>
            ) : caption ? (
              <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-ink-soft">{caption}</p>
            ) : (
              <p className="text-ink-soft">
                Légende introuvable pour ce lien.{" "}
                <button
                  type="button"
                  onClick={() => fetchCaption(url)}
                  className="underline hover:text-ink"
                >
                  Réessayer
                </button>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blush-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
        >
          <option value={CATEGORY_FILTER_ALL}>Toutes les catégories</option>
          {RECIPE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
        >
          <option value={STATUS_FILTER_ALL}>Tous les statuts</option>
          {RECIPE_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="text-ink-soft">
          {filteredRecipes.length} recette{filteredRecipes.length > 1 ? "s" : ""}
        </span>
      </div>

      {filteredRecipes.length === 0 ? (
        <p className="rounded-xl border border-sand bg-ivory p-4 text-sm text-ink-soft shadow-sm">
          {recipes.length === 0
            ? "Aucune recette pour l'instant — ajoute-en une avec le formulaire ci-dessus."
            : "Aucune recette ne correspond à ces filtres."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onCycleStatus={() => handleStatusCycle(recipe)}
              onDelete={() => handleDelete(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
