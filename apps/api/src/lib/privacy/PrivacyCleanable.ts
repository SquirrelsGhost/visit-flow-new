/**
 * Jeder Service, der personenbezogene Daten speichert, meldet sich hier an und sagt,
 * was bei Auskunft (Art. 15/20 DSGVO) und Löschung (Art. 17 DSGVO) mit seinen Daten passiert.
 * Die Export- und Lösch-Endpunkte rufen nur noch diese Hooks auf (Phase 5) und müssen
 * nicht jedes Modul einzeln kennen.
 */

/** Was beim Löschen eines Kontos mit den Daten passiert. */
export type DeletionOutcome =
  /** Sofort und vollständig gelöscht. */
  | { action: "deleted"; count: number }
  /** Personenbezug entfernt, Datensatz bleibt (z. B. Visits gehören dem Unternehmen, userId wird "deleted-user"). */
  | { action: "anonymized"; count: number }
  /** Wegen gesetzlicher Frist behalten (z. B. § 147 AO), mit Datum, ab dem gelöscht oder anonymisiert wird. */
  | { action: "retained"; count: number; until: Date; reason: string };

export interface PrivacyCleanable {
  /** Eindeutiger Name, erscheint im Export und im Lösch-Protokoll, z. B. "visits". */
  readonly privacyKey: string;
  /** Alle Daten dieses Moduls zu einem Nutzer, maschinenlesbar (Art. 20). */
  onUserExport(userId: string): Promise<unknown>;
  /** Löscht, anonymisiert oder behält die Daten dieses Moduls zu einem Nutzer. */
  onUserDelete(userId: string): Promise<DeletionOutcome>;
}
