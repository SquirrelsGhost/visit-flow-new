import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface OptionTileProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}

/** Auswahlkachel in einem Sheet (Zeitraum, Format): gewählt mit rotem Rand und leichtem Schein. */
export default function OptionTile({ icon: Icon, title, hint, selected, onSelect }: OptionTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-w-0 flex-1 items-start gap-2.5 rounded-2xl px-3.5 py-3 text-left ring-1 ring-inset transition-[background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
        selected ? "bg-red-500/[0.08] ring-red-500/40 shadow-[0_8px_20px_-12px_rgba(220,38,38,0.6)]" : "bg-[var(--glass-track)]/60 ring-[var(--glass-divider)] hover:bg-[var(--glass-hover)]",
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 h-4 w-4 shrink-0", selected ? "text-red-500" : "text-slate-400 dark:text-white/45")} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold text-foreground">{title}</span>
        <span className="block text-[12px] leading-snug text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
