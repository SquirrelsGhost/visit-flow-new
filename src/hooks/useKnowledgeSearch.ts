import { useMemo, useState } from "react";
import { countByCategory, filterKnowledge } from "../lib/assistant/knowledgeBase";
import type { CategoryFilter, KnowledgeItem } from "../lib/assistant/knowledgeTypes";

/** Suche, Kategorie-Filter und aufgeklappter Eintrag der Wissensdatenbank (v1 KnowledgeSection). */
export function useKnowledgeSearch(items: readonly KnowledgeItem[]) {
  const [query, setQueryState] = useState("");
  const [filter, setFilterState] = useState<CategoryFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => filterKnowledge(items, query, filter), [items, query, filter]);
  const counts = useMemo(() => countByCategory(items, query), [items, query]);
  const total = query.trim() ? Object.values(counts).reduce((sum, n) => sum + n, 0) : items.length;

  // Wie in v1 klappt ein neuer Filter oder Suchbegriff den offenen Eintrag zu
  const setQuery = (value: string) => {
    setQueryState(value);
    setExpandedId(null);
  };
  const setFilter = (value: CategoryFilter) => {
    setFilterState(value);
    setExpandedId(null);
  };
  const toggle = (id: string) => setExpandedId((open) => (open === id ? null : id));

  return { query, setQuery, filter, setFilter, results, counts, total, expandedId, toggle };
}
