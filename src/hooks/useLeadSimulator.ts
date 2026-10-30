import { useMemo, useState } from "react";
import { clampLeads, LEAD_LIMITS, leadCommission, type LeadLimits, type LeadResult } from "../lib/simulator/leadCommission";
import type { LeadRole } from "../lib/simulator/simulatorTypes";

export interface LeadSimulator {
  role: LeadRole;
  /** Stufe wechseln setzt die Anzahl auf den Startwert der Stufe */
  setRole: (role: LeadRole) => void;
  count: number;
  setCount: (count: number) => void;
  /** Eingabe beim Verlassen auf den Bereich der Stufe begrenzen */
  commitCount: () => void;
  limits: LeadLimits;
  result: LeadResult;
}

/** Zustand des Lead-Simulators (v1 Reiter "Leads (TrioHeim)"). */
export function useLeadSimulator(initialRole: LeadRole): LeadSimulator {
  const [role, setRoleState] = useState<LeadRole>(initialRole);
  const [count, setCount] = useState(LEAD_LIMITS[initialRole].start);
  const limits = LEAD_LIMITS[role];
  const result = useMemo(() => leadCommission(role, count), [role, count]);
  return {
    role,
    setRole: (next) => {
      setRoleState(next);
      setCount(LEAD_LIMITS[next].start);
    },
    count,
    setCount,
    commitCount: () => setCount((c) => clampLeads(c, limits)),
    limits,
    result,
  };
}
