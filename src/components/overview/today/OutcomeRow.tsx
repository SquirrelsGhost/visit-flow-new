import type { LucideIcon } from "lucide-react";
import type { GlassTone } from "../../../lib/glass/glassTones";
import GlassIcon from "../../glass/GlassIcon";
import GlassNumber from "../../glass/GlassNumber";
import GlassProgress from "../../glass/GlassProgress";
import { GLASS_ROW, GLASS_SUBTITLE, GLASS_TITLE } from "../../glass/glassStyles";

interface OutcomeRowProps {
  icon: LucideIcon;
  tone: GlassTone;
  title: string;
  subtitle: string;
  count: number;
  /** Alle Türen von heute, für den Anteilsbalken. */
  total: number;
}

/** Ergebnis an der Tür: Symbol, Name, Anzahl und ein feiner Balken mit dem Anteil an allen Türen. */
export default function OutcomeRow({ icon, tone, title, subtitle, count, total }: OutcomeRowProps) {
  return (
    <div className={GLASS_ROW}>
      <GlassIcon icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className={GLASS_TITLE}>{title}</span>
          <GlassNumber value={count} duration={0.9} className="text-[17px] font-semibold tracking-[-0.01em] text-foreground" />
        </div>
        <GlassProgress share={total > 0 ? count / total : 0} label={title} tone={tone} now={count} max={Math.max(total, 1)} className="mt-2" />
        <span className={GLASS_SUBTITLE}>{subtitle}</span>
      </div>
    </div>
  );
}
