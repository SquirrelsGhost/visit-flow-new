import { describe, expect, it } from "vitest";
import { browserName, shortenIp } from "../lib/privacy/anonymize";

describe("shortenIp", () => {
  it("kürzt IPv4 um das letzte Oktett", () => expect(shortenIp("203.0.113.57")).toBe("203.0.113.0"));
  it("behandelt IPv4-mapped IPv6 wie IPv4", () => expect(shortenIp("::ffff:203.0.113.57")).toBe("203.0.113.0"));
  it("kürzt IPv6 auf drei Blöcke", () => expect(shortenIp("2001:db8:85a3:8d3:1319:8a2e:370:7348")).toBe("2001:db8:85a3::"));
  it("gibt bei Unsinn nichts preis", () => expect(shortenIp("kein-ip")).toBe("unbekannt"));
});

describe("browserName", () => {
  it("reduziert den User-Agent auf Browser und System", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
    expect(browserName(ua)).toBe("Chrome · Windows");
  });
  it("erkennt die App auf Android", () => {
    expect(browserName("Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36")).toBe("Chrome · Android");
  });
});
