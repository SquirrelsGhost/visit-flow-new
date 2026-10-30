/**
 * Typed environment variable access.
 *
 * Import `env` instead of reading `process.env` directly anywhere in the app.
 *
 * RULES:
 *  - Server-only vars (e.g. DATABASE_URL, VF_DATA_KEY) must NEVER be accessed in Client Components.
 *  - Public vars (NEXT_PUBLIC_*) are safe everywhere.
 *  - Add new variables here AND in .env.example (and .env.local for real values).
 */

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

const rawDbUrl = optional("DATABASE_URL", optional("POSTGRES_URL"));
const isTest = process.env.NODE_ENV === "test";

export const env = {
  // ── App ────────────────────────────────────────────────────
  /** Public URL of the app. Safe to use in Client Components. */
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3001"),

  // ── Hybrid PostgreSQL & Encrypted RecordStore (DSGVO) ──────
  /**
   * Storage driver:
   * - "postgres": Hybrid PostgreSQL (Relational SQL tables + encrypted JSONB store)
   * - "file": Local AES-256-GCM encrypted JSON files with .bak self-healing
   * - "memory": Isolated in-memory store (default during Vitest unit tests)
   */
  dataStoreDriver: optional(
    "DATA_STORE_DRIVER",
    isTest ? "memory" : rawDbUrl ? "postgres" : "file",
  ) as "postgres" | "file" | "memory",

  /** PostgreSQL Connection String (EU/DE Server or Neon Frankfurt eu-central-1). SERVER ONLY. */
  databaseUrl: rawDbUrl,

  /** Local directory for encrypted file fallback. Default: ./data/visit-flow. SERVER ONLY. */
  dataDir: optional("DATA_DIR"),

  /**
   * AES-256-GCM Master Key for Application-Level Encryption (Art. 32 DSGVO).
   * Encrypts customer PII, door notes, billing items, and record payloads before DB storage.
   * SERVER ONLY.
   */
  dataKey: optional("VF_DATA_KEY", rawDbUrl),

  // ── Zero-Trust Auth & Security ─────────────────────────────
  /** Secret (min. 32 chars) used to sign the `__Host-vf_session` HMAC-SHA256 cookie. SERVER ONLY. */
  sessionSecret: optional("VF_SESSION_SECRET"),

  /** Optional global pepper (HMAC before scrypt) for password hashes. SERVER ONLY. */
  authPepper: optional("AUTH_PEPPER", "vf-pycie-pepper-v1"),

  /** Session lifetime in seconds (default: 12 hours). SERVER ONLY. */
  sessionTtlSeconds: Number(optional("VF_SESSION_TTL_SECONDS", "43200")) || 43200,

  // ── DSGVO Retention Policies (Art. 5 & Art. 17 DSGVO) ──────
  /** Days to keep consent audit logs (default: 1095 = 3 years). SERVER ONLY. */
  consentRetentionDays: Number(optional("VF_CONSENT_RETENTION_DAYS", "1095")) || 1095,

  /** Days to keep security audit logs (default: 90 days). SERVER ONLY. */
  securityLogRetentionDays: Number(optional("VF_SECURITY_LOG_RETENTION_DAYS", "90")) || 90,

  // ── Legacy / Optional ──────────────────────────────────────
  mongodbUri: optional("MONGODB_URI"),
  mongodbDbName: optional("MONGODB_DB_NAME"),

  isProduction: process.env.NODE_ENV === "production",
  isTest,
} as const;
