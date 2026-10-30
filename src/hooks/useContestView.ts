import { useMemo, useState } from "react";
import { contestsByScope } from "../lib/overview/contestLogic";
import type { Contest, ContestScope } from "../lib/overview/contestTypes";

/** Gewählter Bereich und Blätterstelle im Gewinnspiel-Reiter; fällt sauber zurück, wenn ein Gewinnspiel wegfällt. */
export function useContestView(contests: readonly Contest[]) {
  const groups = useMemo(() => contestsByScope(contests), [contests]);
  const [scope, setScopeState] = useState<ContestScope>("team");
  const [index, setIndex] = useState(0);
  const group = groups.find((g) => g.scope === scope) ?? groups[0];
  const list = group?.contests ?? [];
  const safeIndex = Math.min(index, Math.max(0, list.length - 1));

  const setScope = (next: ContestScope) => {
    setScopeState(next);
    setIndex(0);
  };

  return { groups, scope: group?.scope ?? scope, setScope, list, index: safeIndex, setIndex, contest: list[safeIndex] ?? null };
}
