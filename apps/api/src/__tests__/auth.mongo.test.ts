import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../config/env";
import { createServices, type Services } from "../services";

/**
 * Gegen eine echte MongoDB (MONGO_TEST_URI, in der CI ein mongo-Service). Prüft, dass v2 die
 * v1-Collections im v1-Format liest und schreibt: ein v1-Nutzer meldet sich an, das Refresh-Token
 * sieht aus wie eines von v1, und fremde Felder im Nutzerdokument bleiben unberührt.
 */
const uri = process.env.MONGO_TEST_URI;
const PASSWORD = "v1-passwort";
const userId = new Types.ObjectId();
const client = { ip: "198.51.100.7", userAgent: "vitest" };

describe.skipIf(!uri)("Auth gegen MongoDB im v1-Format", () => {
  let services: Services;
  const db = () => mongoose.connection.db!;

  beforeAll(async () => {
    await mongoose.connect(uri ?? "", { dbName: "visitflow_ci_auth" });
    await mongoose.connection.dropDatabase();
    const env = loadEnv({ MONGO_URI: uri, JWT_SECRET: "j".repeat(40), DATA_CIPHER_KEY: "d".repeat(40), BLIND_INDEX_KEY: "b".repeat(40) });
    services = createServices(env);
    await mongoose.model("LoginFailure").syncIndexes();
    // Wie v1 es speichert: bcryptjs-Hash mit $2a$, Mongoose-Timestamps, viele Felder, die v2 nicht kennt
    await db().collection("users").insertOne({
      _id: userId, email: "v1@example.de", password: bcrypt.hashSync(PASSWORD, 4).replace(/^\$2b\$/, "$2a$"),
      name: "V1 Nutzer", role: "teamleiter", isActive: true, isWhitelisted: true, whitelistStatus: "approved",
      teamId: "team-1", partnerIban: "DE00 0000", dailyPins: [{ street: "Hauptstr." }], createdAt: new Date(), updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it("meldet einen v1-Nutzer an und schreibt das Refresh-Token im v1-Format", async () => {
    const result = await services.auth.login({ email: "v1@example.de", password: PASSWORD }, client);
    expect(result.user).toMatchObject({ id: String(userId), role: "teamleiter", teamId: "team-1" });

    const tokens = await db().collection("refresh_tokens").find({ userId }).toArray();
    expect(tokens).toHaveLength(1);
    expect(Object.keys(tokens[0] ?? {}).sort()).toEqual(["_id", "createdAt", "expiresAt", "familyId", "isRevoked", "tokenHash", "userId"]);
    expect(tokens[0]?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ändert am Nutzerdokument nur die Login-Felder", async () => {
    const user = await db().collection("users").findOne({ _id: userId });
    expect(user).toMatchObject({ partnerIban: "DE00 0000", dailyPins: [{ street: "Hauptstr." }], loginAttempts: 0, name: "V1 Nutzer" });
    expect(user?.password).toMatch(/^\$2a\$/);
  });

  it("rotiert innerhalb derselben Kette", async () => {
    const login = await services.auth.login({ email: "v1@example.de", password: PASSWORD }, client);
    const next = await services.auth.refresh(login.refreshToken, client);
    expect(next.refreshToken).not.toBe(login.refreshToken);
    await expect(services.auth.refresh(login.refreshToken, client)).rejects.toThrow();
    const family = await db().collection("refresh_tokens").find({ isRevoked: false, userId }).toArray();
    expect(family.length).toBe(1);
  });

  it("speichert Fehlversuche nur gehasht und mit TTL", async () => {
    await expect(services.auth.login({ email: "v1@example.de", password: "falsch" }, client)).rejects.toThrow();
    const failures = await db().collection("login_failures").find().toArray();
    expect(JSON.stringify(failures)).not.toMatch(/198\.51|v1@example/);
    const indexes = await db().collection("login_failures").indexes();
    expect(indexes.find((i) => i.key.at === 1)?.expireAfterSeconds).toBe(15 * 60);
  });

  it("schreibt Audit-Einträge im v1-Format", async () => {
    const entry = await db().collection("audit_logs").findOne({ action: "LOGIN_FAILED" });
    expect(entry).toMatchObject({ category: "SECURITY", actor: { userId, email: "v1@example.de", ip: client.ip } });
    expect(entry?.timestamp).toBeInstanceOf(Date);
  });

  it("löscht Sitzungen über die Datenschutz-Registry", async () => {
    expect(services.privacy.keys()).toContain("sessions");
    const outcome = await services.privacy.deleteUser(String(userId));
    expect(outcome.sessions).toMatchObject({ action: "deleted" });
    expect(await db().collection("refresh_tokens").countDocuments({ userId })).toBe(0);
  });
});
