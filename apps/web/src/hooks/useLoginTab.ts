import { useCallback, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type LoginTab = "onboarding" | "login" | "register";

/** Reiter aus der Adresse wie in v1: ?tab=…, /onboarding oder ?team=… (Einladungslink). Standard ist "Team buchen". */
function tabFromLocation(pathname: string, search: string): LoginTab | null {
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  if (tab === "onboarding" || pathname === "/onboarding") return "onboarding";
  if (tab === "register" || params.get("team")) return "register";
  if (tab === "login") return "login";
  return null;
}

/** Aktiver Reiter. Ändert sich die Adresse, gewinnt der Reiter aus der Adresse. */
export function useLoginTab() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const urlKey = `${pathname}${search}`;
  const [state, setState] = useState(() => ({ urlKey, tab: tabFromLocation(pathname, search) ?? "onboarding" }));

  if (state.urlKey !== urlKey) {
    setState({ urlKey, tab: tabFromLocation(pathname, search) ?? state.tab });
  }

  const setTab = useCallback((tab: LoginTab) => setState((current) => ({ ...current, tab })), []);
  return [state.tab, setTab] as const;
}
