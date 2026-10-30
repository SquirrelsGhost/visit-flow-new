import type { Recap } from "../../../lib/battle/battleRecap";
import type { ReadinessEntry, TopEarner } from "../../../lib/battle/battleTypes";
import { battleTexts as t } from "../../../texts/battleTexts";
import RecapEarnerRow from "./RecapEarnerRow";
import RecapPeople from "./RecapPeople";
import RecapPodium from "./RecapPodium";
import RecapResultRow from "./RecapResultRow";
import RecapTally from "./RecapTally";

interface HeroBackProps {
  recap: Recap;
  topEarners: TopEarner[];
  sick: ReadinessEntry[];
}

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50";

/** Rückblick-Seite der Kopfkarte: Bilanz des Tages, Podium der Topverdiener, Ergebnisse und wer fehlte. */
export default function HeroBack({ recap, topEarners, sick }: HeroBackProps) {
  return (
    <div className="pt-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={LABEL}>{t.recapTitle}</p>
          <h2 className="mt-1 truncate text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white">{recap.label}</h2>
        </div>
        <RecapTally battles={recap.battles.length} wins={recap.wins} draws={recap.draws} />
      </div>
      {topEarners.length > 0 && (
        <div className="mt-6">
          <p className={LABEL}>{t.podiumLabel}</p>
          <RecapPodium earners={topEarners.slice(0, 3)} />
          {topEarners.length > 3 && (
            <div className="mt-2 space-y-1.5">
              {topEarners.slice(3).map((e, i) => <RecapEarnerRow key={e.userId} earner={e} index={i} />)}
            </div>
          )}
        </div>
      )}
      <div className="mt-6">
        <p className={LABEL}>{t.resultsLabel}</p>
        {recap.battles.length > 0 ? (
          <div className="mt-2.5 space-y-1.5">
            {recap.battles.map((b, i) => <RecapResultRow key={b.id} battle={b} index={i} />)}
          </div>
        ) : (
          <p className="mt-2.5 rounded-2xl bg-white/[0.05] py-5 text-center text-[13px] text-white/50 ring-1 ring-inset ring-white/10">{t.noCompleted}</p>
        )}
      </div>
      <RecapPeople absent={recap.absent} sick={sick} />
    </div>
  );
}
