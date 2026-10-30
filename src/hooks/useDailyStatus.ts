import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { AuthUser } from "@/shared/auth/authSchemas";
import { hasDemoSession } from "../lib/auth/demoSession";
import { clampDraft, statusPatch, type StatusDraft } from "../lib/team/statusPayload";
import { canTrackAttendance, draftOf, isStatusLeader } from "../lib/team/statusDraft";
import { demoMember } from "../lib/team/teamDemoData";
import type { MemberPatch, TeamMember } from "../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../texts/dailyStatusTexts";
import { useAuth } from "./useAuth";
import { useTeamMembers, type TeamMembersState } from "./useTeamMembers";

const subscribeNever = () => () => {};

export interface DailyStatusState {
  demo: boolean;
  isLeader: boolean;
  showAttendance: boolean;
  /** Wessen Status das Formular gerade bearbeitet (ich oder ein Teammitglied). */
  target: TeamMember;
  isSelf: boolean;
  draft: StatusDraft;
  setDraft: (draft: StatusDraft) => void;
  saving: boolean;
  save: () => Promise<void>;
  editMember: (id: string | null) => void;
  team: TeamMembersState;
}

function selfOf(user: AuthUser, demo: boolean): TeamMember {
  const base = { ...user, name: user.name ?? user.email } as unknown as TeamMember;
  return demo ? { ...base, ...demoMember(user.id), id: user.id, name: base.name, role: user.role } : base;
}

/** Zustand der Seite Tagesstatus: eigener Status, Status anderer (für Leitungen) und die Anwesenheitsliste. */
export function useDailyStatus(): DailyStatusState | null {
  const { user, updateUser } = useAuth();
  const demo = useSyncExternalStore(subscribeNever, hasDemoSession, () => false);
  const role = user?.role ?? "berater";
  const isLeader = isStatusLeader(role);
  const showAttendance = canTrackAttendance(role, user?.teamId);
  const team = useTeamMembers(Boolean(user) && showAttendance);
  const [ownPatch, setOwnPatch] = useState<MemberPatch>({});
  const [targetId, setTargetId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; draft: StatusDraft } | null>(null);
  const [saving, setSaving] = useState(false);

  const self = useMemo(() => (user ? { ...selfOf(user, demo), ...ownPatch } : null), [user, demo, ownPatch]);
  const other = targetId ? team.members?.find((m) => m.id === targetId) : undefined;
  const target = other ?? self;
  const isSelf = !other;
  const draft = target && edit?.id === target.id ? edit.draft : target ? draftOf(target) : null;

  const setDraft = useCallback(
    (next: StatusDraft) => target && setEdit({ id: target.id, draft: clampDraft(next, isLeader) }),
    [target, isLeader],
  );

  const save = useCallback(async () => {
    if (!target || !draft) return;
    setSaving(true);
    const patch = statusPatch(draft, !isSelf && isLeader);
    const ok = await team.apply(target.id, patch, isSelf, texts.saved);
    if (ok && isSelf) {
      setOwnPatch((p) => ({ ...p, ...patch }));
      if (!demo) updateUser(patch as Partial<AuthUser>);
    }
    if (ok) {
      setEdit(null);
      setTargetId(null);
    }
    setSaving(false);
  }, [target, draft, isSelf, isLeader, team, demo, updateUser]);

  const editMember = useCallback((id: string | null) => {
    setTargetId(id);
    setEdit(null);
  }, []);

  if (!target || !draft) return null;
  return { demo, isLeader, showAttendance, target, isSelf, draft, setDraft, saving, save, editMember, team };
}
