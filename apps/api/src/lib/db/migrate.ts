import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "../../config/db";

/** SQL-Migrationen aus `apps/api/drizzle/`, erzeugt mit `npm run db:generate`. */
export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../../../drizzle", import.meta.url));

/** Spielt alle noch fehlenden Migrationen ein. drizzle merkt sich den Stand in `drizzle.__drizzle_migrations`. */
export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
