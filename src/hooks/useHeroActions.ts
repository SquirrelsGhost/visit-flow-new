import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveGoal } from "../lib/simulator/simulatorGoal";
import type { ProvisionGoal } from "../lib/simulator/simulatorTypes";
import { simulatorTexts as t } from "../texts/simulatorTexts";

const SAVED_MS = 3000;

export interface HeroActions {
  goalSaved: boolean;
  copy: (text: string) => void;
  setGoal: (goal: ProvisionGoal) => void;
}

/** Kopieren und Als Ziel setzen; die Zielschaltfläche zeigt drei Sekunden lang "gespeichert" (v1). */
export function useHeroActions(): HeroActions {
  const [goalSaved, setGoalSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback((text: string) => {
    if (!navigator.clipboard) {
      toast.error(t.hero.copyFailed);
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success(t.hero.copied),
      () => toast.error(t.hero.copyFailed),
    );
  }, []);

  const setGoal = useCallback((goal: ProvisionGoal) => {
    saveGoal(goal);
    setGoalSaved(true);
    toast.success(t.hero.goalSaved);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setGoalSaved(false), SAVED_MS);
  }, []);

  return { goalSaved, copy, setGoal };
}
