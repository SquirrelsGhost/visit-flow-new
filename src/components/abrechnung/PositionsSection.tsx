// Anzahl sichtbarer Zeilen ist State
"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { familyOf, filterPositions, type PositionFilter } from "../../lib/abrechnung/abrechnungBreakdown";
import { countByStatus } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungCategory, AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD, CARD_TITLE, MUTED } from "./abrechnungStyles";
import PositionFilters from "./PositionFilters";
import PositionRow from "./PositionRow";

interface PositionsSectionProps {
  items: AbrechnungItem[];
  category: AbrechnungCategory;
  totalsOnly: boolean;
  filter: PositionFilter;
  onFilter: (patch: Partial<PositionFilter>) => void;
  onTakeOver: (item: AbrechnungItem) => void;
  onClaim: (item: AbrechnungItem) => void;
}

const PAGE = 12;

/** Alle Positionen des Monats, durchsuch- und filterbar, jede Zeile klappt auf. Ersetzt die v1-Klapplisten. */
export default function PositionsSection({ items, category, totalsOnly, filter, onFilter, onTakeOver, onClaim }: PositionsSectionProps) {
  const [limit, setLimit] = useState(PAGE);
  const familyLabel = filter.family ? (items.map((i) => familyOf(i.product, category)).find((f) => f.key === filter.family)?.label ?? null) : null;
  const scoped = filter.family ? items.filter((i) => familyOf(i.product, category).key === filter.family) : items;
  const hits = filterPositions(items, category, filter);
  const change = (patch: Partial<PositionFilter>) => {
    setLimit(PAGE);
    onFilter(patch);
  };

  return (
    <motion.section variants={riseIn} className={cn(CARD, "pt-5")} aria-labelledby="abr-positions">
      <div className="px-5">
        <h2 id="abr-positions" className={CARD_TITLE}>
          {t.positionsTitle} <span className="font-normal text-slate-400">{items.length}</span>
        </h2>
        {totalsOnly && <p className={MUTED}>{t.pendingClaimHint}</p>}
        <div className="mt-3">
          <PositionFilters filter={filter} counts={countByStatus(scoped)} total={scoped.length} familyLabel={familyLabel} onChange={change} />
        </div>
      </div>
      {hits.length ? (
        <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
          {hits.slice(0, limit).map((item) => (
            <PositionRow key={item._id} item={item} onTakeOver={() => onTakeOver(item)} onClaim={() => onClaim(item)} />
          ))}
        </ul>
      ) : (
        <div className="mt-2 border-t border-slate-100 px-5 py-8 text-center dark:border-white/[0.06]">
          <p className="text-sm text-slate-500 dark:text-neutral-400">{t.noHits}</p>
          <button type="button" onClick={() => change({ status: "all", family: null, query: "" })} className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {t.resetFilter}
          </button>
        </div>
      )}
      {hits.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE * 2)}
          className="w-full border-t border-slate-100 py-3.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-slate-50 dark:border-white/[0.06] dark:text-emerald-400 dark:hover:bg-white/[0.03]"
        >
          {t.showMore(hits.length - limit)}
        </button>
      )}
      {hits.length <= limit && <div className="h-2" />}
    </motion.section>
  );
}
