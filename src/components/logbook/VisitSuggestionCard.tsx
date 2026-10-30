import { MapPinned } from "lucide-react";
import { cn } from "../../lib/cn";
import type { VisitSuggestion } from "../../lib/logbook/logbookVisits";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { GLASS_INSET } from "../glass/glassStyles";
import { SOFT_BUTTON } from "./logbookStyles";

interface VisitSuggestionCardProps {
  suggestion: VisitSuggestion;
  t: LogbookTexts;
  onApply: () => void;
}

/** Vorschlag aus den Kartenbesuchen des Tages: Gebiet und Straßen als Ziel, Zahl der Haushalte als Partner. */
export default function VisitSuggestionCard({ suggestion, t, onApply }: VisitSuggestionCardProps) {
  return (
    <div className={cn(GLASS_INSET, "flex items-center gap-3 px-3.5 py-3")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_16px_-6px] shadow-blue-500/45">
        <MapPinned aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-sky-300">{t.fromVisits}</span>
        <span className="block truncate text-[13.5px] font-semibold text-foreground">{suggestion.to}</span>
        <span className="block text-[12px] text-muted-foreground">{t.fromVisitsText(suggestion.doors, suggestion.streets, suggestion.sales)}</span>
      </span>
      <button type="button" onClick={onApply} className={cn(SOFT_BUTTON, "shrink-0 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-sky-300")}>
        {t.apply}
      </button>
    </div>
  );
}
