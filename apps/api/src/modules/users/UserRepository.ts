import { eq, getTableColumns } from "drizzle-orm";
import type { Database } from "../../config/db";
import { isUuid } from "../../lib/db/ids";
import { users, type UserRecord } from "./User.model";

export interface UserRepository {
  /** Mit Passwort-Hash, nur für den Login. */
  findByEmailForLogin(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  /** Hebt eine abgelaufene Admin-Sperre auf (wie v1 beim Login). */
  clearExpiredBlock(id: string): Promise<void>;
  /** Merkt die letzte Aktivität. */
  markLoginSuccess(id: string, now: Date): Promise<void>;
}

// Alle Spalten außer dem Passwort-Hash
const { passwordHash, ...publicColumns } = getTableColumns(users);

export function pgUserRepository(db: Database): UserRepository {
  return {
    async findByEmailForLogin(email) {
      const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      return row ?? null;
    },
    async findById(id) {
      if (!isUuid(id)) return null;
      const [row] = await db.select(publicColumns).from(users).where(eq(users.id, id)).limit(1);
      return row ?? null;
    },
    async clearExpiredBlock(id) {
      await db
        .update(users)
        .set({ blockedAt: null, blockedUntil: null, blockReason: null, updatedAt: new Date() })
        .where(eq(users.id, id));
    },
    async markLoginSuccess(id, now) {
      await db.update(users).set({ lastActivityAt: now, updatedAt: now }).where(eq(users.id, id));
    },
  };
}
