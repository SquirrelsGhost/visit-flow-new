import { useCallback, useState } from "react";

/**
 * Welche Äste im Baum offen sind. Bis zum ersten Tipp gilt der Startzustand (er kann sich ändern, während Daten
 * nachladen), danach die eigene Wahl.
 */
export function useOrgOpen(defaults: ReadonlySet<string>, branches: readonly string[]) {
  const [own, setOwn] = useState<ReadonlySet<string> | null>(null);
  const open = own ?? defaults;
  const allOpen = branches.length > 0 && branches.every((id) => open.has(id));

  const toggle = useCallback(
    (id: string) =>
      setOwn((prev) => {
        const next = new Set(prev ?? defaults);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [defaults],
  );
  const toggleAll = () => setOwn(allOpen ? new Set() : new Set(branches));

  return { open, toggle, toggleAll, allOpen };
}
