import type { SecurityState } from "../../../hooks/useSecurityDashboard";
import type { SecuritySnapshot } from "../../../lib/security/securityTypes";
import type { SecurityConfirm } from "./ConfirmSheet";

/** Was jeder Reiter mit Live-Daten bekommt: Zustand mit Aktionen, die geladenen Daten und die Rückfrage. */
export interface SecurityTabProps {
  state: SecurityState;
  snapshot: SecuritySnapshot;
  onAsk: (confirm: SecurityConfirm) => void;
}
