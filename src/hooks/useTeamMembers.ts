import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TEAM_UPDATED_EVENT } from "../lib/overview/memberApi";
import { loadTeamMembers, saveMemberPatch } from "../lib/team/teamApi";
import type { MemberPatch, TeamMember } from "../lib/team/teamTypes";

export interface TeamMembersState {
  /** undefined = lädt, null = Laden fehlgeschlagen. */
  members: TeamMember[] | null | undefined;
  /** Übernimmt die Änderung sofort (wie v1 optimistisch) und nimmt sie bei einem Fehler zurück. */
  apply: (id: string, patch: MemberPatch, self: boolean, successMessage: string) => Promise<boolean>;
  reload: () => void;
}

/** Teamliste für Tagesstatus und Teamleistung (gleiche Quelle wie Battle-Arena und Verwaltung: /auth/team-members). */
export function useTeamMembers(enabled: boolean): TeamMembersState {
  const [members, setMembers] = useState<TeamMember[] | null | undefined>(undefined);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () => void loadTeamMembers().then((list) => alive && setMembers(list));
    load();
    // Änderungen aus der Verwaltung der Übersicht (oder einem zweiten Blick auf diese Seite) sofort übernehmen
    window.addEventListener(TEAM_UPDATED_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(TEAM_UPDATED_EVENT, load);
    };
  }, [enabled, round]);

  const apply = useCallback(async (id: string, patch: MemberPatch, self: boolean, successMessage: string) => {
    let before: TeamMember | undefined;
    setMembers((list) => list?.map((m) => (m.id === id ? ((before = m), { ...m, ...patch }) : m)));
    const result = await saveMemberPatch(id, patch, self);
    if (result.ok) {
      toast.success(successMessage);
      return true;
    }
    setMembers((list) => list?.map((m) => (m.id === id && before ? before : m)));
    toast.error(result.message);
    return false;
  }, []);

  const reload = useCallback(() => setRound((n) => n + 1), []);
  return { members: enabled ? members : [], apply, reload };
}
