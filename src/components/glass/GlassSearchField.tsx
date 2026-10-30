import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { GLASS_FIELD } from "./glassStyles";

interface GlassSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

/** Suchfeld im Glas-Look mit Lupe und Löschen-Knopf. */
export default function GlassSearchField({ value, onChange, placeholder, className }: GlassSearchFieldProps) {
  return (
    <label className={cn("relative block", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/40" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={cn(GLASS_FIELD, "pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden")} />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Suche leeren" className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/[0.06] text-slate-500 hover:text-foreground dark:bg-white/10 dark:text-white/60">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );
}
