import { useCallback, useMemo, useState } from "react";
import type { AbrechnungItem } from "../lib/abrechnung/abrechnungTypes";

/**
 * Auswahl offener Punkte für Sammelaktionen. Reklamierte sind nicht wählbar (v1);
 * verschwindet eine Position nach dem Neuladen, fällt sie von selbst aus der Auswahl.
 */
export function useSelection(open: readonly AbrechnungItem[]) {
  const [ids, setIds] = useState<string[]>([]);
  const selectable = useMemo(() => open.filter((i) => !i.reklamiert), [open]);
  const selected = useMemo(() => selectable.filter((i) => ids.includes(i._id)), [selectable, ids]);
  const selectedIds = useMemo(() => selected.map((i) => i._id), [selected]);
  const allSelected = selectable.length > 0 && selected.length === selectable.length;

  const toggle = useCallback((id: string) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), []);
  const toggleAll = useCallback(() => setIds(allSelected ? [] : selectable.map((i) => i._id)), [allSelected, selectable]);
  const clear = useCallback(() => setIds([]), []);

  return { selected, selectedIds, selectableCount: selectable.length, allSelected, toggle, toggleAll, clear };
}
