import type { AuthUser } from "../../lib/auth/accessToken";
import type { ScopeSource, ScopeUser } from "./ScopeSource";

/**
 * Team-Abgrenzung (NDA: Lead-Daten eines Teams darf kein anderes Team lesen). Port von
 * v1 server/src/utils/accessScope.ts mit denselben Regeln:
 *  - Eigene Daten und Daten des eigenen Teams sind lesbar, Admins lesen alles.
 *  - Gebietsmanager: Teams ihrer aktiven Gebiete.
 *  - Strukturleiter: ihre Struktur (direkt Unterstellte plus deren Mentees), ein Team nur,
 *    wenn alle aktiven Mitglieder in der Struktur liegen.
 * Jeder Endpunkt, der Daten zu einer vom Client gelieferten userId/teamId liefert, fragt hier.
 */
export type DeniedListener = (kind: "USER" | "TEAM", targetId: string, requester: AuthUser) => void;

export class AccessScope {
  constructor(
    private readonly source: ScopeSource,
    private readonly onDenied: DeniedListener = () => undefined,
  ) {}

  /** Nutzer-IDs, die der Anfragende lesen darf. `null` heißt: alle (Admin ohne gewähltes Team). */
  async accessibleUserIds(requester: AuthUser): Promise<string[] | null> {
    const me = await this.source.user(requester.id);
    if (!me) return [];
    if (me.role === "admin" && !me.teamId) return null;

    // Ein Admin mit gewähltem Team sieht nur dieses Team, sich selbst aber nicht
    const ids = new Set<string>(me.role === "admin" ? [] : [me.id]);
    if (me.role === "gebietsmanager") {
      const teamIds = await this.source.gebietsmanagerTeamIds(me.id);
      if (teamIds.length > 0) (await this.source.activeUsers({ teamIds })).forEach((u) => ids.add(u.id));
    }
    if (me.role === "strukturleiter") (await this.structureUserIds(me.id)).forEach((id) => ids.add(id));
    if (me.teamId) {
      const members = await this.source.activeUsers({ teamIds: [me.teamId] });
      members.filter((u) => u.role !== "admin").forEach((u) => ids.add(u.id));
    }
    return [...ids];
  }

  async canAccessUser(requester: AuthUser, targetUserId: string): Promise<boolean> {
    const me = await this.source.user(requester.id);
    if (!me) return false;
    if (me.role === "admin" || me.id === targetUserId) return true;

    const accessible = await this.accessibleUserIds(requester);
    if (accessible === null || accessible.includes(targetUserId)) return true;
    const target = await this.source.userByAnyId(targetUserId);
    if (target && accessible.includes(target.id)) return true;

    this.onDenied("USER", targetUserId, requester);
    return false;
  }

  async canAccessTeam(requester: AuthUser, targetTeamId: string): Promise<boolean> {
    // "none" heißt in v1 "meine eigenen Mentees" und ist immer auf den Anfragenden beschränkt
    if (targetTeamId === "none") return true;
    const me = await this.source.user(requester.id);
    if (!me) return false;
    if (me.role === "admin" || (me.teamId && me.teamId === targetTeamId)) return true;

    if (me.role === "gebietsmanager" && (await this.source.gebietsmanagerTeamIds(me.id)).includes(targetTeamId)) return true;
    if (me.role === "strukturleiter" && (await this.teamInsideStructure(me.id, targetTeamId))) return true;

    this.onDenied("TEAM", targetTeamId, requester);
    return false;
  }

  private async teamInsideStructure(strukturleiterId: string, teamId: string): Promise<boolean> {
    const [structure, members] = await Promise.all([
      this.structureUserIds(strukturleiterId),
      this.source.activeUsers({ teamIds: [teamId] }),
    ]);
    return members.length > 0 && members.every((m) => structure.includes(m.id));
  }

  /** Strukturleiter selbst, direkt Unterstellte und die Mentees aller Mentoren darunter. */
  private async structureUserIds(strukturleiterId: string): Promise<string[]> {
    const direct = await this.source.activeUsers({ strukturleiterId });
    const isMentor = (u: ScopeUser) => u.role === "mentor" || Boolean(u.roles?.includes("mentor"));
    const mentorIds = [...new Set([...direct.filter(isMentor).map((u) => u.id), strukturleiterId])];
    const mentees = await this.source.activeUsers({ mentorIds });
    return [...new Set([strukturleiterId, ...direct.map((u) => u.id), ...mentees.map((u) => u.id)])];
  }
}
