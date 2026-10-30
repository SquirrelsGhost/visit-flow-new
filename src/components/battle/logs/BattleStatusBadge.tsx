import { battleLogTexts } from "../../../texts/battleAdminTexts";
import { cn } from "../../../lib/cn";

/** Getönte Pille mit Punkt je Status; Grundfarben wie in v1, nur ruhiger. */
const TONES: Record<string, { pill: string; dot: string }> = {
  active: { pill: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300", dot: "bg-blue-500" },
  completed: { pill: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300", dot: "bg-emerald-500" },
  declined: { pill: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300", dot: "bg-red-500" },
  cancelled_sick: { pill: "bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300", dot: "bg-orange-500" },
  expired: { pill: "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-neutral-300", dot: "bg-slate-400" },
  pending: { pill: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300", dot: "bg-amber-500" },
};

interface BattleStatusBadgeProps {
  status: string;
}

/** Status-Marke eines Battles in der Historie; laufende Battles pulsieren sanft (nicht bei reduzierter Bewegung). */
export default function BattleStatusBadge({ status }: BattleStatusBadgeProps) {
  const label = (battleLogTexts as Record<string, unknown>)[`status_${status}`];
  const tone = TONES[status] ?? TONES.expired;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", tone.pill)}>
      <span className="relative flex h-1.5 w-1.5">
        {status === "active" && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:animate-none", tone.dot)} />}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", tone.dot)} />
      </span>
      {typeof label === "string" ? label : status}
    </span>
  );
}
