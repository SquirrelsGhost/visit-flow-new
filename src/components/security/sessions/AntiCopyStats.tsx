import { Eye, Fingerprint, ShieldAlert, ShieldBan } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { AntiCopyReport } from "../../../lib/security/securityThreatTypes";
import GlassCard from "../../glass/GlassCard";
import GlassNumber from "../../glass/GlassNumber";
import GlassStat from "../../glass/GlassStat";

interface AntiCopyStatsProps {
  report: AntiCopyReport;
}

/** Kopf des Reiters: was der Kopierschutz gerade beobachtet (v1 Anti-Copy Kennzahlen Überwacht/Verdächtig/Blockiert/Honeypots). */
export default function AntiCopyStats({ report }: AntiCopyStatsProps) {
  const t = useSecurityTexts().antiCopy;
  const tiles = [
    { label: t.tracked, value: report.stats.tracked, icon: Eye, color: "text-sky-300" },
    { label: t.suspicious, value: report.stats.suspicious, icon: ShieldAlert, color: "text-amber-300" },
    { label: t.blocked, value: report.stats.blocked, icon: ShieldBan, color: "text-rose-300" },
    { label: t.honeypot, value: report.stats.honeypotHits, icon: Fingerprint, color: "text-fuchsia-300" },
  ];
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6 lg:px-7">
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.34),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 right-[-2rem] h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(217,70,239,0.26),transparent)]" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.label}</p>
      <div className="relative mt-4 grid grid-cols-2 gap-x-3 gap-y-5 min-[460px]:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="min-w-0">
            <Icon aria-hidden className={`mb-2 h-4 w-4 ${color}`} />
            <GlassStat label={label} onDeep>
              <GlassNumber value={value} />
            </GlassStat>
          </div>
        ))}
      </div>
      <p className="relative mt-4 text-[12px] leading-snug text-white/50">{t.footer}</p>
    </GlassCard>
  );
}
