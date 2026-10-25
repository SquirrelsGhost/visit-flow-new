import { count, sql } from "drizzle-orm";
import type { Database } from "../../config/db";
import { users } from "../../modules/users/User.model";
import type { StepContext } from "./context";
import { IdMap } from "./idMap";
import { MigrationReport } from "./report";
import type { V1Source } from "./source";
import { migrateSessions, migrateSettings, migrateSubscriptions } from "./steps/accounts";
import { migrateAreas, migrateTeams } from "./steps/teams";
import { linkUsers, migrateUsers } from "./steps/users";

export interface MigrateOptions {
  /** Alles ausführen und am Ende zurückrollen: zeigt Zähler und Hinweise, ändert nichts. */
  dryRun: boolean;
  /** Übernommene Tabellen vorher leeren. Nur für Proben, nie wenn v2 schon live ist. */
  reset: boolean;
  now?: Date;
}

class DryRunRollback extends Error {}

/**
 * Überträgt v1 nach PostgreSQL in einer einzigen Transaktion: Entweder kommt alles an oder nichts.
 * Schritte, die weitere Module (Fahrtenbuch, Enes, Visits …) bei ihrer Portierung ergänzen,
 * werden hier in der richtigen Reihenfolge eingehängt.
 */
export async function migrateV1(db: Database, source: V1Source, options: MigrateOptions): Promise<MigrationReport> {
  const report = new MigrationReport();
  try {
    await db.transaction(async (tx) => {
      if (options.reset) {
        // CASCADE leert auch alle Tabellen, die auf diese verweisen (Sitzungen, Abos, Mitgliedschaften …)
        await tx.execute(sql`truncate table users, teams, areas, system_settings, v1_ids restart identity cascade`);
      } else {
        const [existing] = await tx.select({ n: count() }).from(users);
        if ((existing?.n ?? 0) > 0) throw new Error("Zieldatenbank enthält schon Nutzer. Für eine Probe mit --reset starten.");
      }
      const ctx: StepContext = { tx, source, report, now: options.now ?? new Date(), ids: new IdMap(), userRefs: new Map(), memberOf: new Map() };
      await migrateUsers(ctx);
      await migrateTeams(ctx, await migrateAreas(ctx));
      await linkUsers(ctx);
      await migrateSubscriptions(ctx);
      await migrateSettings(ctx);
      await migrateSessions(ctx);
      report.count("v1_ids", await ctx.ids.persist(tx));
      if (options.dryRun) throw new DryRunRollback();
    });
  } catch (error) {
    if (!(error instanceof DryRunRollback)) throw error;
  }
  return report;
}
