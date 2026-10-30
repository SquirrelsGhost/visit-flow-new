// Needs session context and anti-copy hook to mount global security layers
"use client";

import useAntiCopy from "@/hooks/useAntiCopy";
import { useAuth } from "@/hooks/useAuth";
import LeaderIdentSheet from "./LeaderIdentSheet";
import ScreenWatermark from "./ScreenWatermark";
import SecurityAcceptanceGate from "./SecurityAcceptanceGate";
import SecurityShieldBadge from "./SecurityShieldBadge";
import SuspiciousActivityOverlay from "./SuspiciousActivityOverlay";

export interface VfShieldProps { readonly _?: never; }

export default function VfShield() {
  const { user, isAuthenticated } = useAuth();
  const { locked, lockReason } = useAntiCopy(user?.email);

  if (!isAuthenticated || !user) return null;

  return (
    <>
      <ScreenWatermark userEmail={user.email} userId={user.id} />
      <SecurityShieldBadge visible />
      <SuspiciousActivityOverlay locked={locked} reason={lockReason} />
      <SecurityAcceptanceGate
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
      />
      <LeaderIdentSheet userId={user.id} defaultName={user.name} />
    </>
  );
}
