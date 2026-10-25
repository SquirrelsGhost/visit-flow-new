import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

/**
 * Welche v2-UUID zu welcher ObjectId aus v1 gehört. Schreibt nur das Übernahmeskript; der
 * App-Code liest die Tabelle nie. Sie dient dazu, später übernommene Module (Visits, Battle …)
 * richtig zu verknüpfen und alte v1-Protokolle einem Konto zuordnen zu können.
 */
export const v1Ids = pgTable(
  "v1_ids",
  {
    collection: text().notNull(),
    v1Id: text().notNull(),
    id: uuid().notNull(),
  },
  (table) => [primaryKey({ columns: [table.collection, table.v1Id] }), index("v1_ids_id_idx").on(table.id)],
);
