import type { TripDraft } from "../../lib/logbook/logbookDraft";
import type { VisitSuggestion } from "../../lib/logbook/logbookVisits";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import LogbookField from "./LogbookField";
import SuggestionChips from "./SuggestionChips";
import VisitSuggestionCard from "./VisitSuggestionCard";

interface TripPlaceFieldsProps {
  draft: TripDraft;
  errors: Partial<Record<"to" | "purpose", string>>;
  frequentTo: readonly string[];
  frequentPurposes: readonly string[];
  suggestion: VisitSuggestion | null;
  t: LogbookTexts;
  onChange: (patch: Partial<TripDraft>) => void;
}

/** Von, Reiseziel, Zweck, Partner und Umweg; bei Dienstfahrten mit Vorschlägen aus Besuchen und früheren Fahrten. */
export default function TripPlaceFields({ draft, errors, frequentTo, frequentPurposes, suggestion, t, onChange }: TripPlaceFieldsProps) {
  const business = draft.kind === "business";
  const purposes = [...new Set([...frequentPurposes, ...t.purposes])].slice(0, 8);
  return (
    <div className="space-y-3.5">
      {business && suggestion && suggestion.to !== draft.to && (
        <VisitSuggestionCard suggestion={suggestion} t={t} onApply={() => onChange({ to: suggestion.to, partner: draft.partner || t.partnerFromVisits(suggestion.doors), purpose: draft.purpose || t.purposes[0]! })} />
      )}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <LogbookField label={t.field.from} value={draft.from} onChange={(from) => onChange({ from })} placeholder={t.placeholder.from} />
        <div className="min-w-0">
          <LogbookField label={t.field.to} value={draft.to} onChange={(to) => onChange({ to })} placeholder={t.placeholder.to} error={errors.to} />
        </div>
      </div>
      {business && <SuggestionChips label={t.frequentTo} options={frequentTo} value={draft.to} onPick={(to) => onChange({ to })} />}
      {business && (
        <>
          <div>
            <LogbookField label={t.field.purpose} value={draft.purpose} onChange={(purpose) => onChange({ purpose })} placeholder={t.placeholder.purpose} error={errors.purpose} />
            <SuggestionChips label={t.field.purpose} options={purposes} value={draft.purpose} onPick={(purpose) => onChange({ purpose })} />
          </div>
          <LogbookField label={t.field.partner} value={draft.partner} onChange={(partner) => onChange({ partner })} placeholder={t.placeholder.partner} />
          <LogbookField label={t.field.detour} value={draft.detour} onChange={(detour) => onChange({ detour })} placeholder={t.placeholder.detour} />
        </>
      )}
      {!business && <p className="px-1 text-[12.5px] leading-snug text-muted-foreground">{draft.kind === "private" ? t.privateHint : t.commuteHint}</p>}
    </div>
  );
}
