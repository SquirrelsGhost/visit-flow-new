import type { Vertical } from "../battle/battleCategories";
import type { Contest, ContestGoal, ContestKind, ContestMode, ContestPrize, ContestScope } from "./contestTypes";
import { productGroupsFor } from "./productGroups";
import { localDay } from "./todayStats";

/** Formular "Gewinnspiel anlegen" (v1 CreateContestDialog); Tage als JJJJ-MM-TT. */
export interface ContestDraft {
  id?: string;
  name: string;
  description: string;
  type: Exclude<ContestKind, "custom-groups">;
  contestType: ContestMode;
  /** Ziel je Kategorie, 0 heißt kein Ziel. */
  targets: Record<string, number>;
  prizes: string[];
  start: string;
  end: string;
  selectedUserIds: string[];
  strukturleiterIds: string[];
}

/** Nicht abgeschickter Entwurf bleibt wie in v1 erhalten; eigenes Format, daher eigener Schlüssel. */
const DRAFT_KEY = "contest_dialog_draft_v2";
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + n);
  return localDay(d);
};

/** Lead-Gewinnspiele zählen nur PV-Leads (v1), sonst alle Gruppen der Sparte. */
export const goalCategories = (vertical: Vertical): readonly string[] => (vertical === "solar" ? ["Solar_PV"] : productGroupsFor(vertical));

export function emptyDraft(vertical: Vertical, now = new Date()): ContestDraft {
  const today = localDay(now);
  return {
    name: "",
    description: "",
    type: "all",
    contestType: "race",
    targets: Object.fromEntries(goalCategories(vertical).map((c) => [c, 0])),
    prizes: [""],
    start: today,
    end: addDays(today, 6),
    selectedUserIds: [],
    strukturleiterIds: [],
  };
}

export function draftFromContest(contest: Contest, vertical: Vertical): ContestDraft {
  const base = emptyDraft(vertical);
  for (const goal of contest.goals) base.targets[goal.category] = goal.target;
  return {
    ...base,
    id: contest.id,
    name: contest.name,
    description: contest.description ?? "",
    type: contest.type === "custom-groups" ? "all" : contest.type,
    contestType: contest.contestType,
    prizes: contest.prizes.length ? [...contest.prizes].sort((a, b) => a.rank - b.rank).map((p) => p.prize) : [""],
    start: localDay(contest.startDate),
    end: localDay(contest.endDate),
    selectedUserIds: contest.selectedUserIds ?? [],
    strukturleiterIds: contest.strukturleiterIds ?? [],
  };
}

/** Erster Fehler wie in v1, sonst null. */
export function validateDraft(draft: ContestDraft, own?: ContestOwnScope): string | null {
  if (own && own.memberIds.length === 0) return "In deiner Gruppe ist noch niemand.";
  if (!draft.name.trim()) return "Bitte gib dem Gewinnspiel einen Namen.";
  if (!Object.values(draft.targets).some((t) => t > 0)) return "Lege mindestens ein Ziel fest.";
  if (!draft.prizes.some((p) => p.trim())) return "Trage mindestens einen Preis ein.";
  if (!draft.start || !draft.end) return "Start und Ende fehlen.";
  if (draft.end < draft.start) return "Das Ende liegt vor dem Start.";
  if (own) return null;
  if (draft.type === "individual" && draft.selectedUserIds.length === 0) return "Wähle mindestens eine Person aus.";
  if (draft.type === "groups" && draft.strukturleiterIds.length === 0) return "Wähle mindestens eine Gruppe aus.";
  return null;
}

/** Gewinnspiel einer Gruppe oder der Mentees (v1: scope plus alle Mitglieder als selectedUserIds). */
export interface ContestOwnScope {
  kind: Exclude<ContestScope, "team">;
  memberIds: string[];
}

/** Daten für POST/PUT /incentives wie v1 handleCreateContest; Start 00:00, Ende 23:59:59. */
export function contestFromDraft(draft: ContestDraft, teamId: string, userId: string, now = new Date(), own?: ContestOwnScope): Partial<Contest> {
  const goals: ContestGoal[] = Object.entries(draft.targets).filter(([, t]) => t > 0).map(([category, target]) => ({ category, target }));
  const prizes: ContestPrize[] = draft.prizes.map((p) => p.trim()).filter(Boolean).map((prize, i) => ({ rank: i + 1, prize }));
  const startDate = new Date(`${draft.start}T00:00:00`);
  return {
    ...(draft.id ? { id: draft.id } : {}),
    teamId,
    createdBy: userId,
    name: draft.name.trim(),
    description: draft.description.trim(),
    type: draft.type,
    contestType: draft.contestType,
    goals,
    prizes,
    startDate: startDate.toISOString(),
    endDate: new Date(`${draft.end}T23:59:59.999`).toISOString(),
    status: startDate > now ? "planned" : "active",
    scope: own?.kind ?? "team",
    ...(own ? { type: "individual" as const, selectedUserIds: own.memberIds } : {}),
    ...(!own && draft.type === "individual" ? { selectedUserIds: draft.selectedUserIds } : {}),
    ...(!own && draft.type === "groups" ? { strukturleiterIds: draft.strukturleiterIds } : {}),
  };
}

export function readDraft(): ContestDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ContestDraft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: ContestDraft | null): void {
  try {
    if (draft && !draft.id) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Entwurf geht dann beim Schließen verloren
  }
}
