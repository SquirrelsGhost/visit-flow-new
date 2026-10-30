import { CalendarClock, Flag, Plus, Ticket, Trophy } from "lucide-react";
import type { Contest, ContestScope } from "../../../lib/overview/contestTypes";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import GlassChip from "../../glass/GlassChip";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface ContestAdminSectionProps {
  contests: readonly Contest[];
  teamId: string;
  now: Date;
  onCreate: () => void;
  onEdit: (contest: Contest) => void;
  /** Ohne: Gewinnspiele des ganzen Teams. Mit: nur die eigenen der Gruppe bzw. der Mentees. */
  own?: { scope: Exclude<ContestScope, "team">; createdBy: string };
}

const texts = manageTexts.contests;
const ENDED_SHOWN = 3;
const dayFormat = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });

type Phase = "running" | "planned" | "ended";
function phaseOf(contest: Contest, now: Date): Phase {
  const end = new Date(contest.endDate);
  if (contest.status === "completed" || contest.status === "cancelled" || end < now) return "ended";
  return new Date(contest.startDate) > now ? "planned" : "running";
}

const ORDER: Record<Phase, number> = { running: 0, planned: 1, ended: 2 };
const CHIP: Record<Phase, "green" | "blue" | "slate"> = { running: "green", planned: "blue", ended: "slate" };

/** Gewinnspiele des Teams verwalten (v1 Bereich "Gewinnspiele"): laufende, geplante und die letzten beendeten. */
export default function ContestAdminSection({ contests, teamId, now, onCreate, onEdit, own }: ContestAdminSectionProps) {
  const list = contests
    .filter((c) => (own ? c.scope === own.scope && c.createdBy === own.createdBy : c.teamId === teamId && (c.scope ?? "team") === "team"))
    .map((contest) => ({ contest, phase: phaseOf(contest, now) }))
    .sort((a, b) => ORDER[a.phase] - ORDER[b.phase] || new Date(b.contest.startDate).getTime() - new Date(a.contest.startDate).getTime());
  const shown = [...list.filter((e) => e.phase !== "ended"), ...list.filter((e) => e.phase === "ended").slice(0, ENDED_SHOWN)];

  return (
    <GlassSection label={texts.label} footer={shown.length === 0 ? texts.empty : undefined}>
      <GlassRow icon={Plus} tone="red" title={texts.create} subtitle={texts.createHint} onClick={onCreate} />
      {shown.map(({ contest, phase }) => (
        <GlassRow
          key={contest.id}
          icon={phase === "planned" ? CalendarClock : contest.contestType === "qualification" ? Ticket : phase === "running" ? Flag : Trophy}
          tone={phase === "running" ? "orange" : phase === "planned" ? "blue" : "gray"}
          title={contest.name}
          subtitle={fill(texts.range, { start: dayFormat.format(new Date(contest.startDate)), end: dayFormat.format(new Date(contest.endDate)) })}
          trailing={<GlassChip tone={CHIP[phase]}>{texts[phase]}</GlassChip>}
          onClick={phase === "ended" ? undefined : () => onEdit(contest)}
        />
      ))}
    </GlassSection>
  );
}
