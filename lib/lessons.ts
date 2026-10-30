export const LESSON_DIFFICULTIES = [
  { key: "decouverte", name: "Découverte" },
  { key: "intermediaire", name: "Intermédiaire" },
  { key: "avance", name: "Avancé" },
] as const;

export type LessonDifficultyKey = (typeof LESSON_DIFFICULTIES)[number]["key"];

export const LESSON_EDITORIAL_STATUSES = [
  { key: "brouillon", name: "Brouillon" },
  { key: "a_verifier", name: "À vérifier" },
  { key: "verifiee", name: "Vérifiée" },
  { key: "publiee", name: "Publiée" },
  { key: "a_importer", name: "Contenu à importer" },
] as const;

export type LessonEditorialStatusKey = (typeof LESSON_EDITORIAL_STATUSES)[number]["key"];

// Suggestions affichées à la saisie (datalist), pas un catalogue fermé :
// l'architecture doit permettre d'ajouter facilement de nouvelles
// disciplines sans toucher au code, `domain` reste un champ texte libre
// côté base (voir 016_lessons.sql).
export const DOMAIN_SUGGESTIONS = [
  "Cosmologie et astronomie",
  "Physique et chimie",
  "Biologie et évolution",
  "Corps humain et neurosciences",
  "Histoire mondiale",
  "Histoire des sciences et des techniques",
  "Philosophie",
  "Psychologie et sciences cognitives",
  "Sociologie et économie",
  "Géographie et géopolitique",
  "Arts, peinture, architecture et musique",
  "Littérature",
  "Cinéma",
  "Mathématiques et logique",
  "Technologies et société",
  "Mythologies et civilisations",
];

// Échelle de répétition espacée volontairement simple (voir le prompt
// d'origine, section E) : un entier d'intervalle en jours par palier,
// avancé d'un cran à chaque révision réussie, remis à 0 en cas d'échec.
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Calcule le prochain palier/date de révision. `success` vient du bouton
// cliqué par l'utilisateur (autoévaluation, voir LessonReader.tsx) — pas
// de correction automatique "intelligente" faute de pipeline IA fiable
// branché sur des réponses ouvertes.
export function nextReviewStage(
  currentStage: number,
  success: boolean
): { stage: number; nextReviewAt: string } {
  const stage = success
    ? Math.min(currentStage + 1, REVIEW_INTERVALS_DAYS.length - 1)
    : 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[stage];
  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  return { stage, nextReviewAt: toIsoDate(next) };
}

export function isReviewDue(nextReviewAt: string | null): boolean {
  if (!nextReviewAt) return false;
  return nextReviewAt <= toIsoDate(new Date());
}

export type LessonBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "callout"; text: string }
  | { type: "list"; items: string[] }
  | { type: "p"; text: string };

// Markdown "maison" minimal plutôt qu'une dépendance (react-markdown...) :
// le besoin réel pour ce premier palier tient en quatre formes — titres de
// section (pour le sommaire), encadrés de définition, listes à puces,
// paragraphes. "## " → section de sommaire (h2), "### " → sous-titre (h3),
// "> " → encadré discret ("définitions importantes" du prompt d'origine),
// "- " → liste (lignes consécutives regroupées), tout le reste → des
// paragraphes séparés par ligne vide.
export function parseLessonContent(content: string): LessonBlock[] {
  const lines = content.split("\n");
  const blocks: LessonBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "p", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  }
  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: listBuffer });
      listBuffer = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "callout", text: line.slice(2).trim() });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.slice(2).trim());
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks;
}

// Sommaire = seulement les blocs h2, dans l'ordre — ce sont aussi les
// ancres sur lesquelles last_section_index pointe (voir LessonReader.tsx).
export function extractTableOfContents(blocks: LessonBlock[]): string[] {
  return blocks.filter((b): b is { type: "h2"; text: string } => b.type === "h2").map((b) => b.text);
}
