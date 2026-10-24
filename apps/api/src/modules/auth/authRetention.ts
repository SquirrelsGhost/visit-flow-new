import { lt } from "drizzle-orm";
import { olderThan, type RetentionRule } from "../../lib/db/retention";
import { LOGIN_WINDOW_MINUTES } from "./loginThrottle";
import { loginFailures } from "./LoginFailure.model";
import { refreshTokens } from "./RefreshToken.model";

/** Fehlversuche nach dem Zeitfenster, Refresh-Tokens nach Ablauf (wie die TTL-Indizes in v1). */
export const authRetention: RetentionRule[] = [
  {
    name: "login_failures",
    purge: async (db, now) => (await db.delete(loginFailures).where(lt(loginFailures.at, olderThan(now, LOGIN_WINDOW_MINUTES * 60_000)))).rowCount ?? 0,
  },
  {
    name: "refresh_tokens",
    purge: async (db, now) => (await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now))).rowCount ?? 0,
  },
];
