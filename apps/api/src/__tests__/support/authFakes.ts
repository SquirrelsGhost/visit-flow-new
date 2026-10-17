import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import type { AuditEntry, AuditLog } from "../../modules/audit/auditLog";
import { AuthService } from "../../modules/auth/AuthService";
import { LOGIN_WINDOW_MINUTES, MAX_FAILURES_PER_IP, type LoginThrottle } from "../../modules/auth/loginThrottle";
import { hashRefreshToken, REFRESH_TOKEN_DAYS, type RefreshTokenStore } from "../../modules/auth/refreshTokens";
import type { UserExtrasSource } from "../../modules/users/UserExtras";
import type { UserDoc } from "../../modules/users/User.model";
import type { UserRepository } from "../../modules/users/UserRepository";

export const JWT_SECRET = "s".repeat(40);
export const PASSWORD = "richtig-geheim";
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

export function makeUser(overrides: Partial<UserDoc> = {}): UserDoc {
  return {
    _id: new Types.ObjectId(),
    email: "berater@example.de",
    password: PASSWORD_HASH,
    name: "Bea Berater",
    role: "berater",
    isActive: true,
    isWhitelisted: true,
    whitelistStatus: "approved",
    lastIpAddress: "203.0.113.9",
    stripeCustomerId: "cus_123",
    ...overrides,
  };
}

export function memoryUsers(rows: UserDoc[]): UserRepository {
  const byId = (id: string) => rows.find((u) => String(u._id) === id) ?? null;
  return {
    findByEmailForLogin: async (email) => rows.find((u) => u.email === email) ?? null,
    // Wie die Mongo-Variante: ohne Passwort-Hash
    findById: async (id) => {
      const found = byId(id);
      if (!found) return null;
      const copy: UserDoc = { ...found };
      delete copy.password;
      return copy;
    },
    clearExpiredBlock: async (id) => {
      const user = byId(id);
      if (user) Object.assign(user, { isBlocked: false, blockUntil: undefined, blockReason: undefined });
    },
    markLoginSuccess: async (id, now) => {
      const user = byId(id);
      if (user) Object.assign(user, { loginAttempts: 0, lastActivity: now });
    },
  };
}

interface StoredToken {
  hash: string;
  userId: string;
  familyId: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
}

export function memoryTokens(): RefreshTokenStore & { rows: StoredToken[] } {
  const rows: StoredToken[] = [];
  return {
    rows,
    async issue(userId, now, familyId = randomBytes(8).toString("hex")) {
      const raw = randomBytes(16).toString("hex");
      const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_DAYS * 86_400_000);
      rows.push({ hash: hashRefreshToken(raw), userId, familyId, createdAt: now, expiresAt, revoked: false });
      return raw;
    },
    async consume(raw, now) {
      const row = rows.find((r) => r.hash === hashRefreshToken(raw));
      if (!row) return { ok: false, reason: "unknown" };
      if (row.revoked) {
        rows.filter((r) => r.familyId === row.familyId).forEach((r) => (r.revoked = true));
        return { ok: false, reason: "reused" };
      }
      row.revoked = true;
      if (row.expiresAt <= now) return { ok: false, reason: "expired" };
      return { ok: true, userId: row.userId, familyId: row.familyId };
    },
    async revoke(raw) {
      rows.filter((r) => r.hash === hashRefreshToken(raw)).forEach((r) => (r.revoked = true));
    },
    async activeSessions(userId, now) {
      return rows.filter((r) => r.userId === userId && !r.revoked && r.expiresAt > now).map(({ createdAt, expiresAt }) => ({ createdAt, expiresAt }));
    },
    async deleteForUser(userId) {
      const before = rows.length;
      rows.splice(0, rows.length, ...rows.filter((r) => r.userId !== userId));
      return before - rows.length;
    },
  };
}

/** Vereinfachte Drosselung: nur pro IP, gleiche Grenze wie die echte. */
export function memoryThrottle(): LoginThrottle & { failures: Map<string, Date[]> } {
  const failures = new Map<string, Date[]>();
  return {
    failures,
    async lockedUntil(ip, _email, now) {
      const recent = (failures.get(ip) ?? []).filter((at) => now.getTime() - at.getTime() < LOGIN_WINDOW_MINUTES * 60_000);
      const oldest = recent[0];
      return recent.length >= MAX_FAILURES_PER_IP && oldest ? new Date(oldest.getTime() + LOGIN_WINDOW_MINUTES * 60_000) : null;
    },
    async recordFailure(ip, _email, now) {
      failures.set(ip, [...(failures.get(ip) ?? []), now]);
    },
    async reset(ip) {
      failures.delete(ip);
    },
  };
}

export function memoryAudit(): AuditLog & { entries: AuditEntry[] } {
  const entries: AuditEntry[] = [];
  return { entries, security: async (entry) => void entries.push(entry) };
}

export const fakeExtras: UserExtrasSource = {
  forUser: async () => ({ subscriptionStatus: "none", isTrioHeim: false }),
  showTeamLeiterLiveTracking: async () => true,
};

export function makeAuth(users: UserDoc[], now?: () => Date) {
  const deps = { users: memoryUsers(users), extras: fakeExtras, tokens: memoryTokens(), throttle: memoryThrottle(), audit: memoryAudit() };
  return { ...deps, service: new AuthService({ ...deps, jwtSecret: JWT_SECRET, now }) };
}
