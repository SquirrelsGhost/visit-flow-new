import { AlertTriangle, Crown } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { seatCounts, seatRows, seatUsage } from "../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../lib/licenses/licenseTypes";
import { riseIn } from "../../lib/motion/presets";
import { cn } from "../../lib/cn";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassChip from "../glass/GlassChip";
import GlassSheen from "../glass/GlassSheen";
import GlassSpotlight from "../glass/GlassSpotlight";
import { GLASS_DEEP } from "../glass/glassStyles";
import HeroFooter from "./HeroFooter";
import HeroGauge from "./HeroGauge";
import HeroTiles from "./HeroTiles";

interface LicenseHeroProps {
  data: TeamLicenses;
}

const texts = licenseTexts.hero;
const STATUS_TONE = { active: "green", incomplete: "amber", canceled: "red", inactive: "slate" } as const;

/**
 * Kopf der Seite: Ring mit Belegung und große Zahl, darunter die Aufteilung der Plätze und eine ruhige
 * Kostenzeile. Hell im Hellmodus, tief im Dunkelmodus; sieht bei 1 wie bei 500 Lizenzen gleich aus.
 */
export default function LicenseHero({ data }: LicenseHeroProps) {
  const usage = seatUsage(data);
  const counts = useMemo(() => seatCounts(seatRows(data)), [data]);
  return (
    <motion.section variants={riseIn} className={cn(GLASS_DEEP, "space-y-5 p-5")}>
      <GlassSpotlight />
      <GlassSheen />
      <div className="relative flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_6px_16px_-6px_rgba(245,158,11,0.7),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-inset ring-white/40">
          <Crown className="h-[18px] w-[18px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--glass-label)]">{texts.eyebrow}</p>
          <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-foreground">{data.teamName}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {data.demo && <GlassChip tone="blue">{licenseTexts.demoBadge}</GlassChip>}
          <GlassChip tone={STATUS_TONE[data.status]}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {licenseTexts.status[data.status]}
          </GlassChip>
        </div>
      </div>
      <HeroGauge usage={usage} />
      {usage.over > 0 && (
        <p role="alert" className="relative flex items-start gap-2 rounded-2xl bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-amber-800 dark:text-amber-200">
          <AlertTriangle aria-hidden className="mt-px h-4 w-4 shrink-0" />
          {texts.overHint}
        </p>
      )}
      <HeroTiles counts={counts} />
      <HeroFooter licenseCount={data.licenseCount} renewsAt={data.renewsAt} />
    </motion.section>
  );
}
