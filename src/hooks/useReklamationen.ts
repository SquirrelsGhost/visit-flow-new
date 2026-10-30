import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadReklamationen, resolveReklamationen } from "../lib/abrechnung/abrechnungApi";
import type { AbrechnungCategory, AbrechnungItem } from "../lib/abrechnung/abrechnungTypes";
import { abrechnungTexts as t } from "../texts/abrechnungTexts";

/** Offene Reklamationen aller Monate fürs Reklamationen-Center (v1 ReklamationenDialog). */
export function useReklamationen(category: AbrechnungCategory, open: boolean) {
  const [items, setItems] = useState<AbrechnungItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void loadReklamationen(category).then((list) => {
      if (!active) return;
      setItems(list);
      setSelected([]);
    });
    return () => {
      active = false;
    };
  }, [category, open]);

  const toggle = useCallback((id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), []);

  const resolve = useCallback(async () => {
    if (!selected.length) return;
    setResolving(true);
    try {
      await resolveReklamationen(category, selected);
      toast.success(t.resolved(selected.length));
      setItems((list) => list?.filter((i) => !selected.includes(i._id)) ?? null);
      setSelected([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.saving);
    } finally {
      setResolving(false);
    }
  }, [category, selected]);

  return { items: open ? items : null, selected, toggle, setSelected, resolving, resolve };
}
