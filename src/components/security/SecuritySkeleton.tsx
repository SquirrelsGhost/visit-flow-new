import { GLASS_BODY, GLASS_BODY_WIDE, GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";

const PULSE = "animate-pulse motion-reduce:animate-none";

/** Platzhalter, solange die Sicherheitsdaten laden: Kopfkarte und zwei Spalten wie die fertige Lage. */
export interface SecuritySkeletonProps { readonly _?: never; }

export default function SecuritySkeleton() {
  return (
    <div aria-busy className={`${GLASS_BODY} ${GLASS_BODY_WIDE}`}>
      <div className={`${GLASS_DEEP} ${PULSE} h-[260px]`} />
      <div className="space-y-7 lg:grid lg:grid-cols-2 lg:gap-7 lg:space-y-0">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-7">
            <div className={`${GLASS_CARD} ${PULSE} h-[220px]`} />
            <div className={`${GLASS_CARD} ${PULSE} h-[150px]`} />
          </div>
        ))}
      </div>
    </div>
  );
}
