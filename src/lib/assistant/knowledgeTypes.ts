/** Kategorien der Wissensdatenbank wie in v1 (AITab/types). */
export type KnowledgeCategory = "einwand" | "faq" | "verkauf" | "technik";

/** Filter über der Liste: eine Kategorie oder alle. */
export type CategoryFilter = "all" | KnowledgeCategory;

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  tags: readonly string[];
}
