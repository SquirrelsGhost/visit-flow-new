import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { signAccessToken } from "../lib/auth/accessToken";
import { newId } from "../lib/db/ids";
import { ConsentService } from "../modules/consent/ConsentService";
import { LogbookService } from "../modules/logbook/LogbookService";
import { logbookPrivacy } from "../modules/logbook/logbookPrivacy";
import { makeAuth } from "./support/authFakes";
import { CIPHER_KEY, makeTrip, memoryLogbook } from "./support/logbookFakes";

const env = { JWT_SECRET: "s".repeat(40), CORS_ORIGINS: [], NODE_ENV: "test" as const };
const consent = new ConsentService({ insert: async (e) => e, findByConsentId: async () => [] });
const BEA = newId();
const bea = `Bearer ${signAccessToken({ id: BEA, email: "bea@example.de", role: "berater" }, env.JWT_SECRET)}`;
const tom = `Bearer ${signAccessToken({ id: newId(), email: "tom@example.de", role: "teamleiter" }, env.JWT_SECRET)}`;

describe("/api/logbook", () => {
  let repository: ReturnType<typeof memoryLogbook>;
  let service: LogbookService;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = memoryLogbook();
    service = new LogbookService(repository, CIPHER_KEY);
    app = createApp(env, { consent, auth: makeAuth([]).service, logbook: service });
  });

  const putMonth = (token: string, body: object, month = "2026-10") =>
    request(app).put(`/api/logbook/months/${month}`).set("Authorization", token).send(body);

  it("verlangt einen Login", async () => {
    expect((await request(app).get("/api/logbook")).status).toBe(401);
  });

  it("liefert ein leeres Buch mit Standardfahrzeug", async () => {
    const response = await request(app).get("/api/logbook").set("Authorization", bea);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ months: [], profile: { rev: 0, activeVehicleId: "car-1" } });
  });

  it("speichert einen Monat verschlüsselt und nur für den eigenen Nutzer", async () => {
    const saved = await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock: null });
    expect(saved.status).toBe(200);
    expect(saved.body.data).toMatchObject({ month: "2026-10", rev: 1, trips: [{ id: "t1", partner: "Haushalte Lindenweg" }] });
    expect(JSON.stringify(repository.months)).not.toContain("Lindenweg");

    const own = await request(app).get("/api/logbook").set("Authorization", bea);
    expect(own.body.data.months).toHaveLength(1);
    const other = await request(app).get("/api/logbook").set("Authorization", tom);
    expect(other.body.data.months).toHaveLength(0);
  });

  it("meldet einen Konflikt mit dem aktuellen Stand, wenn ein anderes Gerät schneller war", async () => {
    await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock: null });
    const stale = await putMonth(bea, { baseRev: 0, trips: [], lock: null });
    expect(stale.status).toBe(409);
    expect(stale.body.current).toMatchObject({ rev: 1, trips: [{ id: "t1" }] });
  });

  it("lehnt Änderungen in abgeschlossenen Monaten ab", async () => {
    const lock = { lockedAt: "2026-11-01T08:00:00.000Z", reopened: [] };
    await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock });
    const response = await putMonth(bea, { baseRev: 1, trips: [], lock });
    expect(response.status).toBe(403);
    expect(repository.months[0]?.rev).toBe(1);
  });

  it("prüft Eingaben streng", async () => {
    expect((await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock: null }, "2026-13")).status).toBe(400);
    expect((await putMonth(bea, { baseRev: 0, trips: [{ ...makeTrip(), extra: 1 }], lock: null })).status).toBe(400);
    expect((await putMonth(bea, { baseRev: 0, trips: [makeTrip({ date: "2026-09-30" })], lock: null })).status).toBe(400);
  });

  it("liefert mit since nur geänderte Monate", async () => {
    await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock: null });
    const later = new Date(Date.now() + 60_000).toISOString();
    const response = await request(app).get(`/api/logbook?since=${encodeURIComponent(later)}`).set("Authorization", bea);
    expect(response.body.data.months).toHaveLength(0);
  });

  it("speichert Fahrzeuge und prüft das aktive Fahrzeug", async () => {
    const vehicles = [{ id: "car-1", name: "Golf", plate: "M-AB 123" }];
    const bad = await request(app).put("/api/logbook/profile").set("Authorization", bea).send({ baseRev: 0, vehicles, activeVehicleId: "car-9", importedV1: true });
    expect(bad.status).toBe(400);
    const good = await request(app).put("/api/logbook/profile").set("Authorization", bea).send({ baseRev: 0, vehicles, activeVehicleId: "car-1", importedV1: true });
    expect(good.body.data).toMatchObject({ rev: 1, vehicles, importedV1: true });
    const stale = await request(app).put("/api/logbook/profile").set("Authorization", bea).send({ baseRev: 0, vehicles, activeVehicleId: "car-1", importedV1: true });
    expect(stale.status).toBe(409);
  });

  it("exportiert und löscht über die Datenschutz-Hooks", async () => {
    await putMonth(bea, { baseRev: 0, trips: [makeTrip()], lock: null });
    const privacy = logbookPrivacy(service);
    const exported = await privacy.onUserExport(BEA);
    expect(JSON.stringify(exported)).toContain("Lindenweg");
    expect(await privacy.onUserDelete(BEA)).toEqual({ action: "deleted", count: 1 });
    expect(repository.months).toHaveLength(0);
  });
  it("nimmt einen großen Monat über 100 kb an", async () => {
    const trips = Array.from({ length: 300 }, (_, i) => makeTrip({ id: `t${i}`, purpose: "x".repeat(400) }));
    const response = await putMonth(bea, { baseRev: 0, trips, lock: null });
    expect(response.status).toBe(200);
    expect(response.body.data.trips).toHaveLength(300);
  });
});
