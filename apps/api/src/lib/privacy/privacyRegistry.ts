import type { DeletionOutcome, PrivacyCleanable } from "./PrivacyCleanable";

export interface PrivacyRegistry {
  register(module: PrivacyCleanable): void;
  exportUser(userId: string): Promise<Record<string, unknown>>;
  deleteUser(userId: string): Promise<Record<string, DeletionOutcome>>;
  keys(): string[];
}

/** Sammelt alle PrivacyCleanable-Module. Doppelte Schlüssel sind ein Programmierfehler. */
export function createPrivacyRegistry(): PrivacyRegistry {
  const modules = new Map<string, PrivacyCleanable>();

  return {
    register(module) {
      if (modules.has(module.privacyKey)) throw new Error(`PrivacyCleanable "${module.privacyKey}" ist doppelt registriert`);
      modules.set(module.privacyKey, module);
    },
    async exportUser(userId) {
      const entries = await Promise.all([...modules.values()].map(async (m) => [m.privacyKey, await m.onUserExport(userId)] as const));
      return Object.fromEntries(entries);
    },
    async deleteUser(userId) {
      // Nacheinander, damit ein Fehler die Reihenfolge im Protokoll nachvollziehbar lässt
      const outcomes: Record<string, DeletionOutcome> = {};
      for (const module of modules.values()) outcomes[module.privacyKey] = await module.onUserDelete(userId);
      return outcomes;
    },
    keys: () => [...modules.keys()],
  };
}
