import { clearFileRecordCache } from "./FileRecordStore";
import type { RecordStore, StoredRecord } from "./RecordStore";

const MEMORY_KEY = Symbol.for("visitFlow.memoryRecordStore.buckets");
type BucketMap = Map<string, Map<string, unknown>>;
const globalMem = globalThis as typeof globalThis & { [MEMORY_KEY]?: BucketMap };
const buckets: BucketMap = (globalMem[MEMORY_KEY] ??= new Map());

function byNewest<T extends StoredRecord>(a: T, b: T): number {
  return b.receivedAt.localeCompare(a.receivedAt);
}

/**
 * MemoryRecordStore
 *
 * Isolierter In-Memory-Store für schnelle Unit-/Integrations-Tests (`DATA_STORE_DRIVER=memory`).
 */
export class MemoryRecordStore<T extends StoredRecord> implements RecordStore<T> {
  constructor(private readonly collection: string) {}

  private bucket(): Map<string, T> {
    let b = buckets.get(this.collection) as Map<string, T> | undefined;
    if (!b) {
      b = new Map<string, T>();
      buckets.set(this.collection, b as Map<string, unknown>);
    }
    return b;
  }

  list = async (): Promise<T[]> => [...this.bucket().values()].sort(byNewest);

  get = async (id: string): Promise<T | null> => this.bucket().get(id) ?? null;

  insert = async (build: (existingIds: string[]) => T): Promise<T> => {
    const b = this.bucket();
    const record = build([...b.keys()]);
    b.set(record.id, record);
    return record;
  };

  upsert = async (record: T): Promise<T> => {
    this.bucket().set(record.id, record);
    return record;
  };

  update = async (id: string, change: (current: T) => T): Promise<T | null> => {
    const b = this.bucket();
    const current = b.get(id);
    if (!current) return null;
    const next = change(current);
    b.set(id, next);
    return next;
  };

  removeWhere = async (predicate: (record: T) => boolean): Promise<number> => {
    const b = this.bucket();
    let removed = 0;
    for (const [id, rec] of b.entries()) {
      if (predicate(rec)) {
        b.delete(id);
        removed++;
      }
    }
    return removed;
  };
}

export function clearMemoryStores(): void {
  buckets.clear();
  clearFileRecordCache();
}
