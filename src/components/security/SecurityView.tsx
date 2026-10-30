// Die Rolle kommt aus dem Browser
"use client";

import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSecurityTexts } from "../../hooks/useSecurityTexts";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import SecurityDashboard from "./SecurityDashboard";

/** Rahmen der Seite: nur mit Capability admin:security ist das Security Dashboard sichtbar (v1 leitete alle anderen auf die Startseite). */
export interface SecurityViewProps { readonly _?: never; }

export default function SecurityView() {
  const { user, can } = useAuth();
  const t = useSecurityTexts();
  if (!user) return null;
  const allowed = can ? can("admin:security") : hasPermission(effectiveUserPermissions(user), "admin:security");
  if (allowed) return <SecurityDashboard />;
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <GlassBody>
          <GlassSection footer={t.noAccess.text}>
            <GlassRow icon={ShieldAlert} tone="gray" title={t.noAccess.title} />
            <GlassRow icon={LayoutDashboard} tone="red" title={t.noAccess.link} href="/daily-view" />
          </GlassSection>
        </GlassBody>
      </div>
    </GlassPage>
  );
}
