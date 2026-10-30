import os from "node:os";
import path from "node:path";
import { env } from "@/lib/env";
import { FileRecordStore } from "./FileRecordStore";
import { MemoryRecordStore } from "./MemoryRecordStore";
import { PostgresRecordStore } from "./PostgresRecordStore";
import type { RecordStore, StoredRecord } from "./RecordStore";

export type CollectionName =
  // 1. Kern-Entitäten (nutzen in Postgres eigene SQL-Tabellen + im Fallback FileRecordStore)
  | "users"
  | "sitzungen"
  | "teams"
  | "doors"
  | "sales"
  // 2. Hybrid RecordStore-Collections (in Postgres `vf_records` + AES-256-GCM)
  | "rate-limits"
  | "audit-log"
  | "security-events"
  | "consents"
  | "abrechnungen"
  | "reklamationen"
  | "logbook"
  | "battle-challenges"
  | "battle-duels"
  | "contests"
  | "tariffs"
  | "simulator-configs"
  | "coach-memory"
  | "licenses"
  | "onboarding"
  | "streets-assignments"
  | "expiring-contracts"
  | "email-reports"
  | "whitelist";

/**
 * Standard-Verzeichnis außerhalb von `process.cwd()` im Dev-Modus (`os.tmpdir()`),
 * damit Datei-Schreibzugriffe niemals den Turbopack-Watcher (`[Fast Refresh] rebuilding`) auslösen.
 */
export function dataDir(): string {
  return env.dataDir || path.join(os.tmpdir(), "visit-flow-data");
}

let warnungGezeigt = false;
const storeInstances = new Map<string, RecordStore<StoredRecord>>();

export function createStore<T extends StoredRecord>(name: CollectionName): RecordStore<T> {
  if (env.isProduction && !env.dataKey && !warnungGezeigt) {
    warnungGezeigt = true;
    console.error("[storeFactory] VF_DATA_KEY fehlt: Daten liegen UNVERSCHLÜSSELT. Vor dem Livegang setzen (DSGVO Art. 32).");
  }
  const driver = env.dataStoreDriver;
  const cacheKey = `${driver}:${dataDir()}:${name}`;
  const existing = storeInstances.get(cacheKey);
  if (existing) {
    return existing as unknown as RecordStore<T>;
  }

  let created: RecordStore<T>;
  switch (driver) {
    case "postgres":
      created = new PostgresRecordStore<T>(name, env.databaseUrl, env.dataKey);
      break;
    case "file":
      created = new FileRecordStore<T>(path.join(dataDir(), `${name}.json`), env.dataKey);
      break;
    case "memory":
      created = new MemoryRecordStore<T>(name);
      break;
    default:
      created = new FileRecordStore<T>(path.join(dataDir(), `${name}.json`), env.dataKey);
      break;
  }
  storeInstances.set(cacheKey, created as unknown as RecordStore<StoredRecord>);
  return created;
}
