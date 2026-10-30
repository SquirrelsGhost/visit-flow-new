// Pure helpers for the Battle Arena: which sales count on a day, and what they
// are worth in battle points and commission. BattleArena reads everything from
// statsByUser(), so every number on the page comes from the same pass.

export interface ArenaProduct {
  userId: string;
  timestamp?: string | Date;
  category?: string;
  type?: string;
  commissionEuro?: number;
  quantity?: number;
  battleExcluded?: boolean;
}

export interface DayStats {
  sales: number;
  score: number;
  commission: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The device's calendar day as YYYY-MM-DD. */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The calendar day in Berlin as YYYY-MM-DD, the day the backend stores battles under. */
export const berlinDay = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export const previousDay = (day: string) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const saleDay = (p: ArenaProduct) => {
  if (!p.timestamp) return null;
  const d = typeof p.timestamp === "string" ? new Date(p.timestamp) : p.timestamp;
  return dayKey(d);
};

/** All sales of one user on `day`, excluded ones included (for the admin's review). */
export const salesOn = (products: ArenaProduct[] | undefined, userId: string, day: string) =>
  (products || []).filter(p => p.userId === userId && saleDay(p) === day);

const gradeEuro = (grade: number, current: number) => {
  if (grade >= 4) return 40;
  return ({ 1: 20, 2: 25, 3: 35 } as Record<number, number>)[grade] ?? current;
};

const withCreditAndQuantity = (comm: number, p: ArenaProduct, type: string) => {
  const credit = type.match(/(\d+)€\s*SG/);
  if (credit && type.includes("SG gegeben") && !type.includes("NICHT gegeben")) {
    const euro = Number(credit[1]);
    if (euro === 80) comm -= 18;
    else if (euro === 50) comm -= 12.5;
  }
  return comm * (p.quantity ?? 1);
};

/** Commission of one sale, with the GigaTV upsell corrections. */
export function saleCommission(p: ArenaProduct): number {
  const comm = p.commissionEuro || 0;
  const type = p.type || "";
  if (p.category !== "Upsell" || !type) return comm;
  const lower = type.toLowerCase();
  const grade = type.match(/Upsell Giga Grade (\d)/i);

  // A GigaTV upsell must not take the cable upsell value (e.g. 78 €).
  if (lower.includes("giga tv") || lower.includes("gigatv")) {
    const base = lower.includes("upsell giga grade")
      ? (grade ? gradeEuro(Number(grade[1]), comm) : comm)
      : 25;
    return withCreditAndQuantity(base, p, type);
  }
  if (comm === 0 && grade) return withCreditAndQuantity(gradeEuro(Number(grade[1]), comm), p, type);
  return comm;
}

/** Sales, battle points and commission per user for `day`. */
export function statsByUser(products: ArenaProduct[] | undefined, points: Record<string, number>, day: string) {
  const stats = new Map<string, DayStats>();
  for (const p of products || []) {
    if (p.battleExcluded || saleDay(p) !== day) continue;
    const s = stats.get(p.userId) || { sales: 0, score: 0, commission: 0 };
    s.sales += 1;
    s.score += points[p.category || ""] ?? 1;
    s.commission += saleCommission(p);
    stats.set(p.userId, s);
  }
  return stats;
}
