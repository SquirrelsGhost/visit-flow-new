import { refreshTokens } from "../../../modules/auth/RefreshToken.model";
import { subscriptions } from "../../../modules/billing/Subscription.model";
import { systemSettings } from "../../../modules/settings/SystemSettings.model";
import { idOf, inBatches, objectIdDate, toDate, toText } from "../convert";
import type { StepContext } from "../context";

/** Schritt 3: Abos (nur was das Profil braucht). */
export async function migrateSubscriptions(ctx: StepContext): Promise<void> {
  for await (const batch of inBatches(ctx.source.read("subscriptions"))) {
    const rows: (typeof subscriptions.$inferInsert)[] = [];
    for (const doc of batch) {
      const id = idOf(doc._id);
      const userId = idOf(doc.userId);
      const planId = toText(doc.planId);
      const status = toText(doc.status);
      if (!id || !planId || !status) continue;
      if (!userId || !ctx.userIds.has(userId)) {
        ctx.report.warn("Abo ohne bekannten Nutzer übersprungen", id);
        continue;
      }
      rows.push({ id, userId, planId, status, type: toText(doc.type), createdAt: toDate(doc.createdAt) ?? objectIdDate(id) ?? ctx.now });
    }
    if (rows.length) await ctx.tx.insert(subscriptions).values(rows);
    ctx.report.count("subscriptions", rows.length);
  }
}

/** Schritt 4: Systemschalter (v1 hat genau ein Dokument). */
export async function migrateSettings(ctx: StepContext): Promise<void> {
  for await (const doc of ctx.source.read("systemsettings")) {
    await ctx.tx.insert(systemSettings).values({ showTeamLeiterLiveTracking: doc.showTeamLeiterLiveTracking !== false });
    ctx.report.count("system_settings");
    return;
  }
}

/**
 * Schritt 5: laufende Sitzungen. Der Hash ist derselbe wie in v1, deshalb bleibt jeder, der am
 * Umstiegstag angemeldet ist, mit seinem `vf_refresh`-Cookie angemeldet.
 */
export async function migrateSessions(ctx: StepContext): Promise<void> {
  const active = ctx.source.read("refresh_tokens", { isRevoked: false, expiresAt: { $gt: ctx.now } });
  for await (const batch of inBatches(active)) {
    const rows: (typeof refreshTokens.$inferInsert)[] = [];
    for (const doc of batch) {
      const userId = idOf(doc.userId);
      const tokenHash = toText(doc.tokenHash);
      const familyId = toText(doc.familyId);
      const expiresAt = toDate(doc.expiresAt);
      // Der Filter oben spart nur Datenverkehr, geprüft wird hier
      if (doc.isRevoked === true || !expiresAt || expiresAt <= ctx.now || !tokenHash || !familyId) continue;
      if (!userId || !ctx.userIds.has(userId)) continue;
      rows.push({ tokenHash, userId, familyId, createdAt: toDate(doc.createdAt) ?? ctx.now, expiresAt });
    }
    if (rows.length) await ctx.tx.insert(refreshTokens).values(rows).onConflictDoNothing();
    ctx.report.count("refresh_tokens", rows.length);
  }
}
