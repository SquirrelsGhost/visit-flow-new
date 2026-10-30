import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as api from "../lib/abrechnung/abrechnungApi";
import { isExcelName, monthKey, monthLabel } from "../lib/abrechnung/abrechnungFormat";
import type { AbrechnungCategory, AbrechnungItem, AbrechnungRecord, MonthRef } from "../lib/abrechnung/abrechnungTypes";
import { abrechnungTexts as t } from "../texts/abrechnungTexts";

export type Busy = "upload" | "compare" | "action" | null;

interface Data {
  record: AbrechnungRecord | null;
  open: AbrechnungItem[];
  history: AbrechnungRecord[];
}

const EMPTY: Data = { record: null, open: [], history: [] };
const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/**
 * Daten und Aktionen der Abrechnung eines Monats (v1 AbrechnungPage). Offene Punkte kommen
 * immer aus allen Monaten, der Verlauf aus allen Abrechnungen der Kategorie.
 */
export function useAbrechnung(category: AbrechnungCategory, ref: MonthRef, goTo: (ref: MonthRef) => void) {
  const [data, setData] = useState<Data>(EMPTY);
  const key = `${category}:${monthKey(ref)}`;
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const request = useRef(0);

  const fetchAll = useCallback(
    async (): Promise<Data> => {
      const [record, open, history] = await Promise.all([api.loadMonth(category, ref), api.loadOpen(category), api.loadHistory(category)]);
      return { record, open, history };
    },
    [category, ref],
  );

  /** Lädt still neu, z.B. nach einer Aktion. Eine ältere Antwort überschreibt nie eine neuere. */
  const load = useCallback(() => {
    const id = ++request.current;
    return fetchAll()
      .then((next) => {
        if (id === request.current) setData(next);
      })
      .catch((e: unknown) => {
        if (id === request.current) toast.error(errorText(e, t.loadError));
      })
      .finally(() => {
        if (id === request.current) setLoadedFor(key);
      });
  }, [fetchAll, key]);

  useEffect(() => {
    // Laden beim Monats- oder Bereichswechsel; der Zustand ändert sich erst mit der Antwort
    const id = ++request.current;
    fetchAll()
      .then((next) => id === request.current && setData(next))
      .catch((e: unknown) => id === request.current && toast.error(errorText(e, t.loadError)))
      .finally(() => id === request.current && setLoadedFor(key));
  }, [fetchAll, key]);

  const upload = useCallback(
    async (file: File | null, total?: number) => {
      setBusy("upload");
      try {
        const { record, parsedItemCount } = await api.uploadBilling(category, ref, file, total);
        const moved = record.month !== ref.month || record.year !== ref.year;
        const description = moved ? t.movedTo(monthLabel(record)) : undefined;
        toast.success(isExcelName(file?.name) ? t.parsed(parsedItemCount) : t.totalSaved, { description });
        if (moved) goTo(record);
        else await load();
        return true;
      } catch (e) {
        toast.error(errorText(e, t.uploadError), { duration: 6000 });
        return false;
      } finally {
        setBusy(null);
      }
    },
    [category, ref, goTo, load],
  );

  const recompare = useCallback(async () => {
    if (!data.record) return;
    setBusy("compare");
    try {
      await api.recompare(category, data.record._id);
      toast.success(t.recompared);
      await load();
    } catch (e) {
      toast.error(errorText(e, t.compareError));
    } finally {
      setBusy(null);
    }
  }, [category, data.record, load]);

  const removeRecord = useCallback(async () => {
    if (!data.record) return;
    try {
      await api.deleteRecord(category, data.record._id);
      toast.success(t.recordDeleted);
      await load();
    } catch (e) {
      toast.error(errorText(e, t.deleteError));
    }
  }, [category, data.record, load]);

  const run = useCallback(
    async (items: AbrechnungItem[], action: api.ItemAction, done: string) => {
      if (!items.length) return;
      setBusy("action");
      const id = toast.loading(t.saving);
      const { failed, total } = await api.runOnItems(category, items, data.record?._id, action);
      if (failed) toast.error(t.bulkFailed(failed, total), { id });
      else toast.success(done, { id });
      await load();
      setBusy(null);
    },
    [category, data.record, load],
  );

  return { ...data, loading: loadedFor !== key, busy, reload: load, upload, recompare, removeRecord, run };
}

export type AbrechnungState = ReturnType<typeof useAbrechnung>;
