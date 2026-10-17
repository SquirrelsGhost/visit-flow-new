import type { ConsentLogInput } from "@visit-flow/shared/consentSchema";
import type { ConsentLogDoc } from "./ConsentLog.model";
import type { ConsentRepository } from "./ConsentRepository";

export interface ConsentLogView {
  consentId: string;
  version: number;
  choice: ConsentLogDoc["choice"];
  source: ConsentLogDoc["source"];
  receivedAt: string;
}

const toView = (doc: ConsentLogDoc): ConsentLogView => ({
  consentId: doc.consentId,
  version: doc.version,
  choice: doc.choice,
  source: doc.source,
  receivedAt: doc.receivedAt.toISOString(),
});

/**
 * Protokolliert jede Entscheidung aus dem Banner: Zufalls-ID, Version, Auswahl, Quelle, Zeitpunkt.
 * Funktioniert ohne Login. Die Version kommt aus CONSENT_VERSION (validiert im Schema),
 * nie aus einem fest eingetragenen Wert (v1-Bug: privacy.ts speicherte immer '1.0').
 */
export class ConsentService {
  constructor(private readonly repository: ConsentRepository) {}

  async record(input: ConsentLogInput, now = new Date()): Promise<ConsentLogView> {
    const saved = await this.repository.insert({
      consentId: input.id,
      version: input.v,
      choice: input.choice,
      source: input.source,
      receivedAt: now,
    });
    return toView(saved);
  }

  /** Alle Einträge zu einer Einwilligungs-ID (Auskunft für den Besucher, der die ID kennt). */
  async history(consentId: string): Promise<ConsentLogView[]> {
    return (await this.repository.findByConsentId(consentId)).map(toView);
  }
}
