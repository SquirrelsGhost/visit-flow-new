import type { PrivacyCleanable } from "../../lib/privacy/PrivacyCleanable";
import type { LogbookService } from "./LogbookService";

/**
 * Datenschutz-Hooks des Fahrtenbuchs. Das Buch ist die eigene Steuerunterlage des Beraters:
 * Aufbewahren muss er es selbst (§ 147 AO), deshalb liefert die Auskunft alles im Klartext
 * und die Kontolöschung löscht es vollständig.
 */
export function logbookPrivacy(service: LogbookService): PrivacyCleanable {
  return {
    privacyKey: "logbook",
    onUserExport: (userId) => service.exportUser(userId),
    async onUserDelete(userId) {
      return { action: "deleted", count: await service.deleteUser(userId) };
    },
  };
}
