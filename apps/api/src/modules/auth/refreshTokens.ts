import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../../config/db";
import { refreshTokens } from "./RefreshToken.model";

export const REFRESH_TOKEN_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export const hashRefreshToken = (raw: string) => createHash("sha256").update(raw).digest("hex");

export type RotateResult =
  | { ok: true; userId: string; familyId: string }
  /** `reused`: ein bereits verbrauchtes Token kam zurück, die ganze Kette wurde gesperrt. */
  | { ok: false; reason: "unknown" | "expired" | "reused" };

export interface RefreshTokenStore {
  issue(userId: string, now: Date, familyId?: string): Promise<string>;
  /** Verbraucht ein Token. Kommt ein verbrauchtes Token erneut, wird die ganze Kette gesperrt. */
  consume(raw: string, now: Date): Promise<RotateResult>;
  revoke(raw: string): Promise<void>;
  activeSessions(userId: string, now: Date): Promise<{ createdAt: Date; expiresAt: Date }[]>;
  deleteForUser(userId: string): Promise<number>;
}

export function pgRefreshTokenStore(db: Database): RefreshTokenStore {
  return {
    async issue(userId, now, familyId = randomBytes(16).toString("hex")) {
      const raw = randomBytes(64).toString("hex");
      await db.insert(refreshTokens).values({
        tokenHash: hashRefreshToken(raw),
        userId,
        createdAt: now,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_DAYS * DAY_MS),
        familyId,
      });
      return raw;
    },
    async consume(raw, now) {
      const tokenHash = hashRefreshToken(raw);
      // Atomar: Zwei gleichzeitige Refreshes mit demselben Token bekommen nicht beide eine neue Kette
      const [stored] = await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.isRevoked, false)))
        .returning({ userId: refreshTokens.userId, familyId: refreshTokens.familyId, expiresAt: refreshTokens.expiresAt });
      if (stored) {
        if (stored.expiresAt <= now) return { ok: false, reason: "expired" };
        return { ok: true, userId: stored.userId, familyId: stored.familyId };
      }
      const [revoked] = await db.select({ familyId: refreshTokens.familyId }).from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).limit(1);
      if (!revoked) return { ok: false, reason: "unknown" };
      await db.update(refreshTokens).set({ isRevoked: true }).where(eq(refreshTokens.familyId, revoked.familyId));
      return { ok: false, reason: "reused" };
    },
    async revoke(raw) {
      await db.update(refreshTokens).set({ isRevoked: true }).where(eq(refreshTokens.tokenHash, hashRefreshToken(raw)));
    },
    activeSessions: (userId, now) =>
      db
        .select({ createdAt: refreshTokens.createdAt, expiresAt: refreshTokens.expiresAt })
        .from(refreshTokens)
        .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false), gt(refreshTokens.expiresAt, now))),
    async deleteForUser(userId) {
      const deleted = await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)).returning({ id: refreshTokens.id });
      return deleted.length;
    },
  };
}
