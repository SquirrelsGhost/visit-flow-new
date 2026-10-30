import { apiRequest } from "../apiClient";

export const COACH_MEMORY_KINDS = ["preference", "fact", "win", "weakspot"] as const;
export type CoachMemoryKind = (typeof COACH_MEMORY_KINDS)[number];

/** Eine Erinnerung von Enes, wie GET /api/copilot/memory sie liefert (v2-API). */
export interface CoachMemory {
  id: string;
  kind: CoachMemoryKind;
  content: string;
  /** "user": hat der Nutzer gesagt, "enes": hat Enes aus dem Gespräch gemerkt. */
  source: "user" | "enes";
  createdAt: string;
}

/** Alle Erinnerungen, neueste zuerst; null wenn der Server nicht antwortet. */
export async function loadCoachMemories(): Promise<CoachMemory[] | null> {
  const res = await apiRequest<CoachMemory[]>("/copilot/memory");
  return res.success && Array.isArray(res.data) ? res.data : null;
}

export async function forgetCoachMemory(id: string): Promise<boolean> {
  const res = await apiRequest<{ deleted: true }>(`/copilot/memory/${encodeURIComponent(id)}`, { method: "DELETE" });
  return res.success;
}

/** Gedächtnis und Gesprächsprotokoll löschen ("Alles vergessen"). */
export async function forgetAllCoachMemories(): Promise<boolean> {
  const res = await apiRequest<{ memories: number; conversations: number }>("/copilot/memory", { method: "DELETE" });
  return res.success;
}
