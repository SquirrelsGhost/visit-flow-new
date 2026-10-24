import type { Database } from "../../config/db";
import type { MigrationReport } from "./report";
import type { V1Source } from "./source";

export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Was jeder Schritt bekommt. `userIds`/`teamIds` füllen die Schritte für die Prüfung von Verweisen. */
export interface StepContext {
  tx: Tx;
  source: V1Source;
  report: MigrationReport;
  now: Date;
  userIds: Set<string>;
  teamIds: Set<string>;
  /** Verweise der Nutzer, die erst gesetzt werden, wenn Teams und alle Nutzer da sind. */
  userRefs: Map<string, { teamId: string | null; mentorId: string | null; strukturleiterId: string | null }>;
}
