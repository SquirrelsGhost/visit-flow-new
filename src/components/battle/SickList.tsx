import { Loader2, X } from "lucide-react";
import type { ReadinessEntry } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { GLASS_FOOTER } from "../glass/glassStyles";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD } from "./battleStyles";
import PersonChip from "./PersonChip";
import SectionTitle from "./SectionTitle";

interface SickListProps {
  sick: ReadinessEntry[];
  canManage: boolean;
  isBusy: (key: string) => boolean;
  onLift: (person: ReadinessEntry) => void;
}

/** Heute krank Gemeldete. Admin und Teamleiter können die Krankmeldung über das × aufheben. */
export default function SickList({ sick, canManage, isBusy, onLift }: SickListProps) {
  if (sick.length === 0) return null;
  return (
    <ArenaSection title={<SectionTitle count={sick.length}>{t.sickTitle}</SectionTitle>}>
      <div className={cn(ARENA_CARD, "flex flex-wrap gap-2 p-3.5")}>
        {sick.map((b) => (
          <PersonChip key={b.userId} name={b.name} tone="amber">
            {canManage && (
              <button
                type="button"
                onClick={() => onLift(b)}
                title={t.liftSick}
                aria-label={`${t.liftSick}: ${b.name}`}
                className="-mr-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-amber-500/20"
              >
                {isBusy(`liftSick:${b.userId}`) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              </button>
            )}
          </PersonChip>
        ))}
      </div>
      <p className={GLASS_FOOTER}>{t.sickBody}</p>
    </ArenaSection>
  );
}
