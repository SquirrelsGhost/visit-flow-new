import { createHash } from "node:crypto";
import { Schema, model, type Model } from "mongoose";

/**
 * Brute-Force-Schutz für den Login. Ersetzt die In-Memory-Map plus JSON-Datei aus v1
 * (LoginProtectionService), die pro PM2-Instanz getrennt zählte. Hier zählen alle Instanzen
 * gemeinsam in MongoDB, und ein TTL-Index räumt Fehlversuche nach dem Zeitfenster selbst weg.
 * Gespeichert wird nur ein Hash von IP bzw. E-Mail, nie der Klartext.
 */
export const LOGIN_WINDOW_MINUTES = 15;
export const MAX_FAILURES_PER_IP = 5;
export const MAX_FAILURES_PER_EMAIL = 10;

interface LoginFailureDoc {
  key: string;
  at: Date;
}

const loginFailureSchema = new Schema<LoginFailureDoc>(
  { key: { type: String, required: true, index: true }, at: { type: Date, required: true } },
  { collection: "login_failures", versionKey: false },
);
loginFailureSchema.index({ at: 1 }, { expireAfterSeconds: LOGIN_WINDOW_MINUTES * 60 });

export function loginFailureModel(): Model<LoginFailureDoc> {
  return model<LoginFailureDoc>("LoginFailure", loginFailureSchema);
}

export interface LoginThrottle {
  /** Zeitpunkt, bis zu dem gesperrt ist, oder null. */
  lockedUntil(ip: string, email: string, now: Date): Promise<Date | null>;
  recordFailure(ip: string, email: string, now: Date): Promise<void>;
  reset(ip: string, email: string): Promise<void>;
}

const keyFor = (kind: "ip" | "email", value: string) => createHash("sha256").update(`${kind}:${value}`).digest("hex");

export function mongoLoginThrottle(failures: Model<LoginFailureDoc>): LoginThrottle {
  async function lockFor(key: string, limit: number, now: Date): Promise<Date | null> {
    const since = new Date(now.getTime() - LOGIN_WINDOW_MINUTES * 60_000);
    const recent = await failures.find({ key, at: { $gt: since } }, { at: 1 }).sort({ at: -1 }).limit(limit).lean().exec();
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
      await failures.insertMany([
        { key: keyFor("ip", ip), at: now },
        { key: keyFor("email", email), at: now },
      ]);
    },
    async reset(ip, email) {
      await failures.deleteMany({ key: { $in: [keyFor("ip", ip), keyFor("email", email)] } });
    },
  };
}
