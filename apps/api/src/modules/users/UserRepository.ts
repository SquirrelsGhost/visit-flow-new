import { isValidObjectId, type Model } from "mongoose";
import type { UserDoc } from "./User.model";

export interface UserRepository {
  /** Mit Passwort-Hash, nur für den Login. */
  findByEmailForLogin(email: string): Promise<UserDoc | null>;
  findById(id: string): Promise<UserDoc | null>;
  /** Hebt eine abgelaufene Admin-Sperre auf (wie v1 beim Login). */
  clearExpiredBlock(id: string): Promise<void>;
  /** Setzt die alten Fehlversuchs-Zähler von v1 zurück und merkt die letzte Aktivität. */
  markLoginSuccess(id: string, now: Date): Promise<void>;
}

export function mongoUserRepository(users: Model<UserDoc>): UserRepository {
  return {
    findByEmailForLogin: (email) => users.findOne({ email }).select("+password").lean<UserDoc>().exec(),
    findById: (id) => (isValidObjectId(id) ? users.findById(id).lean<UserDoc>().exec() : Promise.resolve(null)),
    async clearExpiredBlock(id) {
      await users.updateOne(
        { _id: id },
        { $set: { isBlocked: false, updatedAt: new Date() }, $unset: { blockReason: 1, blockedAt: 1, blockUntil: 1 } },
      );
    },
    async markLoginSuccess(id, now) {
      await users.updateOne(
        { _id: id },
        { $set: { loginAttempts: 0, lastActivity: now, updatedAt: now }, $unset: { lockedUntil: 1 } },
      );
    },
  };
}
