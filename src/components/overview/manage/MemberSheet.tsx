// Entwurf und Speichern laufen im Browser
"use client";

import { CalendarCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { berlinDate } from "../../../lib/overview/dailyStatus";
import { roleLabel, type MemberStats } from "../../../lib/overview/manageLogic";
import { updateMember, updateMembers } from "../../../lib/overview/memberApi";
import { draftOf, orphanedBy, patchFrom, type MemberDraft } from "../../../lib/overview/memberDraft";
import type { StructureLens } from "../../../lib/overview/structureLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import { structureTexts } from "../../../texts/structureTexts";
import GlassRow from "../../glass/GlassRow";
import GlassSheet from "../../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_CARD } from "../../glass/glassStyles";
import MemberAssignFields from "./MemberAssignFields";
import MemberLeadFields from "./MemberLeadFields";
import MemberStatsStrip from "./MemberStatsStrip";
import MemberStatusField from "./MemberStatusField";

interface MemberSheetProps {
  member: TeamUser;
  open: boolean;
  users: readonly TeamUser[];
  stats: MemberStats;
  solar: boolean;
  now: Date;
  onClose: () => void;
  /** Strukturleiter oder Mentor: weniger Rechte, dafür "aus Gruppe entfernen". */
  lead?: { lens: StructureLens; onRemove: () => void };
  /** Zusätzliche Bereiche über dem Speichern-Knopf (z. B. Lizenz und Team auf der Seite Meine Teams). */
  extra?: ReactNode;
}

const texts = manageTexts.member;

/** Bearbeiten einer Person: Zahlen, Tagesstatus, Rolle und Zuordnung, Zugang. Speichert nur, was sich geändert hat. */
export default function MemberSheet({ member, open, users, stats, solar, now, onClose, lead, extra }: MemberSheetProps) {
  const [draft, setDraft] = useState<MemberDraft>(() => draftOf(member, now));
  const [busy, setBusy] = useState(false);
  const patch = patchFrom(member, draft, now);
  const dirty = Object.keys(patch).length > 0;
  const change = (next: Partial<MemberDraft>) => setDraft((d) => ({ ...d, ...next }));

  const save = async () => {
    setBusy(true);
    const orphans = orphanedBy(member, patch, users);
    const ok = await updateMember(member.id, patch).catch(() => false);
    if (ok && orphans.length > 0) await updateMembers(orphans, { strukturleiterId: null }).catch(() => 0);
    setBusy(false);
    if (!ok) return void toast.error(texts.failed);
    toast.success(fill(texts.saved, { name: member.name.split(" ")[0] ?? member.name }));
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={member.name} subtitle={[roleLabel(member.role, solar), member.email].filter(Boolean).join(" · ")}>
      <MemberStatsStrip stats={stats} />
      <MemberStatusField status={draft.status} reason={draft.reason} until={draft.until} today={berlinDate(now) ?? ""} onChange={change} />
      {lead ? (
        <MemberLeadFields member={member} users={users} draft={draft} lens={lead.lens} solar={solar} onChange={change} onRemove={lead.onRemove} />
      ) : (
        <>
          <MemberAssignFields member={member} users={users} draft={draft} solar={solar} onChange={change} />
          <div className={GLASS_CARD}>
            <GlassRow icon={CalendarCheck} tone="green" title={structureTexts.toDailyStatus} subtitle={structureTexts.toDailyStatusHint} href="/daily-status" />
          </div>
        </>
      )}
      {extra}
      <button type="button" disabled={!dirty || busy} onClick={save} className={GLASS_BUTTON}>
        {texts.save}
      </button>
    </GlassSheet>
  );
}
