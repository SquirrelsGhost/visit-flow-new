/** Wie eine Glas-Zahl geschrieben wird: ganze Zahl, Euro (Cent kleiner) oder Prozent. */
export type GlassNumberKind = "int" | "euro" | "percent";

const FORMATS: Record<GlassNumberKind, Intl.NumberFormat> = {
  int: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }),
  euro: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
  percent: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }),
};

/** Teilt eine Zahl in Hauptteil und Nachsatz, z. B. "3.420" und ",00 €" oder "42" und " %". */
export function splitGlassNumber(value: number, kind: GlassNumberKind): [string, string] {
  if (kind === "percent") return [FORMATS.percent.format(value), " %"];
  if (kind === "int") return [FORMATS.int.format(Math.round(value)), ""];
  let main = "";
  let rest = "";
  for (const part of FORMATS.euro.formatToParts(value)) {
    if (part.type === "integer" || part.type === "group" || part.type === "minusSign") main += part.value;
    else rest += part.value;
  }
  return [main, rest];
}
