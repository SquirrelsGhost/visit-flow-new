import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { describeChange, type ExportInput } from "./logbookExport";
import { formatDate, formatDateTime, formatKm } from "./logbookFormat";
import { sortTrips, summarize, tripKm } from "./logbookLogic";
import type { MonthLock } from "./logbookTypes";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const STYLE = `@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font:9pt/1.35 -apple-system,"Segoe UI",Roboto,sans-serif;color:#0f172a;margin:0}
h1{font-size:16pt;margin:0 0 2mm}.meta{display:flex;gap:8mm;color:#475569;margin-bottom:5mm}.meta b{color:#0f172a}
table{width:100%;border-collapse:collapse}th{background:#f1f5f9;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;color:#475569}
th,td{border:1px solid #cbd5e1;padding:1.6mm 2mm;vertical-align:top}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr{page-break-inside:avoid}.kind{font-weight:600}.changed{color:#b45309;font-size:7.5pt}.sum td{font-weight:700;background:#f8fafc}
h2{font-size:11pt;margin:7mm 0 2mm}ul{margin:0;padding-left:5mm;color:#334155}.sign{margin-top:14mm;display:flex;justify-content:space-between;color:#64748b}
.sign span{border-top:1px solid #94a3b8;padding-top:1.5mm;width:70mm}`;

/**
 * Druckansicht des Fahrtenbuchs (v1: jsPDF-Tabelle im pdfGenerator). Im Browser „Als PDF sichern“ ergibt das PDF,
 * ohne zusätzliche Bibliothek. Kopf mit Fahrer und Fahrzeug, alle Pflichtangaben, Summen, Änderungsprotokoll, Unterschrift.
 */
export function logbookHtml(input: ExportInput, locks: Record<string, MonthLock>, t: LogbookTexts, now = new Date()): string {
  const trips = sortTrips(input.trips);
  const sum = summarize(trips);
  const plates = input.vehicles.map((v) => [v.name, v.plate].filter(Boolean).join(" · ")).filter(Boolean).join(", ");
  const rows = trips
    .map((trip) => {
      const place = [trip.from, trip.to].filter(Boolean).join(" → ");
      const note = trip.revisions.length ? `<div class="changed">${esc(t.edited(trip.revisions.length))}</div>` : "";
      return `<tr><td>${formatDate(trip.date, t)}</td><td>${esc([trip.startTime, trip.endTime].filter(Boolean).join("–"))}</td><td class="n">${trip.startKm}</td><td class="n">${trip.endKm}</td><td class="n">${tripKm(trip)}</td><td class="kind">${esc(t.kinds[trip.kind])}</td><td>${esc(place)}</td><td>${esc(trip.purpose)}${trip.detour ? `<br>${esc(t.field.detour)}: ${esc(trip.detour)}` : ""}</td><td>${esc(trip.partner)}${note}</td></tr>`;
    })
    .join("");
  const changes = trips.flatMap((trip) =>
    trip.revisions.map((r, i) => {
      const after = i + 1 < trip.revisions.length ? trip.revisions[i + 1]!.before : trip;
      return `<li>${formatDateTime(r.at, t)} · ${formatDate(trip.date, t)}: ${esc(describeChange(r.before, after, t))}</li>`;
    }),
  );
  const reopened = Object.values(locks).flatMap((l) => l.reopened.map((r) => `<li>${esc(t.reopenedLine(formatDateTime(r.at, t), r.reason))}</li>`));
  const log = [...changes, ...reopened];
  const head = [t.field.date, `${t.field.startTime}–${t.field.endTime}`, t.field.startKm, t.field.endKm, "km", t.field.kind, `${t.field.from} → ${t.field.to}`, t.field.purpose, t.field.partner];
  return `<!doctype html><html lang="${t.locale.slice(0, 2)}"><head><meta charset="utf-8"><title>${esc(t.fileName(input.period))}</title><style>${STYLE}</style></head><body>
<h1>${esc(t.printTitle)}</h1>
<div class="meta"><span>${esc(t.printPeriod)}: <b>${esc(input.period)}</b></span><span>${esc(t.printDriver)}: <b>${esc(input.driver)}</b></span><span>${esc(t.field.vehicleId)}: <b>${esc(plates || "–")}</b></span></div>
<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows}
<tr class="sum"><td colspan="4">${esc(t.printSum)} · ${esc(t.kinds.business)} ${formatKm(sum.byKind.business, t)} · ${esc(t.kinds.commute)} ${formatKm(sum.byKind.commute, t)} · ${esc(t.kinds.private)} ${formatKm(sum.byKind.private, t)}</td><td class="n">${sum.totalKm}</td><td colspan="4"></td></tr></tbody></table>
<h2>${esc(t.printChanges)}</h2>${log.length ? `<ul>${log.join("")}</ul>` : `<p>${esc(t.printNoChanges)}</p>`}
<div class="sign"><span>${esc(t.printSignature)}</span><span>${esc(t.printFooter(formatDateTime(now.toISOString(), t)))}</span></div>
</body></html>`;
}

/** Druckt über einen unsichtbaren Rahmen; der Browser bietet dort „Als PDF sichern“ an. */
export function printHtml(html: string): boolean {
  try {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    frame.srcdoc = html;
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 60_000);
    };
    document.body.appendChild(frame);
    return true;
  } catch {
    return false;
  }
}
