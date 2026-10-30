import { Loader2 } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { InactiveBerater } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { GLASS_FOOTER } from "../glass/glassStyles";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD } from "./battleStyles";
import PersonChip from "./PersonChip";
import SectionTitle from "./SectionTitle";

interface InactiveListProps {
  inactive: InactiveBerater[];
  vertical: Vertical;
  canManage: boolean;
  isBusy: (key: string) => boolean;
  onLift: (person: InactiveBerater) => void;
}

/** Inaktive und nicht battlefähige Berater. Mit Vertragsmonat kann die Leitung die Inaktivität per Tippen aufheben. */
export default function InactiveList({ inactive, vertical, canManage, isBusy, onLift }: InactiveListProps) {
  if (inactive.length === 0) return null;
  const telco = vertical === "telco";
  return (
    <ArenaSection title={<SectionTitle count={inactive.length}>{t.inactiveTitle}</SectionTitle>}>
      <div className={cn(ARENA_CARD, "flex flex-wrap gap-2 p-3.5")}>
        {inactive.map((b) =>
          b.month !== null && canManage ? (
            <PersonChip key={b.userId} name={b.name} tone="gray" title={t.liftInactive} onClick={() => onLift(b)}>
              {isBusy(`liftInactive:${b.userId}`) && <Loader2 className="h-3 w-3 animate-spin" />}
            </PersonChip>
          ) : (
            <PersonChip key={b.userId} name={b.name} tone="gray">
              {canManage && b.month === null && telco && (
                <span title={t.contractMissingHint} className="rounded-full bg-red-500/12 px-1.5 py-px text-[10.5px] font-semibold text-red-600 dark:text-red-300">
                  {t.contractMissing}
                </span>
              )}
            </PersonChip>
          ),
        )}
      </div>
      <p className={GLASS_FOOTER}>{telco ? t.inactiveBodyTelco : t.inactiveBodyOther}</p>
    </ArenaSection>
  );
}
