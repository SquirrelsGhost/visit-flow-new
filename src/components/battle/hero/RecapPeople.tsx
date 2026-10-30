import { PauseCircle, Thermometer } from "lucide-react";
import type { ReadinessEntry } from "../../../lib/battle/battleTypes";
import { battleTexts as t } from "../../../texts/battleTexts";

interface RecapPeopleProps {
  absent: ReadinessEntry[];
  sick: ReadinessEntry[];
}

/** Fußzeile des Rückblicks: wer nicht dabei war und wer krank ist, als ruhige Namenslisten. */
export default function RecapPeople({ absent, sick }: RecapPeopleProps) {
  if (absent.length === 0 && sick.length === 0) return null;
  const rows = [
    { key: "absent", icon: PauseCircle, label: t.absentLabel, people: absent },
    { key: "sick", icon: Thermometer, label: t.sickLabel, people: sick },
  ].filter((r) => r.people.length > 0);
  return (
    <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
      {rows.map(({ key, icon: Icon, label, people }) => (
        <p key={key} className="flex items-start gap-2 text-[12.5px] text-white/55">
          <Icon aria-hidden className="mt-px h-4 w-4 shrink-0 text-white/40" />
          <span>
            <span className="font-semibold text-white/75">{label}: </span>
            {people.map((p) => p.name).join(", ")}
          </span>
        </p>
      ))}
    </div>
  );
}
