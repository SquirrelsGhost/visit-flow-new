import { apiRequest } from "../apiClient";
import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf } from "../battle/legacyRequest";
import { loadPublicTeams } from "../register/registerApi";
import { profileTexts } from "../../texts/profileTexts";
import { DEMO_ACHIEVEMENTS, DEMO_SUBSCRIPTION, DEMO_TEAM_NAME, DEMO_XP, demoDelay, demoInvoices, writeDemoPatch } from "./profileDemoData";
import { normalizeInvoices, normalizeSubscription } from "./profileNormalize";
import type { Achievement, Invoice, ProfilePatch, SaveResult, Subscription, XpProgress } from "./profileTypes";

/**
 * Profil-Endpunkte der v1-API (/api/auth/profile, /auth/change-password, /subscriptions, /invoices).
 * Im Demo-Modus antworten Beispieldaten; Level und Erfolge gibt es live erst mit der Gamification in v2.
 */
const failed = (body: { message?: string; error?: string; success: boolean }) => messageOf(body) || profileTexts.rules.saveFailed;

export async function saveProfile(patch: ProfilePatch): Promise<SaveResult> {
  if (hasDemoSession()) {
    await demoDelay();
    writeDemoPatch(patch);
    return { ok: true };
  }
  const body = await legacyRequest("/auth/profile", json("PATCH", patch));
  return body.success ? { ok: true } : { ok: false, message: failed(body) };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<SaveResult> {
  if (hasDemoSession()) return demoDelay().then(() => ({ ok: true }));
  const body = await legacyRequest("/auth/change-password", json("PATCH", { currentPassword, newPassword }));
  return body.success ? { ok: true } : { ok: false, message: failed(body) };
}

/** Teamname wie v1 über die öffentliche Teamliste; ohne Treffer "Team <id>". */
export async function loadTeamName(teamId: string | undefined): Promise<string> {
  if (!teamId) return profileTexts.noTeam;
  if (hasDemoSession()) return DEMO_TEAM_NAME;
  const team = (await loadPublicTeams()).find((t) => t.id === teamId);
  return team?.name ?? `Team ${teamId}`;
}

export async function loadSubscription(): Promise<Subscription | null> {
  if (hasDemoSession()) return demoDelay().then(() => DEMO_SUBSCRIPTION);
  const response = await apiRequest<unknown>("/subscriptions/current");
  return response.success ? normalizeSubscription(response.data) : null;
}

/** v1 gleicht die Rechnungen beim Öffnen mit Stripe ab (POST /invoices/sync). */
export async function loadInvoices(): Promise<Invoice[]> {
  if (hasDemoSession()) return demoDelay(500).then(demoInvoices);
  const response = await apiRequest<unknown>("/invoices/sync", { method: "POST" });
  return response.success ? normalizeInvoices(response.data) : [];
}

export async function loadXp(): Promise<XpProgress | null> {
  return hasDemoSession() ? DEMO_XP : null;
}

export async function loadAchievements(): Promise<readonly Achievement[]> {
  return hasDemoSession() ? DEMO_ACHIEVEMENTS : [];
}
