import type { Achievement, Invoice, Subscription, XpProgress } from "./profileTypes";

const DAY = 86_400_000;
const PATCH_KEY = "vf_profile_demo";

/** Felder, die der Demo-Admin sonst nicht hat, damit jede Zeile der Profilseite etwas zeigt. */
export const DEMO_PROFILE_FIELDS: Record<string, unknown> = {
  nickname: "demoking",
  nicknameLastChangedAt: new Date(Date.now() - 10 * DAY).toISOString(),
  teamId: "team-demo",
  billingFirstName: "Demo",
  billingLastName: "Admin",
  billingStreet: "Musterstraße 12",
  billingZip: "10115",
  billingCity: "Berlin",
  billingCountry: "DE",
  vpkn: "VK10482",
  vodafoneContractStart: "2026-07-01",
  vodafoneCurrentMonth: 4,
};

export const DEMO_TEAM_NAME = "Team Berlin Mitte";
export const DEMO_XP: XpProgress = { level: 27, current: 340, next: 500 };

export const DEMO_SUBSCRIPTION: Subscription = {
  planId: "Team-Lizenz",
  status: "active",
  price: 65000,
  features: ["Karte & Laufliste", "Rechner & Assistent", "Battle & Leaderboard", "Abrechnung & Reklamationen"],
  licenses: { total: 10, used: 8 },
  renewsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
};

function monthStart(offset: number): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - offset, 1, 9).toISOString();
}

export const demoInvoices = (): Invoice[] =>
  [0, 1, 2].map((offset) => ({
    id: `demo-inv-${offset}`,
    status: offset === 0 ? "open" : "paid",
    date: monthStart(offset),
    amount: 65000,
    description: "Team-Lizenzen · 10 Plätze",
  }));

/** Ein Ausschnitt der v1-Erfolge (AchievementService) mit Beispiel-Fortschritt. */
export const DEMO_ACHIEVEMENTS: readonly Achievement[] = [
  { id: "door_opener", name: "Türöffner", description: "Besuche erfolgreich abschließen", current: 2140, target: 2500, tier: "bronze" },
  { id: "sales_talent", name: "Verkaufstalent", description: "Erfolgreiche Verkäufe abschließen", current: 212, target: 250, tier: "bronze" },
  { id: "marathon_runner", name: "Marathonläufer", description: "Besuche an einem Tag", current: 100, target: 150, tier: "silver" },
  { id: "neighborhood_king", name: "Kiez-König", description: "Besuche in einer Straße", current: 81, target: 150, tier: "silver" },
  { id: "area_coverage", name: "Flächendeckung", description: "Verschiedene Postleitzahlen", current: 31, target: 75, tier: "gold" },
  { id: "persistent", name: "Hartnäckig", description: "Wiederholte Besuche bis zum Abschluss", current: 38, target: 50 },
];

/** Änderungen der Demo bleiben bis zum Schließen des Tabs, wie die Demo-Sitzung selbst. */
export function readDemoPatch(): Record<string, unknown> {
  try {
    return JSON.parse(window.sessionStorage.getItem(PATCH_KEY) ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function writeDemoPatch(patch: Record<string, unknown>): void {
  try {
    window.sessionStorage.setItem(PATCH_KEY, JSON.stringify({ ...readDemoPatch(), ...patch }));
  } catch {
    // gilt dann nur bis zum Neuladen
  }
}

export const demoDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
