import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import { json, legacyRequest } from "../battle/legacyRequest";
import { demoContests } from "./contestDemoData";
import type { Contest } from "./contestTypes";

/** Meldet Änderungen an Gewinnspielen an alle Ansichten im Tab (v1 CONTESTS_UPDATED_EVENT). */
export const CONTESTS_UPDATED_EVENT = "contests-updated";
/** v1 hält die Gewinnspiele zusätzlich in localStorage "contests"; v2 liest den Cache beim Start mit. */
const CACHE_KEY = "contests";
const DEMO_KEY = "vf_contests_demo";

function readJson(storage: Storage, key: string): Contest[] | null {
  try {
    const raw = storage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Contest[]) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, contests: Contest[]): void {
  try {
    storage.setItem(key, JSON.stringify(contests));
  } catch {
    // gilt dann nur bis zum Neuladen
  }
  window.dispatchEvent(new Event(CONTESTS_UPDATED_EVENT));
}

const normalize = (raw: Contest & { _id?: string }): Contest => ({ ...raw, id: raw.id || raw._id || "" });

/** Zwischengespeicherte Gewinnspiele für den ersten Aufbau ohne Warten. */
export function cachedContests(vertical: Vertical): Contest[] {
  if (hasDemoSession()) return readJson(window.sessionStorage, DEMO_KEY) ?? demoContests(vertical);
  return readJson(window.localStorage, CACHE_KEY) ?? [];
}

/** Lädt die Gewinnspiele vom Server (v1 syncContestsCache) und legt sie in den Cache. */
export async function syncContests(vertical: Vertical): Promise<Contest[]> {
  if (hasDemoSession()) return cachedContests(vertical);
  const body = await legacyRequest("/incentives");
  if (!body.success || !Array.isArray(body.data)) return cachedContests(vertical);
  const contests = (body.data as (Contest & { _id?: string })[]).map(normalize);
  writeJson(window.localStorage, CACHE_KEY, contests);
  return contests;
}

function demoWrite(vertical: Vertical, change: (list: Contest[]) => Contest[]): boolean {
  writeJson(window.sessionStorage, DEMO_KEY, change(cachedContests(vertical)));
  return true;
}

export async function deleteContest(id: string, vertical: Vertical): Promise<boolean> {
  if (hasDemoSession()) return demoWrite(vertical, (list) => list.filter((c) => c.id !== id));
  const body = await legacyRequest(`/incentives/${id}`, json("DELETE"));
  if (body.success === false) return false;
  await syncContests(vertical);
  return true;
}

export async function saveContest(contest: Partial<Contest>, vertical: Vertical): Promise<boolean> {
  if (hasDemoSession()) {
    return demoWrite(vertical, (list) =>
      contest.id && list.some((c) => c.id === contest.id)
        ? list.map((c) => (c.id === contest.id ? { ...c, ...contest } : c))
        : [...list, { ...(contest as Contest), id: `demo-${Date.now()}`, createdAt: new Date().toISOString() }],
    );
  }
  const body = contest.id ? await legacyRequest(`/incentives/${contest.id}`, json("PUT", contest)) : await legacyRequest("/incentives", json("POST", contest));
  if (body.success === false) return false;
  await syncContests(vertical);
  return true;
}
