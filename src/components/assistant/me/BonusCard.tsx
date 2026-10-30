import { Trophy } from "lucide-react";
import { useDeck } from "../../../hooks/useDeck";
import { bonusCategoriesFor } from "../../../lib/assistant/bonusTiers";
import type { MeMetrics } from "../../../lib/assistant/meTypes";
import { meTexts as t } from "../../../texts/assistantTexts";
import BonusSlide from "./BonusSlide";
import MeCard from "./MeCard";
import SwipeDeck from "./SwipeDeck";

/** Vodafone-Bonus je Kategorie zum Durchwischen; ohne Vertragsmonat nur ein Hinweis wie in v1. */
export interface BonusCardProps { m: MeMetrics }

export default function BonusCard({ m }: BonusCardProps) {
  const categories = m.contractMonth > 0 ? bonusCategoriesFor(m.contractMonth) : [];
  const deck = useDeck(categories.length);
  const action = m.contractMonth > 0 && (
    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      {deck.index + 1}/{categories.length}
    </span>
  );

  return (
    <MeCard icon={Trophy} iconTone="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" title={t.bonusTitle} action={action} divided>
      {categories.length === 0 ? (
        <p className="p-4 text-center text-xs text-slate-600 dark:text-slate-400">{t.noContractMonth}</p>
      ) : (
        <SwipeDeck count={categories.length} index={deck.index} dir={deck.dir} onStep={deck.step}>
          {(i) => {
            const category = categories[i] ?? categories[0]!;
            return <BonusSlide category={category} count={m.bonusCounts[category.id] ?? 0} />;
          }}
        </SwipeDeck>
      )}
    </MeCard>
  );
}
