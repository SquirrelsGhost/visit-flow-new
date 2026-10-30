import { useCallback, useState } from "react";
import { toast } from "sonner";
import { battleActions } from "../lib/battle/battleActionsApi";
import { feedback } from "../lib/feedback/feedback";
import type { ActionResult } from "../lib/battle/battleTypes";
import { battleErrorTexts as err } from "../texts/battleAdminTexts";

type Refresh = () => unknown;

/**
 * Führt Battle-Aktionen aus. `busy` nennt die laufende Aktion (z. B. "respond:c4"),
 * damit genau dieser Knopf den Lade-Kreis zeigt. Fehler kommen als Toast wie in v1.
 */
export function useBattleActions(reload: Refresh, refreshProducts: Refresh) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(key: string, action: () => Promise<ActionResult<T>>, fallback: string, after: Refresh = reload) => {
      setBusy(key);
      try {
        const result = await action();
        if (!result.success) toast.error(result.message || fallback);
        else await after();
        return result;
      } finally {
        setBusy(null);
      }
    },
    [reload],
  );

  return {
    busy,
    isBusy: (key: string) => busy === key,
    challenge: async (id: string) => {
      const result = await run(`challenge:${id}`, () => battleActions.challenge(id), err.challenge);
      if (result.success) feedback("challenge");
      return result;
    },
    respond: async (id: string, action: "accept" | "decline") => {
      const result = await run(`respond:${id}`, () => battleActions.respond(id, action), err.challenge);
      if (result.success && action === "accept") feedback("challenge");
      return result;
    },
    cancel: (id: string) => run(`cancel:${id}`, () => battleActions.cancel(id), err.cancel),
    manualAssign: (a: string, b: string) => run("assign", () => battleActions.manualAssign(a, b), err.assign),
    autoAssign: async () => {
      const result = await run("auto", battleActions.autoAssign, err.auto);
      if (result.success) toast.success(result.message || "Auto-Zuweisung ausgelöst");
    },
    reportSick: (id: string) => run(`sick:${id}`, () => battleActions.reportSick(id), err.sick),
    removeSick: (id: string) => run(`liftSick:${id}`, () => battleActions.removeSick(id), err.lift),
    removeInactive: (id: string) => run(`liftInactive:${id}`, () => battleActions.removeInactive(id), err.lift),
    resetStreaks: () => run("reset", battleActions.resetStreaks, err.reset),
    toggleExclude: (productId: string, excluded: boolean) =>
      run(`exclude:${productId}`, () => battleActions.toggleExclude(productId, excluded), err.exclude, refreshProducts),
  };
}

export type BattleActions = ReturnType<typeof useBattleActions>;
