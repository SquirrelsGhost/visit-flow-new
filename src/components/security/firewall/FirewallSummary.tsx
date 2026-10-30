import { Ban } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { BlockedIp, FirewallStats } from "../../../lib/security/securityTypes";
import GlassCard from "../../glass/GlassCard";
import GlassNumber from "../../glass/GlassNumber";
import GlassStat from "../../glass/GlassStat";
import { GLASS_BUTTON } from "../../glass/glassStyles";

interface FirewallSummaryProps {
  stats: FirewallStats | null;
  blacklist: BlockedIp[] | null;
  onBlock: () => void;
}

/** Kopf der Firewall (v1 DDoSProtectionTab Kennzahlen): Sperren gesamt, dauerhaft/befristet, aktive IPs, "IP sperren". */
export default function FirewallSummary({ stats, blacklist, onBlock }: FirewallSummaryProps) {
  const t = useSecurityTexts().firewall;
  const total = blacklist?.length ?? stats?.blockedIPs ?? 0;
  const permanent = blacklist ? blacklist.filter((b) => b.isPermanent).length : (stats?.permanentBlocks ?? 0);
  return (
    <GlassCard variant="deep" sheen className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(244,63,94,0.4),transparent)]" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.summary}</p>
      <div className="relative mt-4">
        <GlassStat label={t.blocked} size="hero" onDeep>
          <GlassNumber value={total} />
        </GlassStat>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.permanent} onDeep>
          <GlassNumber value={permanent} />
        </GlassStat>
        <GlassStat label={t.temporary} onDeep>
          <GlassNumber value={total - permanent} />
        </GlassStat>
        <GlassStat label={t.active} onDeep>
          {stats ? <GlassNumber value={stats.activeIPs} /> : "–"}
        </GlassStat>
      </div>
      <button type="button" onClick={onBlock} className={`${GLASS_BUTTON} relative mt-5`}>
        <Ban aria-hidden className="h-4 w-4" />
        {t.blockAction}
      </button>
    </GlassCard>
  );
}
