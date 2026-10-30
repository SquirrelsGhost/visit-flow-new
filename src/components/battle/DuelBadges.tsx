import { Zap } from "lucide-react";
import { battleTexts as t } from "../../texts/battleTexts";

interface DuelBadgesProps {
  mine: boolean;
  auto: boolean;
}

const BADGE = "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]";

/** Kleine Plaketten unter dem Spielstand: eigenes Duell und automatisch zugeteilt. */
export default function DuelBadges({ mine, auto }: DuelBadgesProps) {
  if (!mine && !auto) return null;
  return (
    <span className="flex gap-1">
      {mine && <span className={`${BADGE} bg-red-500/12 text-red-600 dark:text-red-300`}>{t.you}</span>}
      {auto && (
        <span className={`${BADGE} bg-amber-500/12 text-amber-700 dark:text-amber-300`}>
          <Zap aria-hidden className="h-3 w-3" />
          {t.autoShort}
        </span>
      )}
    </span>
  );
}
