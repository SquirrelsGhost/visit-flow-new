import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import { demoDelay } from "../battle/battleDemoStore";
import { legacyRequest } from "../battle/legacyRequest";
import { demoPerformance } from "./performanceDemo";
import { normalizeHistory, type PerformanceDay, type Period } from "./teamPerformance";

/**
 * Verlauf über die v1-API (GET /teams/:id/performance-history). Ohne Team ("none") liefert v1 die eigenen
 * Mentees plus einen selbst. Die Sparte geht mit; v1 zählt noch alle Sparten, v2 kann danach filtern.
 * Geladen wird der doppelte Zeitraum für den Vergleich mit davor.
 */
export async function loadPerformance(teamId: string | undefined, period: Period, vertical: Vertical): Promise<PerformanceDay[] | null> {
  if (hasDemoSession()) {
    await demoDelay(320);
    return demoPerformance(period * 2, vertical);
  }
  const id = encodeURIComponent(teamId || "none");
  const body = await legacyRequest(`/teams/${id}/performance-history?period=${period * 2}&vertical=${vertical}`);
  return body.success ? normalizeHistory(body.data) : null;
}
