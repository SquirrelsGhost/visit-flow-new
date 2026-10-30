import { statsOf, statusOf, type MemberStats } from "../overview/manageLogic";
import { isActiveMentee } from "../overview/structureLogic";
import type { TeamUser } from "../overview/teamTypes";
import { can } from "../permissions";
import type { OrgFilter, OrgNode, OrgPersonNode, OrgScope, OrgTeam, OrgTeamNode, OrgTotals } from "./orgTypes";

/** Rollen ganz oben im Team; sie hängen an niemandem. */
const TOP = new Set(["admin", "gebietsmanager", "teamleiter"]);
const LEADS = new Set(["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"]);
/** Reihenfolge unter einem Knoten: Führung zuerst, dann alphabetisch. */
const RANK: Record<string, number> = { admin: 0, gebietsmanager: 1, teamleiter: 2, strukturleiter: 3, mentor: 4, berater: 5 };

/** Wohin eine Person im Baum gehört (v1-Felder strukturleiterId und mentorId), ohne Team gilt null. */
export function parentOf(user: TeamUser, byId: ReadonlyMap<string, TeamUser>, head: string | undefined, now = new Date()): string | null {
  if (TOP.has(user.role)) return null;
  const group = user.strukturleiterId && user.strukturleiterId !== user.id && byId.get(user.strukturleiterId)?.role === "strukturleiter" ? user.strukturleiterId : undefined;
  const mentor = user.mentorId && user.mentorId !== user.id ? byId.get(user.mentorId) : undefined;
  // Mentees hängen am Mentor, solange er in derselben Gruppe ist; sonst bleibt die Gruppe sichtbar
  if (user.role !== "strukturleiter" && mentor && isActiveMentee(user, mentor.id, now)) {
    const mentorGroup = mentor.role === "strukturleiter" ? mentor.id : mentor.strukturleiterId;
    if (!group || mentorGroup === group) return mentor.id;
  }
  if (group && user.role !== "strukturleiter") return group;
  return head && head !== user.id ? head : null;
}

const byRank = (a: OrgNode, b: OrgNode) =>
  a.kind === "person" && b.kind === "person" ? (RANK[a.user.role] ?? 9) - (RANK[b.user.role] ?? 9) || a.user.name.localeCompare(b.user.name, "de") : 0;

/** Baum der Personen eines Teams: Teamleiter → Strukturleiter → Mentor → Berater. Ringe fallen auf die Teamleitung zurück. */
export function personForest(users: readonly TeamUser[], now = new Date()): OrgPersonNode[] {
  const byId = new Map(users.map((u) => [u.id, u]));
  const head = users.find((u) => u.role === "teamleiter")?.id;
  const parent = new Map(users.map((u) => [u.id, parentOf(u, byId, head, now)]));
  for (const u of users) {
    const seen = new Set([u.id]);
    let p = parent.get(u.id) ?? null;
    while (p && !seen.has(p)) {
      seen.add(p);
      p = parent.get(p) ?? null;
    }
    if (p) parent.set(u.id, head && head !== u.id && parent.get(head) === null ? head : null);
  }
  const nodes = new Map<string, OrgPersonNode>(users.map((u) => [u.id, { kind: "person", id: u.id, user: u, children: [] }]));
  const roots: OrgPersonNode[] = [];
  for (const node of nodes.values()) {
    const p = parent.get(node.id);
    const target = p ? nodes.get(p) : undefined;
    (target ? target.children : roots).push(node);
  }
  const sort = (list: OrgNode[]) => list.sort(byRank).forEach((n) => sort(n.children));
  sort(roots);
  return roots;
}

/** Wer im Blick ist: Strukturleiter mit ihrer Gruppe, Mentoren mit ihren Mentees, sonst das ganze Team. */
export function scopeUsers(scope: OrgScope, meId: string, users: readonly TeamUser[], now = new Date()): TeamUser[] {
  const me = users.find((u) => u.id === meId);
  if (scope === "group") return [...(me ? [me] : []), ...users.filter((u) => u.strukturleiterId === meId && u.id !== meId)];
  if (scope === "mentees") return [...(me ? [me] : []), ...users.filter((u) => u.id !== meId && isActiveMentee(u, meId, now))];
  return [...users];
}

