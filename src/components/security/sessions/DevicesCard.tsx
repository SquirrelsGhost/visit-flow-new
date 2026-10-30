import { Smartphone } from "lucide-react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { ageOf } from "../../../lib/security/securityLogic";
import type { DeviceBinding } from "../../../lib/security/securityThreatTypes";
import GlassIcon from "../../glass/GlassIcon";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_ROW } from "../../glass/glassStyles";
import { MONO } from "../securityStyles";

interface DevicesCardProps {
  bindings: DeviceBinding[];
}

const MINUTE = 60_000;

/** Geräte je Konto (v1 deviceBindings, in v1 geladen aber nie gezeigt): Fingerabdruck, IP, seit wann. */
export default function DevicesCard({ bindings }: DevicesCardProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  const sorted = [...bindings].sort((a, b) => b.devices.length - a.devices.length);
  return (
    <GlassSection label={t.devices.label} footer={t.devices.footer}>
      {sorted.length === 0 && <GlassRow icon={Smartphone} tone="gray" title={t.devices.empty} />}
      {sorted.map((b) => (
        <div key={b.userId} className={`${GLASS_ROW} items-start`}>
          <GlassIcon icon={Smartphone} tone={b.devices.length > 1 ? "amber" : "blue"} className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-semibold leading-tight text-foreground">{b.email}</span>
              <span className="shrink-0 text-[12px] text-[var(--glass-label)]">{t.devices.count(b.devices.length)}</span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {b.devices.map((d) => (
                <li key={d.fingerprint} className="flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
                  <span className={`${MONO} truncate`}>
                    {d.fingerprint.slice(0, 11)} · {d.ip}
                  </span>
                  <span className="shrink-0">{t.devices.since(t.ago(ageOf(Date.parse(d.firstSeen), now)))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </GlassSection>
  );
}
