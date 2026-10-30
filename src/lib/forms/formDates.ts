/** Datum wie auf den Vodafone-Formularen: tt.mm.jjjj. */
export function germanDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** yyyy-mm-dd aus einem Datumsfeld als tt.mm.jjjj; anderes bleibt, wie es ist. */
export function isoToGerman(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : iso;
}
