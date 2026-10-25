import { lt } from "drizzle-orm";
import { DAY_MS, olderThan, type RetentionRule } from "../../lib/db/retention";
import { AUDIT_RETENTION_DAYS, auditLogs } from "./AuditLog.model";

export const auditRetention: RetentionRule = {
  name: "audit_logs",
  purge: async (db, now) => (await db.delete(auditLogs).where(lt(auditLogs.timestamp, olderThan(now, AUDIT_RETENTION_DAYS * DAY_MS)))).rowCount ?? 0,
};
