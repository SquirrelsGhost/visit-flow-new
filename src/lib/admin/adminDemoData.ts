import type { Vertical } from "../battle/battleCategories";
import { applyDemoPatches } from "../overview/memberApi";
import { DEMO_TEAM_ID, demoActivity } from "../overview/teamDemoData";
import type { TeamProduct, TeamUser } from "../overview/teamTypes";
import { DEMO_STRENGTH, demoDirectory } from "../teams/orgDemoData";
import type { AdminActivity, AdminProduct, AdminRevenue, AdminTasks, SystemFlags } from "./adminTypes";

/** Beispielzahlen des Admin-Dashboards: dieselben drei Teams wie auf der Seite Meine Teams. */
const FLAGS_KEY = "vf_admin_flags_demo";
const EURO: Record<Vertical, number> = { telco: 90, energy: 45, solar: 80 };
/** Energie und Lead verkaufen in der Demo nur einzelne Personen. */
const SIDE_LINE: Record<Exclude<Vertical, "telco">, ReadonlySet<string>> = {
  energy: new Set(["b2", "b8", "n2", "s2"]),
  solar: new Set(["b1", "n4", "s3"]),
};

const DAY = 24 * 60 * 60 * 1000;

/** Jeder neunte Auftrag storniert, ältere ab 14 Tagen meist abgeschlossen; so sieht die Quote echt aus. */
function toAdmin(products: readonly TeamProduct[], vertical: Vertical, now: number): AdminProduct[] {
  return products.map((p, i) => {
    const old = now - new Date(p.timestamp).getTime() >= 14 * DAY;
    const notes = i % 9 === 4 ? "[STORNIERT]" : old && i % 3 !== 0 ? "[ABGESCHLOSSEN]" : undefined;
    return { doorId: p.id, userId: p.userId, category: p.category, type: p.category, timestamp: p.timestamp, commissionEuro: EURO[vertical], notes };
  });
}

function activityFor(users: readonly TeamUser[], vertical: Vertical) {
  const own = users.filter((u) => u.teamId === DEMO_TEAM_ID);
  const others = users.filter((u) => u.teamId !== DEMO_TEAM_ID);
  if (vertical === "telco") {
    const a = demoActivity(own, vertical);
    const b = demoActivity(others, vertical, (id) => DEMO_STRENGTH[id] ?? 1);
    return { products: [...a.products, ...b.products], doors: [...a.doors, ...b.doors] };
  }
  const line = SIDE_LINE[vertical];
  return demoActivity(users, vertical, (id) => (line.has(id) ? 1 : 0));
}

export function demoActivityAll(): AdminActivity {
  const users = applyDemoPatches(demoDirectory().users);
  const now = Date.now();
  const verticals: Vertical[] = ["telco", "energy", "solar"];
  const parts = verticals.map((v) => ({ v, ...activityFor(users, v) }));
  return {
    products: parts.flatMap((part) => toAdmin(part.products, part.v, now)),
    doors: (parts[0]?.doors ?? []).map((d) => ({ userId: d.userId, timestamp: d.timestamp, status: d.status })),
  };
}

export const demoRevenue = (): AdminRevenue => ({ mrr: 1755, activeSubscriptions: 3, licenses: 27, breached: 0, canceled: 1, lostMrr: 325 });

export const demoTasks = (): AdminTasks => ({ whitelist: 2, partners: 1, payments: 0 });

const DEFAULT_FLAGS: SystemFlags = { maintenanceMode: false, allowRegistration: true, bypassCompanyEmailRequirement: false };

export function demoFlags(): SystemFlags {
  try {
    const raw = window.sessionStorage.getItem(FLAGS_KEY);
    return raw ? { ...DEFAULT_FLAGS, ...(JSON.parse(raw) as Partial<SystemFlags>) } : DEFAULT_FLAGS;
  } catch {
    return DEFAULT_FLAGS;
  }
}

export function saveDemoFlags(patch: Partial<SystemFlags>): boolean {
  try {
    window.sessionStorage.setItem(FLAGS_KEY, JSON.stringify({ ...demoFlags(), ...patch }));
    return true;
  } catch {
    return false;
  }
}
