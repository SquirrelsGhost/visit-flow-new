import { ShieldCheck } from "lucide-react";
import type { LogbookIssue, Trip } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import LogbookIssueRow from "./LogbookIssueRow";

interface LogbookChecksProps {
  t: LogbookTexts;
  issues: readonly LogbookIssue[];
  trips: readonly Trip[];
  locked: boolean;
  onFillGap: (issue: LogbookIssue) => void;
  onOpen: (issue: LogbookIssue) => void;
  onLock: () => void;
}

/** So viele Hinweise zeigt die Karte; der Rest steht als Zähler darunter. */
const SHOWN = 4;

/** Finanzamt-Check des Monats: grün, wenn alles passt, sonst die Hinweise mit direkter Abhilfe. */
export default function LogbookChecks({ t, issues, trips, locked, onFillGap, onOpen, onLock }: LogbookChecksProps) {
  const shown = issues.slice(0, SHOWN);
  const rest = issues.length - shown.length;
  return (
    <GlassSection label={t.checks} footer={t.checksFooter}>
      {issues.length === 0 && <GlassRow icon={ShieldCheck} tone="green" title={t.allGood} subtitle={t.allGoodHint} />}
      {shown.map((issue) => (
        <LogbookIssueRow
          key={`${issue.kind}-${issue.tripId ?? issue.date}`}
          issue={issue}
          trip={trips.find((x) => x.id === issue.tripId)}
          t={t}
          onFillGap={locked ? undefined : onFillGap}
          onOpen={issue.kind === "unlocked" ? onLock : onOpen}
        />
      ))}
      {rest > 0 && <p className="px-4 py-3 text-[12.5px] text-muted-foreground">{t.moreIssues(rest)}</p>}
    </GlassSection>
  );
}
