import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { battleActions } from "../lib/battle/battleActionsApi";
import { loadAutoAssignStatus } from "../lib/battle/battleApi";
import type { AutoAssignMode } from "../lib/battle/battleTypes";
import { battleErrorTexts } from "../texts/battleAdminTexts";

/** Täglicher Auto-Zuweisungs-Cronjob (an/aus) und sein Modus, nur für Admin und Teamleiter. */
export function useAutoAssignSettings(enabled: boolean) {
  const [cronOn, setCronOn] = useState(false);
  const [mode, setMode] = useState<AutoAssignMode>("standard");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void loadAutoAssignStatus().then((status) => {
      if (!status) return;
      setCronOn(status.enabled);
      setMode(status.mode);
    });
  }, [enabled]);

  const toggleCron = useCallback(async () => {
    setToggling(true);
    try {
      const result = await battleActions.toggleCron(!cronOn);
      if (result.success) setCronOn(result.data ?? !cronOn);
      else toast.error(result.message || battleErrorTexts.cron);
    } finally {
      setToggling(false);
    }
  }, [cronOn]);

  /** Neuer Modus gilt sofort; schlägt das Speichern fehl, springt er zurück. */
  const changeMode = useCallback(
    async (next: AutoAssignMode) => {
      const previous = mode;
      setMode(next);
      const result = await battleActions.setMode(next);
      if (!result.success) {
        setMode(previous);
        toast.error(result.message || battleErrorTexts.mode);
      }
    },
    [mode],
  );

  return { cronOn, mode, toggling, toggleCron, changeMode };
}
