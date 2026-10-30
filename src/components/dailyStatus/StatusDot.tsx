import { cn } from "../../lib/cn";
import { STATUS_META, type DailyStatus } from "../../lib/team/dailyStatus";

interface StatusDotProps {
  status: DailyStatus;
  size?: "sm" | "lg";
  /** Ausgegraut (nicht gewählte Kachel). */
  muted?: boolean;
}

const SIZES = { sm: "h-2.5 w-2.5", lg: "h-4 w-4" } as const;

/** Leuchtender Statuspunkt; groß atmet sein Schein leise (ohne Bewegungswunsch steht er still). */
export default function StatusDot({ status, size = "sm", muted = false }: StatusDotProps) {
  const meta = STATUS_META[status];
  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", SIZES[size])}>
      {size === "lg" && !muted && <span className={cn("animate-glass-breathe absolute -inset-2 rounded-full opacity-60 blur-[6px]", meta.dot)} />}
      <span className={cn("relative h-full w-full rounded-full transition-[background-color,box-shadow] duration-300", muted ? "bg-slate-300 dark:bg-white/20" : cn(meta.dot, meta.glow))} />
    </span>
  );
}
