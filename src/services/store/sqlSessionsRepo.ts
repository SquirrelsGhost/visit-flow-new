import { env } from "@/lib/env";
import type { ServerSitzungRecord } from "@/services/sicherheit/Sitzungswachdienst";
import { ensureHybridSchema, getPostgresPool } from "./postgresPool";
import type { StoredRecord } from "./RecordStore";
import { createStore } from "./storeFactory";

type StoredSitzung = ServerSitzungRecord & StoredRecord;

interface PgSessionRow {
  id: string;
  inhaber_id: string;
  inhaber_name: string;
  aktives_token_id: string;
  vorheriges_token_id: string | null;
  rotiert_at: string;
  erstellt_at: string;
  zuletzt_aktiv_at: string;
  laeuft_ab_at: string;
  user_agent_hash: string;
  geraet_fingerprint: string | null;
  ip_kuerzel: string;
  browser: string;
  widerrufen_at: string | null;
  widerruf_grund: string | null;
}

function rowToSession(row: PgSessionRow): ServerSitzungRecord {
  return {
    id: row.id,
    inhaberId: row.inhaber_id,
    inhaberName: row.inhaber_name,
    aktivesTokenId: row.aktives_token_id,
    vorherigesTokenId: row.vorheriges_token_id ?? undefined,
    rotiertAm: row.rotiert_at,
    erstelltAm: row.erstellt_at,
    zuletztAktivAm: row.zuletzt_aktiv_at,
    laeuftAbAm: row.laeuft_ab_at,
    userAgentHash: row.user_agent_hash,
    geraetFingerprint: row.geraet_fingerprint ?? undefined,
    ipKuerzel: row.ip_kuerzel,
    browser: row.browser,
    widerrufenAm: row.widerrufen_at ?? undefined,
    widerrufGrund: row.widerruf_grund ?? undefined,
  };
}

const fallbackStore = () => createStore<StoredSitzung>("sitzungen");

export const SqlSessionsRepo = {
  async getById(id: string): Promise<ServerSitzungRecord | null> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgSessionRow>("SELECT * FROM vf_sessions WHERE id = $1 LIMIT 1", [id]);
      return res.rows[0] ? rowToSession(res.rows[0]) : null;
    }
    return fallbackStore().get(id);
  },

  async listAll(): Promise<ServerSitzungRecord[]> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query<PgSessionRow>("SELECT * FROM vf_sessions ORDER BY zuletzt_aktiv_at DESC");
      return res.rows.map(rowToSession);
    }
    return fallbackStore().list();
  },

  async upsert(sitzung: ServerSitzungRecord): Promise<ServerSitzungRecord> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      await pool.query(
        `INSERT INTO vf_sessions (
          id, inhaber_id, inhaber_name, aktives_token_id, vorheriges_token_id,
          rotiert_at, erstellt_at, zuletzt_aktiv_at, laeuft_ab_at,
          user_agent_hash, geraet_fingerprint, ip_kuerzel, browser,
          widerrufen_at, widerruf_grund
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15
        )
        ON CONFLICT (id) DO UPDATE SET
          aktives_token_id = EXCLUDED.aktives_token_id,
          vorheriges_token_id = EXCLUDED.vorheriges_token_id,
          rotiert_at = EXCLUDED.rotiert_at,
          zuletzt_aktiv_at = EXCLUDED.zuletzt_aktiv_at,
          laeuft_ab_at = EXCLUDED.laeuft_ab_at,
          widerrufen_at = EXCLUDED.widerrufen_at,
          widerruf_grund = EXCLUDED.widerruf_grund`,
        [
          sitzung.id,
          sitzung.inhaberId.toLowerCase(),
          sitzung.inhaberName,
          sitzung.aktivesTokenId,
          sitzung.vorherigesTokenId ?? null,
          sitzung.rotiertAm,
          sitzung.erstelltAm,
          sitzung.zuletztAktivAm,
          sitzung.laeuftAbAm,
          sitzung.userAgentHash,
          sitzung.geraetFingerprint ?? null,
          sitzung.ipKuerzel,
          sitzung.browser,
          sitzung.widerrufenAm ?? null,
          sitzung.widerrufGrund ?? null,
        ],
      );
      return sitzung;
    }
    await fallbackStore().upsert({ ...sitzung, receivedAt: sitzung.erstelltAm });
    return sitzung;
  },

  async removeExpiredBefore(isoCutoff: string): Promise<number> {
    if (env.dataStoreDriver === "postgres") {
      const pool = getPostgresPool();
      await ensureHybridSchema(pool);
      const res = await pool.query("DELETE FROM vf_sessions WHERE laeuft_ab_at < $1", [isoCutoff]);
      return res.rowCount ?? 0;
    }
    return fallbackStore().removeWhere((s) => s.laeuftAbAm < isoCutoff);
  },
};
