import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { battleActions } from "../lib/battle/battleActionsApi";
import { defaultPoints, type Vertical } from "../lib/battle/battleCategories";
import type { PointConfig } from "../lib/battle/battleTypes";
import { battleAdminTexts, battleErrorTexts } from "../texts/battleAdminTexts";

/**
 * Battle-Punkte pro Kategorie. Die Werte fließen sofort in die Live-Scores, gespeichert
 * wird erst mit "Speichern" (wie in v1).
 */
export function useBattlePoints(vertical: Vertical, serverPoints: PointConfig | null) {
  const defaults = useMemo(() => defaultPoints(vertical), [vertical]);
  const [config, setConfig] = useState<PointConfig>(defaults);
  const [saved, setSaved] = useState<PointConfig>(defaults);
  const [saving, setSaving] = useState(false);

  // Neuen Server-Stand (oder Bereich) übernehmen; Vergleich über den Inhalt, nicht die Referenz
  const sourceKey = `${vertical}|${JSON.stringify(serverPoints)}`;
  const [seenKey, setSeenKey] = useState(sourceKey);
  if (seenKey !== sourceKey) {
    setSeenKey(sourceKey);
    setConfig(serverPoints ?? defaults);
    setSaved(serverPoints ?? defaults);
  }

  const setPoints = useCallback((category: string, value: number) => {
    setConfig((prev) => ({ ...prev, [category]: Math.min(10, Math.max(0, value)) }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const result = await battleActions.savePoints(config, vertical);
      if (!result.success) return void toast.error(result.message || battleErrorTexts.points);
      const stored = result.data ?? config;
      setConfig(stored);
      setSaved(stored);
      toast.success(battleAdminTexts.pointsSaved);
    } finally {
      setSaving(false);
    }
  }, [config, vertical]);

  const dirty = Object.keys(config).some((k) => config[k] !== saved[k]);
  return { config, defaults, saving, dirty, setPoints, reset: () => setConfig(defaults), save };
}
