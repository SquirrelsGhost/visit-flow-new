import { Users } from "lucide-react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { ageOf } from "../../../lib/security/securityLogic";
import type { MultiLoginAlert } from "../../../lib/security/securityThreatTypes";
import GlassIcon from "../../glass/GlassIcon";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_ROW } from "../../glass/glassStyles";
import { MONO } from "../securityStyles";

interface MultiLoginCardProps {
  alerts: MultiLoginAlert[];
}

const MINUTE = 60_000;
/** v1 zeigte die letzten 10 Alarme. */
const MAX = 10;

/** Mehrfach-Logins (v1 Multi-Login Alarme): ein Konto gleichzeitig von mehreren IPs, neueste zuerst. */
export default function MultiLoginCard({ alerts }: MultiLoginCardProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  return (
    <GlassSection label={t.multiLogin.label} footer={t.multiLogin.footer}>
      {alerts.length === 0 && <GlassRow icon={Users} tone="green" title={t.multiLogin.empty} />}
      {alerts.slice(0, MAX).map((a) => (
        <div key={`${a.userId}-${a.timestamp}`} className={`${GLASS_ROW} items-start`}>
          <GlassIcon icon={Users} tone="amber" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-semibold leading-tight text-foreground">{a.email}</span>
              <span className="shrink-0 text-[12px] text-[var(--glass-label)]">{t.ago(ageOf(Date.parse(a.timestamp), now))}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {a.ips.map((ip) => (
                <span key={ip} className={`${MONO} rounded-full bg-amber-500/12 px-2 py-0.5 text-amber-700 dark:text-amber-300`}>
                  {ip}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </GlassSection>
  );
}
