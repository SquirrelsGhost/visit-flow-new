import { Users } from "lucide-react";
import type { AdminTeamSummary } from "../../lib/admin/adminTeam";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import GlassRow from "../glass/GlassRow";
import AdminPanel from "./AdminPanel";
import AdminTile from "./AdminTile";

interface AdminTeamCardProps {
  team: AdminTeamSummary;
}

const texts = adminTexts.team;

/** Personen über alle Teams: Größe der Organisation, wer heute fehlt, wer gesperrt oder noch ohne Team ist. */
export default function AdminTeamCard({ team }: AdminTeamCardProps) {
  return (
    <AdminPanel label={texts.label} className="p-0">
      <div className="grid grid-cols-3 gap-2.5 p-4 pb-3">
        <AdminTile label={texts.people} value={team.people} />
        <AdminTile label={texts.teams} value={team.teams} />
        <AdminTile label={texts.leads} value={team.leads} />
        <AdminTile label={texts.out} value={team.out} warn />
        <AdminTile label={texts.blocked} value={team.blocked} warn />
        <AdminTile label={texts.fresh} value={team.newThisMonth} />
      </div>
      <div className="border-t border-[var(--glass-divider)]">
        <GlassRow icon={Users} tone="indigo" title={texts.manage} subtitle={team.unassigned > 0 ? fill(texts.unassigned, { count: team.unassigned }) : fill(texts.working, { count: team.working })} warn={team.unassigned > 0} href="/teams" />
      </div>
    </AdminPanel>
  );
}
