import { KNOWLEDGE_EINWAND } from "./knowledgeEinwand";
import { KNOWLEDGE_FAQ } from "./knowledgeFaq";
import type { CategoryFilter, KnowledgeCategory, KnowledgeItem } from "./knowledgeTypes";
import { KNOWLEDGE_TECHNIK } from "./knowledgeTechnik";
import { KNOWLEDGE_VERKAUF } from "./knowledgeVerkauf";

/** Alle Einträge in der Reihenfolge aus v1 (allKnowledgeItems). */
export const KNOWLEDGE_ITEMS: readonly KnowledgeItem[] = [
  ...KNOWLEDGE_EINWAND,
  ...KNOWLEDGE_FAQ,
  ...KNOWLEDGE_VERKAUF,
  ...KNOWLEDGE_TECHNIK,
];

export const KNOWLEDGE_CATEGORIES: readonly KnowledgeCategory[] = ["einwand", "faq", "verkauf", "technik"];

const STEPS_MARKER = "RICHTIGE VORGEHENSWEISE";

/** Sucht wie v1 in Titel, Text und Schlagworten, ohne Groß/klein und ohne Leerzeichen am Rand. */
export function matchesQuery(item: KnowledgeItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.title.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q) ||
    item.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function filterKnowledge(items: readonly KnowledgeItem[], query: string, filter: CategoryFilter): KnowledgeItem[] {
  return items.filter((item) => (filter === "all" || item.category === filter) && matchesQuery(item, query));
}

/** Treffer je Kategorie für die Zähler an den Filtern. */
export function countByCategory(items: readonly KnowledgeItem[], query: string): Record<KnowledgeCategory, number> {
  const counts: Record<KnowledgeCategory, number> = { einwand: 0, faq: 0, verkauf: 0, technik: 0 };
  for (const item of items) if (matchesQuery(item, query)) counts[item.category] += 1;
  return counts;
}

/**
 * Trennt den Abschnitt "RICHTIGE VORGEHENSWEISE" ab, damit er als eigener Kasten erscheint (v1 parseContent).
 * Anders als v1 bleibt vom Häkchen davor kein einzelnes "✅" als Einleitung übrig.
 */
export function splitSteps(content: string): { intro: string | null; steps: string | null } {
  const index = content.indexOf(STEPS_MARKER);
  if (index === -1) return { intro: content, steps: null };
  const intro = content.slice(0, index).replace(/✅\s*$/u, "").trim();
  const steps = content.slice(index + STEPS_MARKER.length).replace(/^[:\s]+/, "").trim();
  return { intro: intro || null, steps };
}
