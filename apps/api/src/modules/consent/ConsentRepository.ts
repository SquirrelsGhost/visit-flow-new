import type { Model } from "mongoose";
import type { ConsentLogDoc } from "./ConsentLog.model";

/** Speicherzugriff des Consent-Moduls. Der Service kennt nur dieses Interface (testbar ohne Datenbank). */
export interface ConsentRepository {
  insert(entry: ConsentLogDoc): Promise<ConsentLogDoc>;
  findByConsentId(consentId: string): Promise<ConsentLogDoc[]>;
}

export function mongoConsentRepository(model: Model<ConsentLogDoc>): ConsentRepository {
  return {
    async insert(entry) {
      const created = await model.create(entry);
      return created.toObject();
    },
    findByConsentId: (consentId) =>
      model.find({ consentId }, { _id: 0 }).sort({ receivedAt: -1 }).limit(100).lean<ConsentLogDoc[]>().exec(),
  };
}
