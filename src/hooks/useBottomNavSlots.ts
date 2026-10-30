import { useCallback, useMemo } from "react";
import { availableNavTargets, type NavTarget } from "../lib/navigation/navTargets";
import { assignSlot, hasOverrides, normalizeOverrides, resolveSlots } from "../lib/navigation/navSlots";
import { useAuth } from "./useAuth";
import { useUserSettings } from "./useUserSettings";
import { useVertical } from "./useVertical";

export interface BottomNavSlots {
  /** Die vier Ziele neben Home, von links nach rechts. */
  slots: NavTarget[];
  /** Alles, was dieser Nutzer in dieser Sparte auf einen Platz legen darf. */
  options: readonly NavTarget[];
  customized: boolean;
  choose: (slot: number, targetId: string) => void;
  reset: () => void;
}

/**
 * Belegung der unteren Leiste. Gespeichert in den Benutzereinstellungen (vf_settings), damit sie mit
 * ihnen in die Cloud wandert, sobald die v2-API die Einstellungen speichert; v1 kennt dafür kein Feld.
 */
export function useBottomNavSlots(): BottomNavSlots {
  const { user } = useAuth();
  const vertical = useVertical();
  const { settings, update } = useUserSettings();
  const overrides = useMemo(() => normalizeOverrides(settings.bottomNavSlots), [settings.bottomNavSlots]);
  const options = useMemo(() => availableNavTargets(user, vertical), [user, vertical]);
  const slots = useMemo(() => resolveSlots(overrides, vertical, options), [overrides, vertical, options]);

  const choose = useCallback(
    (slot: number, targetId: string) => update({ bottomNavSlots: [...assignSlot(slots, slot, targetId, vertical)] }),
    [slots, vertical, update],
  );
  const reset = useCallback(() => update({ bottomNavSlots: undefined }), [update]);

  return { slots, options, customized: hasOverrides(overrides), choose, reset };
}
