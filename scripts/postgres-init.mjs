import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error("[postgres-init] Keine DATABASE_URL in .env.local oder Umgebung gefunden.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

try {
  await pool.query(`
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

    CREATE TABLE IF NOT EXISTS vf_records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      received_at TEXT NOT NULL,
      payload TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    );
    CREATE INDEX IF NOT EXISTS idx_vf_records_collection_received
      ON vf_records (collection, received_at DESC);
  `);

  const tables = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'vf_%'
    ORDER BY tablename
  `);
  console.log("[postgres-init] Visit Flow Hybrid-PostgreSQL Tabellen bereit:", tables.rows.map((r) => r.tablename));
} finally {
  await pool.end();
}
