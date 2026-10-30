// Die Rolle kommt aus dem Browser
"use client";

import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { effectiveUserPermissions, hasPermission } from "../../lib/permissions";
import { adminTexts } from "../../texts/adminTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import AdminDashboard from "./AdminDashboard";

/** Rahmen des Admin-Dashboards: nur mit Capability admin:dashboard werden Zahlen geladen, alle anderen sehen einen kurzen Hinweis (wie v1). */
export interface AdminDashboardViewProps { readonly _?: never; }

export default function AdminDashboardView() {
  const { user, can } = useAuth();
  if (!user) return null;
  const allowed = can ? can("admin:dashboard") : hasPermission(effectiveUserPermissions(user), "admin:dashboard");
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {allowed ? (
          <AdminDashboard />
        ) : (
          <GlassBody>
            <GlassSection footer={adminTexts.noAccess.text}>
              <GlassRow icon={ShieldAlert} tone="gray" title={adminTexts.noAccess.title} />
              <GlassRow icon={LayoutDashboard} tone="red" title={adminTexts.noAccess.link} href="/daily-view" />
            </GlassSection>
          </GlassBody>
        )}
      </div>
    </GlassPage>
  );
}
