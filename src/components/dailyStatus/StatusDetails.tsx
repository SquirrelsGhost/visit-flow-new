import { minStart, type StatusDraft } from "../../lib/team/statusPayload";
import { formatShortDay } from "../../lib/team/statusDraft";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import { GLASS_CARD, GLASS_FIELD } from "../glass/glassStyles";

interface StatusDetailsProps {
  draft: StatusDraft;
  onChange: (draft: StatusDraft) => void;
  isLeader: boolean;
  /** Eine Leitung trägt den Status für jemand anderen ein. */
  forOther: boolean;
}

const LABEL = "mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]";

/** Grund und Zeitraum einer Abwesenheit; erscheint nur, wenn nicht "Voll aktiv" gewählt ist. */
export default function StatusDetails({ draft, onChange, isLeader, forOther }: StatusDetailsProps) {
  const min = minStart(draft.status, isLeader);
  const start = formatShortDay(draft.start);
  const applies = draft.start === draft.end ? fill(texts.appliesOne, { start }) : fill(texts.appliesRange, { start, end: formatShortDay(draft.end) });
  return (
    <div className={`${GLASS_CARD} space-y-4 p-4`}>
      <label className="block">
        <span className={LABEL}>{texts.reason}</span>
        <input type="text" value={draft.reason} maxLength={120} onChange={(e) => onChange({ ...draft, reason: e.target.value })} placeholder={texts.reasonPlaceholder} className={GLASS_FIELD} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block min-w-0">
          <span className={LABEL}>{texts.from}</span>
          <input type="date" value={draft.start} min={min} onChange={(e) => e.target.value && onChange({ ...draft, start: e.target.value })} className={GLASS_FIELD} />
        </label>
        <label className="block min-w-0">
          <span className={LABEL}>{texts.to}</span>
          <input type="date" value={draft.end} min={draft.start} onChange={(e) => e.target.value && onChange({ ...draft, end: e.target.value })} className={GLASS_FIELD} />
        </label>
      </div>
      <p className="px-1 text-[12px] leading-snug text-muted-foreground">
        {applies}
        {texts.autoBack}
        {forOther && (draft.status === "sick" || draft.status === "inactive") ? ` ${texts.excusedNote}` : ""}
      </p>
      {min && <p className="px-1 text-[12px] leading-snug text-amber-600 dark:text-amber-300">{texts.deadline}</p>}
    </div>
  );
}
