import { Pool } from "pg";
import { env } from "@/lib/env";

const POOL_KEY = Symbol.for("visitFlow.postgresPool.instance");
const SCHEMA_KEY = Symbol.for("visitFlow.postgresPool.schemaReady");

type GlobalWithPg = typeof globalThis & {
  [POOL_KEY]?: Pool;
  [SCHEMA_KEY]?: Promise<void>;
};

const globalPg = globalThis as GlobalWithPg;

export function getPostgresPool(connectionString = env.databaseUrl): Pool {
  if (!connectionString) {
    throw new Error("[postgresPool] DATABASE_URL fehlt für DATA_STORE_DRIVER=postgres.");
  }
  if (!globalPg[POOL_KEY]) {
    globalPg[POOL_KEY] = new Pool({
      connectionString,
      max: 12,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalPg[POOL_KEY];
}

export const HYBRID_POSTGRES_DDL = `
  -- 1. Kern-Tabelle: Benutzer & Berater-Konten (Zero-Trust Capabilities + DSGVO-Verschlüsselung)
  CREATE TABLE IF NOT EXISTS vf_users (
    id TEXT PRIMARY KEY,
    email_canonical TEXT NOT NULL UNIQUE,
    email_display TEXT NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'berater',
    roles_json JSONB NOT NULL DEFAULT '["berater"]'::jsonb,
    permissions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    team_id TEXT,
    team_name TEXT,
    structure_id TEXT,
    mentor_id TEXT,
    partner_status TEXT,
    sitzungs_version INTEGER NOT NULL DEFAULT 1,
    banned_at TEXT,
    ban_reason TEXT,
    ident_status TEXT DEFAULT 'pending',
    contract_signed_at TEXT,
    encrypted_profile TEXT,
    received_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_vf_users_team ON vf_users (team_id);
  CREATE INDEX IF NOT EXISTS idx_vf_users_role ON vf_users (role);

  -- 2. Kern-Tabelle: Stateful Server-Sitzungen (Sitzungswachdienst / Anti-Theft Watchdog)
  CREATE TABLE IF NOT EXISTS vf_sessions (
    id TEXT PRIMARY KEY,
    inhaber_id TEXT NOT NULL,
    inhaber_name TEXT NOT NULL,
    aktives_token_id TEXT NOT NULL,
    vorheriges_token_id TEXT,
    rotiert_at TEXT NOT NULL,
    erstellt_at TEXT NOT NULL,
    zuletzt_aktiv_at TEXT NOT NULL,
    laeuft_ab_at TEXT NOT NULL,
    user_agent_hash TEXT NOT NULL,
    geraet_fingerprint TEXT,
    ip_kuerzel TEXT NOT NULL,
    browser TEXT NOT NULL,
    widerrufen_at TEXT,
    widerruf_grund TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_vf_sessions_inhaber ON vf_sessions (inhaber_id);
  CREATE INDEX IF NOT EXISTS idx_vf_sessions_expires ON vf_sessions (laeuft_ab_at);

  -- 3. Kern-Tabelle: Teams & Organisationsstruktur
  CREATE TABLE IF NOT EXISTS vf_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    leader_id TEXT,
    leader_name TEXT,
    structure_name TEXT,
    parent_team_id TEXT,
    region TEXT,
    license_limit INTEGER NOT NULL DEFAULT 25,
    payload_encrypted TEXT NOT NULL,
    received_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- 4. Kern-Tabelle: Haustüren, Karte & Straßenbesuche (Kunden-Notizen AES-256-GCM verschlüsselt)
  CREATE TABLE IF NOT EXISTS vf_doors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    postal_code TEXT DEFAULT '',
    city TEXT DEFAULT '',
    lat DOUBLE PRECISION NOT NULL DEFAULT 0,
    lng DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    vertical TEXT DEFAULT 'telco',
    payload_encrypted TEXT NOT NULL,
    received_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_vf_doors_user ON vf_doors (user_id, received_at DESC);
  CREATE INDEX IF NOT EXISTS idx_vf_doors_team ON vf_doors (team_id, received_at DESC);
  CREATE INDEX IF NOT EXISTS idx_vf_doors_street ON vf_doors (street, city);

  -- 5. Kern-Tabelle: Aufträge / Sales / CRM (Kunden-PII AES-256-GCM verschlüsselt)
  CREATE TABLE IF NOT EXISTS vf_sales (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT,
    door_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    category TEXT NOT NULL DEFAULT 'telco',
    provider TEXT DEFAULT '',
    product_name TEXT NOT NULL DEFAULT '',
    commission_cents INTEGER NOT NULL DEFAULT 0,
    contract_expires_at TEXT,
    customer_encrypted TEXT NOT NULL,
    received_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_vf_sales_user ON vf_sales (user_id, received_at DESC);
  CREATE INDEX IF NOT EXISTS idx_vf_sales_team ON vf_sales (team_id, received_at DESC);
  CREATE INDEX IF NOT EXISTS idx_vf_sales_status ON vf_sales (status);
  CREATE INDEX IF NOT EXISTS idx_vf_sales_expires ON vf_sales (contract_expires_at);

  -- 6. Hybrid RecordStore-Tabelle für alle weiteren Collections (AES-256-GCM verschlüsselt)
  CREATE TABLE IF NOT EXISTS vf_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    received_at TEXT NOT NULL,
    payload TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE INDEX IF NOT EXISTS idx_vf_records_collection_received
    ON vf_records (collection, received_at DESC);
`;

export function ensureHybridSchema(pool = getPostgresPool()): Promise<void> {
  if (!globalPg[SCHEMA_KEY]) {
    globalPg[SCHEMA_KEY] = pool
      .query(HYBRID_POSTGRES_DDL)
      .then(() => undefined)
      .catch((err) => {
        globalPg[SCHEMA_KEY] = undefined;
        throw err;
      });
  }
  return globalPg[SCHEMA_KEY];
}
