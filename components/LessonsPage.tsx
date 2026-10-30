"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  DOMAIN_SUGGESTIONS,
  LESSON_DIFFICULTIES,
  LESSON_EDITORIAL_STATUSES,
  isReviewDue,
  nextReviewStage,
  type LessonDifficultyKey,
  type LessonEditorialStatusKey,
} from "@/lib/lessons";
import type { Lesson, LessonNote, LessonProgress } from "@/lib/types";
import AppHeader from "./AppHeader";
import LessonCard from "./LessonCard";
import LessonReader from "./LessonReader";

type LessonsPageProps = {
  userId: string;
};

const DOMAIN_FILTER_ALL = "tous";
const REVIEW_FILTER_ALL = "toutes";
const REVIEW_FILTER_DUE = "a_reviser";

export default function LessonsPage({ userId }: LessonsPageProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressByLesson, setProgressByLesson] = useState<Map<string, LessonProgress>>(new Map());
  const [notesByLesson, setNotesByLesson] = useState<Map<string, LessonNote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState<LessonDifficultyKey>("intermediaire");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [editorialStatus, setEditorialStatus] = useState<LessonEditorialStatusKey>("brouillon");
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState(DOMAIN_FILTER_ALL);
  const [reviewFilter, setReviewFilter] = useState(REVIEW_FILTER_ALL);

  useEffect(() => {
    let ignore = false;

    async function loadAll() {
      const [lessonsRes, progressRes, notesRes] = await Promise.all([
        supabase.from("lessons").select("*").order("created_at", { ascending: true }),
        supabase.from("lesson_progress").select("*").eq("user_id", userId),
        supabase.from("lesson_notes").select("*").eq("user_id", userId),
      ]);
      if (ignore) return;

      if (lessonsRes.error) {
        console.error(lessonsRes.error);
        setErrorMessage("Impossible de charger les leçons : " + lessonsRes.error.message);
      } else {
        setLessons(lessonsRes.data ?? []);
      }
      if (!progressRes.error) {
        setProgressByLesson(new Map((progressRes.data ?? []).map((p) => [p.lesson_id, p])));
      }
      if (!notesRes.error) {
        setNotesByLesson(new Map((notesRes.data ?? []).map((n) => [n.lesson_id, n])));
      }
      setLoading(false);
    }

    loadAll();
    return () => {
      ignore = true;
    };
  }, [userId]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDomain("");
    setSummary("");
    setContent("");
    setDifficulty("intermediaire");
    setEstimatedMinutes("");
    setEditorialStatus("brouillon");
  }

  function handleStartEdit(lesson: Lesson) {
    setErrorMessage(null);
    setFormOpen(true);
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setDomain(lesson.domain);
    setSummary(lesson.summary ?? "");
    setContent(lesson.content);
    setDifficulty(lesson.difficulty);
    setEstimatedMinutes(lesson.estimated_minutes ? String(lesson.estimated_minutes) : "");
    setEditorialStatus(lesson.editorial_status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !domain.trim()) return;
    setErrorMessage(null);
    setSaving(true);
    const payload = {
      title: title.trim(),
      domain: domain.trim(),
      summary: summary.trim() || null,
      content,
      difficulty,
      estimated_minutes: estimatedMinutes.trim() ? Number(estimatedMinutes) : null,
      editorial_status: editorialStatus,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("lessons")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select()
        .single();
      setSaving(false);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de modifier la leçon : " + error.message);
      } else if (data) {
        setLessons((prev) => prev.map((l) => (l.id === editingId ? data : l)));
        resetForm();
        setFormOpen(false);
      }
      return;
    }

    const { data, error } = await supabase
      .from("lessons")
      .insert({ user_id: userId, ...payload })
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible d'ajouter la leçon : " + error.message);
    } else if (data) {
      setLessons((prev) => [...prev, data]);
      resetForm();
      setFormOpen(false);
    }
  }

  async function handleDelete(lesson: Lesson) {
    setErrorMessage(null);
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer la leçon : " + error.message);
    } else {
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      if (selectedLessonId === lesson.id) setSelectedLessonId(null);
    }
  }

  // Centralise les écritures sur lesson_progress (section consultée,
  // validation, révision) : insère la ligne si elle n'existe pas encore
  // (premher contact avec cette leçon), sinon met à jour.
  async function upsertProgress(lessonId: string, payload: Partial<LessonProgress>) {
    const existing = progressByLesson.get(lessonId);
    if (existing) {
      const { data, error } = await supabase
        .from("lesson_progress")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) {
        console.error(error);
        return;
      }
      if (data) setProgressByLesson((prev) => new Map(prev).set(lessonId, data));
    } else {
      const { data, error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: userId, lesson_id: lessonId, ...payload })
        .select()
        .single();
      if (error) {
        console.error(error);
        return;
      }
      if (data) setProgressByLesson((prev) => new Map(prev).set(lessonId, data));
    }
  }

  function handleOpenLesson(lesson: Lesson) {
    setSelectedLessonId(lesson.id);
    if (!progressByLesson.has(lesson.id)) {
      upsertProgress(lesson.id, {});
    }
  }

  function handleSectionVisited(lessonId: string, index: number) {
    upsertProgress(lessonId, { last_section_index: index });
  }

  function handleComplete(lessonId: string) {
    const { stage, nextReviewAt } = nextReviewStage(-1, true);
    upsertProgress(lessonId, {
      status: "terminee",
      completed_at: new Date().toISOString(),
      review_stage: stage,
      next_review_at: nextReviewAt,
    });
  }

  function handleReview(lessonId: string, success: boolean) {
    const current = progressByLesson.get(lessonId);
    const { stage, nextReviewAt } = nextReviewStage(current?.review_stage ?? -1, success);
    upsertProgress(lessonId, { review_stage: stage, next_review_at: nextReviewAt });
  }

  async function handleSaveNote(lessonId: string, noteContent: string) {
    const trimmed = noteContent.trim();
    const existing = notesByLesson.get(lessonId);
    if (!trimmed) {
      if (existing) {
        await supabase.from("lesson_notes").delete().eq("id", existing.id);
        setNotesByLesson((prev) => {
          const next = new Map(prev);
          next.delete(lessonId);
          return next;
        });
      }
      return;
    }
    if (existing) {
      const { data, error } = await supabase
        .from("lesson_notes")
        .update({ content: trimmed, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (!error && data) setNotesByLesson((prev) => new Map(prev).set(lessonId, data));
    } else {
      const { data, error } = await supabase
        .from("lesson_notes")
        .insert({ user_id: userId, lesson_id: lessonId, content: trimmed })
        .select()
        .single();
      if (!error && data) setNotesByLesson((prev) => new Map(prev).set(lessonId, data));
    }
  }

  const domains = useMemo(
    () => Array.from(new Set(lessons.map((l) => l.domain))).sort((a, b) => a.localeCompare(b)),
    [lessons]
  );

  const counts = useMemo(() => {
    let enCours = 0;
    let terminees = 0;
    let aReviser = 0;
    for (const lesson of lessons) {
      const p = progressByLesson.get(lesson.id);
      if (!p) continue;
      if (p.status === "en_cours") enCours++;
      if (p.status === "terminee") {
        terminees++;
        if (isReviewDue(p.next_review_at)) aReviser++;
      }
    }
    return { enCours, terminees, aReviser, total: lessons.length };
  }, [lessons, progressByLesson]);

  const filteredLessons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      const matchesDomain = domainFilter === DOMAIN_FILTER_ALL || l.domain === domainFilter;
      const matchesQuery =
        !query ||
        l.title.toLowerCase().includes(query) ||
        (l.summary ?? "").toLowerCase().includes(query) ||
        l.domain.toLowerCase().includes(query);
      const p = progressByLesson.get(l.id);
      const matchesReview =
        reviewFilter === REVIEW_FILTER_ALL || (p?.status === "terminee" && isReviewDue(p.next_review_at));
      return matchesDomain && matchesQuery && matchesReview;
    });
  }, [lessons, searchQuery, domainFilter, reviewFilter, progressByLesson]);

  const selectedLesson = selectedLessonId ? lessons.find((l) => l.id === selectedLessonId) ?? null : null;

  if (loading) {
    return <p className="p-8 text-ink-soft">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-8">
      <AppHeader userId={userId} />

      {errorMessage && (
        <p className="rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
          {errorMessage}
        </p>
      )}

      {selectedLesson ? (
        <LessonReader
          lesson={selectedLesson}
          progress={progressByLesson.get(selectedLesson.id) ?? null}
          note={notesByLesson.get(selectedLesson.id) ?? null}
          onBack={() => setSelectedLessonId(null)}
          onSectionVisited={(index) => handleSectionVisited(selectedLesson.id, index)}
          onComplete={() => handleComplete(selectedLesson.id)}
          onReview={(success) => handleReview(selectedLesson.id, success)}
          onSaveNote={(noteContent) => handleSaveNote(selectedLesson.id, noteContent)}
        />
      ) : (
        <>
          <div className="space-y-1.5 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
            <p className="font-medium text-ink">📚 Progression</p>
            <p className="text-sm text-ink-soft">
              {counts.terminees}/{counts.total} terminées · {counts.enCours} en cours
              {counts.aReviser > 0 && ` · ${counts.aReviser} à réviser aujourd'hui`}
            </p>
          </div>

          <details
            open={formOpen}
            onToggle={(e) => setFormOpen(e.currentTarget.open)}
            className="rounded-xl border border-sand bg-ivory p-4 shadow-sm"
          >
            <summary className="cursor-pointer select-none text-sm font-medium text-ink">
              {editingId ? "Modifier la leçon" : "+ Ajouter une leçon"}
            </summary>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-ink-soft underline hover:text-ink"
                >
                  Annuler la modification
                </button>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-title">
                    Titre
                  </label>
                  <input
                    id="lesson-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-domain">
                    Domaine
                  </label>
                  <input
                    id="lesson-domain"
                    type="text"
                    list="lesson-domain-suggestions"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Ex. Cosmologie et astronomie"
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  />
                  <datalist id="lesson-domain-suggestions">
                    {DOMAIN_SUGGESTIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-difficulty">
                    Difficulté
                  </label>
                  <select
                    id="lesson-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as LessonDifficultyKey)}
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {LESSON_DIFFICULTIES.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-minutes">
                    Durée estimée (minutes, optionnel)
                  </label>
                  <input
                    id="lesson-minutes"
                    type="number"
                    min={1}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-status">
                    Statut éditorial
                  </label>
                  <select
                    id="lesson-status"
                    value={editorialStatus}
                    onChange={(e) => setEditorialStatus(e.target.value as LessonEditorialStatusKey)}
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {LESSON_EDITORIAL_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-summary">
                    Résumé (optionnel)
                  </label>
                  <input
                    id="lesson-summary"
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-ink-soft" htmlFor="lesson-content">
                    Contenu (## section, ### sous-section, &quot;&gt; &quot; encadré, &quot;- &quot; liste)
                  </label>
                  <textarea
                    id="lesson-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder={"## Introduction\nTexte de section...\n\n> Définition importante\n\n## Développement\n- premier point\n- second point"}
                    className="w-full rounded-md border border-sand bg-cream px-3 py-2 font-mono text-sm text-ink"
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
          </details>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une leçon..."
              className="min-w-0 flex-1 rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink placeholder:text-ink-soft sm:flex-none sm:w-48"
            />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
            >
              <option value={DOMAIN_FILTER_ALL}>Tous les domaines</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
            >
              <option value={REVIEW_FILTER_ALL}>Toutes</option>
              <option value={REVIEW_FILTER_DUE}>À réviser aujourd&rsquo;hui</option>
            </select>
            <span className="text-ink-soft">
              {filteredLessons.length} leçon{filteredLessons.length > 1 ? "s" : ""}
            </span>
          </div>

          {filteredLessons.length === 0 ? (
            <p className="rounded-xl border border-sand bg-ivory p-4 text-sm text-ink-soft shadow-sm">
              {lessons.length === 0
                ? "Aucune leçon pour l'instant — ajoute-en une avec le formulaire ci-dessus."
                : "Aucune leçon ne correspond à ces filtres."}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  progress={progressByLesson.get(lesson.id) ?? null}
                  onOpen={() => handleOpenLesson(lesson)}
                  onEdit={() => handleStartEdit(lesson)}
                  onDelete={() => handleDelete(lesson)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
