import { sealJson, unsealJson } from "@/lib/dataCipher";
import { env } from "@/lib/env";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { StoredRecord } from "./RecordStore";
import { createStore } from "./storeFactory";

/**
 * Auftrags-/CRM-Datensatz (`vf_sales`).
 * Alle personenbezogenen Kundendaten (Name, Adresse, Telefon, E-Mail, Vertragsnummer, Notizen)
 * werden in `customer_encrypted` mit AES-256-GCM verschlüsselt gespeichert (Art. 32 DSGVO).
 */
export interface VfSaleRecord extends StoredRecord {
  id: string;
  userId: string;
  teamId?: string;
  doorId?: string;
  status: "pending" | "completed" | "cancelled" | string;
  category: string;
  provider?: string;
  productName: string;
  commissionCents: number;
  contractExpiresAt?: string;
  /** Verschlüsselte Kundendaten & Auftrags-Metadaten */
  customerData: Record<string, unknown>;
  receivedAt: string;
  updatedAt: string;
}

interface PgSaleRow {
  id: string;
  user_id: string;
  team_id: string | null;
  door_id: string | null;
  status: string;
  category: string;
  provider: string | null;
  product_name: string;
  commission_cents: number;
  contract_expires_at: string | null;
  customer_encrypted: string;
  received_at: string;
  updated_at: string;
}

function rowToSale(row: PgSaleRow): VfSaleRecord {
  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id ?? undefined,
    doorId: row.door_id ?? undefined,
    status: row.status,
    category: row.category,
    provider: row.provider ?? "",
    productName: row.product_name,
    commissionCents: Number(row.commission_cents) || 0,
    contractExpiresAt: row.contract_expires_at ?? undefined,
    customerData: unsealJson<Record<string, unknown>>(row.customer_encrypted, env.dataKey, {}),
    receivedAt: row.received_at,
    updatedAt: row.updated_at,
  };
}

const fallbackStore = () => createStore<VfSaleRecord>("sales");

export const SqlSalesRepo = {
  async listAll(filter?: { userId?: string; teamId?: string; status?: string }): Promise<VfSaleRecord[]> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const clauses: string[] = [];
      const values: unknown[] = [];
      if (filter?.userId) {
        values.push(filter.userId);
        clauses.push(`user_id = $${values.length}`);
      }
      if (filter?.teamId) {
        values.push(filter.teamId);
        clauses.push(`team_id = $${values.length}`);
      }
      if (filter?.status) {
        values.push(filter.status);
        clauses.push(`status = $${values.length}`);
      }
      const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
      const res = await pool.query<PgSaleRow>(`SELECT * FROM vf_sales ${where} ORDER BY received_at DESC`, values);
      return res.rows.map(rowToSale);
    }
    const all = await fallbackStore().list();
    return all.filter((s) => {
      if (filter?.userId && s.userId !== filter.userId) return false;
      if (filter?.teamId && s.teamId !== filter.teamId) return false;
      if (filter?.status && s.status !== filter.status) return false;
      return true;
    });
  },

  async getById(id: string): Promise<VfSaleRecord | null> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgSaleRow>("SELECT * FROM vf_sales WHERE id = $1 LIMIT 1", [id]);
      return res.rows[0] ? rowToSale(res.rows[0]) : null;
    }
    return fallbackStore().get(id);
  },

  async upsert(sale: VfSaleRecord): Promise<VfSaleRecord> {
    const now = new Date().toISOString();
    const record: VfSaleRecord = {
      ...sale,
      receivedAt: sale.receivedAt || now,
      updatedAt: sale.updatedAt || now,
    };
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const enc = sealJson(record.customerData ?? {}, env.dataKey);
      await pool.query(
        `INSERT INTO vf_sales (
          id, user_id, team_id, door_id, status, category, provider,
          product_name, commission_cents, contract_expires_at,
          customer_encrypted, received_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          team_id = EXCLUDED.team_id,
          door_id = EXCLUDED.door_id,
          status = EXCLUDED.status,
          category = EXCLUDED.category,
          provider = EXCLUDED.provider,
          product_name = EXCLUDED.product_name,
          commission_cents = EXCLUDED.commission_cents,
          contract_expires_at = EXCLUDED.contract_expires_at,
          customer_encrypted = EXCLUDED.customer_encrypted,
          updated_at = EXCLUDED.updated_at`,
        [
          record.id,
          record.userId,
          record.teamId ?? null,
          record.doorId ?? null,
          record.status,
          record.category,
          record.provider ?? "",
          record.productName,
          record.commissionCents,
          record.contractExpiresAt ?? null,
          enc,
          record.receivedAt,
          record.updatedAt,
        ],
      );
      return record;
    }
    return fallbackStore().upsert(record);
  },

  async updateStatus(id: string, status: string): Promise<VfSaleRecord | null> {
    const existing = await SqlSalesRepo.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    return SqlSalesRepo.upsert({
      ...existing,
      status,
      customerData: { ...existing.customerData, status, updatedAt: now },
      updatedAt: now,
    });
  },

  async removeByIds(ids: readonly string[]): Promise<number> {
    if (ids.length === 0) return 0;
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query("DELETE FROM vf_sales WHERE id = ANY($1::text[])", [ids]);
      return res.rowCount ?? 0;
    }
    const idSet = new Set(ids);
    return fallbackStore().removeWhere((s) => idSet.has(s.id));
  },
};
