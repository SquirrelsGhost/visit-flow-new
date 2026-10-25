import { forbidden } from "../../lib/http/HttpError";
import type { UserRecord } from "../users/User.model";

const deDate = (date: Date) => date.toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

type BlockFields = Pick<UserRecord, "blockedAt" | "blockedUntil">;

/** true, wenn eine zeitlich begrenzte Sperre abgelaufen ist und aufgehoben werden soll. */
export function blockExpired(user: BlockFields, now: Date): boolean {
  return Boolean(user.blockedAt && user.blockedUntil && user.blockedUntil <= now);
}

export const isBlocked = (user: BlockFields, now: Date) => user.blockedAt !== null && !blockExpired(user, now);

/**
 * Prüfungen nach korrektem Passwort, mit denselben Meldungen wie v1.
 * Anders als v1 erst nach der Passwortprüfung: Sonst verrät die Sperrmeldung ohne Passwort,
 * dass das Konto existiert und warum es gesperrt ist.
 */
export function assertMayLogin(user: UserRecord, now: Date): void {
  if (isBlocked(user, now)) {
    const base = user.blockedUntil ? `Ihr Account ist bis ${deDate(user.blockedUntil)} gesperrt.` : "Ihr Account wurde permanent gesperrt.";
    const reason = user.blockReason ? ` Grund: ${user.blockReason}` : "";
    throw forbidden(`${base}${reason} Bitte kontaktieren Sie einen Administrator.`, {
      isBlocked: true,
      blockReason: user.blockReason,
      blockUntil: user.blockedUntil,
    });
  }
  if (user.approvalStatus !== "approved") {
    throw forbidden("Ihr Account wartet auf Genehmigung. Bitte kontaktieren Sie einen Administrator oder Teamleiter.", {
      whitelistStatus: user.approvalStatus,
    });
  }
  if (!user.isActive) throw forbidden("Ihr Account ist deaktiviert. Bitte kontaktieren Sie einen Administrator.");
}
