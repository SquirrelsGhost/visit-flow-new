import type { Database } from "../../config/db";
import type { IdMap } from "./idMap";
import type { MigrationReport } from "./report";
import type { V1Source } from "./source";

export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Verweise eines Nutzers auf v1-IDs, die erst gesetzt werden, wenn alle Ziele übernommen sind. */
export interface UserRefs {
  teamId: string | null;
  mentorId: string | null;
  strukturleiterId: string | null;
  referredById: string | null;
}

export interface StepContext {
  tx: Tx;
  source: V1Source;
  report: MigrationReport;
  now: Date;
  ids: IdMap;
  /** Neue Nutzer-UUID → Verweise mit v1-IDs. */
  userRefs: Map<string, UserRefs>;
  /** Neue Nutzer-UUID → Teams, in deren `member_ids` er in v1 stand (Ersatz, falls `teamId` fehlt). */
  memberOf: Map<string, string[]>;
}
