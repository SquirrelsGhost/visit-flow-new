const DAY = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Datum ohne Uhrzeit (TT.MM.JJJJ); leer oder ungültig wird zu "–". */
export function formatDay(iso: string | undefined): string {
  const at = iso ? new Date(iso) : undefined;
  return at && !Number.isNaN(at.getTime()) ? DAY.format(at) : "–";
}
