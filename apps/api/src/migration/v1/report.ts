/**
 * Protokoll eines Laufs: Zähler pro Tabelle und Hinweise zu Datensätzen, die angepasst oder
 * übersprungen wurden. Hinweise nennen nur IDs, nie E-Mails oder Namen (das Protokoll landet in Logs).
 */
export class MigrationReport {
  readonly counts: Record<string, number> = {};
  readonly warnings: Record<string, string[]> = {};

  count(table: string, n = 1): void {
    this.counts[table] = (this.counts[table] ?? 0) + n;
  }

  warn(kind: string, id: string): void {
    (this.warnings[kind] ??= []).push(id);
  }

  summary(): string {
    const lines = Object.entries(this.counts).map(([table, n]) => `  ${table}: ${n}`);
    const hints = Object.entries(this.warnings).map(([kind, ids]) => `  ${kind}: ${ids.length} (${ids.slice(0, 10).join(", ")}${ids.length > 10 ? ", …" : ""})`);
    return ["Übernommen:", ...lines, ...(hints.length ? ["Hinweise:", ...hints] : [])].join("\n");
  }
}
