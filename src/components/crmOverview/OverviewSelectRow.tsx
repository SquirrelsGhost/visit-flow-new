import { ChevronsUpDown, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import type { GlassTone } from "../../lib/glass/glassTones";
import GlassIcon from "../glass/GlassIcon";
import GlassRowText from "../glass/GlassRowText";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_VALUE } from "../glass/glassStyles";

export interface SelectOption {
  value: string;
  label: string;
}

interface OverviewSelectRowProps {
  icon: LucideIcon;
  tone: GlassTone;
  title: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

/** Glas-Zeile mit Auswahl: rechts der gewählte Wert, darüber ein unsichtbares natives Feld fürs gewohnte Auswahlrad. */
export default function OverviewSelectRow({ icon, tone, title, value, options, onChange }: OverviewSelectRowProps) {
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <div className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "focus-within:bg-[var(--glass-hover)]")}>
      <GlassIcon icon={icon} tone={tone} />
      <GlassRowText title={title} />
      <span className={cn(GLASS_VALUE, "flex max-w-[55%] items-center gap-1")}>
        <span className="truncate">{current}</span>
        <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/30" />
      </span>
      <select aria-label={title} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
