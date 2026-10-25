import { sql } from "drizzle-orm";
import { boolean, check, date, index, pgEnum, pgTable, text, timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { ROLES } from "@visit-flow/shared/roles";
import { newId } from "../../lib/db/ids";
import { teams } from "../teams/Team.model";

export const APPROVAL_STATES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATES)[number];

export const userRole = pgEnum("user_role", ROLES);
/** Freigabe durch Admin oder Teamleiter. Ersetzt `isWhitelisted` + `whitelistStatus` aus v1. */
export const approvalStatus = pgEnum("approval_status", APPROVAL_STATES);

const at = () => timestamp({ withTimezone: true });

/**
 * Konto und Stammdaten eines Nutzers. Hier steht nur, was zum Konto gehört. Fachliche Felder
 * (Tagesstatus, Tagesbericht, Rechnungsadresse, Pins, Battle …) bekommt das jeweilige Modul in
 * eigenen Tabellen, sobald es portiert ist.
 */
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    email: text().notNull().unique(),
    passwordHash: text(),
    name: text().notNull(),
    nickname: text(),
    nicknameChangedAt: at(),
    phone: text(),
    profilePictureUrl: text(),
    role: userRole().notNull().default("berater"),
    /** Zusätzliche Rollen neben der Hauptrolle, z. B. ein Berater, der auch Mentor ist. */
    extraRoles: userRole().array().notNull().default(sql`'{}'`),
    approvalStatus: approvalStatus().notNull().default("pending"),
    /** false = vom Admin deaktiviert. */
    isActive: boolean().notNull().default(true),
    /** Gesetzt = gesperrt; ohne `blockedUntil` dauerhaft. */
    blockedAt: at(),
    blockedUntil: at(),
    blockReason: text(),
    teamId: uuid().references((): AnyPgColumn => teams.id, { onDelete: "set null" }),
    mentorId: uuid().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    strukturleiterId: uuid().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    vodafoneContractStart: date({ mode: "date" }),
    paymentRequired: boolean().notNull().default(false),
    giftedUntil: at(),
    emailVerifiedAt: at(),
    termsAcceptedVersion: text(),
    termsAcceptedAt: at(),
    isCompanyAccount: boolean().notNull().default(false),
    companyName: text(),
    verifiedCompanyEmail: text(),
    whatsappNumber: text(),
    instagramUrl: text(),
    tiktokUrl: text(),
    facebookUrl: text(),
    referralCode: text().unique(),
    referredById: uuid().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    lastActivityAt: at(),
    createdAt: at().notNull().defaultNow(),
    updatedAt: at().notNull().defaultNow(),
  },
  (table) => [
    check("users_email_lowercase", sql`${table.email} = lower(${table.email})`),
    check("users_block_until_needs_block", sql`${table.blockedUntil} is null or ${table.blockedAt} is not null`),
    index("users_team_id_idx").on(table.teamId),
    index("users_mentor_id_idx").on(table.mentorId),
    index("users_strukturleiter_id_idx").on(table.strukturleiterId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
/** Nutzer, wie die Services ihn sehen. Der Passwort-Hash ist nur beim Login dabei. */
export type UserRecord = Omit<UserRow, "passwordHash"> & { passwordHash?: string | null };
