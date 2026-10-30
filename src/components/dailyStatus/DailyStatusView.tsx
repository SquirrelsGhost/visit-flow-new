// Status, Teamliste und Demo-Sitzung kommen aus dem Browser
"use client";

import { useMemo, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useDailyStatus } from "../../hooks/useDailyStatus";
import { visibleMembers } from "../../lib/team/attendance";
import { attendancePatch } from "../../lib/team/statusPayload";
import type { Attendance, TeamMember } from "../../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassSplit from "../glass/GlassSplit";
import AttendanceSection from "./AttendanceSection";
import DailyStatusLinks from "./DailyStatusLinks";
import StatusForm from "./StatusForm";
import StatusHero from "./StatusHero";

/**
 * Tagesstatus (/daily-status, v1 DailyStatusDialog im Profilmenü): oben der eigene Status, darunter die Wahl
 * mit Zeitraum, für Leitungen die Anwesenheit des Teams. Ein Tipp auf eine Person bearbeitet deren Status oben.
 */
export interface DailyStatusViewProps { readonly _?: never; }

export default function DailyStatusView() {
  const { user } = useAuth();
  const state = useDailyStatus();
  const scroller = useRef<HTMLDivElement>(null);
  const members = state?.team.members;
  const visible = useMemo(() => (user && members ? visibleMembers(user, members) : members), [user, members]);
  if (!state || !user) return null;

  const mark = (member: TeamMember, next: Attendance | null, extra?: string) =>
    void state.team.apply(member.id, attendancePatch(next, extra), member.id === user.id, texts.attendanceSaved);

  const editStatus = (member: TeamMember) => {
    state.editMember(member.id === user.id ? null : member.id);
    scroller.current?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  return (
    <GlassPage>
      <div ref={scroller} className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <GlassBody layout="wide">
          <GlassSplit
            sticky
            aside={
              <>
                <StatusHero member={state.target} isSelf={state.isSelf} demo={state.demo} />
                <StatusForm
                  key={state.target.id}
                  draft={state.draft}
                  onChange={state.setDraft}
                  isLeader={state.isLeader}
                  otherName={state.isSelf ? undefined : state.target.name}
                  saving={state.saving}
                  onSave={() => void state.save()}
                  onBackToMe={() => state.editMember(null)}
                />
              </>
            }
          >
            {state.showAttendance && <AttendanceSection members={visible} onMark={mark} onEditStatus={editStatus} onRetry={state.team.reload} />}
            <DailyStatusLinks />
          </GlassSplit>
        </GlassBody>
      </div>
    </GlassPage>
  );
}
