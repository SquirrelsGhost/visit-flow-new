import { Types, type Connection } from "mongoose";
import type { UserDoc } from "./User.model";
import type { UserViewExtras } from "./userView";

/**
 * Ergänzungen zur Profil-Antwort aus anderen v1-Collections (nur lesend).
 * Port von `shapeUserWithSubscription` und `SubscriptionService.isTrioHeimUser` aus v1.
 */
export interface UserExtrasSource {
  forUser(user: UserDoc): Promise<UserViewExtras>;
  /** Systemschalter aus v1 `systemsettings`, fehlt er, gilt wie in v1 `true`. */
  showTeamLeiterLiveTracking(): Promise<boolean>;
}

const ACTIVE_STATES = ["active", "trialing", "past_due", "canceled"];
const isFreePlan = (planId: string) => planId.endsWith("-free") || planId.endsWith("-basic");
const mentionsTrio = (text: unknown) => typeof text === "string" && text.toLowerCase().includes("trio");

export function mongoUserExtras(db: Connection): UserExtrasSource {
  const subscriptions = db.collection<{ userId: string; planId: string; status: string; type?: string; createdAt?: Date }>("subscriptions");
  const teams = db.collection<{ name?: string }>("teams");
  const settings = db.collection<{ showTeamLeiterLiveTracking?: boolean }>("systemsettings");

  async function subscriptionStatus(user: UserDoc): Promise<string> {
    // Wie v1: nur nachsehen, wenn der Nutzer überhaupt zahlen muss
    if (!user.paymentRequired) return "none";
    const sub = await subscriptions.findOne(
      { userId: String(user._id), type: { $ne: "addon" }, status: { $in: ACTIVE_STATES } },
      { sort: { createdAt: -1 }, projection: { planId: 1, status: 1 } },
    );
    if (!sub || isFreePlan(sub.planId)) return "none";
    return sub.status || "none";
  }

  async function isTrioHeim(user: UserDoc): Promise<boolean> {
    if (mentionsTrio(user.email)) return true;
    const id = new Types.ObjectId(String(user._id));
    const team = await teams.findOne(
      { $or: [{ team_leader_id: id }, { member_ids: id }, { mentor_ids: id }], is_active: true },
      { projection: { name: 1 } },
    );
    return mentionsTrio(team?.name);
  }

  return {
    async forUser(user) {
      const [status, trio] = await Promise.all([subscriptionStatus(user), isTrioHeim(user)]);
      return { subscriptionStatus: status, isTrioHeim: trio };
    },
    async showTeamLeiterLiveTracking() {
      const doc = await settings.findOne({}, { projection: { showTeamLeiterLiveTracking: 1 } });
      return doc?.showTeamLeiterLiveTracking ?? true;
    },
  };
}
