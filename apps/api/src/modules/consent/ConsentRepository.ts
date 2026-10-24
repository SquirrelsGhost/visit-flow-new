import { desc, eq } from "drizzle-orm";
import type { Database } from "../../config/db";
import { consentLogs, type ConsentLogDoc } from "./ConsentLog.model";

/** Speicherzugriff des Consent-Moduls. Der Service kennt nur dieses Interface (testbar ohne Datenbank). */
export interface ConsentRepository {
  insert(entry: ConsentLogDoc): Promise<ConsentLogDoc>;
  findByConsentId(consentId: string): Promise<ConsentLogDoc[]>;
}

const columns = {
  consentId: consentLogs.consentId,
  version: consentLogs.version,
  choice: consentLogs.choice,
  source: consentLogs.source,
  receivedAt: consentLogs.receivedAt,
};

export function pgConsentRepository(db: Database): ConsentRepository {
  return {
    async insert(entry) {
      const [created] = await db.insert(consentLogs).values(entry).returning(columns);
      if (!created) throw new Error("Consent-Eintrag wurde nicht gespeichert");
      return created;
    },
    findByConsentId: (consentId) =>
      db.select(columns).from(consentLogs).where(eq(consentLogs.consentId, consentId)).orderBy(desc(consentLogs.receivedAt)).limit(100),
  };
}
