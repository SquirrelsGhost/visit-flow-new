import { GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";

const PULSE = "animate-pulse motion-reduce:animate-none";

/** Platzhalter, solange die Aufträge laden. */
export interface CrmSkeletonProps { readonly _?: never; }

export default function CrmSkeleton() {
  return (
    <div aria-busy className="space-y-7">
      <div className={`${GLASS_DEEP} ${PULSE} h-[300px]`} />
      <div className="flex gap-1.5">
        {[64, 72, 108, 92].map((w) => (
          <div key={w} className={`glass-surface ${PULSE} h-9 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${GLASS_CARD} ${PULSE} h-[78px]`} />
        ))}
      </div>
    </div>
  );
}
