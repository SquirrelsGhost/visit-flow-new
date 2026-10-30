import { FileClock, MonitorSmartphone, ShieldHalf } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { SecuritySnapshot, SecurityTab } from "../../../lib/security/securityTypes";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface OverviewLinksProps {
  snapshot: SecuritySnapshot;
  onOpen: (tab: SecurityTab) => void;
}

/** Wege in die anderen Reiter mit der wichtigsten Zahl daneben, damit die Lage nicht in einer Sackgasse endet. */
export default function OverviewLinks({ snapshot, onOpen }: OverviewLinksProps) {
  const t = useSecurityTexts();
  const threats = snapshot.antiCopy?.threats.filter((x) => x.score >= 40).length;
  return (
    <GlassSection label={t.links.label}>
      <GlassRow icon={ShieldHalf} tone="red" title={t.tabs.firewall} subtitle={t.links.firewall} value={snapshot.blacklist ? String(snapshot.blacklist.length) : undefined} onClick={() => onOpen("firewall")} />
      <GlassRow icon={MonitorSmartphone} tone="indigo" title={t.tabs.sessions} subtitle={t.links.sessions} value={threats === undefined ? undefined : String(threats)} onClick={() => onOpen("sessions")} />
      <GlassRow icon={FileClock} tone="gray" title={t.tabs.audit} subtitle={t.links.audit} onClick={() => onOpen("audit")} />
    </GlassSection>
  );
}
