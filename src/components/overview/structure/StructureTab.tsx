// Blickwinkel, Sheets und Teamdaten leben im Browser
"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLastDefined } from "../../../hooks/useLastDefined";
import { useManageTeam } from "../../../hooks/useManageTeam";
import { hasDemoSession } from "../../../lib/auth/demoSession";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { draftFromContest, type ContestDraft } from "../../../lib/overview/contestForm";
import type { Contest } from "../../../lib/overview/contestTypes";
import { statsOf } from "../../../lib/overview/manageLogic";
import { updateMember } from "../../../lib/overview/memberApi";
import { peopleOf, rankMembers, type StructureLens, type StructurePeriod } from "../../../lib/overview/structureLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import { structureTexts as texts } from "../../../texts/structureTexts";
import GlassBody from "../../glass/GlassBody";
import GlassSplit from "../../glass/GlassSplit";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import ConfirmDialog from "../../profile/ConfirmDialog";
import MyTeamsLink from "../../teams/MyTeamsLink";
import ContestAdminSection from "../manage/ContestAdminSection";
import ContestFormSheet from "../manage/ContestFormSheet";
import MemberSheet from "../manage/MemberSheet";
import RankingSection from "./RankingSection";
import ReportSheet from "./ReportSheet";
import StructureActions from "./StructureActions";
import StructureHero from "./StructureHero";
import TeamLensChips, { type TeamLens } from "../team/TeamLensChips";

interface StructureTabProps {
  vertical: Vertical;
  contests: readonly Contest[];
  lens: StructureLens;
  /** Nur im Admin-Reiter "Team": die gewählte Strukturleiter-Gruppe und die Plaketten zum Wechseln. */
  teamLens?: TeamLens;
}

/** Reiter "Struktur" bzw. "Mentor" (v1 StrukturleiterDashboard, MentorVerwaltung): die eigene Gruppe im Blick. */
export default function StructureTab({ vertical, contests, lens, teamLens }: StructureTabProps) {
  const team = useManageTeam(vertical);
  const leadId = teamLens?.active ?? team.userId ?? "";
  const people = peopleOf(team.users, lens, leadId, team.now);
  const [period, setPeriod] = useState<StructurePeriod>("day");
  const ranked = rankMembers(people, team.products, period, team.now);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const shown = useLastDefined(editing);
  const [reportOpen, setReportOpen] = useState(false);
  const [removing, setRemoving] = useState<TeamUser | null>(null);
  const [form, setForm] = useState<{ key: number; draft: ContestDraft | null } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const own = { kind: lens === "structure" ? ("strukturleiter" as const) : ("mentor" as const), memberIds: people.map((p) => p.id) };
  const solar = vertical === "solar";

  const today = people.reduce((sum, p) => ({ sales: sum.sales + statsOf(team.stats, p.id).salesToday, doors: sum.doors + statsOf(team.stats, p.id).doorsToday }), { sales: 0, doors: 0 });
  const total = (p: StructurePeriod) => rankMembers(people, team.products, p, team.now).reduce((sum, r) => sum + r.sales, 0);
  const openForm = (draft: ContestDraft | null) => {
    setForm((f) => ({ key: (f?.key ?? 0) + 1, draft }));
    setFormOpen(true);
  };
  const remove = async (member: TeamUser) => {
    const patch = lens === "structure" ? { strukturleiterId: null, ...(member.mentorId === leadId ? { mentorId: null } : {}) } : { mentorId: null };
    const ok = await updateMember(member.id, patch).catch(() => false);
    if (!ok) return void toast.error(manageTexts.member.failed);
    toast.success(fill(texts.removed, { name: member.name.split(" ")[0] ?? member.name }));
    setRemoving(null);
    setEditing(null);
  };

  return (
    <GlassBody layout="wide">
      <GlassSplit
        sticky
        aside={
          <>
            {teamLens && <TeamLensChips users={team.users} {...teamLens} />}
            <StructureHero lens={lens} today={today} week={total("week")} month={total("month")} people={people.length} leadName={teamLens ? team.users.find((u) => u.id === leadId)?.name.split(" ")[0] : undefined} demo={hasDemoSession()} now={team.now} />
            {people.length > 0 && <StructureActions onReport={() => setReportOpen(true)} onContest={() => openForm(null)} />}
            {people.length > 0 && <MyTeamsLink />}
          </>
        }
      >
        {people.length === 0 ? (
          <GlassSection>
            <GlassRow icon={Users} tone="gray" title={leadId ? texts.empty[lens] : texts.noLead[lens]} subtitle={texts.emptyHint[lens]} />
          </GlassSection>
        ) : (
          <>
            <RankingSection lens={lens} period={period} ranked={ranked} now={team.now} stats={team.stats} onPeriod={setPeriod} onOpen={setEditing} />
            <ContestAdminSection contests={contests} teamId={team.teamId ?? ""} now={team.now} onCreate={() => openForm(null)} onEdit={(c) => openForm(draftFromContest(c, vertical))} own={{ scope: own.kind, createdBy: team.userId ?? "" }} />
          </>
        )}
      </GlassSplit>
      {shown && (
        <MemberSheet key={shown.id} member={shown} open={editing !== null} users={team.users} stats={statsOf(team.stats, shown.id)} solar={solar} now={team.now} onClose={() => setEditing(null)} lead={{ lens, onRemove: () => setRemoving(shown) }} />
      )}
      <ConfirmDialog open={removing !== null} title={texts.remove[lens]} confirmLabel={texts.remove[lens]} cancelLabel={texts.cancel} busy={false} onConfirm={() => removing && void remove(removing)} onClose={() => setRemoving(null)}>
        {fill(texts.removeBody[lens], { name: removing?.name ?? "" })}
      </ConfirmDialog>
      <ReportSheet open={reportOpen} rank={(p) => rankMembers(people, team.products, p, team.now)} now={team.now} onClose={() => setReportOpen(false)} />
      {form && <ContestFormSheet key={form.key} open={formOpen} initial={form.draft} vertical={vertical} teamId={team.teamId ?? ""} userId={team.userId ?? ""} users={team.users} solar={solar} own={own} onClose={() => setFormOpen(false)} />}
    </GlassBody>
  );
}
