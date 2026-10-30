import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { DAILY_STATUS_META } from "../../lib/overview/dailyStatus";
import { statusOf } from "../../lib/overview/manageLogic";
import { manageTexts } from "../../texts/manageTexts";
import { updateMember } from "../../lib/overview/memberApi";
import type { TeamUser } from "../../lib/overview/teamTypes";
import { matchesQuery } from "../../lib/teams/orgTree";
import { fill } from "../../texts/profileTexts";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";
import OrgAvatar from "./OrgAvatar";

interface AddToGroupSheetProps {
  open: boolean;
  meId: string;
  users: readonly TeamUser[];
  now: Date;
  onClose: () => void;
}

const texts = teamsTexts.add;

/** Strukturleiter holen Leute aus dem Team in ihre Gruppe (v1 "Mitglied hinzufügen", PATCH strukturleiterId). */
export default function AddToGroupSheet({ open, meId, users, now, onClose }: AddToGroupSheetProps) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const byId = new Map(users.map((u) => [u.id, u]));
  const candidates = users
    .filter((u) => u.id !== meId && u.strukturleiterId !== meId && (u.role === "berater" || u.role === "mentor") && u.isActive !== false)
    .filter((u) => matchesQuery(u, query))
    .sort((a, b) => Number(Boolean(a.strukturleiterId)) - Number(Boolean(b.strukturleiterId)) || a.name.localeCompare(b.name, "de"));

  const add = async (user: TeamUser) => {
    setBusy(user.id);
    const ok = await updateMember(user.id, { strukturleiterId: meId }).catch(() => false);
    setBusy(null);
    if (!ok) return void toast.error(manageTexts.member.failed);
    toast.success(fill(texts.done, { name: user.name.split(" ")[0] ?? user.name }));
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={texts.hint}>
      <GlassSearchField value={query} onChange={setQuery} placeholder={texts.search} />
      {candidates.length === 0 ? (
        <p className={GLASS_FOOTER}>{texts.empty}</p>
      ) : (
        <div className={cn(GLASS_CARD, GLASS_DIVIDER)}>
          {candidates.map((user) => {
            const group = user.strukturleiterId ? byId.get(user.strukturleiterId) : undefined;
            return (
              <button key={user.id} type="button" disabled={busy !== null} onClick={() => void add(user)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "disabled:opacity-60")}>
                <OrgAvatar name={user.name} role={user.role} dot={DAILY_STATUS_META[statusOf(user, now)].dot} />
                <span className="min-w-0 flex-1">
                  <span className={cn(GLASS_TITLE, "truncate")}>{user.name}</span>
                  <span className={cn(GLASS_SUBTITLE, "truncate")}>{group ? fill(texts.other, { name: group.name }) : texts.none}</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_6px_14px_-6px_rgba(220,38,38,0.8)]">
                  <Plus aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </GlassSheet>
  );
}
