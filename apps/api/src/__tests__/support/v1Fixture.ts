import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { hashRefreshToken } from "../../modules/auth/refreshTokens";
import type { V1Doc, V1Source } from "../../migration/v1/source";

export const V1_PASSWORD = "v1-passwort";
export const V1_RAW_REFRESH = "a1".repeat(64);
export const NOW = new Date("2026-10-24T12:00:00Z");
export const V1_CIPHER_KEY = "c".repeat(40);

/** Ein kleiner v1-Bestand wie in MongoDB: ObjectIds, Datumswerte, Altlasten und kaputte Verweise. */
export function v1Fixture() {
  const id = { leader: new ObjectId(), berater: new ObjectId(), memberOnly: new ObjectId(), dup: new ObjectId(), gm: new ObjectId(), team: new ObjectId(), area: new ObjectId() };
  const hash = bcrypt.hashSync(V1_PASSWORD, 4).replace(/^\$2b\$/, "$2a$");
  const collections: Record<string, V1Doc[]> = {
    users: [
      { _id: id.leader, email: "Leiter@Example.de ", password: hash, name: "Lea Leiter", role: "teamleiter", isActive: true, isWhitelisted: true, whitelistStatus: "approved", teamId: String(id.team), lastActivity: new Date("2026-10-20"), phone: "0221 123", billingCity: "Köln", lastIpAddress: "203.0.113.1", deviceIds: ["x"] },
      { _id: id.berater, id: "legacy-uuid-1", email: "berater@example.de", password: hash, name: "Ben", role: "superheld", isWhitelisted: true, whitelistStatus: "approved", teamId: String(id.team), mentorId: String(new ObjectId()), dailyPins: [{ street: "Hauptstr.", at: new Date("2026-10-01") }], createdAt: "2026-01-02T03:04:05.000Z" },
      { _id: id.memberOnly, email: "mitglied@example.de", name: "Mia", role: "berater", roles: ["berater", "mentor"], isBlocked: true, blockReason: "Test", isWhitelisted: false, whitelistStatus: "pending" },
      { _id: id.dup, email: "leiter@example.de", name: "Altkonto", role: "berater", lastActivity: new Date("2025-01-01") },
      { _id: id.gm, email: "gm@example.de", name: "Gina", role: "gebietsmanager", isWhitelisted: true, whitelistStatus: "approved" },
      { _id: new ObjectId(), name: "ohne E-Mail" },
    ],
    teams: [{ _id: id.team, name: "Trio Nord", team_leader_id: id.leader, member_ids: [id.berater, id.memberOnly, new ObjectId()], mentor_ids: [id.leader], is_active: true, area_id: id.area }],
    areas: [{ _id: id.area, name: "West", manager_id: id.gm, team_ids: [id.team], is_active: true }],
    subscriptions: [{ _id: new ObjectId(), userId: String(id.berater), planId: "pro-monthly", status: "active", createdAt: new Date("2026-09-01") }],
    systemsettings: [{ _id: new ObjectId(), showTeamLeiterLiveTracking: false }],
    enesmemories: [
      { _id: new ObjectId(), userId: id.berater, type: "context", content: "Läuft lieber abends", source: "chat", embedding: [0.1, 0.2], createdAt: new Date("2026-10-01") },
      { _id: new ObjectId(), userId: id.berater, type: "win", content: "Uralt", createdAt: new Date("2026-01-01") },
      { _id: new ObjectId(), userId: new ObjectId(), type: "fact", content: "Kein Nutzer", createdAt: new Date("2026-10-01") },
    ],
    ai_chat_logs: [
      { _id: new ObjectId(), userId: id.leader, userMessage: "Einwand Preis?", aiResponse: "Rechne vor.", feedback: "up", createdAt: new Date("2026-10-20") },
      { _id: new ObjectId(), userId: id.leader, userMessage: "Hallo", aiResponse: "Hi", feedback: null, createdAt: new Date("2026-10-21") },
    ],
    refresh_tokens: [
      { _id: new ObjectId(), tokenHash: hashRefreshToken(V1_RAW_REFRESH), userId: id.leader, familyId: "fam-1", createdAt: new Date("2026-10-23"), expiresAt: new Date("2026-10-30"), isRevoked: false },
      { _id: new ObjectId(), tokenHash: "f".repeat(64), userId: id.leader, familyId: "fam-0", createdAt: new Date("2026-10-01"), expiresAt: new Date("2026-10-08"), isRevoked: false },
    ],
  };
  const reads: string[] = [];
  const source: V1Source = {
    async *read(collection) {
      reads.push(collection);
      yield* collections[collection] ?? [];
    },
  };
  return { id, source, reads };
}
