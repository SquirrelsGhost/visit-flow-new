import { licenseTexts } from "../../texts/licenseTexts";
import { GLASS_BODY, GLASS_CARD, GLASS_DEEP } from "../glass/glassStyles";
import { cn } from "../../lib/cn";

const PULSE = "animate-pulse motion-reduce:animate-none";

/** Platzhalter in der Form der Seite, solange die Lizenzen laden. */
export interface LicenseSkeletonProps { readonly _?: never; }

export default function LicenseSkeleton() {
  return (
    <div className={GLASS_BODY} role="status" aria-label={licenseTexts.loading}>
      <div className={cn(GLASS_DEEP, PULSE, "h-[268px]")} />
      <div className="flex justify-between gap-2 px-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("glass-surface h-14 w-14 rounded-full", PULSE)} />
        ))}
      </div>
      <div className={cn(GLASS_CARD, PULSE, "h-[300px]")} />
    </div>
  );
}
