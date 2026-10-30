import type { Pool } from "pg";
import { isSealed, seal, unseal } from "@/lib/dataCipher";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { RecordStore, StoredRecord } from "./RecordStore";

/**
 * PostgresRecordStore
 *
 * Speichert beliebige Sammlungen in `vf_records` (PostgreSQL) und verschlüsselt
 * jeden Datensatz vor dem Speichern mit AES-256-GCM (`VF_DATA_KEY`).
 */
export class PostgresRecordStore<T extends StoredRecord> implements RecordStore<T> {
  private readonly pool: Pool;

  constructor(
    private readonly collection: string,
    connectionString: string,
    private readonly secret: string,
  ) {
    this.pool = getPostgresPool(connectionString);
  }

  private encode(record: T): string {
    const json = JSON.stringify(record);
    return this.secret ? JSON.stringify(seal(json, this.secret)) : json;
  }

  private decode(raw: string): T {
    const parsed = JSON.parse(raw) as unknown;
    if (isSealed(parsed)) {
      if (!this.secret) throw new Error("[PostgresRecordStore] Datensatz ist verschlüsselt, aber VF_DATA_KEY fehlt.");
      return JSON.parse(unseal(parsed, this.secret)) as T;
    }
    return parsed as T;
  }

  list = async (): Promise<T[]> => {
    await ensureHybridSchema(this.pool);
    const res = await this.pool.query<{ payload: string }>(
      "SELECT payload FROM vf_records WHERE collection = $1 ORDER BY received_at DESC",
      [this.collection],
    );
    return res.rows.map((row) => this.decode(row.payload));
  };

  get = async (id: string): Promise<T | null> => {
    await ensureHybridSchema(this.pool);
    const res = await this.pool.query<{ payload: string }>(
      "SELECT payload FROM vf_records WHERE collection = $1 AND id = $2 LIMIT 1",
      [this.collection, id],
    );
    const row = res.rows[0];
    return row ? this.decode(row.payload) : null;
  };

  insert = async (build: (existingIds: string[]) => T): Promise<T> => {
    await ensureHybridSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [this.collection]);
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM vf_records WHERE collection = $1",
        [this.collection],
      );
      const record = build(existing.rows.map((r) => r.id));
      await client.query(
        `INSERT INTO vf_records (collection, id, received_at, payload)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (collection, id)
         DO UPDATE SET received_at = EXCLUDED.received_at, payload = EXCLUDED.payload`,
        [this.collection, record.id, record.receivedAt, this.encode(record)],
      );
      await client.query("COMMIT");
      return record;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  };

  upsert = async (record: T): Promise<T> => {
    await ensureHybridSchema(this.pool);
    await this.pool.query(
      `INSERT INTO vf_records (collection, id, received_at, payload)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (collection, id)
       DO UPDATE SET received_at = EXCLUDED.received_at, payload = EXCLUDED.payload`,
      [this.collection, record.id, record.receivedAt, this.encode(record)],
    );
    return record;
  };

  update = async (id: string, change: (current: T) => T): Promise<T | null> => {
    await ensureHybridSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query<{ payload: string }>(
        "SELECT payload FROM vf_records WHERE collection = $1 AND id = $2 FOR UPDATE",
        [this.collection, id],
      );
      const row = res.rows[0];
      if (!row) {
        await client.query("ROLLBACK");
        return null;
      }
      const updated = change(this.decode(row.payload));
      await client.query(
        "UPDATE vf_records SET received_at = $3, payload = $4 WHERE collection = $1 AND id = $2",
        [this.collection, id, updated.receivedAt, this.encode(updated)],
      );
      await client.query("COMMIT");
      return updated;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  };

  removeWhere = async (predicate: (record: T) => boolean): Promise<number> => {
    await ensureHybridSchema(this.pool);
    const all = await this.list();
    const toDelete = all.filter((r) => predicate(r)).map((r) => r.id);
    if (toDelete.length === 0) return 0;
    const res = await this.pool.query(
      "DELETE FROM vf_records WHERE collection = $1 AND id = ANY($2::text[])",
      [this.collection, toDelete],
    );
    return res.rowCount ?? toDelete.length;
  };
}
