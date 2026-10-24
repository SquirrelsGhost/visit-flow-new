import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { ROLES } from "@visit-flow/shared/roles";
import { sqlList } from "../../lib/db/sqlList";
import { teams } from "../teams/Team.model";

export const WHITELIST_STATES = ["pending", "approved", "rejected"] as const;

/**
 * Nutzer. Die ID ist die ObjectId aus v1 als Text (neue Nutzer bekommen dasselbe Format, siehe
 * `newObjectId`), damit Access-Tokens und Refresh-Cookies den Umzug überleben.
 *
 * `profile` hält vorübergehend die v1-Profilfelder, die noch kein v2-Modul besitzt (Tagesbericht,
 * Rechnungsadresse, Social-Links …). Wird ein Modul portiert, zieht es seine Felder in echte
 * Spalten oder eigene Tabellen um, und `profile` schrumpft. Neue Felder kommen nie dort hinein.
 */
export const users = pgTable(
  "users",
  {
    id: text().primaryKey(),
    /** Altes Feld `id` aus v1, über das manche Visit-Daten Nutzer referenzieren. */
    legacyId: text().unique(),
    email: text().notNull().unique(),
    passwordHash: text(),
    name: text().notNull(),
    role: text({ enum: ROLES }).notNull().default("berater"),
    roles: text({ enum: ROLES }).array().notNull().default(sql`'{}'::text[]`),
    isActive: boolean().notNull().default(true),
    isBlocked: boolean().notNull().default(false),
    blockedAt: timestamp({ withTimezone: true }),
    blockUntil: timestamp({ withTimezone: true }),
    blockReason: text(),
    isWhitelisted: boolean().notNull().default(false),
    whitelistStatus: text({ enum: WHITELIST_STATES }),
    teamId: text().references((): AnyPgColumn => teams.id, { onDelete: "set null" }),
    strukturleiterId: text().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    mentorId: text().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    paymentRequired: boolean().notNull().default(false),
    giftedUntil: timestamp({ withTimezone: true }),
    vodafoneContractStart: timestamp({ withTimezone: true }),
    loginAttempts: integer().notNull().default(0),
    lockedUntil: timestamp({ withTimezone: true }),
    lastActivity: timestamp({ withTimezone: true }),
    profile: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("users_email_lowercase", sql`${table.email} = lower(${table.email})`),
    check("users_role_valid", sql`${table.role} in (${sqlList(ROLES)})`),
    check("users_roles_valid", sql`${table.roles} <@ array[${sqlList(ROLES)}]::text[]`),
    check("users_whitelist_status_valid", sql`${table.whitelistStatus} in (${sqlList(WHITELIST_STATES)})`),
    index("users_team_id_idx").on(table.teamId),
    index("users_strukturleiter_id_idx").on(table.strukturleiterId),
    index("users_mentor_id_idx").on(table.mentorId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
/** Nutzer, wie die Services ihn sehen. Der Passwort-Hash ist nur beim Login dabei. */
export type UserRecord = Omit<UserRow, "passwordHash"> & { passwordHash?: string | null };
