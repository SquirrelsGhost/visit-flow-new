import { describe, expect, it } from "vitest";
import { toUserView, vodafoneMonth } from "../modules/users/userView";
import { newId } from "../lib/db/ids";
import { makeUser } from "./support/authFakes";

const extras = { subscriptionStatus: "active", isTrioHeim: false };
const now = new Date("2026-10-17T12:00:00+02:00");

describe("toUserView", () => {
  it("liefert die Feldnamen, die der Client kennt, und nie den Passwort-Hash", () => {
    const teamId = newId();
    const view = toUserView(makeUser({ teamId, extraRoles: ["mentor"], approvalStatus: "approved", blockedAt: null }), extras, now);
    expect(view).toMatchObject({ teamId, roles: ["mentor"], isWhitelisted: true, whitelistStatus: "approved", isBlocked: false, subscriptionStatus: "active" });
    for (const key of ["password", "passwordHash", "extraRoles", "approvalStatus", "_id"]) expect(view).not.toHaveProperty(key);
  });

  it("rechnet Junior- und Regular-Berater aus dem Vertragsmonat wie v1", () => {
    expect(vodafoneMonth(new Date("2026-07-01"), now)).toBe(4);
    expect(toUserView(makeUser({ vodafoneContractStart: new Date("2026-07-01") }), extras, now)).toMatchObject({ isJuniorBerater: true, isRegularBerater: false });
    expect(toUserView(makeUser({ vodafoneContractStart: new Date("2026-05-15") }), extras, now)).toMatchObject({ vodafoneCurrentMonth: 6, isRegularBerater: true });
    expect(toUserView(makeUser(), extras, now)).toMatchObject({ vodafoneCurrentMonth: null, isRegularBerater: true });
    expect(toUserView(makeUser({ mentorId: newId() }), extras, now)).toMatchObject({ isRegularBerater: false });
  });

  it("geschenkter Zugang hebt die Zahlungspflicht auf, solange er läuft", () => {
    expect(toUserView(makeUser({ paymentRequired: true, giftedUntil: new Date("2026-12-01") }), extras, now).paymentRequired).toBe(false);
    expect(toUserView(makeUser({ paymentRequired: true, giftedUntil: new Date("2026-01-01") }), extras, now).paymentRequired).toBe(true);
  });
});
