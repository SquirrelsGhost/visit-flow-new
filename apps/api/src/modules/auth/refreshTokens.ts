import { createHash, randomBytes } from "node:crypto";
import { Types, type Model } from "mongoose";
import type { RefreshTokenDoc } from "./RefreshToken.model";

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

export function mongoRefreshTokenStore(tokens: Model<RefreshTokenDoc>): RefreshTokenStore {
  return {
    async issue(userId, now, familyId = randomBytes(16).toString("hex")) {
      const raw = randomBytes(64).toString("hex");
      await tokens.create({
        tokenHash: hashRefreshToken(raw),
        userId: new Types.ObjectId(userId),
        createdAt: now,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_DAYS * DAY_MS),
        familyId,
        isRevoked: false,
      });
      return raw;
    },
    async consume(raw, now) {
      // Atomar: Zwei gleichzeitige Refreshes mit demselben Token bekommen nicht beide eine neue Kette
      const stored = await tokens
        .findOneAndUpdate({ tokenHash: hashRefreshToken(raw), isRevoked: false }, { $set: { isRevoked: true } })
        .lean<RefreshTokenDoc>()
        .exec();
      if (stored) {
        if (stored.expiresAt <= now) return { ok: false, reason: "expired" };
        return { ok: true, userId: String(stored.userId), familyId: stored.familyId };
      }
      const revoked = await tokens.findOne({ tokenHash: hashRefreshToken(raw) }).lean<RefreshTokenDoc>().exec();
      if (!revoked) return { ok: false, reason: "unknown" };
      await tokens.updateMany({ familyId: revoked.familyId }, { $set: { isRevoked: true } });
      return { ok: false, reason: "reused" };
    },
    async revoke(raw) {
      await tokens.updateOne({ tokenHash: hashRefreshToken(raw) }, { $set: { isRevoked: true } });
    },
    async activeSessions(userId, now) {
      const rows = await tokens
        .find({ userId: new Types.ObjectId(userId), isRevoked: false, expiresAt: { $gt: now } }, { createdAt: 1, expiresAt: 1, _id: 0 })
        .lean<{ createdAt: Date; expiresAt: Date }[]>()
        .exec();
      return rows;
    },
    async deleteForUser(userId) {
      const result = await tokens.deleteMany({ userId: new Types.ObjectId(userId) });
      return result.deletedCount;
    },
  };
}
