"use client";

import { LESSON_DIFFICULTIES, LESSON_EDITORIAL_STATUSES, isReviewDue } from "@/lib/lessons";
import type { Lesson, LessonProgress } from "@/lib/types";

type LessonCardProps = {
  lesson: Lesson;
  progress: LessonProgress | null;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

// "À découvrir" n'est jamais persisté (voir lib/types.ts) : c'est juste
// l'absence de ligne lesson_progress, donc dérivé ici plutôt que lu.
function statusLabel(progress: LessonProgress | null): { text: string; className: string } {
  if (!progress) return { text: "À découvrir", className: "bg-sand text-ink-soft" };
  if (progress.status === "terminee") {
    if (isReviewDue(progress.next_review_at)) {
      return { text: "À réviser", className: "bg-terracotta-deep text-white" };
    }
    return { text: "Terminée", className: "bg-blush-deep text-white" };
  }
  return { text: "En cours", className: "bg-blush text-ink" };
}

export default function LessonCard({ lesson, progress, onOpen, onEdit, onDelete }: LessonCardProps) {
  const difficultyName = LESSON_DIFFICULTIES.find((d) => d.key === lesson.difficulty)?.name ?? lesson.difficulty;
  const editorialName =
    LESSON_EDITORIAL_STATUSES.find((s) => s.key === lesson.editorial_status)?.name ?? lesson.editorial_status;
  const status = statusLabel(progress);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left font-medium text-ink hover:text-blush-deep">
          {lesson.title}
        </button>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEdit}
            aria-label="Modifier cette leçon"
            title="Modifier"
            className="text-ink-soft hover:text-ink"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            aria-label="Supprimer cette leçon"
            title="Supprimer"
            className="text-ink-soft hover:text-danger-text"
          >
            ✕
          </button>
        </div>
      </div>

      {lesson.summary && <p className="text-sm text-ink-soft">{lesson.summary}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{lesson.domain}</span>
        <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{difficultyName}</span>
        {lesson.estimated_minutes && (
          <span className="text-ink-soft">⏱ {lesson.estimated_minutes} min</span>
        )}
        <span className={`rounded-full px-2 py-0.5 font-medium ${status.className}`}>{status.text}</span>
        {lesson.editorial_status !== "publiee" && (
          <span className="text-ink-soft/70">({editorialName})</span>
        )}
      </div>
    </div>
  );
}
