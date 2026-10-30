import { battleTexts as t } from "../../texts/battleTexts";
import { GLASS_BODY, GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";

const BAR = "animate-pulse rounded-full bg-[var(--glass-track)] motion-reduce:animate-none";

/** Platzhalter beim ersten Laden in Form der echten Seite: tiefe Kopfkarte, Überschrift, Duell-Karten. */
export interface BattleArenaSkeletonProps { readonly _?: never; }

export default function BattleArenaSkeleton() {
  return (
    <div aria-busy="true" aria-label={t.loading} className={GLASS_BODY}>
      <div className={`${GLASS_DEEP} h-[330px] animate-pulse motion-reduce:animate-none`} />
      <div className="space-y-2.5">
        <div className={`${BAR} h-3 w-28`} />
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${GLASS_CARD} h-[132px] animate-pulse motion-reduce:animate-none`} style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
