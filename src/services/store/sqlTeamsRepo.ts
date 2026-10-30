import { sealJson, unsealJson } from "@/lib/dataCipher";
import { env } from "@/lib/env";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { StoredRecord } from "./RecordStore";
import { createStore } from "./storeFactory";

export interface VfTeamRecord extends StoredRecord {
  id: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  structureName?: string;
  parentTeamId?: string;
  region?: string;
  licenseLimit: number;
  memberIds?: string[];
  extra?: Record<string, unknown>;
  receivedAt: string;
  updatedAt: string;
}

interface PgTeamRow {
  id: string;
  name: string;
  leader_id: string | null;
  leader_name: string | null;
  structure_name: string | null;
  parent_team_id: string | null;
  region: string | null;
  license_limit: number;
  payload_encrypted: string;
  received_at: string;
  updated_at: string;
}

function rowToTeam(row: PgTeamRow): VfTeamRecord {
  const unsealed = unsealJson<{ memberIds?: string[]; extra?: Record<string, unknown> }>(
    row.payload_encrypted,
    env.dataKey,
    {},
  );
  return {
    id: row.id,
    name: row.name,
    leaderId: row.leader_id ?? undefined,
    leaderName: row.leader_name ?? undefined,
    structureName: row.structure_name ?? undefined,
    parentTeamId: row.parent_team_id ?? undefined,
    region: row.region ?? undefined,
    licenseLimit: Number(row.license_limit) || 25,
    memberIds: unsealed.memberIds,
    extra: unsealed.extra,
    receivedAt: row.received_at,
    updatedAt: row.updated_at,
  };
}

const fallbackStore = () => createStore<VfTeamRecord>("teams");

export const SqlTeamsRepo = {
  async listAll(): Promise<VfTeamRecord[]> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgTeamRow>("SELECT * FROM vf_teams ORDER BY name ASC");
      return res.rows.map(rowToTeam);
    }
    return fallbackStore().list();
  },

  async getById(id: string): Promise<VfTeamRecord | null> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgTeamRow>("SELECT * FROM vf_teams WHERE id = $1 LIMIT 1", [id]);
      return res.rows[0] ? rowToTeam(res.rows[0]) : null;
    }
    return fallbackStore().get(id);
  },

  async upsert(team: VfTeamRecord): Promise<VfTeamRecord> {
    const now = new Date().toISOString();
    const record: VfTeamRecord = {
      ...team,
      licenseLimit: team.licenseLimit ?? 25,
      receivedAt: team.receivedAt || now,
      updatedAt: team.updatedAt || now,
    };
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const enc = sealJson({ memberIds: record.memberIds, extra: record.extra }, env.dataKey);
      await pool.query(
        `INSERT INTO vf_teams (
          id, name, leader_id, leader_name, structure_name,
          parent_team_id, region, license_limit, payload_encrypted,
          received_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          leader_id = EXCLUDED.leader_id,
          leader_name = EXCLUDED.leader_name,
          structure_name = EXCLUDED.structure_name,
          parent_team_id = EXCLUDED.parent_team_id,
          region = EXCLUDED.region,
          license_limit = EXCLUDED.license_limit,
          payload_encrypted = EXCLUDED.payload_encrypted,
          updated_at = EXCLUDED.updated_at`,
        [
          record.id,
          record.name,
          record.leaderId ?? null,
          record.leaderName ?? null,
          record.structureName ?? null,
          record.parentTeamId ?? null,
          record.region ?? null,
          record.licenseLimit,
          enc,
          record.receivedAt,
          record.updatedAt,
        ],
      );
      return record;
    }
    return fallbackStore().upsert(record);
  },

  async removeById(id: string): Promise<boolean> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query("DELETE FROM vf_teams WHERE id = $1", [id]);
      return (res.rowCount ?? 0) > 0;
    }
    return (await fallbackStore().removeWhere((t) => t.id === id)) > 0;
  },
};
