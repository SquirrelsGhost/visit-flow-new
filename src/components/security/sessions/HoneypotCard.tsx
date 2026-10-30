import { Bug } from "lucide-react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { ageOf } from "../../../lib/security/securityLogic";
import type { Honeypot, Intruder } from "../../../lib/security/securityThreatTypes";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import PartError from "../shared/PartError";
import IntruderRow from "./IntruderRow";

interface HoneypotCardProps {
  honeypot: Honeypot | null;
  onReport: (intruder: Intruder) => void;
  onRetry: () => void;
}

const MINUTE = 60_000;
const MAX = 4;

/** Honeypot-Fallen (v1 HoneypotIntruderPanel): vier Zahlen oben, darunter die neuesten Eindringlinge. */
export default function HoneypotCard({ honeypot, onReport, onRetry }: HoneypotCardProps) {
  const t = useSecurityTexts().honeypot;
  const now = useNow(MINUTE).getTime();
  const tiles = honeypot ? [
    { label: t.hits, value: honeypot.stats.total },
    { label: t.ips, value: honeypot.stats.uniqueIPs },
    { label: t.countries, value: honeypot.stats.uniqueCountries },
    { label: t.canary, value: honeypot.stats.canaryDownloads },
  ] : [];
  return (
    <GlassSection label={t.label} footer={t.footer}>
      {honeypot === null && <PartError onRetry={onRetry} />}
      {honeypot && (
        <div className="grid grid-cols-4 gap-2 px-4 py-3.5">
          {tiles.map((tile) => (
            <div key={tile.label} className="min-w-0 text-center">
              <span className="block text-[20px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-foreground">{tile.value}</span>
              <span className="mt-1 block truncate text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--glass-label)]">{tile.label}</span>
            </div>
          ))}
        </div>
      )}
      {honeypot?.intruders.length === 0 && <GlassRow icon={Bug} tone="green" title={t.empty} />}
      {honeypot?.intruders.slice(0, MAX).map((i) => (
        <IntruderRow key={i.id} intruder={i} age={ageOf(Date.parse(i.timestamp), now)} onReport={onReport} />
      ))}
    </GlassSection>
  );
}
