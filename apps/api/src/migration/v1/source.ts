import type { Db } from "mongodb";

/** Ein Dokument aus der v1-MongoDB, so wie der Treiber es liefert. */
export type V1Doc = Record<string, unknown>;

/**
 * Lesezugriff auf v1. Das Interface kennt absichtlich nur `read`: Das Migrationsskript kann
 * v1 gar nicht verändern, auch nicht aus Versehen (v1 bleibt strikt read-only).
 */
export interface V1Source {
  read(collection: string, filter?: Record<string, unknown>): AsyncIterable<V1Doc>;
}

export function mongoV1Source(db: Db): V1Source {
  return {
    read: (collection, filter = {}) => db.collection(collection).find(filter, { batchSize: 1000 }),
  };
}

const WRITE_ACTIONS = new Set([
  "insert", "update", "remove", "createCollection", "dropCollection", "dropDatabase", "createIndex", "dropIndex",
  "renameCollectionSameDB", "collMod", "convertToCapped", "emptycapped", "bypassDocumentValidation",
]);

interface ConnectionStatus {
  authInfo?: {
    authenticatedUsers?: unknown[];
    authenticatedUserPrivileges?: { resource?: unknown; actions?: string[] }[];
  };
}

/**
 * Probleme mit den Rechten des Mongo-Nutzers. Leer heißt: nur Leserechte. Ohne Anmeldung lässt
 * sich das nicht ausschließen (lokale MongoDB ohne Auth darf alles), deshalb zählt das auch.
 */
export function writeAccessProblems(status: ConnectionStatus): string[] {
  const info = status.authInfo ?? {};
  if (!info.authenticatedUsers?.length) return ["Ohne Anmeldung verbunden, Schreibrechte lassen sich nicht ausschließen"];
  const actions = (info.authenticatedUserPrivileges ?? []).flatMap((privilege) => privilege.actions ?? []);
  return [...new Set(actions.filter((action) => WRITE_ACTIONS.has(action)))].map((action) => `Nutzer darf "${action}"`);
}

export async function readConnectionStatus(db: Db): Promise<ConnectionStatus> {
  return (await db.command({ connectionStatus: 1, showPrivileges: true })) as ConnectionStatus;
}
