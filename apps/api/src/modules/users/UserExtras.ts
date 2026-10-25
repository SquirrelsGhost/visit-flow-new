import { and, desc, eq, exists, inArray, or } from "drizzle-orm";
import type { Database } from "../../config/db";
import { subscriptions } from "../billing/Subscription.model";
import { systemSettings } from "../settings/SystemSettings.model";
import { teamMentors, teams } from "../teams/Team.model";
import type { UserRecord } from "./User.model";
import type { UserViewExtras } from "./userView";

/**
 * Ergänzungen zur Profil-Antwort aus Abos, Teams und Systemschaltern (nur lesend).
 * Port von `shapeUserWithSubscription` und `SubscriptionService.isTrioHeimUser` aus v1.
 */
export interface UserExtrasSource {
  forUser(user: UserRecord): Promise<UserViewExtras>;
  /** Systemschalter, fehlt die Zeile, gilt wie in v1 `true`. */
  showTeamLeiterLiveTracking(): Promise<boolean>;
}

const ACTIVE_STATES = ["active", "trialing", "past_due", "canceled"];
const isFreePlan = (planId: string) => planId.endsWith("-free") || planId.endsWith("-basic");
const mentionsTrio = (text: unknown) => typeof text === "string" && text.toLowerCase().includes("trio");

export function pgUserExtras(db: Database): UserExtrasSource {
  async function subscriptionStatus(user: UserRecord): Promise<string> {
    // Wie v1: nur nachsehen, wenn der Nutzer überhaupt zahlen muss
    if (!user.paymentRequired) return "none";
    const [sub] = await db
      .select({ planId: subscriptions.planId, status: subscriptions.status })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.isAddon, false),
        inArray(subscriptions.status, ACTIVE_STATES),
      ))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    if (!sub || isFreePlan(sub.planId)) return "none";
    return sub.status || "none";
  }

  async function isTrioHeim(user: UserRecord): Promise<boolean> {
    if (mentionsTrio(user.email)) return true;
    const isMentor = db.select().from(teamMentors).where(and(eq(teamMentors.teamId, teams.id), eq(teamMentors.userId, user.id)));
    const ownTeam = user.teamId ? [eq(teams.id, user.teamId)] : [];
    const [team] = await db
      .select({ name: teams.name })
      .from(teams)
      .where(and(eq(teams.isActive, true), or(eq(teams.teamLeaderId, user.id), exists(isMentor), ...ownTeam)))
      .limit(1);
    return mentionsTrio(team?.name);
  }

  return {
    async forUser(user) {
      const [status, trio] = await Promise.all([subscriptionStatus(user), isTrioHeim(user)]);
      return { subscriptionStatus: status, isTrioHeim: trio };
    },
    async showTeamLeiterLiveTracking() {
      const [row] = await db.select({ value: systemSettings.showTeamLeiterLiveTracking }).from(systemSettings).limit(1);
      return row?.value ?? true;
    },
  };
}
