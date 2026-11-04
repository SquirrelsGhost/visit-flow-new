import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "../app/api/waitlist/route";
import { findPolicy } from "../lib/routePolicies";
import { parseWaitlistInput } from "../lib/waitlist/waitlistRules";
import { WaitlistDatabaseService } from "../services/WaitlistDatabaseService";
import { clearMemoryStores } from "../services/store/MemoryRecordStore";

const join = (body: Record<string, unknown>, ip = "203.0.113.7") =>
  POST(new Request("http://localhost/api/waitlist", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) }));

const valid = { email: "anna@example.de", role: "vertriebler", consent: true };

describe("Warteliste der Website", () => {
  beforeEach(() => {
    clearMemoryStores();
    WaitlistDatabaseService.resetLimits();
  });

  it("prüft E-Mail, Einwilligung und Rolle", () => {
    expect(parseWaitlistInput({ ...valid, email: "kein-at" })).toEqual({ ok: false, error: "email" });
    expect(parseWaitlistInput({ ...valid, consent: false })).toEqual({ ok: false, error: "consent" });
    expect(parseWaitlistInput({ ...valid, role: "chef" })).toEqual({ ok: false, error: "role" });
    expect(parseWaitlistInput(valid).ok).toBe(true);
  });

  it("vergibt fortlaufende Plätze und behält den Platz bei doppelter Adresse", async () => {
    const first = await (await join(valid)).json();
    const second = await (await join({ ...valid, email: "ben@example.de", role: "teamleiter" })).json();
    const again = await (await join({ ...valid, email: "ANNA@example.de" })).json();
    expect(first.data).toEqual({ position: 1, already: false });
    expect(second.data).toEqual({ position: 2, already: false });
    expect(again.data).toEqual({ position: 1, already: true });
    const count = await (await GET()).json();
    expect(count.data).toEqual({ count: 2 });
  });

  it("lehnt ohne Einwilligung ab und speichert Bots im Honigtopf nicht", async () => {
    expect((await join({ ...valid, consent: false })).status).toBe(400);
    expect((await join({ ...valid, website: "spam.example" })).status).toBe(201);
    expect((await (await GET()).json()).data).toEqual({ count: 0 });
  });

  it("begrenzt Eintragungen pro IP", async () => {
    for (let i = 0; i < 5; i++) expect((await join({ ...valid, email: `n${i}@example.de` })).status).toBe(201);
    expect((await join({ ...valid, email: "n6@example.de" })).status).toBe(429);
  });

  it("ist öffentlich erreichbar", () => {
    expect(findPolicy("POST", "/api/waitlist")?.access).toBe("public");
    expect(findPolicy("GET", "/api/waitlist")?.access).toBe("public");
  });
});
