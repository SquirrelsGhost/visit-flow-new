import { cn } from "../../lib/cn";

interface SuggestionChipsProps {
  label: string;
  options: readonly string[];
  /** Gerade gewählter Wert; passt er zu einem Vorschlag, leuchtet der. */
  value: string;
  onPick: (value: string) => void;
}

const CHIP = "shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Waagrecht scrollende Vorschläge unter einem Feld (Zwecke, häufige Ziele); Tippen übernimmt den Text. */
export default function SuggestionChips({ label, options, value, onPick }: SuggestionChipsProps) {
  if (options.length === 0) return null;
  return (
    <div role="group" aria-label={label} className="-mx-5 mt-2 flex gap-1.5 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((option) => {
        const on = option === value.trim();
        return (
          <button key={option} type="button" aria-pressed={on} onClick={() => onPick(option)} className={cn(CHIP, on ? "bg-red-500/12 text-red-600 ring-1 ring-inset ring-red-500/25 dark:text-red-300" : "bg-slate-900/[0.05] text-slate-600 hover:text-foreground dark:bg-white/[0.06] dark:text-white/65")}>
            <span className="block max-w-[14rem] truncate">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
