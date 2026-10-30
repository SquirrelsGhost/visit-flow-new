// Uhr, Teamdaten und Löschen laufen im Browser
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import { useContestView } from "../../../hooks/useContestView";
import { useNow } from "../../../hooks/useNow";
import { useTeamData } from "../../../hooks/useTeamData";
import { hasDemoSession } from "../../../lib/auth/demoSession";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { deleteContest } from "../../../lib/overview/contestApi";
import { contestClock, contestStandings, ownStandingId } from "../../../lib/overview/contestLogic";
import type { Contest } from "../../../lib/overview/contestTypes";
import { DEMO_TEAM_ID } from "../../../lib/overview/teamDemoData";
import { localDay } from "../../../lib/overview/todayStats";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassBody from "../../glass/GlassBody";
import GlassSplit from "../../glass/GlassSplit";
import ContestDeleteDialog from "./ContestDeleteDialog";
import ContestEmpty from "./ContestEmpty";
import ContestFacts from "./ContestFacts";
import ContestHero from "./ContestHero";
import ContestPager from "./ContestPager";
import ContestScopeBar from "./ContestScopeBar";
import StandingsSection from "./StandingsSection";

interface ContestTabProps {
  contests: readonly Contest[];
  vertical: Vertical;
}

const texts = overviewTexts.contest;
const SECOND = 1000;
const MINUTE = 60_000;

/** Ab dem frühesten Start laden, damit jedes Gewinnspiel seinen ganzen Zeitraum sieht. */
const earliestStart = (contests: readonly Contest[], today: string) =>
  new Date(Math.min(new Date(`${today}T00:00:00`).getTime(), ...contests.map((c) => new Date(c.startDate).getTime())));

/** Reiter "Gewinnspiel" (v1 ContestTab): Bereich wählen, Gewinnspiel ansehen, Live-Rangliste verfolgen. */
export default function ContestTab({ contests, vertical }: ContestTabProps) {
  const { user } = useAuth();
  const view = useContestView(contests);
  const contest = view.contest;
  const now = useNow(SECOND);
  // Teamzahlen und Rangliste nur einmal pro Minute neu rechnen, der Countdown tickt jede Sekunde
  const minute = Math.floor(now.getTime() / MINUTE);
  const today = localDay(now);
  const teamId = typeof user?.teamId === "string" ? user.teamId : hasDemoSession() ? DEMO_TEAM_ID : undefined;
  const start = useMemo(() => earliestStart(contests, today), [contests, today]);
  const end = useMemo(() => new Date(`${today}T12:00:00`), [today]);
  const { data } = useTeamData(teamId, vertical, start, end);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const standings = useMemo(() => (contest ? contestStandings(contest, data.users, data.products, new Date(minute * MINUTE)) : []), [contest, data, minute]);

  if (!contest) return <GlassBody><ContestEmpty title={texts.empty} hint={texts.emptyHint} /></GlassBody>;
  if (contest.goals.length === 0 || contest.prizes.length === 0) return <GlassBody><ContestEmpty title={texts.configuring} hint={texts.configuringHint} /></GlassBody>;

  const clock = contestClock(contest, now);
  const remove = async () => {
    setBusy(true);
    const ok = await deleteContest(contest.id, vertical).catch(() => false);
    setBusy(false);
    setConfirm(false);
    if (ok) toast.success(texts.deleted);
    else toast.error(texts.deleteFailed);
  };

  return (
    <GlassBody layout="wide">
      <GlassSplit
        sticky
        aside={
          <>
            {view.groups.length > 1 && <ContestScopeBar scopes={view.groups.map((g) => g.scope)} active={view.scope} onChange={view.setScope} />}
            {view.list.length > 1 && <ContestPager index={view.index} count={view.list.length} onChange={view.setIndex} />}
            <ContestHero contest={contest} clock={clock} onDelete={contest.createdBy === user?.id ? () => setConfirm(true) : undefined} />
          </>
        }
      >
        <StandingsSection contest={contest} standings={standings} ownId={ownStandingId(contest, user?.id ?? "")} started={clock.started} />
        <ContestFacts contest={contest} clock={clock} participants={standings.length} />
      </GlassSplit>
      <ContestDeleteDialog name={contest.name} open={confirm} busy={busy} onConfirm={remove} onClose={() => setConfirm(false)} />
    </GlassBody>
  );
}
