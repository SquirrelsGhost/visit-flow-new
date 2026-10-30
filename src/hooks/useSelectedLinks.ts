import { useState } from "react";
import type { AssistantContent } from "../lib/assistant/verticalAssistant";
import { readPreference, writePreference } from "../lib/preferences";

/** v1 speicherte die Auswahl in den Einstellungen (dashboardSelectedLinks); hier lokal und je Sparte, bis die Einstellungen portiert sind. */
function readIds({ links, defaultLinkIds, linksKey }: AssistantContent): string[] {
  try {
    const parsed: unknown = JSON.parse(readPreference(linksKey) ?? "null");
    if (Array.isArray(parsed)) {
      const known = parsed.filter((id): id is string => links.some((l) => l.id === id));
      if (known.length > 0) return known;
    }
  } catch {
    // kaputter Wert: Standard nehmen
  }
  return [...defaultLinkIds];
}

/** Welche wichtigen Links sichtbar sind. */
export function useSelectedLinks(content: AssistantContent) {
  const [ids, setIds] = useState<string[]>(() => (typeof window === "undefined" ? [...content.defaultLinkIds] : readIds(content)));
  const save = (next: string[]) => {
    setIds(next);
    writePreference(content.linksKey, JSON.stringify(next));
  };
  return { ids, save };
}
