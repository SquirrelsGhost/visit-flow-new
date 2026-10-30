import { sealJson, unsealJson } from "@/lib/dataCipher";
import { env } from "@/lib/env";
import { kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import type { Permission } from "@/types/permissions.types";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { StoredRecord } from "./RecordStore";
import { createStore } from "./storeFactory";

export interface VfUserProfilePii {
  phone?: string;
  vpkn?: string;
  secondaryEmail?: string;
  address?: string;
  iban?: string;
  contractStart?: string;
  referredBy?: string;
  avatarUrl?: string;
  extra?: Record<string, unknown>;
}

export interface VfUserRecord extends StoredRecord {
  id: string;
  emailCanonical: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: string;
  roles: string[];
  permissions: Permission[];
  teamId?: string;
  teamName?: string;
  structureId?: string;
  mentorId?: string;
  partnerStatus?: string;
  sitzungsVersion: number;
  gesperrtAm?: string;
  sperrGrund?: string;
  identStatus?: "pending" | "verified" | "rejected";
  contractSignedAt?: string;
  profilePii?: VfUserProfilePii;
  receivedAt: string;
  updatedAt: string;
}

interface PgUserRow {
  id: string;
  email_canonical: string;
  email_display: string;
  password_hash: string | null;
  name: string;
  role: string;
  roles_json: string[];
  permissions_json: Permission[];
  team_id: string | null;
  team_name: string | null;
  structure_id: string | null;
  mentor_id: string | null;
  partner_status: string | null;
  sitzungs_version: number;
  banned_at: string | null;
  ban_reason: string | null;
  ident_status: string | null;
  contract_signed_at: string | null;
  encrypted_profile: string | null;
  received_at: string;
  updated_at: string;
}

function rowToUser(row: PgUserRow): VfUserRecord {
  return {
    id: row.id,
    emailCanonical: row.email_canonical,
    email: row.email_display,
    passwordHash: row.password_hash ?? undefined,
    name: row.name,
    role: row.role,
    roles: Array.isArray(row.roles_json) ? row.roles_json : [row.role],
    permissions: Array.isArray(row.permissions_json) ? row.permissions_json : [],
    teamId: row.team_id ?? undefined,
    teamName: row.team_name ?? undefined,
    structureId: row.structure_id ?? undefined,
    mentorId: row.mentor_id ?? undefined,
    partnerStatus: row.partner_status ?? undefined,
    sitzungsVersion: Number(row.sitzungs_version) || 1,
    gesperrtAm: row.banned_at ?? undefined,
    sperrGrund: row.ban_reason ?? undefined,
    identStatus: (row.ident_status as VfUserRecord["identStatus"]) ?? "pending",
    contractSignedAt: row.contract_signed_at ?? undefined,
    profilePii: unsealJson<VfUserProfilePii>(row.encrypted_profile, env.dataKey, {}),
    receivedAt: row.received_at,
    updatedAt: row.updated_at,
  };
}

const fallbackStore = () => createStore<VfUserRecord>("users");

export const SqlUsersRepo = {
  async getById(id: string): Promise<VfUserRecord | null> {
    const key = id.toLowerCase();
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgUserRow>("SELECT * FROM vf_users WHERE LOWER(id) = $1 LIMIT 1", [key]);
      return res.rows[0] ? rowToUser(res.rows[0]) : null;
    }
    const all = await fallbackStore().list();
    return all.find((u) => u.id.toLowerCase() === key) ?? null;
  },

  async getByEmail(email: string): Promise<VfUserRecord | null> {
    const canon = kanonischeEmail(email);
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgUserRow>(
        "SELECT * FROM vf_users WHERE email_canonical = $1 OR LOWER(email_display) = $2 LIMIT 1",
        [canon, email.trim().toLowerCase()],
      );
      return res.rows[0] ? rowToUser(res.rows[0]) : null;
    }
    const all = await fallbackStore().list();
    return (
      all.find(
        (u) => u.emailCanonical === canon || u.email.toLowerCase() === email.trim().toLowerCase(),
      ) ?? null
    );
  },

  async listAll(): Promise<VfUserRecord[]> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgUserRow>("SELECT * FROM vf_users ORDER BY received_at DESC");
      return res.rows.map(rowToUser);
    }
    return fallbackStore().list();
  },

  async upsert(user: VfUserRecord): Promise<VfUserRecord> {
    const normalized: VfUserRecord = {
      ...user,
      id: user.id,
      emailCanonical: user.emailCanonical || kanonischeEmail(user.email),
      updatedAt: user.updatedAt || new Date().toISOString(),
      receivedAt: user.receivedAt || new Date().toISOString(),
    };
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const existingByEmail = await pool.query<PgUserRow>(
        "SELECT id FROM vf_users WHERE email_canonical = $1 AND LOWER(id) <> LOWER($2) LIMIT 1",
        [normalized.emailCanonical, normalized.id],
      );
      if (existingByEmail.rows[0]) {
        normalized.id = existingByEmail.rows[0].id;
      }
      const encProfile = sealJson(normalized.profilePii ?? {}, env.dataKey);
      await pool.query(
        `INSERT INTO vf_users (
          id, email_canonical, email_display, password_hash, name, role,
          roles_json, permissions_json, team_id, team_name, structure_id, mentor_id,
          partner_status, sitzungs_version, banned_at, ban_reason, ident_status,
          contract_signed_at, encrypted_profile, received_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7::jsonb, $8::jsonb, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21
        )
        ON CONFLICT (id) DO UPDATE SET
          email_canonical = EXCLUDED.email_canonical,
          email_display = EXCLUDED.email_display,
          password_hash = COALESCE(EXCLUDED.password_hash, vf_users.password_hash),
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          roles_json = EXCLUDED.roles_json,
          permissions_json = EXCLUDED.permissions_json,
          team_id = EXCLUDED.team_id,
          team_name = EXCLUDED.team_name,
          structure_id = EXCLUDED.structure_id,
          mentor_id = EXCLUDED.mentor_id,
          partner_status = EXCLUDED.partner_status,
          sitzungs_version = EXCLUDED.sitzungs_version,
          banned_at = EXCLUDED.banned_at,
          ban_reason = EXCLUDED.ban_reason,
          ident_status = EXCLUDED.ident_status,
          contract_signed_at = EXCLUDED.contract_signed_at,
          encrypted_profile = EXCLUDED.encrypted_profile,
          updated_at = EXCLUDED.updated_at`,
        [
          normalized.id,
          normalized.emailCanonical,
          normalized.email,
          normalized.passwordHash ?? null,
          normalized.name,
          normalized.role,
          JSON.stringify(normalized.roles),
          JSON.stringify(normalized.permissions),
          normalized.teamId ?? null,
          normalized.teamName ?? null,
          normalized.structureId ?? null,
          normalized.mentorId ?? null,
          normalized.partnerStatus ?? null,
          normalized.sitzungsVersion,
          normalized.gesperrtAm ?? null,
          normalized.sperrGrund ?? null,
          normalized.identStatus ?? "pending",
          normalized.contractSignedAt ?? null,
          encProfile,
          normalized.receivedAt,
          normalized.updatedAt,
        ],
      );
      return normalized;
    }
    return fallbackStore().upsert(normalized);
  },

  async removeById(id: string): Promise<boolean> {
    const key = id.toLowerCase();
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query("DELETE FROM vf_users WHERE LOWER(id) = $1", [key]);
      return (res.rowCount ?? 0) > 0;
    }
    const removed = await fallbackStore().removeWhere((u) => u.id.toLowerCase() === key);
    return removed > 0;
  },
};
