import { newId } from "../../lib/db/ids";
import { chunk } from "./convert";
import type { Tx } from "./context";
import { v1Ids } from "./V1Id.model";

/**
 * Zuordnung ObjectId aus v1 → neue UUID, je Collection. Neue UUIDs tragen den Zeitstempel des
 * Originals, damit die Reihenfolge erhalten bleibt. Am Ende landet alles in `v1_ids`.
 */
export class IdMap {
  private readonly maps = new Map<string, Map<string, string>>();

  private map(collection: string): Map<string, string> {
    let map = this.maps.get(collection);
    if (!map) this.maps.set(collection, (map = new Map()));
    return map;
  }

  assign(collection: string, v1Id: string, createdAt: Date): string {
    const id = newId(createdAt.getTime());
    this.map(collection).set(v1Id, id);
    return id;
  }

  get(collection: string, v1Id: string | null): string | null {
    return v1Id ? (this.map(collection).get(v1Id) ?? null) : null;
  }

  async persist(tx: Tx): Promise<number> {
    const rows = [...this.maps].flatMap(([collection, map]) => [...map].map(([v1Id, id]) => ({ collection, v1Id, id })));
    for (const part of chunk(rows)) await tx.insert(v1Ids).values(part);
    return rows.length;
  }
}
