import { lt } from "drizzle-orm";
import { DAY_MS, olderThan, type RetentionRule } from "../../lib/db/retention";
import { consentLogs } from "./ConsentLog.model";

/** Nachweise werden nach CONSENT_LOG_DAYS gelöscht (Standard 3 Jahre). */
export function consentRetention(retentionDays: number): RetentionRule {
  return {
    name: "consent_logs",
    purge: async (db, now) => (await db.delete(consentLogs).where(lt(consentLogs.receivedAt, olderThan(now, retentionDays * DAY_MS)))).rowCount ?? 0,
  };
}
