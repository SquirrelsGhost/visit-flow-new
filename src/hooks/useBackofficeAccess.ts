import { useEffect, useState } from "react";
import { accessFor } from "../lib/backoffice/backofficeAccess";
import { loadAddons } from "../lib/backoffice/backofficeApi";
import type { BackofficeAccess } from "../lib/backoffice/backofficeTypes";
import { hasDemoSession } from "../lib/auth/demoSession";
import { useAuth } from "./useAuth";

/**
 * Zugang zum Team-Backoffice: Admin immer, Teamleiter nur mit aktivem Add-on (v1 /subscriptions/current → addons).
 * null solange das Abo lädt. Admin und Demo brauchen keine Anfrage.
 */
export function useBackofficeAccess(): BackofficeAccess | null {
  const { user } = useAuth();
  const [addons, setAddons] = useState<string[] | null>(null);
  const needsAddons = !!user && user.role !== "admin" && !hasDemoSession();

  useEffect(() => {
    if (!needsAddons) return;
    let alive = true;
    void loadAddons().then((list) => alive && setAddons(list), () => alive && setAddons([]));
    return () => {
      alive = false;
    };
  }, [needsAddons]);

  if (!user) return null;
  if (!needsAddons) return accessFor(user, []);
  return addons === null ? null : accessFor(user, addons);
}
