import { describe, expect, it } from "vitest";
import type { PrivacyCleanable } from "../lib/privacy/PrivacyCleanable";
import { createPrivacyRegistry } from "../lib/privacy/privacyRegistry";

const visits: PrivacyCleanable = {
  privacyKey: "visits",
  onUserExport: async (userId) => [{ userId, street: "Hauptstr. 1" }],
  onUserDelete: async () => ({ action: "anonymized", count: 12 }),
};

const commissions: PrivacyCleanable = {
  privacyKey: "commissions",
  onUserExport: async () => [],
  onUserDelete: async () => ({ action: "retained", count: 3, until: new Date("2027-04-17"), reason: "Provisionsabrechnung" }),
};

describe("PrivacyRegistry", () => {
  it("sammelt Export und Löschung aller Module", async () => {
    const registry = createPrivacyRegistry();
    registry.register(visits);
    registry.register(commissions);

    expect(await registry.exportUser("u1")).toEqual({ visits: [{ userId: "u1", street: "Hauptstr. 1" }], commissions: [] });
    const outcomes = await registry.deleteUser("u1");
    expect(outcomes.visits).toEqual({ action: "anonymized", count: 12 });
    expect(outcomes.commissions?.action).toBe("retained");
  });

  it("verhindert doppelte Module", () => {
    const registry = createPrivacyRegistry();
    registry.register(visits);
    expect(() => registry.register(visits)).toThrow(/doppelt/);
  });
});
