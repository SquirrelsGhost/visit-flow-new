import type { SeatUsage } from "../../lib/licenses/licenseLogic";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassRing from "../glass/GlassRing";

interface HeroGaugeProps {
  usage: SeatUsage;
}

const texts = licenseTexts.hero;

/** Ring mit Prozent und daneben die große Zahl: liest sich bei 5 Plätzen genauso ruhig wie bei 500. */
export default function HeroGauge({ usage }: HeroGaugeProps) {
  const percent = Math.round(usage.share * 100);
  const chip = usage.over > 0 ? { tone: "amber" as const, text: fill(texts.over, { count: usage.over }) } : usage.free > 0 ? { tone: "slate" as const, text: fill(texts.free, { count: usage.free }) } : { tone: "green" as const, text: texts.full };
  return (
    <div className="relative flex items-center gap-5">
      <GlassRing share={usage.share} tone={usage.tone} size={124} label={texts.seatsLabel}>
        <span className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-foreground">
          <GlassNumber value={percent} kind="percent" restClassName="text-[0.6em] opacity-60" />
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--glass-label)]">{texts.used}</span>
      </GlassRing>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="glass-text-shine text-[52px] font-semibold leading-[0.95] tracking-[-0.045em]">
            <GlassNumber value={usage.used} />
          </span>
          <span className="text-[17px] font-medium tracking-[-0.01em] text-muted-foreground tabular-nums">{fill(texts.of, { total: usage.total })}</span>
        </p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">{texts.seatsLabel}</p>
        <div className="mt-3">
          <GlassChip tone={chip.tone}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {chip.text}
          </GlassChip>
        </div>
      </div>
    </div>
  );
}
