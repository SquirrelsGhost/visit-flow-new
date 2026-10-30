import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { isSealed, seal, unseal } from "@/lib/dataCipher";
import type { RecordStore, StoredRecord } from "./RecordStore";

interface FileContent<T> {
  version: 1;
  records: T[];
}

const QUEUE_KEY = Symbol.for("visitFlow.fileRecordStore.queues");
const CACHE_KEY = Symbol.for("visitFlow.fileRecordStore.cache");
type QueueMap = Map<string, Promise<unknown>>;
type CacheMap = Map<string, StoredRecord[]>;
const globalQueues = globalThis as typeof globalThis & {
  [QUEUE_KEY]?: QueueMap;
  [CACHE_KEY]?: CacheMap;
};
const queues: QueueMap = (globalQueues[QUEUE_KEY] ??= new Map());
const memoryCache: CacheMap = (globalQueues[CACHE_KEY] ??= new Map());

export function clearFileRecordCache(): void {
  memoryCache.clear();
}

function byNewest<T extends StoredRecord>(a: T, b: T): number {
  return b.receivedAt.localeCompare(a.receivedAt);
}

/**
 * FileRecordStore
 *
 * Speichert eine Sammlung als JSON-Datei mit In-Memory-Read-Cache (0ms Lesezugriff),
 * atomarem Temp-Rename, `.bak`-Selbstheilung und optionaler AES-256-GCM Verschlüsselung (`VF_DATA_KEY`).
 */
export class FileRecordStore<T extends StoredRecord> implements RecordStore<T> {
  constructor(
    private readonly file: string,
    private readonly secret: string,
  ) {}

  private parseRaw(raw: string): T[] {
    const parsed = JSON.parse(raw) as unknown;
    const json = isSealed(parsed) ? unseal(parsed, this.requireSecret()) : raw;
    const content = (isSealed(parsed) ? JSON.parse(json) : parsed) as FileContent<T>;
    if (!Array.isArray(content.records)) throw new Error("Ungültiges Speicherformat");
    return content.records;
  }

  private async read(): Promise<T[]> {
    const cached = memoryCache.get(this.file) as T[] | undefined;
    if (cached) {
      return [...cached];
    }

    let raw: string;
    try {
      raw = await readFile(/*turbopackIgnore: true*/ this.file, "utf8");
    } catch {
      memoryCache.set(this.file, []);
      return [];
    }
    try {
      const parsed = this.parseRaw(raw);
      memoryCache.set(this.file, parsed);
      return [...parsed];
    } catch {
      try {
        const bakRaw = await readFile(/*turbopackIgnore: true*/ `${this.file}.bak`, "utf8");
        const recovered = this.parseRaw(bakRaw);
        await writeFile(/*turbopackIgnore: true*/ this.file, bakRaw, { encoding: "utf8", mode: 0o600 });
        console.warn(`[Selbstheilung] Speicherdatei ${path.basename(this.file)} automatisch aus .bak wiederhergestellt.`);
        memoryCache.set(this.file, recovered);
        return [...recovered];
      } catch {
        memoryCache.set(this.file, []);
        return [];
      }
    }
  }

  private requireSecret(): string {
    if (!this.secret) throw new Error("[FileRecordStore] Ablage ist verschlüsselt, aber VF_DATA_KEY fehlt.");
    return this.secret;
  }

  private async write(records: T[]): Promise<void> {
    memoryCache.set(this.file, [...records]);
    const content: FileContent<T> = { version: 1, records };
    const json = JSON.stringify(content);
    const body = this.secret ? JSON.stringify(seal(json, this.secret)) : JSON.stringify(content, null, 2);
    await mkdir(/*turbopackIgnore: true*/ path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(/*turbopackIgnore: true*/ tmp, body, { encoding: "utf8", mode: 0o600 });
    await rename(/*turbopackIgnore: true*/ tmp, this.file);
    await writeFile(/*turbopackIgnore: true*/ `${this.file}.bak`, body, { encoding: "utf8", mode: 0o600 }).catch(() => undefined);
  }

  private exclusive<R>(task: () => Promise<R>): Promise<R> {
    const previous = queues.get(this.file) ?? Promise.resolve();
    const next = previous.then(task, task);
    queues.set(this.file, next.catch(() => undefined));
    return next;
  }

  list = async (): Promise<T[]> => (await this.read()).sort(byNewest);

  get = async (id: string): Promise<T | null> => (await this.read()).find((record) => record.id === id) ?? null;

  insert = (build: (existingIds: string[]) => T): Promise<T> =>
    this.exclusive(async () => {
      const records = await this.read();
      const record = build(records.map((r) => r.id));
      const without = records.filter((r) => r.id !== record.id);
      await this.write([record, ...without]);
      return record;
    });

  upsert = (record: T): Promise<T> =>
    this.exclusive(async () => {
      const records = await this.read();
      const without = records.filter((r) => r.id !== record.id);
      await this.write([record, ...without]);
      return record;
    });

  update = (id: string, change: (current: T) => T): Promise<T | null> =>
    this.exclusive(async () => {
      const records = await this.read();
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) return null;
      records[index] = change(records[index]);
      await this.write(records);
      return records[index];
    });

  removeWhere = (predicate: (record: T) => boolean): Promise<number> =>
    this.exclusive(async () => {
      const records = await this.read();
      const kept = records.filter((record) => !predicate(record));
      if (kept.length !== records.length) await this.write(kept);
      return records.length - kept.length;
    });
}
