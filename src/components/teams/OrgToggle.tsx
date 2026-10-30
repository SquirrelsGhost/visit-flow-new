import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

interface OrgToggleProps {
  open: boolean;
  label: string;
  onToggle: () => void;
}

/** Runder Knopf rechts an einem Ast: klappt die Personen darunter auf und zu. */
export default function OrgToggle({ open, label, onToggle }: OrgToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={label}
      className="glass-surface no-touch-target-fix mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-[background-color] duration-200 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")} />
    </button>
  );
}
