import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { STATUS_META, type DailyStatus } from "../../lib/team/dailyStatus";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import StatusDot from "./StatusDot";

interface StatusOptionProps {
  status: DailyStatus;
  selected: boolean;
  onSelect: (status: DailyStatus) => void;
}

const TILE =
  "glass-surface flex min-h-[5.75rem] flex-col items-start justify-between gap-3 rounded-[22px] p-4 text-left ring-1 ring-inset ring-transparent transition-[background-color,box-shadow] duration-300 focus:outline-none focus-visible:ring-red-500/40";

/** Eine Statuskachel; gewählt leuchtet sie in ihrer Farbe. */
export default function StatusOption({ status, selected, onSelect }: StatusOptionProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(status)}
      whileTap={{ scale: 0.96 }}
      className={cn(TILE, selected && STATUS_META[status].selected)}
    >
      <StatusDot status={status} muted={!selected} />
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground">{texts.status[status]}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{texts.statusHint[status]}</span>
      </span>
    </motion.button>
  );
}
