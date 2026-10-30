/** Minimal-Anforderung an jeden gespeicherten Datensatz im RecordStore. */
export interface StoredRecord {
  id: string;
  receivedAt: string;
}

/**
 * RecordStore<T>
 *
 * Einheitliche Speicher-Schnittstelle für alle Collections (PostgreSQL, verschlüsselte Datei oder Memory).
 */
export interface RecordStore<T extends StoredRecord> {
  /** Alle Datensätze, neueste zuerst (`receivedAt DESC`). */
  list(): Promise<T[]>;
  /** Einzelnen Datensatz anhand der ID lesen. */
  get(id: string): Promise<T | null>;
  /** Legt einen Datensatz atomar an. `build` bekommt die vorhandenen IDs. */
  insert(build: (existingIds: string[]) => T): Promise<T>;
  /** Legt einen Datensatz an oder überschreibt ihn atomar anhand von `record.id`. */
  upsert(record: T): Promise<T>;
  /** Ändert einen Datensatz atomar. Gibt `null` zurück, wenn es ihn nicht gibt. */
  update(id: string, change: (current: T) => T): Promise<T | null>;
  /** Löscht alle passenden Datensätze und gibt die Anzahl zurück. */
  removeWhere(predicate: (record: T) => boolean): Promise<number>;
}
