export type AssistantTab = "assistant" | "dashboard" | "tracker";

/** Reihenfolge der Reiter wie in v1: KI, Ich, D2D. */
export const ASSISTANT_TABS: readonly AssistantTab[] = ["assistant", "dashboard", "tracker"];

/** v1 startet auf "Ich" und merkt sich den Reiter im Tab (sessionStorage). */
export const DEFAULT_TAB: AssistantTab = "dashboard";
export const TAB_STORAGE_KEY = "smart_visit_assistant_tab";

export const isAssistantTab = (value: string | null): value is AssistantTab =>
  value === "assistant" || value === "dashboard" || value === "tracker";
