import { createHash } from "node:crypto";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import type { Database } from "../../config/db";
import { loginFailures } from "./LoginFailure.model";

/**
 * Brute-Force-Schutz für den Login. Ersetzt die In-Memory-Map plus JSON-Datei aus v1
 * (LoginProtectionService), die pro PM2-Instanz getrennt zählte. Hier zählen alle Instanzen
 * gemeinsam in der Datenbank. Abfragen sehen nur das Zeitfenster, alte Zeilen löscht der Aufräum-Job.
 * Gespeichert wird nur ein Hash von IP bzw. E-Mail, nie der Klartext.
 */
export const LOGIN_WINDOW_MINUTES = 15;
export const MAX_FAILURES_PER_IP = 5;
export const MAX_FAILURES_PER_EMAIL = 10;

export interface LoginThrottle {
  /** Zeitpunkt, bis zu dem gesperrt ist, oder null. */
  lockedUntil(ip: string, email: string, now: Date): Promise<Date | null>;
  recordFailure(ip: string, email: string, now: Date): Promise<void>;
  reset(ip: string, email: string): Promise<void>;
}

const keyFor = (kind: "ip" | "email", value: string) => createHash("sha256").update(`${kind}:${value}`).digest("hex");

export function pgLoginThrottle(db: Database): LoginThrottle {
  async function lockFor(key: string, limit: number, now: Date): Promise<Date | null> {
    const since = new Date(now.getTime() - LOGIN_WINDOW_MINUTES * 60_000);
    const recent = await db
      .select({ at: loginFailures.at })
      .from(loginFailures)
      .where(and(eq(loginFailures.key, key), gt(loginFailures.at, since)))
      .orderBy(desc(loginFailures.at))
      .limit(limit);
    if (recent.length < limit) return null;
    // Gesperrt, bis der älteste der letzten `limit` Fehlversuche aus dem Fenster fällt
    const oldest = recent[recent.length - 1];
    return oldest ? new Date(oldest.at.getTime() + LOGIN_WINDOW_MINUTES * 60_000) : null;
  }

  return {
    async lockedUntil(ip, email, now) {
      const [byIp, byEmail] = await Promise.all([
        lockFor(keyFor("ip", ip), MAX_FAILURES_PER_IP, now),
        lockFor(keyFor("email", email), MAX_FAILURES_PER_EMAIL, now),
      ]);
      if (!byIp) return byEmail;
      if (!byEmail) return byIp;
      return byIp > byEmail ? byIp : byEmail;
    },
    async recordFailure(ip, email, now) {
      await db.insert(loginFailures).values([
        { key: keyFor("ip", ip), at: now },
        { key: keyFor("email", email), at: now },
      ]);
    },
    async reset(ip, email) {
      await db.delete(loginFailures).where(inArray(loginFailures.key, [keyFor("ip", ip), keyFor("email", email)]));
    },
  };
}
