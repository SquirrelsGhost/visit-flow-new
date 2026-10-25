import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { idOf, objectIdDate, toDate, toJson } from "../migration/v1/convert";
import { MigrationReport } from "../migration/v1/report";
import { writeAccessProblems } from "../migration/v1/source";
import { convertUser } from "../migration/v1/steps/convertUser";

describe("Übernahme aus v1: Umwandlungen", () => {
  it("wandelt ObjectIds, Datumstexte und verschachtelte Werte um", () => {
    const id = new ObjectId("65f000000000000000000001");
    expect(idOf(id)).toBe("65f000000000000000000001");
    expect(idOf("  ")).toBeNull();
    expect(objectIdDate("65f000000000000000000001")?.getTime()).toBe(0x65f00000 * 1000);
    expect(toDate("kein Datum")).toBeNull();
    expect(toJson({ at: new Date("2026-01-01"), ref: id, list: [id] })).toEqual({ at: "2026-01-01T00:00:00.000Z", ref: id.toHexString(), list: [id.toHexString()] });
  });

  it("übernimmt nur Kontofelder, keine IPs, User-Agents oder Geräte-IDs", () => {
    const user = convertUser({ _id: new ObjectId(), email: "a@b.de", lastIpAddress: "203.0.113.1", userAgent: "x", deviceIds: ["d"], billingCity: "Köln" }, new MigrationReport(), new Date());
    expect(JSON.stringify(user)).not.toMatch(/203\.0|deviceIds|Köln/);
  });

  it("behandelt fehlende Schalter wie v1", () => {
    const user = convertUser({ _id: new ObjectId(), email: "A@B.de", roles: ["mentor", "kaiser", "mentor"], whitelistStatus: "approved" }, new MigrationReport(), new Date());
    expect(user?.row).toMatchObject({ email: "a@b.de", name: "a", isActive: true, blockedAt: null, extraRoles: ["mentor"], approvalStatus: "pending" });
  });
});

describe("Übernahme aus v1: nur lesen", () => {
  it("akzeptiert einen Nutzer mit reinen Leserechten", () => {
    const status = { authInfo: { authenticatedUsers: [{ user: "migration" }], authenticatedUserPrivileges: [{ actions: ["find", "listCollections", "collStats"] }] } };
    expect(writeAccessProblems(status)).toEqual([]);
  });

  it("lehnt Schreibrechte und Verbindungen ohne Anmeldung ab", () => {
    expect(writeAccessProblems({ authInfo: { authenticatedUsers: [{}], authenticatedUserPrivileges: [{ actions: ["find", "insert", "remove"] }] } })).toHaveLength(2);
    expect(writeAccessProblems({ authInfo: { authenticatedUsers: [] } })).toHaveLength(1);
  });
});
