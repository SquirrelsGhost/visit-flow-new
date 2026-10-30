import { sealJson, unsealJson } from "@/lib/dataCipher";
import { env } from "@/lib/env";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { StoredRecord } from "./RecordStore";
import { createStore } from "./storeFactory";

/**
 * Haustür-/Karten-Datensatz (`vf_doors`).
 * Personenbezogene Bewohner-Notizen, Einheiten und Besuchsprotokolle werden
 * vor dem Speichern in `payload_encrypted` mit AES-256-GCM verschlüsselt (Art. 32 DSGVO).
 */
export interface VfDoorRecord extends StoredRecord {
  id: string;
  userId: string;
  teamId?: string;
  street: string;
  houseNumber: string;
  postalCode?: string;
  city?: string;
  lat: number;
  lng: number;
  status: string;
  vertical?: string;
  /** Sensible Details (Bewohnername, Notizen, Einheiten, Rückrufzeit, Historie) — verschlüsselt in DB */
  details: Record<string, unknown>;
  receivedAt: string;
  updatedAt: string;
}

interface PgDoorRow {
  id: string;
  user_id: string;
  team_id: string | null;
  street: string;
  house_number: string;
  postal_code: string | null;
  city: string | null;
  lat: number;
  lng: number;
  status: string;
  vertical: string | null;
  payload_encrypted: string;
  received_at: string;
  updated_at: string;
}

function rowToDoor(row: PgDoorRow): VfDoorRecord {
  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id ?? undefined,
    street: row.street,
    houseNumber: row.house_number,
    postalCode: row.postal_code ?? "",
    city: row.city ?? "",
    lat: Number(row.lat) || 0,
    lng: Number(row.lng) || 0,
    status: row.status,
    vertical: row.vertical ?? "telco",
    details: unsealJson<Record<string, unknown>>(row.payload_encrypted, env.dataKey, {}),
    receivedAt: row.received_at,
    updatedAt: row.updated_at,
  };
}

const fallbackStore = () => createStore<VfDoorRecord>("doors");

export const SqlDoorsRepo = {
  async listAll(filter?: { userId?: string; teamId?: string }): Promise<VfDoorRecord[]> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      if (filter?.userId) {
        const res = await pool.query<PgDoorRow>(
          "SELECT * FROM vf_doors WHERE user_id = $1 ORDER BY received_at DESC",
          [filter.userId],
        );
        return res.rows.map(rowToDoor);
      }
      if (filter?.teamId) {
        const res = await pool.query<PgDoorRow>(
          "SELECT * FROM vf_doors WHERE team_id = $1 ORDER BY received_at DESC",
          [filter.teamId],
        );
        return res.rows.map(rowToDoor);
      }
      const res = await pool.query<PgDoorRow>("SELECT * FROM vf_doors ORDER BY received_at DESC");
      return res.rows.map(rowToDoor);
    }
    const all = await fallbackStore().list();
    return all.filter((d) => {
      if (filter?.userId && d.userId !== filter.userId) return false;
      if (filter?.teamId && d.teamId !== filter.teamId) return false;
      return true;
    });
  },

  async getById(id: string): Promise<VfDoorRecord | null> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgDoorRow>("SELECT * FROM vf_doors WHERE id = $1 LIMIT 1", [id]);
      return res.rows[0] ? rowToDoor(res.rows[0]) : null;
    }
    return fallbackStore().get(id);
  },

  async upsert(door: VfDoorRecord): Promise<VfDoorRecord> {
    const now = new Date().toISOString();
    const record: VfDoorRecord = {
      ...door,
      receivedAt: door.receivedAt || now,
      updatedAt: door.updatedAt || now,
    };
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const enc = sealJson(record.details ?? {}, env.dataKey);
      await pool.query(
        `INSERT INTO vf_doors (
          id, user_id, team_id, street, house_number, postal_code, city,
          lat, lng, status, vertical, payload_encrypted, received_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          team_id = EXCLUDED.team_id,
          street = EXCLUDED.street,
          house_number = EXCLUDED.house_number,
          postal_code = EXCLUDED.postal_code,
          city = EXCLUDED.city,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          status = EXCLUDED.status,
          vertical = EXCLUDED.vertical,
          payload_encrypted = EXCLUDED.payload_encrypted,
          updated_at = EXCLUDED.updated_at`,
        [
          record.id,
          record.userId,
          record.teamId ?? null,
          record.street,
          record.houseNumber,
          record.postalCode ?? "",
          record.city ?? "",
          record.lat,
          record.lng,
          record.status,
          record.vertical ?? "telco",
          enc,
          record.receivedAt,
          record.updatedAt,
        ],
      );
      return record;
    }
    return fallbackStore().upsert(record);
  },

  async removeByIds(ids: readonly string[]): Promise<number> {
    if (ids.length === 0) return 0;
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query("DELETE FROM vf_doors WHERE id = ANY($1::text[])", [ids]);
      return res.rowCount ?? 0;
    }
    const idSet = new Set(ids);
    return fallbackStore().removeWhere((d) => idSet.has(d.id));
  },
};
