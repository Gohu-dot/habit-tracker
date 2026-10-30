"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LESSON_DIFFICULTIES,
  extractTableOfContents,
  isReviewDue,
  parseLessonContent,
} from "@/lib/lessons";
import type { Lesson, LessonNote, LessonProgress } from "@/lib/types";

type LessonReaderProps = {
  lesson: Lesson;
  progress: LessonProgress | null;
  note: LessonNote | null;
  onBack: () => void;
  onSectionVisited: (index: number) => void;
  onComplete: () => void;
  onReview: (success: boolean) => void;
  onSaveNote: (content: string) => void;
};

function sectionAnchorId(index: number): string {
  return `lesson-section-${index}`;
}

// Lecteur : sommaire cliquable (ancres sur les h2), reprise à la dernière
// section consultée, validation/révision, note personnelle. Le contenu
// "## / ### / > / -" est parsé par parseLessonContent (lib/lessons.ts),
// pas de dépendance markdown.
export default function LessonReader({
  lesson,
  progress,
  note,
  onBack,
  onSectionVisited,
  onComplete,
  onReview,
  onSaveNote,
}: LessonReaderProps) {
  const blocks = useMemo(() => parseLessonContent(lesson.content), [lesson.content]);
  const toc = useMemo(() => extractTableOfContents(blocks), [blocks]);
  // Index de section (1-based, ancre sectionAnchorId) par bloc h2, calculé
  // sans variable mutée pendant le rendu (voir la boucle de rendu
  // ci-dessous) — un simple compteur local au useMemo plutôt qu'un state,
  // recalculé seulement si `blocks` change.
  const sectionIndexByBlock = useMemo(() => {
    let count = 0;
    return blocks.map((block) => (block.type === "h2" ? ++count : null));
  }, [blocks]);
  const difficultyName =
    LESSON_DIFFICULTIES.find((d) => d.key === lesson.difficulty)?.name ?? lesson.difficulty;

  const [noteDraft, setNoteDraft] = useState(note?.content ?? "");
  const [noteSaved, setNoteSaved] = useState(true);
  const hasScrolledToResume = useRef(false);

  // Reprise automatique à l'ouverture : une seule fois (pas à chaque
  // rendu), et seulement s'il y a vraiment une section à retrouver.
  useEffect(() => {
    if (hasScrolledToResume.current) return;
    hasScrolledToResume.current = true;
    const index = progress?.last_section_index ?? 0;
    if (index > 0) {
      document.getElementById(sectionAnchorId(index))?.scrollIntoView({ block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- volontaire : une seule fois à l'ouverture, pas à chaque changement de `progress`
  }, []);

  function handleTocClick(index: number) {
    onSectionVisited(index);
    document.getElementById(sectionAnchorId(index))?.scrollIntoView({ block: "start" });
  }

  function handleSaveNote() {
    onSaveNote(noteDraft);
    setNoteSaved(true);
  }

  const reviewDue = progress?.status === "terminee" && isReviewDue(progress.next_review_at);

  return (
    // Colonne de lecture volontairement plus étroite que la bibliothèque
    // (mx-auto max-w-2xl) — confort de lecture longue ("priorité à la
    // lecture et à la navigation" du cahier des charges), pas la largeur
    // pleine du conteneur de LessonsPage.tsx.
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={onBack} className="text-sm text-ink-soft hover:text-ink">
        ← Retour à la bibliothèque
      </button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span className="rounded-full bg-sand px-2 py-0.5">{lesson.domain}</span>
          <span className="rounded-full bg-sand px-2 py-0.5">{difficultyName}</span>
          {lesson.estimated_minutes && <span>⏱ {lesson.estimated_minutes} min de lecture</span>}
        </div>
        <h1 className="text-2xl font-semibold text-ink">{lesson.title}</h1>
        {lesson.summary && <p className="text-ink-soft">{lesson.summary}</p>}
      </div>

      {lesson.editorial_status === "a_importer" && (
        <p className="rounded-lg border border-sand bg-blush/20 px-3 py-2 text-sm text-ink">
          📥 Contenu pas encore importé pour cette leçon — modifie-la pour coller le texte complet.
        </p>
      )}

      {progress && progress.last_section_index > 0 && (
        <p className="text-sm text-ink-soft">
          ↩️ Reprise à : <span className="font-medium text-ink">{toc[progress.last_section_index - 1]}</span>
        </p>
      )}

      {toc.length > 0 && (
        <nav className="space-y-1 rounded-xl border border-sand bg-ivory p-4 text-sm shadow-sm">
          <p className="mb-1 font-medium text-ink">Sommaire</p>
          {toc.map((heading, i) => (
            <button
              key={i}
              onClick={() => handleTocClick(i + 1)}
              className="block text-left text-ink-soft hover:text-blush-deep hover:underline"
            >
              {heading}
            </button>
          ))}
        </nav>
      )}

      <div className="space-y-4 text-ink">
        {blocks.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2
                key={i}
                id={sectionAnchorId(sectionIndexByBlock[i] as number)}
                className="pt-2 text-lg font-semibold text-ink"
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "h3") {
            return (
              <h3 key={i} className="text-base font-medium text-ink">
                {block.text}
              </h3>
            );
          }
          if (block.type === "callout") {
            return (
              <p key={i} className="rounded-lg border border-sand bg-blush/15 px-3 py-2 text-sm text-ink">
                {block.text}
              </p>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-sm text-ink">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-sm leading-relaxed text-ink">
              {block.text}
            </p>
          );
        })}
        {blocks.length === 0 && <p className="text-sm text-ink-soft">Cette leçon n&rsquo;a pas encore de contenu.</p>}
      </div>

      <div className="space-y-3 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
        {progress?.status !== "terminee" ? (
          <button
            onClick={onComplete}
            className="rounded-md bg-blush-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            ✓ Marquer comme terminée
          </button>
        ) : reviewDue ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">📅 Révision du jour</p>
            <p className="text-sm text-ink-soft">
              Sans relire : arrives-tu à expliquer les idées principales de cette leçon ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onReview(true)}
                className="rounded-md bg-blush-deep px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Je m&rsquo;en souviens bien
              </button>
              <button
                onClick={() => onReview(false)}
                className="rounded-md border border-sand px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
              >
                À revoir bientôt
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">
            ✓ Terminée{progress?.next_review_at ? ` — prochaine révision le ${progress.next_review_at}` : ""}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-sand bg-ivory p-4 shadow-sm">
        <p className="text-sm font-medium text-ink">📝 Ma note</p>
        <textarea
          value={noteDraft}
          onChange={(e) => {
            setNoteDraft(e.target.value);
            setNoteSaved(false);
          }}
          rows={4}
          placeholder="Une idée à retenir, une question, un lien avec autre chose..."
          className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink"
        />
        <button
          onClick={handleSaveNote}
          disabled={noteSaved}
          className="rounded-md border border-sand px-3 py-1.5 text-sm text-ink-soft hover:text-ink disabled:opacity-50"
        >
          {noteSaved ? "Enregistrée" : "Enregistrer la note"}
        </button>
      </div>
    </div>
  );
}
