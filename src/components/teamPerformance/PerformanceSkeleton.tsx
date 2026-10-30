import { GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";

/** Platzhalter beim ersten Laden: tiefe Kopfkarte und Verlaufskarte in ihrer echten Höhe, leise pulsierend. */
export interface PerformanceSkeletonProps { readonly _?: never; }

export default function PerformanceSkeleton() {
  return (
    <div aria-hidden className="space-y-7">
      <div className={`${GLASS_DEEP} h-[19rem] animate-pulse`} />
      <div className={`${GLASS_CARD} h-[22rem] animate-pulse`} />
    </div>
  );
}
