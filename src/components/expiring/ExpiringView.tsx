// Die Rolle kommt aus dem Browser
"use client";

import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import { expiringTexts as t } from "../../texts/expiringTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import ExpiringContracts from "./ExpiringContracts";

/** Rahmen der Seite: nur mit Capability admin:expiring sind die Verträge aller Nutzer sichtbar, alle anderen sehen einen kurzen Hinweis (wie v1). */
export interface ExpiringViewProps { readonly _?: never; }

export default function ExpiringView() {
  const { user, can } = useAuth();
  if (!user) return null;
  const allowed = can ? can("admin:expiring") : hasPermission(effectiveUserPermissions(user), "admin:expiring");
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {allowed ? (
          <ExpiringContracts />
        ) : (
          <GlassBody>
            <GlassSection footer={t.noAccess.text}>
              <GlassRow icon={ShieldAlert} tone="gray" title={t.noAccess.title} />
              <GlassRow icon={LayoutDashboard} tone="red" title={t.noAccess.link} href="/daily-view" />
            </GlassSection>
          </GlassBody>
        )}
      </div>
    </GlassPage>
  );
}
