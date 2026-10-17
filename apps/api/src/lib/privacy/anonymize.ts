/**
 * Datensparsame Angaben für Sicherheits- und Audit-Logs (Art. 5 Abs. 1 lit. c DSGVO).
 * Übernommen aus Einhorn (services/mitglieder/videoschutz/Abrufprotokoll.ts).
 */

/** IPv4 ohne letztes Oktett, IPv6 nur die ersten drei Blöcke. IPv4-mapped IPv6 wird wie IPv4 behandelt. */
export function shortenIp(ip: string): string {
  const plain = ip.startsWith("::ffff:") ? ip.slice("::ffff:".length) : ip;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(plain)) return plain.split(".").slice(0, 3).concat("0").join(".");
  if (plain.includes(":")) return `${plain.split(":").slice(0, 3).join(":")}::`;
  return "unbekannt";
}

/** Grobe Angabe wie "Chrome · Windows" statt des vollständigen User-Agents. */
export function browserName(userAgent: string): string {
  const os = /Windows/.test(userAgent)
    ? "Windows"
    : /iPhone|iPad/.test(userAgent)
      ? "iOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "?";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Sonstiger";
  return `${browser} · ${os}`;
}
