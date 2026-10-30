import { STATUS_META, type ViewStatus } from "../../lib/abrechnung/abrechnungStatus";
import { cn } from "../../lib/cn";

interface StatusChipProps {
  status: ViewStatus;
  className?: string;
}

/** Status einer Position als kleiner Chip mit Punkt. */
export default function StatusChip({ status, className }: StatusChipProps) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", meta.chip, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
