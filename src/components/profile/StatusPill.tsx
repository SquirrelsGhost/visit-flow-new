import { cn } from "../../lib/cn";
import type { SubscriptionStatus } from "../../lib/profile/profileTypes";
import { profileTexts } from "../../texts/profileTexts";

interface StatusPillProps {
  status: SubscriptionStatus;
  /** Auf der dunklen Lizenzkarte heller. */
  onDark?: boolean;
}

const TONE: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  incomplete: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  canceled: "bg-red-500/10 text-red-600 dark:text-red-400",
  inactive: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

const DARK: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-400/15 text-emerald-300",
  incomplete: "bg-amber-400/15 text-amber-300",
  canceled: "bg-red-400/15 text-red-300",
  inactive: "bg-white/10 text-white/70",
};

/** Status des Abos als kleine Plakette mit Punkt. */
export default function StatusPill({ status, onDark = false }: StatusPillProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", onDark ? DARK[status] : TONE[status])}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {profileTexts.subscription.status[status]}
    </span>
  );
}
