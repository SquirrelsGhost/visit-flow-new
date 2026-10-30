import { streetListTexts } from "../../texts/streetListTexts";
import { productText } from "./streetStatus";
import type { StreetDateFilter, StreetRow, StreetStatus } from "./streetTypes";
import type { StreetStats } from "./streetGrouping";

const texts = streetListTexts;
/** Statuswerte, wie v1 sie an den Mail-Bericht schickte (displayStatus). */
const V1_STATUS: Record<StreetStatus, string> = { sale: "sale", termin: "termin", kein: "kein interesse", versorgt: "versorgt", na: "N/A", storno: "Storno", approved: "Approved" };
const deDate =(day: string) => day.split("-").reverse().join(".");

/** Zeitraum als Text für Bericht und Mail ("23.10.2026", "01.10.2026 - 23.10.2026", "Gesamt"). */
export function filterLabel(filter: StreetDateFilter): string {
  if (filter.mode === "all") return texts.filter.modes.all;
  if (filter.mode === "day" || filter.from === filter.to) return deDate(filter.from);
  return `${deDate(filter.from)} - ${deDate(filter.to)}`;
}

/** Textbericht zum Kopieren wie v1 buildReportText: Ort, Straße, Summen und je Tür Produkte oder Status. */
export function buildReportText(rows: readonly StreetRow[], filter: StreetDateFilter): string {
  const r = texts.report;
  const lines = [r.title, `${r.date}: ${filterLabel(filter)}`, ""];
  for (const row of rows) {
    lines.push(`${row.zipCode} ${row.city}`, `${r.street}: ${row.street}`, `${r.doors}: ${row.doors.length}, ${r.sales}: ${row.sales}`);
    for (const door of row.doors) {
      lines.push(`  ${row.street} ${door.houseNumber}: ${door.products.length > 0 ? productText(door.products) : texts.status[door.status]}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Body für v1 POST /reports/send-daily-report (Admin: teamId "admin-all"). */
export function reportPayload(rows: readonly StreetRow[], stats: StreetStats, filter: StreetDateFilter) {
  return {
    teamId: "admin-all",
    date: filter.mode === "day" ? filter.from : filter.mode === "range" ? `${filter.from} - ${filter.to}` : texts.filter.modes.all,
    doorsCount: stats.doors,
    salesCount: stats.sales,
    activeMembersCount: stats.active.length,
    activeMembersDetails: stats.active,
    streetDetails: rows.map((row) => ({
      street: row.street,
      city: row.city,
      zipCode: row.zipCode,
      doors: row.doors.length,
      sales: row.sales,
      doorDetails: row.doors.map((d) => ({ houseNumber: d.houseNumber, status: V1_STATUS[d.status], memberName: d.memberName, customerName: d.customerName })),
    })),
  };
}
