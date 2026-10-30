import { MonitorSmartphone, UserRound } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { UserSession } from "../../../lib/security/securityThreatTypes";
import GlassChip from "../../glass/GlassChip";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { MONO } from "../securityStyles";

interface SessionsCardProps {
  sessions: UserSession[];
}

/** Gerade angemeldete Konten mit ihren IPs (v1 Aktive Sessions); mehrere IPs gleichzeitig = Mehrfach-Login. */
export default function SessionsCard({ sessions }: SessionsCardProps) {
  const t = useSecurityTexts().sessions;
  const sorted = [...sessions].sort((a, b) => b.ips.length - a.ips.length || a.email.localeCompare(b.email));
  return (
    <GlassSection label={`${t.label} · ${sessions.length}`} footer={t.footer}>
      {sorted.length === 0 && <GlassRow icon={MonitorSmartphone} tone="gray" title={t.empty} />}
      {sorted.map((s) => (
        <GlassRow
          key={s.userId}
          icon={UserRound}
          tone={s.ips.length > 1 ? "amber" : "indigo"}
          title={s.email}
          subtitle={s.ips.slice(0, 2).join(", ") + (s.ips.length > 2 ? ` +${s.ips.length - 2}` : "")}
          trailing={s.ips.length > 1 ? <GlassChip tone="amber">{t.multi}</GlassChip> : <span className={`${MONO} text-muted-foreground`}>{t.ips(s.ips.length)}</span>}
        />
      ))}
    </GlassSection>
  );
}
