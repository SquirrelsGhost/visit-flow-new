import type { PrivacyCleanable } from "../../lib/privacy/PrivacyCleanable";
import type { CoachMemoryRepository } from "./CoachMemoryRepository";
import type { CopilotLogRepository } from "./CopilotLogRepository";

const EXPORT_LIMIT = 10_000;

/**
 * Datenschutz-Hooks von Enes: Gedächtnis (180 Tage TTL) und Gesprächsprotokoll (90 Tage TTL).
 * Beides gehört allein dem Berater und wird bei Löschung des Kontos sofort entfernt.
 */
export function copilotPrivacy(memories: CoachMemoryRepository, logs: CopilotLogRepository): PrivacyCleanable {
  return {
    privacyKey: "copilot",
    async onUserExport(userId) {
      return { memories: await memories.list(userId, EXPORT_LIMIT), conversations: await logs.exportForUser(userId) };
    },
    async onUserDelete(userId) {
      const count = (await memories.removeAll(userId)) + (await logs.deleteForUser(userId));
      return { action: "deleted", count };
    },
  };
}
