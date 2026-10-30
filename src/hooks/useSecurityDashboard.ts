import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { feedback } from "../lib/feedback/feedback";
import * as actions from "../lib/security/securityActions";
import { loadSnapshot } from "../lib/security/securityApi";
import { REFRESH_MS, type SecuritySnapshot } from "../lib/security/securityTypes";
import { useSecurityTexts } from "./useSecurityTexts";

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/**
 * Lage des Security Dashboards: lädt alle Teile, frischt wie v1 alle 30 Sekunden nach (nur wenn die Seite
 * sichtbar ist) und lädt nach jeder Aktion neu, damit Zähler und Sicherheitswert sofort stimmen.
 */
export function useSecurityDashboard() {
  const t = useSecurityTexts();
  const [snapshot, setSnapshot] = useState<SecuritySnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);

  /** Lädt still und setzt Zustand erst nach der Antwort. Liefert true oder die Fehlermeldung. */
  const load = useCallback(() => {
    const id = ++request.current;
    return loadSnapshot()
      .then((next) => {
        if (id !== request.current) return true;
        setSnapshot(next);
        setFailed(false);
        return true;
      })
      .catch((e: unknown) => {
        if (id === request.current) setFailed(true);
        return errorText(e, "");
      });
  }, []);

  /** Neuladen per Knopf: dreht das Symbol und meldet einen Fehler. */
  const reload = useCallback(async () => {
    setRefreshing(true);
    const result = await load();
    setRefreshing(false);
    if (result !== true) toast.error(result || t.loadError);
  }, [load, t.loadError]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  /** Aktion ausführen, Erfolg melden, neu laden. Liefert true bei Erfolg (Sheets schließen dann). */
  const run = useCallback(
    async (action: () => Promise<void>, success: string) => {
      setBusy(true);
      try {
        await action();
        feedback("success");
        toast.success(success);
        await load();
        return true;
      } catch (e) {
        toast.error(errorText(e, t.loadError));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [load, t.loadError],
  );

  return {
    snapshot,
    failed,
    refreshing,
    busy,
    reload,
    unblockIp: (ip: string) => run(() => actions.unblockIp(ip), t.firewall.done(ip)),
    blockIp: (ip: string, reason: string, permanent: boolean) => run(() => actions.blockIp(ip, reason, permanent), t.firewall.blockDone(ip)),
    addWhitelist: (ip: string, comment: string) => run(() => actions.addWhitelist(ip, comment), t.whitelist.added(ip)),
    removeWhitelist: (ip: string) => run(() => actions.removeWhitelist(ip), t.whitelist.removed(ip)),
    unlockLogin: (ip: string) => run(() => actions.unlockLogin(ip), t.login.done(ip)),
    acknowledge: (id: string) => run(() => actions.acknowledgeAlert(id), t.alerts.done),
    clearThreat: (ip: string) => run(() => actions.clearThreat(ip), t.threats.done(ip)),
    reportIntruder: (id: string, ip: string, note: string) => run(() => actions.reportIntruder(id, note), t.honeypot.done(ip)),
    unblockAccount: (id: string, name: string) => run(() => actions.unblockAccount(id), t.accounts.done(name)),
  };
}

export type SecurityState = ReturnType<typeof useSecurityDashboard>;