/** Admin-Baum: jedes Team als eigener Knoten, wer keinem Team angehört, landet unter "Ohne Team". */
export function teamForest(teams: readonly OrgTeam[], users: readonly TeamUser[], noTeamName: string, now = new Date()): OrgTeamNode[] {
  const known = new Set(teams.map((t) => t.id));
  const loose = users.filter((u) => !u.teamId || !known.has(u.teamId));
  const list = [...teams].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const nodes: OrgTeamNode[] = list.map((team) => ({ kind: "team", id: `team:${team.id}`, team, children: personForest(users.filter((u) => u.teamId === team.id), now) }));
  if (loose.length > 0) nodes.push({ kind: "team", id: "team:none", team: { id: "", name: noTeamName }, children: personForest(loose, now) });
  return nodes;
}

const isOut = (u: TeamUser, now: Date) => {
  const status = statusOf(u, now);
  return status === "sick" || status === "inactive";
};

/** Summen eines Astes; zählt nur aktive Konten mit. */
export function totalsOf(node: OrgNode, stats: ReadonlyMap<string, MemberStats>, now = new Date()): OrgTotals {
  const sum: OrgTotals = { people: 0, out: 0, salesToday: 0, salesMonth: 0, doorsToday: 0 };
  const walk = (n: OrgNode) => {
    if (n.kind === "person" && n.user.isActive !== false && !n.user.isBlocked) {
      const s = statsOf(stats as Map<string, MemberStats>, n.id);
      sum.people += 1;
      sum.out += isOut(n.user, now) ? 1 : 0;
      sum.salesToday += s.salesToday;
      sum.salesMonth += s.salesMonth;
      sum.doorsToday += s.doorsToday;
    }
    n.children.forEach(walk);
  };
  walk(node);
  return sum;
}

/** Passt eine Person zum Filter? "Ohne Gruppe" heißt: Berater oder Mentor ohne Strukturleiter im Team. */
export function matchesFilter(user: TeamUser, filter: OrgFilter, byId: ReadonlyMap<string, TeamUser>, now = new Date()): boolean {
  if (filter === "leads") return LEADS.has(user.role);
  if (filter === "out") return isOut(user, now);
  if (filter === "inactive") return user.isActive === false || user.isBlocked === true;
  if (filter === "unassigned") return !TOP.has(user.role) && !can(user, "streets:struktur") && !(user.strukturleiterId && can(byId.get(user.strukturleiterId), "streets:struktur"));
  return true;
}

export const matchesQuery = (user: TeamUser, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || user.name.toLowerCase().includes(q) || (user.email ?? "").toLowerCase().includes(q);
};

/** Behält Treffer samt ihren Vorgesetzten, damit man sieht, wo jemand hängt; die Äste kommen aufgeklappt zurück. */
export function pruneForest(nodes: readonly OrgNode[], keep: (user: TeamUser) => boolean): { nodes: OrgNode[]; open: Set<string> } {
  const open = new Set<string>();
  const prune = (list: readonly OrgNode[]): OrgNode[] =>
    list.flatMap((n) => {
      const children = prune(n.children);
      const hit = n.kind === "person" && keep(n.user);
      if (!hit && children.length === 0) return [];
      if (children.length > 0) open.add(n.id);
      return [{ ...n, children }];
    });
  return { nodes: prune(nodes), open };
}

/** Alle Personen eines Baums, flach. */
export function peopleIn(nodes: readonly OrgNode[]): TeamUser[] {
  return nodes.flatMap((n) => [...(n.kind === "person" ? [n.user] : []), ...peopleIn(n.children)]);
}

/** Anfangs offen: Teams und Führungskräfte der ersten drei Ebenen, beim Admin nur das eigene Team. */
export function defaultOpen(nodes: readonly OrgNode[], ownTeamId?: string): Set<string> {
  const open = new Set<string>();
  const walk = (list: readonly OrgNode[], depth: number) =>
    list.forEach((n) => {
      if (n.kind === "team") {
        if (n.team.id === ownTeamId || nodes.length === 1) open.add(n.id);
        if (open.has(n.id)) walk(n.children, 0);
      } else if (n.children.length > 0 && depth < 3) {
        open.add(n.id);
        walk(n.children, depth + 1);
      }
    });
  walk(nodes, 0);
  return open;
}

/** Alle Knoten mit Unterknoten (zum Aufklappen auf einen Tipp). */
export function branchIds(nodes: readonly OrgNode[]): string[] {
  return nodes.flatMap((n) => (n.children.length > 0 ? [n.id, ...branchIds(n.children)] : []));
}
