import { TOP_THRESHOLD, periodRange, type RankedMember, type StructurePeriod } from "./structureLogic";

const MEDALS = ["🥇", "🥈", "🥉"];
const deals = (n: number) => `${n} ${n === 1 ? "Abschluss" : "Abschlüsse"}`;
const tag = (r: RankedMember) => `@${r.member.name.replace(/\s+/g, "")}`;
const first = (r: RankedMember) => r.member.name.split(" ")[0] ?? r.member.name;
const short = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" });
const full = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });

function title(period: StructurePeriod, now: Date): string {
  if (period === "day") return `🏆 Tagesranking (${full.format(now)})`;
  if (period === "week") {
    const { from, to } = periodRange("week", now);
    return `📊 Wochenranking (${short.format(from)}. – ${full.format(new Date(to.getTime() - 1))})`;
  }
  return `📅 Monatsranking (${monthName.format(now)})`;
}

function dayComment(r: RankedMember): string {
  const name = first(r);
  if (r.sales > 0) {
    if (r.sales > r.yesterday && r.yesterday > 0) return `${name}, starke Leistung! Du hast dich im Vergleich zu gestern (${deals(r.yesterday)}) nochmal gesteigert. Weiter so!`;
    if (r.sales >= 5) return `${name}, absolute Maschine heute! Richtig abgerissen, das zeigt, was möglich ist.`;
    if (r.sales === r.yesterday && r.sales > 1) return `${name}, sehr starke Konstanz! Genau wie gestern wieder super abgeliefert.`;
    return `${name}, gute Arbeit heute! Du lieferst zuverlässig deine Zahlen.`;
  }
  if (r.yesterday > 0) return `${name}, Kopf hoch! Gestern lief es mit ${r.yesterday} ${r.yesterday === 1 ? "Abschluss" : "Abschlüssen"} noch super. Morgen greifen wir wieder voll an!`;
  return `${name}, heute war vielleicht nicht dein Tag, aber morgen sieht es wieder anders aus. Bleib dran!`;
}

/** Auswertung als Text für die Teamgruppe (v1 handleGenerateReport), Euro nur wenn Provisionen vorliegen. */
export function buildReport(ranked: readonly RankedMember[], period: StructurePeriod, now = new Date()): string {
  const withEuro = ranked.some((r) => r.revenue > 0);
  const euro = (value: number) => (withEuro ? ` (${Math.round(value)} €)` : "");
  const sold = ranked.filter((r) => r.sales > 0);
  const zero = ranked.filter((r) => r.sales === 0);
  const top = TOP_THRESHOLD[period];
  const lines = [`${title(period, now)}\n`];
  sold.forEach((r, i) => lines.push(`${i < 3 ? `${MEDALS[i]} ` : ""}${i + 1}. ${tag(r)} – ${deals(r.sales)}${euro(r.revenue)}\n`));
  if (zero.length > 0) lines.push(`${sold.length + 1}. - 0 Abschlüsse:`, `${zero.map(tag).join(" ")}\n`);
  lines.push("\n🚦 Status:\n");
  lines.push(`🟢 Top Performer (${top}+): ${sold.filter((r) => r.sales >= top).map(tag).join(" ") || "–"}\n`);
  lines.push(`🟡 Solide (1–${top - 1}): ${sold.filter((r) => r.sales < top).map(tag).join(" ") || "–"}\n`);
  lines.push(`🔴 Unter Mindestleistung (0): ${zero.map(tag).join(" ") || "–"}\n`);
  if (period === "day") {
    lines.push("\n💬 Kommentar:\n", ranked.map(dayComment).join("\n"));
    lines.push("\nGenau so weitermachen Team, das wird sich auszahlen. Leistung wird bei uns auch entsprechend belohnt!");
    return lines.join("\n");
  }
  const total = ranked.reduce((s, r) => s + r.sales, 0);
  const revenue = ranked.reduce((s, r) => s + r.revenue, 0);
  const count = ranked.length || 1;
  lines.push("\n📈 Zusammenfassung:\n", `Gesamt: ${total} Abschlüsse${withEuro ? ` | ${Math.round(revenue)} €` : ""}`);
  lines.push(`Ø pro Mitglied: ${Math.round(total / count)} Abschlüsse${withEuro ? ` | ${Math.round(revenue / count)} €` : ""}\n`);
  const highlights = sold.slice(0, 3).map((r, i) =>
    i === 0 ? `🏆 ${first(r)} dominiert ${period === "week" ? "diese Woche" : "diesen Monat"} mit ${r.sales} Abschlüssen – absolute Spitzenklasse!` : `💪 ${first(r)}, starke ${r.sales} Abschlüsse – Top Performance!`,
  );
  if (highlights.length > 0) lines.push("💬 Highlights:\n", highlights.join("\n"));
  lines.push("\nWeiter so, Team! 💪");
  return lines.join("\n");
}
