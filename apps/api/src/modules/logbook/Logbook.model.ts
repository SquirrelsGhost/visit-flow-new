import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { SealedValue } from "../../lib/crypto/dataCipher";
import { users } from "../users/User.model";

/**
 * Fahrtenbuch: ein Datensatz je Nutzer und Monat. v1 hatte das Fahrtenbuch nur im localStorage,
 * auf dem Server gibt es nichts zu übernehmen. Der Inhalt ist immer verschlüsselt (Ziele,
 * Geschäftspartner und Uhrzeiten sind ein Bewegungsprofil); lesbar bleiben nur Nutzer, Monat
 * und Revision, damit der Abgleich ohne Entschlüsseln läuft. Mit dem Konto verschwindet alles.
 */
export const logbookMonths = pgTable(
  "logbook_months",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** yyyy-MM */
    month: text().notNull(),
    /** JSON { trips, lock }, mit seal() verschlüsselt */
    payload: jsonb().$type<SealedValue>().notNull(),
    /** Zählt bei jedem Speichern hoch; Grundlage für die Konflikterkennung zwischen Geräten. */
    rev: integer().notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.month] }),
    index("logbook_months_user_id_updated_at_idx").on(table.userId, table.updatedAt),
    check("logbook_months_month_valid", sql`${table.month} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'`),
    check("logbook_months_rev_positive", sql`${table.rev} > 0`),
  ],
);

/** Fahrzeuge und Einstellungen des Fahrtenbuchs, ein Datensatz je Nutzer. */
export const logbookProfiles = pgTable(
  "logbook_profiles",
  {
    userId: uuid()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    /** JSON { vehicles, activeVehicleId, importedV1 }, mit seal() verschlüsselt */
    payload: jsonb().$type<SealedValue>().notNull(),
    rev: integer().notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [check("logbook_profiles_rev_positive", sql`${table.rev} > 0`)],
);

export type LogbookMonthDoc = typeof logbookMonths.$inferSelect;
export type LogbookProfileDoc = typeof logbookProfiles.$inferSelect;
