// Reiter, Wischen, Nachladen und Sheets brauchen den Browser
"use client";

import { FileClock, MonitorSmartphone, ShieldCheck, ShieldHalf, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useSecurityDashboard } from "../../hooks/useSecurityDashboard";
import { useSecurityTexts } from "../../hooks/useSecurityTexts";
import type { SecurityTab } from "../../lib/security/securityTypes";
import AssistantSlider from "../assistant/AssistantSlider";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassSection from "../glass/GlassSection";
import GlassSegmented from "../glass/GlassSegmented";
import { GLASS_TAB_BAR } from "../glass/glassStyles";
import AuditTab from "./audit/AuditTab";
import FirewallTab from "./firewall/FirewallTab";
import OverviewTab from "./overview/OverviewTab";
import SecuritySkeleton from "./SecuritySkeleton";
import SessionsTab from "./sessions/SessionsTab";
import ConfirmSheet, { type SecurityConfirm } from "./shared/ConfirmSheet";
import PartError from "./shared/PartError";

const TABS: readonly SecurityTab[] = ["overview", "firewall", "sessions", "audit"];
const ICONS: Record<SecurityTab, LucideIcon> = { overview: ShieldCheck, firewall: ShieldHalf, sessions: MonitorSmartphone, audit: FileClock };

/**
 * Security Dashboard für Admins (v1 pages/SecurityDashboard + admin/SecurityDashboard): vier Reiter statt der
 * v1-Dreiteilung. Lage (Sicherheitswert, Alarme, Login-Sperren, gesperrte Konten), Firewall (Blacklist,
 * Whitelist, Sperren), Sitzungen (Kopierschutz, Mehrfach-Logins, Geräte, Honeypot) und Protokoll (Audit-Log).
 */
export interface SecurityDashboardProps { readonly _?: never; }

export default function SecurityDashboard() {
  const t = useSecurityTexts();
  const s = useSecurityDashboard();
  const [active, setActive] = useState<SecurityTab>("overview");
  const [visited, setVisited] = useState<ReadonlySet<SecurityTab>>(() => new Set(["overview"]));
  const [confirm, setConfirm] = useState<SecurityConfirm | null>(null);

  const select = (tab: SecurityTab) => {
    setVisited((seen) => (seen.has(tab) ? seen : new Set(seen).add(tab)));
    setActive(tab);
  };

  const content = (tab: SecurityTab): ReactNode => {
    if (tab === "audit") return <AuditTab onAsk={setConfirm} />;
    if (!s.snapshot) {
      return s.failed ? (
        <GlassBody>
          <GlassSection>
            <PartError onRetry={() => void s.reload()} />
          </GlassSection>
        </GlassBody>
      ) : (
        <SecuritySkeleton />
      );
    }
    if (tab === "firewall") return <FirewallTab state={s} snapshot={s.snapshot} onAsk={setConfirm} />;
    if (tab === "sessions") return <SessionsTab state={s} snapshot={s.snapshot} onAsk={setConfirm} />;
    return <OverviewTab state={s} snapshot={s.snapshot} onAsk={setConfirm} onOpen={select} />;
  };

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className={GLASS_TAB_BAR}>
          <GlassSegmented label={t.tabsLabel} idPrefix="security" segments={TABS.map((id) => ({ id, label: t.tabs[id], icon: ICONS[id] }))} active={active} onChange={select} />
        </div>
        <AssistantSlider
          index={TABS.indexOf(active)}
          onIndexChange={(i) => select(TABS[i] ?? active)}
          panels={TABS.map((tab) => (
            <section key={tab} id={`security-panel-${tab}`} role="tabpanel" aria-labelledby={`security-tab-${tab}`}>
              {visited.has(tab) && content(tab)}
            </section>
          ))}
        />
      </div>
      <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />
    </GlassPage>
  );
}
