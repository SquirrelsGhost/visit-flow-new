import { useCallback, useEffect, useState } from "react";
import { readPushPermission, requestPushPermission, type PushPermission } from "../lib/settings/pushPermission";

/** Wie oft der Stand nachgesehen wird, falls er in den Browser-Einstellungen geändert wurde (v1: 5 s). */
const POLL_MS = 5000;

/** Browser-Erlaubnis für Benachrichtigungen, bleibt aktuell, auch wenn sie außerhalb der App geändert wird. */
export function usePushPermission(): [PushPermission, () => Promise<PushPermission>] {
  const [permission, setPermission] = useState<PushPermission>("default");

  useEffect(() => {
    const check = () => setPermission(readPushPermission());
    check();
    const timer = window.setInterval(check, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const request = useCallback(async () => {
    const next = await requestPushPermission();
    setPermission(next);
    return next;
  }, []);

  return [permission, request];
}
