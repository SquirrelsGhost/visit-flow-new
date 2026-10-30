import { useCallback, useState } from "react";
import { DEFAULT_TAB, TAB_STORAGE_KEY, isAssistantTab, type AssistantTab } from "../lib/assistant/assistantTabs";

function readStoredTab(): AssistantTab {
  try {
    const stored = window.sessionStorage.getItem(TAB_STORAGE_KEY);
    return isAssistantTab(stored) ? stored : DEFAULT_TAB;
  } catch {
    return DEFAULT_TAB;
  }
}

/** Aktiver Reiter der Assistent-Seite; bleibt wie in v1 für die Dauer des Browser-Tabs erhalten. */
export function useAssistantTab() {
  // Die Seite rendert erst nach der Anmeldung im Browser, sessionStorage ist dann da
  const [tab, setTabState] = useState<AssistantTab>(() => (typeof window === "undefined" ? DEFAULT_TAB : readStoredTab()));

  const setTab = useCallback((next: AssistantTab) => {
    setTabState(next);
    try {
      window.sessionStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      // ohne sessionStorage gilt der Reiter nur bis zum Neuladen
    }
  }, []);

  return { tab, setTab };
}
