import { forbidden } from "../../lib/http/HttpError";
import type { UserRecord } from "../users/User.model";

const deDate = (date: Date) => date.toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

/** true, wenn die Admin-Sperre abgelaufen ist und aufgehoben werden soll. */
export function blockExpired(user: UserRecord, now: Date): boolean {
  return Boolean(user.isBlocked && user.blockUntil && new Date(user.blockUntil) <= now);
}

/**
 * Prüfungen nach korrektem Passwort, mit denselben Meldungen und Feldern wie v1.
 * Anders als v1 erst nach der Passwortprüfung: Sonst verrät die Sperrmeldung ohne Passwort,
 * dass das Konto existiert und warum es gesperrt ist.
 */
export function assertMayLogin(user: UserRecord, now: Date): void {
  if (user.isBlocked && !blockExpired(user, now)) {
    const until = user.blockUntil ? new Date(user.blockUntil) : null;
    const base = until ? `Ihr Account ist bis ${deDate(until)} gesperrt.` : "Ihr Account wurde permanent gesperrt.";
    const reason = user.blockReason ? ` Grund: ${user.blockReason}` : "";
    throw forbidden(`${base}${reason} Bitte kontaktieren Sie einen Administrator.`, {
      isBlocked: true,
      blockReason: user.blockReason,
      blockUntil: user.blockUntil,
    });
  }
  if (!user.isWhitelisted || user.whitelistStatus !== "approved") {
    throw forbidden("Ihr Account wartet auf Genehmigung. Bitte kontaktieren Sie einen Administrator oder Teamleiter.", {
      whitelistStatus: user.whitelistStatus ?? "pending",
    });
  }
  if (user.isActive === false) throw forbidden("Ihr Account ist deaktiviert. Bitte kontaktieren Sie einen Administrator.");
}
