import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { hasDemoSession } from "../lib/auth/demoSession";
import { forgetAllCoachMemories, forgetCoachMemory, loadCoachMemories, type CoachMemory } from "../lib/copilot/coachMemoryApi";
import { coachMemoryTexts as t } from "../texts/coachMemoryTexts";

type Loaded = { ok: boolean; items: CoachMemory[] } | null;
const withItems = (change: (list: CoachMemory[]) => CoachMemory[]) => (l: Loaded) => (l ? { ...l, items: change(l.items) } : l);

export type CoachMemoryStatus = "loading" | "ready" | "offline" | "demo";

/** Lädt die Erinnerungen von Enes, sobald die Ansicht offen ist, und löscht sie auf Wunsch. */
export function useCoachMemory(open: boolean) {
  const demo = hasDemoSession();
  const [loaded, setLoaded] = useState<Loaded>(null);

  useEffect(() => {
    if (!open || demo) return;
    let alive = true;
    void loadCoachMemories().then((list) => {
      if (alive) setLoaded({ ok: list !== null, items: list ?? [] });
    });
    return () => {
      alive = false;
    };
  }, [open, demo]);

  const forget = useCallback(async (memory: CoachMemory) => {
    // Sofort weg, bei Fehler wieder zurück
    setLoaded(withItems((list) => list.filter((m) => m.id !== memory.id)));
    if (await forgetCoachMemory(memory.id)) {
      toast.success(t.forgotten);
      return;
    }
    setLoaded(withItems((list) => [memory, ...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
    toast.error(t.forgetFailed);
  }, []);

  const forgetAll = useCallback(async () => {
    if (!(await forgetAllCoachMemories())) {
      toast.error(t.forgetFailed);
      return false;
    }
    setLoaded(withItems(() => []));
    toast.success(t.forgotAll);
    return true;
  }, []);

  const status: CoachMemoryStatus = demo ? "demo" : !loaded ? "loading" : loaded.ok ? "ready" : "offline";
  return { status, items: loaded?.items ?? [], forget, forgetAll };
}
