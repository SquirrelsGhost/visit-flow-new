import { describe, expect, it } from "vitest";
import { blindIndex, normalizeEmail, normalizePhone } from "../lib/crypto/blindIndex";
import { isSealed, readField, seal, unseal } from "../lib/crypto/dataCipher";

const KEY = "k".repeat(40);
const INDEX_KEY = "i".repeat(40);

describe("dataCipher", () => {
  it("verschlüsselt und entschlüsselt", () => {
    const sealed = seal("0171 2345678", KEY);
    expect(isSealed(sealed)).toBe(true);
    expect(unseal(sealed, KEY)).toBe("0171 2345678");
  });

  it("ergibt für denselben Klartext jedes Mal einen anderen Geheimtext", () => {
    expect(seal("gleich", KEY).data).not.toBe(seal("gleich", KEY).data);
  });

  it("erkennt veränderte Daten und falsche Schlüssel", () => {
    const sealed = seal("geheim", KEY);
    expect(() => unseal({ ...sealed, data: Buffer.from("anders").toString("base64") }, KEY)).toThrow();
    expect(() => unseal(sealed, "x".repeat(40))).toThrow();
  });

  it("liest Klartext aus v1 und verschlüsselte Werte gleichermaßen", () => {
    expect(readField("klartext aus v1", KEY)).toBe("klartext aus v1");
    expect(readField(seal("neu", KEY), KEY)).toBe("neu");
    expect(readField(undefined, KEY)).toBeNull();
  });
});

describe("blindIndex", () => {
  it("ist deterministisch und findet normalisierte Varianten", () => {
    expect(blindIndex(" Max@Mail.de", INDEX_KEY, normalizeEmail)).toBe(blindIndex("max@mail.de", INDEX_KEY, normalizeEmail));
    expect(blindIndex("+49 171 2345678", INDEX_KEY, normalizePhone)).toBe(blindIndex("0171/2345678", INDEX_KEY, normalizePhone));
  });

  it("hängt vom Schlüssel ab und verrät den Klartext nicht", () => {
    const index = blindIndex("max@mail.de", INDEX_KEY);
    expect(index).not.toBe(blindIndex("max@mail.de", "j".repeat(40)));
    expect(index).toMatch(/^[0-9a-f]{32}$/);
  });
});
