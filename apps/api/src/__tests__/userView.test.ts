import { describe, expect, it } from "vitest";
import { toUserView, vodafoneMonth } from "../modules/users/userView";
import { makeUser } from "./support/authFakes";

const extras = { subscriptionStatus: "active", isTrioHeim: false };
const now = new Date("2026-10-17T12:00:00+02:00");

describe("toUserView", () => {
  it("liefert die v1-Felder mit Standardwerten und ohne interne Daten", () => {
    const view = toUserView(makeUser({ teamId: "T1", profile: { deviceIds: ["d1"], userAgent: "Mozilla", lastIpAddress: "203.0.113.9", billingCity: "Köln" } }), extras, now);
    expect(view).toMatchObject({ teamId: "T1", billingCity: "Köln", permissions: [], partnerStatus: "none", billingCountry: "DE", subscriptionStatus: "active" });
    for (const key of ["password", "passwordHash", "profile", "lastIpAddress", "stripeCustomerId", "deviceIds", "userAgent", "_id"]) expect(view).not.toHaveProperty(key);
  });

  it("rechnet Junior- und Regular-Berater aus dem Vertragsmonat wie v1", () => {
    expect(vodafoneMonth(new Date("2026-07-01"), now)).toBe(4);
    expect(toUserView(makeUser({ vodafoneContractStart: new Date("2026-07-01") }), extras, now)).toMatchObject({ isJuniorBerater: true, isRegularBerater: false });
    expect(toUserView(makeUser({ vodafoneContractStart: new Date("2026-05-15") }), extras, now)).toMatchObject({ vodafoneCurrentMonth: 6, isRegularBerater: true });
    expect(toUserView(makeUser(), extras, now)).toMatchObject({ vodafoneCurrentMonth: null, isRegularBerater: true });
    expect(toUserView(makeUser({ mentorId: "m1" }), extras, now)).toMatchObject({ isRegularBerater: false });
  });

  it("geschenkter Zugang hebt die Zahlungspflicht auf, solange er läuft", () => {
    expect(toUserView(makeUser({ paymentRequired: true, giftedUntil: new Date("2026-12-01") }), extras, now).paymentRequired).toBe(false);
    expect(toUserView(makeUser({ paymentRequired: true, giftedUntil: new Date("2026-01-01") }), extras, now).paymentRequired).toBe(true);
  });
});
