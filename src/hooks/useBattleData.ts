import { useCallback, useEffect, useRef, useState } from "react";
import { loadSnapshot, loadTeamProducts, loadTeamUsers } from "../lib/battle/battleApi";
import type { Vertical } from "../lib/battle/battleCategories";
import type { ArenaUser, BattleProduct, BattleSnapshot } from "../lib/battle/battleTypes";

const POLL_MS = 60_000;
const DEBOUNCE_MS = 500;

/** Battle-Ereignisse aus dem Socket (v1 WebSocketEventBridge) und Sales-Ereignisse. */
const BATTLE_EVENTS = ["battle-challenge-accepted", "battle-challenge-declined", "battle-score-updated", "battle-cancelled", "battle-completed"];
const PRODUCT_EVENTS = ["product-added", "product-created", "product-deleted", "team-data-changed"];

/**
 * Lädt alles für die Arena und hält es frisch wie in v1: alle 60 s, beim Zurückkehren in den Tab
 * und bei Socket-Ereignissen. Mehrere Anstöße kurz hintereinander laden nur einmal nach.
 */
export function useBattleData(vertical: Vertical, teamId: string | undefined) {
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [users, setUsers] = useState<ArenaUser[]>([]);
  const [products, setProducts] = useState<BattleProduct[]>([]);
  const lastLoad = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(() => {
    lastLoad.current = Date.now();
    return loadSnapshot(vertical).then(setSnapshot);
  }, [vertical]);

  const refreshProducts = useCallback(() => loadTeamProducts(teamId).then(setProducts), [teamId]);

  const debouncedReload = useCallback(() => {
    if (Date.now() - lastLoad.current >= DEBOUNCE_MS) return void reload();
    timer.current ??= setTimeout(() => {
      timer.current = null;
      void reload();
    }, DEBOUNCE_MS);
  }, [reload]);

  useEffect(() => {
    void reload();
    void refreshProducts();
    void loadTeamUsers().then(setUsers);
    const interval = setInterval(debouncedReload, POLL_MS);
    return () => {
      clearInterval(interval);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reload, refreshProducts, debouncedReload]);

  useEffect(() => {
    const onBattle = () => debouncedReload();
    const onProducts = () => void refreshProducts();
    const onWake = () => {
      if (document.visibilityState !== "visible") return;
      debouncedReload();
      void refreshProducts();
    };
    BATTLE_EVENTS.forEach((e) => window.addEventListener(e, onBattle));
    PRODUCT_EVENTS.forEach((e) => window.addEventListener(e, onProducts));
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    return () => {
      BATTLE_EVENTS.forEach((e) => window.removeEventListener(e, onBattle));
      PRODUCT_EVENTS.forEach((e) => window.removeEventListener(e, onProducts));
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [debouncedReload, refreshProducts]);

  return { snapshot, users, products, reload, debouncedReload, refreshProducts };
}
