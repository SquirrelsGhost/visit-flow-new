// Die Rolle kommt aus dem Browser
"use client";

import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import CrmOverview from "./CrmOverview";

/** Rahmen der CRM-Übersicht: nur mit Capability admin:crm werden Verkäufe aller Nutzer geladen, alle anderen sehen einen kurzen Hinweis (wie v1). */
export interface CrmOverviewViewProps { readonly _?: never; }

export default function CrmOverviewView() {
  const { user, can } = useAuth();
  if (!user) return null;
  const allowed = can ? can("admin:crm") : hasPermission(effectiveUserPermissions(user), "admin:crm");
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {allowed ? (
          <CrmOverview />
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
