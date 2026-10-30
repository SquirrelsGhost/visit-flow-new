import { DEMO_ADMIN } from "../auth/demoSession";
import { berlinDay, previousDay } from "./arenaScore";
import type { ArenaUser, BattleProduct, Challenge, Readiness, StreakMap, TopEarner } from "./battleTypes";

/**
 * Beispielteam für den Demo-Admin: ohne laufende API zeigt die Arena damit jeden Zustand
 * (aktive Battles, offene Herausforderung, Krankmeldung, Inaktive, Rückblick, Topverdiener).
 */
export const DEMO_ME = DEMO_ADMIN.id;

const PEOPLE: [string, string, string, number | null][] = [
  ["b1", "Lukas Berger", "berater", 2],
  ["b2", "Sarah Klein", "berater", 7],
  ["b3", "Mehmet Yilmaz", "berater", 1],
  ["b4", "Julia Wagner", "berater", 11],
  ["b5", "Tim Hoffmann", "berater", 3],
  ["b6", "Aylin Demir", "mentor", 5],
  ["b7", "Jonas Richter", "berater", 9],
  ["b8", "Lea Schulz", "berater", 4],
  ["b9", "Noah Fischer", "berater", 6],
  ["b10", "Mia Becker", "berater", null],
  ["b11", "Felix Wolf", "berater", 8],
  ["tl", "Kevin Braun", "teamleiter", 14],
];

const SICK = new Set(["b9"]);
const INACTIVE = new Set(["b10", "b11"]);

const nameOf = (id: string) => PEOPLE.find((p) => p[0] === id)?.[1] ?? DEMO_ADMIN.name ?? "Demo";

export function demoUsers(): ArenaUser[] {
  return [
    { id: DEMO_ME, name: DEMO_ADMIN.name ?? "Demo Admin", role: "admin" },
    ...PEOPLE.map(([id, name, role]) => ({ id, name, role, battleInactive: INACTIVE.has(id) })),
  ];
}

export function demoReadiness(): Readiness {
  const entry = ([userId, name, , month]: (typeof PEOPLE)[number]) => ({ userId, name, month });
  const ready = PEOPLE.filter(([id, , , m]) => m !== null && !SICK.has(id) && !INACTIVE.has(id));
  return {
    newcomers: ready.filter(([, , , m]) => (m ?? 0) <= 4).map(entry),
    experienced: ready.filter(([, , , m]) => (m ?? 0) > 4).map(entry),
    sickToday: PEOPLE.filter(([id]) => SICK.has(id)).map(entry),
    inactive: PEOPLE.filter(([id]) => INACTIVE.has(id)).map((p) => ({ ...entry(p), hasBattleToday: false })),
  };
}

/** Ein Battle zwischen zwei Personen am Tag `date`. */
export function demoChallenge(id: string, a: string, b: string, date: string, extra: Partial<Challenge> = {}): Challenge {
  const created = new Date().toISOString();
  return {
    id,
    challengerId: a,
    challengerName: nameOf(a),
    opponentId: b,
    opponentName: nameOf(b),
    status: "active",
    challengerScore: 0,
    opponentScore: 0,
    date,
    createdAt: created,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...extra,
  };
}

export function demoChallenges(): Challenge[] {
  const today = berlinDay(new Date());
  const yesterday = previousDay(today);
  const done = (id: string, a: string, b: string, sa: number, sb: number) =>
    demoChallenge(id, a, b, yesterday, {
      status: "completed",
      challengerScore: sa,
      opponentScore: sb,
      winnerId: sa === sb ? undefined : sa > sb ? a : b,
      isAutoAssigned: true,
    });
  return [
    demoChallenge("c1", "b2", "b4", today, { isAutoAssigned: true }),
    demoChallenge("c2", "b1", "b5", today, { isAutoAssigned: true }),
    demoChallenge("c3", "b7", "b6", today),
    demoChallenge("c4", "b3", DEMO_ME, today, { status: "pending" }),
    done("y1", "b2", "b8", 5, 3),
    done("y2", "b4", "b7", 2, 4),
    done("y3", "b1", "b3", 3, 3),
    done("y4", "b6", "b5", 6, 2),
  ];
}

export function demoStreaks(): StreakMap {
  return {
    [DEMO_ME]: { streak: 2, loseStreak: 0, name: nameOf(DEMO_ME) },
    b2: { streak: 3, loseStreak: 0, name: nameOf("b2") },
    b6: { streak: 2, loseStreak: 0, name: nameOf("b6") },
    b7: { streak: 1, loseStreak: 0, name: nameOf("b7") },
    b4: { streak: 0, loseStreak: 2, name: nameOf("b4") },
    b5: { streak: 0, loseStreak: 1, name: nameOf("b5") },
  };
}

export function demoTopEarners(): TopEarner[] {
  const rows: [string, number][] = [["b6", 412], ["b2", 365], ["b7", 298], ["tl", 240], ["b8", 185]];
  return rows.map(([userId, totalCommission], i) => ({ rank: i + 1, userId, name: nameOf(userId), totalCommission }));
}

/** Sales von heute: [Person, Kategorie, Typ, Provision, Uhrzeit]. */
const SALES: [string, string, string, number, string][] = [
  ["b2", "KIP", "Kabel Internet 250", 85, "09:12"],
  ["b2", "Mobile", "GigaMobil M", 60, "10:40"],
  ["b2", "GigaTV", "GigaTV Net", 45, "13:05"],
  ["b4", "Glasfaser", "Glasfaser 500", 110, "11:20"],
  ["b4", "Upsell", "Giga TV Upsell Giga Grade 3 · 80€ SG gegeben", 0, "14:02"],
  ["b1", "KIP", "Kabel Internet 100", 70, "10:05"],
  ["b5", "Mobile", "GigaMobil S", 45, "09:48"],
  ["b5", "KAS", "Kabel Anschluss", 30, "12:31"],
  ["b5", "Zubehör", "Router Upgrade", 15, "15:10"],
  ["b7", "Glasfaser", "Glasfaser 1000", 130, "10:15"],
  ["b7", "KIP", "Kabel Internet 500", 95, "12:45"],
  ["b6", "Mobile", "GigaMobil L", 75, "11:02"],
  ["b8", "KIP", "Kabel Internet 250", 85, "09:30"],
  ["b8", "Mobile", "GigaMobil M", 60, "13:55"],
  ["tl", "Glasfaser", "Glasfaser 250", 90, "10:50"],
  ["b3", "Mobile", "GigaMobil S", 45, "14:20"],
  [DEMO_ME, "KIP", "Kabel Internet 250", 85, "10:20"],
  [DEMO_ME, "Mobile", "GigaMobil M", 60, "12:10"],
];

export function demoProducts(): BattleProduct[] {
  return SALES.map(([userId, category, type, commissionEuro, time], i) => {
    const [h, m] = time.split(":").map(Number);
    const at = new Date();
    at.setHours(h, m, 0, 0);
    return { id: `p${i + 1}`, userId, category, type, commissionEuro, timestamp: at.toISOString(), isPremium: i % 5 === 0 };
  });
}
