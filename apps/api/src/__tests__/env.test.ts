import { describe, expect, it } from "vitest";
import { loadEnv } from "../config/env";

const valid = {
  MONGO_URI: "mongodb://localhost:27017/test",
  JWT_SECRET: "j".repeat(40),
  DATA_CIPHER_KEY: "d".repeat(40),
  BLIND_INDEX_KEY: "b".repeat(40),
  CORS_ORIGINS: "http://localhost:5173, capacitor://localhost",
};

describe("loadEnv", () => {
  it("liest eine gültige Umgebung mit Standardwerten", () => {
    const env = loadEnv(valid);
    expect(env.PORT).toBe(3002);
    expect(env.CONSENT_LOG_DAYS).toBe(1095);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:5173", "capacitor://localhost"]);
  });

  it("startet nicht ohne starke Secrets", () => {
    expect(() => loadEnv({ ...valid, JWT_SECRET: "kurz" })).toThrow(/JWT_SECRET/);
  });

  it("verlangt verschiedene Schlüssel für Verschlüsselung und Blind Index", () => {
    expect(() => loadEnv({ ...valid, BLIND_INDEX_KEY: valid.DATA_CIPHER_KEY })).toThrow(/verschieden/);
  });
});
