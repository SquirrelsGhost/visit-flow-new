import { lt } from "drizzle-orm";
import { DAY_MS, olderThan, type RetentionRule } from "../../lib/db/retention";
import { coachMemories } from "./CoachMemory.model";
import { copilotLogs } from "./CopilotLog.model";

/** Erinnerungen laufen über expiresAt ab (COPILOT_MEMORY_DAYS), das Protokoll nach COPILOT_LOG_DAYS. */
export function copilotRetention(logDays: number): RetentionRule[] {
  return [
    {
      name: "coach_memories",
      purge: async (db, now) => (await db.delete(coachMemories).where(lt(coachMemories.expiresAt, now))).rowCount ?? 0,
    },
    {
      name: "copilot_logs",
      purge: async (db, now) => (await db.delete(copilotLogs).where(lt(copilotLogs.createdAt, olderThan(now, logDays * DAY_MS)))).rowCount ?? 0,
    },
  ];
}
