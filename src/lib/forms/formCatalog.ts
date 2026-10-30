import type { FormId } from "./formTypes";

/** Formulare in der Reihenfolge der Auswahl (v1 AVAILABLE_FORMS). */
export const FORM_IDS: readonly FormId[] = ["aenderung", "uebernahme"];

/** Formulare, deren Titel oder Beschreibung die Suche enthält (ohne Groß-/Kleinschreibung). */
export function filterForms(query: string, describe: (id: FormId) => { title: string; desc: string }): FormId[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...FORM_IDS];
  return FORM_IDS.filter((id) => {
    const { title, desc } = describe(id);
    return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });
}
